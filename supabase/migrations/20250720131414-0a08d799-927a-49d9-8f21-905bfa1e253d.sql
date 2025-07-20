-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  job_title TEXT,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'ciso', 'risk_manager', 'compliance_officer', 'auditor', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create risk assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  risk_category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  probability TEXT NOT NULL CHECK (probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  impact_score INTEGER NOT NULL CHECK (impact_score >= 1 AND impact_score <= 10),
  likelihood_score INTEGER NOT NULL CHECK (likelihood_score >= 1 AND likelihood_score <= 10),
  risk_score INTEGER GENERATED ALWAYS AS (impact_score * likelihood_score) STORED,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'mitigated', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance records table
CREATE TABLE public.compliance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework TEXT NOT NULL,
  control_id TEXT NOT NULL,
  control_description TEXT NOT NULL,
  compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'partially_compliant', 'not_assessed')),
  evidence_url TEXT,
  last_assessment_date DATE,
  next_assessment_date DATE,
  responsible_person UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit reports table
CREATE TABLE public.audit_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  audit_type TEXT NOT NULL,
  scope TEXT,
  findings TEXT,
  recommendations TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published')),
  auditor_id UUID NOT NULL REFERENCES auth.users(id),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security incidents table
CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  affected_systems TEXT,
  detection_date TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  reported_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create controls table
CREATE TABLE public.controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  control_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  control_type TEXT NOT NULL,
  implementation_status TEXT NOT NULL DEFAULT 'not_implemented' CHECK (implementation_status IN ('not_implemented', 'in_progress', 'implemented', 'needs_review')),
  effectiveness TEXT CHECK (effectiveness IN ('not_effective', 'partially_effective', 'effective')),
  owner_id UUID REFERENCES auth.users(id),
  last_review_date DATE,
  next_review_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);

-- Create RLS policies for risk_assessments
CREATE POLICY "All authenticated users can view risk assessments" ON public.risk_assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Risk managers and admins can manage risk assessments" ON public.risk_assessments FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'risk_manager') OR 
  public.has_role(auth.uid(), 'ciso')
);
CREATE POLICY "Users can insert risk assessments" ON public.risk_assessments FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create RLS policies for compliance_records
CREATE POLICY "All authenticated users can view compliance records" ON public.compliance_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Compliance officers and admins can manage compliance records" ON public.compliance_records FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'compliance_officer') OR 
  public.has_role(auth.uid(), 'ciso')
);

-- Create RLS policies for audit_reports
CREATE POLICY "All authenticated users can view audit reports" ON public.audit_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auditors and admins can manage audit reports" ON public.audit_reports FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'auditor') OR 
  public.has_role(auth.uid(), 'ciso')
);

-- Create RLS policies for security_incidents
CREATE POLICY "All authenticated users can view security incidents" ON public.security_incidents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can report incidents" ON public.security_incidents FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Risk managers and admins can manage incidents" ON public.security_incidents FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'risk_manager') OR 
  public.has_role(auth.uid(), 'ciso')
);

-- Create RLS policies for controls
CREATE POLICY "All authenticated users can view controls" ON public.controls FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Compliance officers and admins can manage controls" ON public.controls FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'compliance_officer') OR 
  public.has_role(auth.uid(), 'ciso')
);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON public.risk_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON public.compliance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audit_reports_updated_at BEFORE UPDATE ON public.audit_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON public.security_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON public.controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, job_title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
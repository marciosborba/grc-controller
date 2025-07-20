-- Create policies table for document management
CREATE TABLE public.policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'draft',
  document_url text,
  document_type text,
  effective_date date,
  review_date date,
  owner_id uuid,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create policy approvals table for approval workflow
CREATE TABLE public.policy_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  comments text,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vendors table for supplier risk management
CREATE TABLE public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  category text NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'active',
  contract_start_date date,
  contract_end_date date,
  last_assessment_date date,
  next_assessment_date date,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vendor assessments table
CREATE TABLE public.vendor_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  questionnaire_data jsonb,
  responses jsonb,
  score integer,
  risk_rating text,
  completed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create ethics reports table for anonymous and identified reports
CREATE TABLE public.ethics_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  is_anonymous boolean NOT NULL DEFAULT false,
  reporter_name text,
  reporter_email text,
  reporter_phone text,
  assigned_to uuid,
  resolution text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create assessments table for compliance assessments
CREATE TABLE public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text NOT NULL,
  framework text,
  status text NOT NULL DEFAULT 'draft',
  questionnaire_data jsonb,
  responses jsonb,
  score integer,
  max_score integer,
  completion_percentage integer DEFAULT 0,
  due_date date,
  completed_at timestamp with time zone,
  created_by uuid,
  assigned_to uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for policies table
CREATE POLICY "All authenticated users can view policies" 
ON public.policies 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Compliance officers and admins can manage policies" 
ON public.policies 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'compliance_officer') OR has_role(auth.uid(), 'ciso'));

-- Create RLS policies for vendors table
CREATE POLICY "All authenticated users can view vendors" 
ON public.vendors 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Risk managers and admins can manage vendors" 
ON public.vendors 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'risk_manager') OR has_role(auth.uid(), 'ciso'));

-- Create RLS policies for ethics reports table
CREATE POLICY "All authenticated users can view ethics reports" 
ON public.ethics_reports 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "All users can create ethics reports" 
ON public.ethics_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins and compliance officers can manage ethics reports" 
ON public.ethics_reports 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'compliance_officer') OR has_role(auth.uid(), 'ciso'));

-- Create RLS policies for assessments table
CREATE POLICY "All authenticated users can view assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and managers can manage assessments" 
ON public.assessments 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'risk_manager') OR has_role(auth.uid(), 'compliance_officer') OR has_role(auth.uid(), 'ciso'));

-- Create RLS policies for vendor assessments table
CREATE POLICY "All authenticated users can view vendor assessments" 
ON public.vendor_assessments 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Risk managers and admins can manage vendor assessments" 
ON public.vendor_assessments 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'risk_manager') OR has_role(auth.uid(), 'ciso'));

-- Create RLS policies for policy approvals table
CREATE POLICY "All authenticated users can view policy approvals" 
ON public.policy_approvals 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and compliance officers can manage policy approvals" 
ON public.policy_approvals 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'compliance_officer') OR has_role(auth.uid(), 'ciso'));

-- Create triggers for updated_at columns
CREATE TRIGGER update_policies_updated_at
BEFORE UPDATE ON public.policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_assessments_updated_at
BEFORE UPDATE ON public.vendor_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
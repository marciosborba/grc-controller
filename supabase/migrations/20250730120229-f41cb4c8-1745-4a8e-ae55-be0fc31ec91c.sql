-- Create enum for assessment status
CREATE TYPE assessment_status AS ENUM ('Não Iniciado', 'Em Andamento', 'Em Revisão', 'Concluído');

-- Create enum for maturity levels (CMMI)
CREATE TYPE maturity_level AS ENUM ('1', '2', '3', '4', '5');

-- Create Frameworks table
CREATE TABLE public.frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT '550e8400-e29b-41d4-a716-446655440000'::uuid,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  created_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Controls table
CREATE TABLE public.framework_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  control_code VARCHAR(50) NOT NULL,
  control_text TEXT NOT NULL,
  control_reference VARCHAR(255),
  domain VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(framework_id, control_code)
);

-- Create Assessments table (renaming existing assessments to compliance_assessments)
ALTER TABLE public.assessments RENAME TO compliance_assessments;

CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT '550e8400-e29b-41d4-a716-446655440000'::uuid,
  framework_id_on_creation UUID NOT NULL REFERENCES public.frameworks(id),
  name VARCHAR(255) NOT NULL,
  status assessment_status NOT NULL DEFAULT 'Não Iniciado',
  due_date DATE,
  progress INTEGER DEFAULT 0,
  created_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Assessment_Responses table
CREATE TABLE public.assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  control_id UUID NOT NULL REFERENCES public.framework_controls(id),
  assessee_response TEXT,
  maturity_level INTEGER CHECK (maturity_level >= 1 AND maturity_level <= 5),
  assessor_analysis TEXT,
  last_updated_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, control_id)
);

-- Create Evidence table
CREATE TABLE public.assessment_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.assessment_responses(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by_user_id UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evidence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for frameworks
CREATE POLICY "All authenticated users can view frameworks" 
ON public.frameworks 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and compliance officers can manage frameworks" 
ON public.frameworks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'compliance_officer'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

-- Create RLS policies for framework_controls
CREATE POLICY "All authenticated users can view framework controls" 
ON public.framework_controls 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and compliance officers can manage framework controls" 
ON public.framework_controls 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'compliance_officer'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

-- Create RLS policies for assessments
CREATE POLICY "All authenticated users can view assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and compliance officers can manage assessments" 
ON public.assessments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'compliance_officer'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

CREATE POLICY "Users can create assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = created_by_user_id);

-- Create RLS policies for assessment_responses
CREATE POLICY "All authenticated users can view assessment responses" 
ON public.assessment_responses 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assessment responses" 
ON public.assessment_responses 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create RLS policies for assessment_evidence
CREATE POLICY "All authenticated users can view assessment evidence" 
ON public.assessment_evidence 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assessment evidence" 
ON public.assessment_evidence 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create triggers for updated_at columns
CREATE TRIGGER update_frameworks_updated_at
  BEFORE UPDATE ON public.frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_framework_controls_updated_at
  BEFORE UPDATE ON public.framework_controls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_responses_updated_at
  BEFORE UPDATE ON public.assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate assessment progress
CREATE OR REPLACE FUNCTION public.calculate_assessment_progress(assessment_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_controls INTEGER;
  completed_responses INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Get total number of controls for this assessment's framework
  SELECT COUNT(*)
  INTO total_controls
  FROM public.framework_controls fc
  JOIN public.assessments a ON a.framework_id_on_creation = fc.framework_id
  WHERE a.id = assessment_id_param;
  
  -- Get number of responses with maturity level filled
  SELECT COUNT(*)
  INTO completed_responses
  FROM public.assessment_responses ar
  WHERE ar.assessment_id = assessment_id_param
    AND ar.maturity_level IS NOT NULL;
  
  -- Calculate percentage
  IF total_controls > 0 THEN
    progress_percentage := ROUND((completed_responses::DECIMAL / total_controls::DECIMAL) * 100);
  ELSE
    progress_percentage := 0;
  END IF;
  
  RETURN progress_percentage;
END;
$$;

-- Create function to update assessment progress automatically
CREATE OR REPLACE FUNCTION public.update_assessment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_progress INTEGER;
BEGIN
  -- Calculate new progress
  new_progress := public.calculate_assessment_progress(NEW.assessment_id);
  
  -- Update the assessment progress
  UPDATE public.assessments
  SET progress = new_progress, updated_at = now()
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update progress when responses change
CREATE TRIGGER update_assessment_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assessment_progress();

-- Create storage bucket for assessment evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assessment-evidence', 'assessment-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for assessment evidence
CREATE POLICY "Authenticated users can view assessment evidence" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assessment-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload assessment evidence" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'assessment-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update assessment evidence" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'assessment-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete assessment evidence" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'assessment-evidence' AND auth.role() = 'authenticated');
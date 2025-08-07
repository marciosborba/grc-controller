
-- Adicionar campos para status das questões e diferenciação entre respondente e auditor
ALTER TABLE assessment_responses 
ADD COLUMN IF NOT EXISTS respondent_maturity_level integer,
ADD COLUMN IF NOT EXISTS auditor_maturity_level integer,
ADD COLUMN IF NOT EXISTS respondent_comments text,
ADD COLUMN IF NOT EXISTS auditor_comments text,
ADD COLUMN IF NOT EXISTS question_status text DEFAULT 'pending' CHECK (question_status IN ('pending', 'answered', 'under_review', 'evaluated')),
ADD COLUMN IF NOT EXISTS answered_by_user_id uuid,
ADD COLUMN IF NOT EXISTS answered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS evaluated_by_user_id uuid,
ADD COLUMN IF NOT EXISTS evaluated_at timestamp with time zone;

-- Criar tabela para papéis dos usuários nos assessments
CREATE TABLE IF NOT EXISTS assessment_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('respondent', 'auditor')),
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(assessment_id, user_id, role)
);

-- Habilitar RLS na nova tabela
ALTER TABLE assessment_user_roles ENABLE ROW LEVEL SECURITY;

-- Política para visualizar papéis do assessment
CREATE POLICY "Users can view assessment roles"
  ON assessment_user_roles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para gerenciar papéis do assessment (apenas admins e CISOs)
CREATE POLICY "Admins can manage assessment roles"
  ON assessment_user_roles
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

-- Atualizar a função de cálculo de progresso para considerar os novos status
CREATE OR REPLACE FUNCTION calculate_assessment_progress(assessment_id_param uuid)
RETURNS integer
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
  
  -- Get number of responses that are evaluated
  SELECT COUNT(*)
  INTO completed_responses
  FROM public.assessment_responses ar
  WHERE ar.assessment_id = assessment_id_param
    AND ar.question_status = 'evaluated';
  
  -- Calculate percentage
  IF total_controls > 0 THEN
    progress_percentage := ROUND((completed_responses::DECIMAL / total_controls::DECIMAL) * 100);
  ELSE
    progress_percentage := 0;
  END IF;
  
  RETURN progress_percentage;
END;
$$;

-- Função para calcular a média de maturidade CMMI
CREATE OR REPLACE FUNCTION calculate_cmmi_average(assessment_id_param uuid)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  average_maturity DECIMAL(3,2);
BEGIN
  SELECT ROUND(AVG(COALESCE(auditor_maturity_level, respondent_maturity_level))::DECIMAL, 2)
  INTO average_maturity
  FROM public.assessment_responses
  WHERE assessment_id = assessment_id_param
    AND (auditor_maturity_level IS NOT NULL OR respondent_maturity_level IS NOT NULL);
  
  RETURN COALESCE(average_maturity, 0.00);
END;
$$;

-- Atualizar o trigger para recalcular progresso quando status mudar
CREATE OR REPLACE FUNCTION update_assessment_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_progress INTEGER;
  cmmi_average DECIMAL(3,2);
BEGIN
  -- Calculate new progress
  new_progress := public.calculate_assessment_progress(NEW.assessment_id);
  
  -- Calculate CMMI average
  cmmi_average := public.calculate_cmmi_average(NEW.assessment_id);
  
  -- Update the assessment progress
  UPDATE public.assessments
  SET 
    progress = new_progress, 
    updated_at = now()
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$;

-- Comentar o campo maturity_level existente (será substituído pelos novos campos)
COMMENT ON COLUMN assessment_responses.maturity_level IS 'DEPRECATED: Use respondent_maturity_level and auditor_maturity_level instead';

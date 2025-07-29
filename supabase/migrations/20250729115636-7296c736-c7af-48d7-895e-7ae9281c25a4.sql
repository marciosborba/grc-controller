-- Primeiro, vamos melhorar a tabela risk_assessments para incluir o cálculo de risco
ALTER TABLE public.risk_assessments 
ADD COLUMN IF NOT EXISTS risk_level text;

-- Função para calcular o nível de risco baseado em impacto x probabilidade
CREATE OR REPLACE FUNCTION calculate_risk_level(impact_score integer, likelihood_score integer)
RETURNS text AS $$
BEGIN
  DECLARE
    risk_score integer := impact_score * likelihood_score;
  BEGIN
    CASE 
      WHEN risk_score >= 75 THEN RETURN 'Muito Alto';
      WHEN risk_score >= 50 THEN RETURN 'Alto';
      WHEN risk_score >= 25 THEN RETURN 'Médio';
      ELSE RETURN 'Baixo';
    END CASE;
  END;
END;
$$ LANGUAGE plpgsql;

-- Atualizar registros existentes
UPDATE public.risk_assessments 
SET risk_level = calculate_risk_level(impact_score, likelihood_score);

-- Criar tabela para planos de ação dos riscos
CREATE TABLE IF NOT EXISTS public.risk_action_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_id uuid NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
  treatment_type text NOT NULL CHECK (treatment_type IN ('Mitigar', 'Transferir', 'Evitar', 'Aceitar')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para atividades do plano de ação
CREATE TABLE IF NOT EXISTS public.risk_action_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_plan_id uuid NOT NULL REFERENCES public.risk_action_plans(id) ON DELETE CASCADE,
  description text NOT NULL,
  responsible_person text NOT NULL,
  deadline date,
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Concluída', 'Atrasada')),
  evidence_url text,
  evidence_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para comunicação e aceitação de riscos
CREATE TABLE IF NOT EXISTS public.risk_communications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_id uuid NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
  person_name text NOT NULL,
  person_email text NOT NULL,
  communication_date timestamp with time zone NOT NULL DEFAULT now(),
  decision text CHECK (decision IN ('Aprovar', 'Rejeitar', 'Aceitar')),
  justification text,
  notified_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.risk_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_action_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_communications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para risk_action_plans
CREATE POLICY "All authenticated users can view action plans" 
ON public.risk_action_plans 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Risk managers and admins can manage action plans" 
ON public.risk_action_plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'risk_manager'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

-- Políticas RLS para risk_action_activities
CREATE POLICY "All authenticated users can view activities" 
ON public.risk_action_activities 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Risk managers and admins can manage activities" 
ON public.risk_action_activities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'risk_manager'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

-- Políticas RLS para risk_communications
CREATE POLICY "All authenticated users can view communications" 
ON public.risk_communications 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Risk managers and admins can manage communications" 
ON public.risk_communications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'risk_manager'::app_role) OR has_role(auth.uid(), 'ciso'::app_role));

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_risk_action_plans_updated_at
BEFORE UPDATE ON public.risk_action_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_action_activities_updated_at
BEFORE UPDATE ON public.risk_action_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_communications_updated_at
BEFORE UPDATE ON public.risk_communications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para calcular automaticamente o risk_level quando um risco é inserido ou atualizado
CREATE OR REPLACE FUNCTION auto_calculate_risk_level()
RETURNS trigger AS $$
BEGIN
  NEW.risk_level = calculate_risk_level(NEW.impact_score, NEW.likelihood_score);
  NEW.risk_score = NEW.impact_score * NEW.likelihood_score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_risk_level_trigger
BEFORE INSERT OR UPDATE ON public.risk_assessments
FOR EACH ROW
EXECUTE FUNCTION auto_calculate_risk_level();
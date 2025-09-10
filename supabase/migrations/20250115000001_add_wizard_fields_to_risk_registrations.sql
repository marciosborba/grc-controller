-- Migration para adicionar campos específicos do wizard na tabela risk_registrations
-- Data: 2025-01-15
-- Objetivo: Adicionar campos para salvar dados detalhados do wizard de 7 etapas

-- Campos da Etapa 5: Plano de Ação - Primeira atividade
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS activity_1_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS activity_1_description TEXT,
ADD COLUMN IF NOT EXISTS activity_1_responsible VARCHAR(255),
ADD COLUMN IF NOT EXISTS activity_1_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS activity_1_priority VARCHAR(20) CHECK (activity_1_priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS activity_1_status VARCHAR(20) CHECK (activity_1_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS activity_1_due_date DATE;

-- Campos da Etapa 6: Comunicação - Pessoas de Ciência
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS awareness_person_1_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS awareness_person_1_position VARCHAR(255),
ADD COLUMN IF NOT EXISTS awareness_person_1_email VARCHAR(255);

-- Campos da Etapa 6: Comunicação - Pessoas de Aprovação
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS approval_person_1_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS approval_person_1_position VARCHAR(255),
ADD COLUMN IF NOT EXISTS approval_person_1_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS approval_person_1_status VARCHAR(20) CHECK (approval_person_1_status IN ('pending', 'approved', 'rejected', 'reviewing'));

-- Campos da Etapa 7: Monitoramento - Campos adicionais
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS closure_criteria TEXT;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN risk_registrations.activity_1_name IS 'Nome da primeira atividade do plano de ação';
COMMENT ON COLUMN risk_registrations.activity_1_description IS 'Descrição da primeira atividade do plano de ação';
COMMENT ON COLUMN risk_registrations.activity_1_responsible IS 'Responsável pela primeira atividade';
COMMENT ON COLUMN risk_registrations.activity_1_email IS 'Email do responsável pela primeira atividade';
COMMENT ON COLUMN risk_registrations.activity_1_priority IS 'Prioridade da primeira atividade';
COMMENT ON COLUMN risk_registrations.activity_1_status IS 'Status da primeira atividade';
COMMENT ON COLUMN risk_registrations.activity_1_due_date IS 'Data de vencimento da primeira atividade';

COMMENT ON COLUMN risk_registrations.awareness_person_1_name IS 'Nome da primeira pessoa de ciência';
COMMENT ON COLUMN risk_registrations.awareness_person_1_position IS 'Posição da primeira pessoa de ciência';
COMMENT ON COLUMN risk_registrations.awareness_person_1_email IS 'Email da primeira pessoa de ciência';

COMMENT ON COLUMN risk_registrations.approval_person_1_name IS 'Nome da primeira pessoa de aprovação';
COMMENT ON COLUMN risk_registrations.approval_person_1_position IS 'Posição da primeira pessoa de aprovação';
COMMENT ON COLUMN risk_registrations.approval_person_1_email IS 'Email da primeira pessoa de aprovação';
COMMENT ON COLUMN risk_registrations.approval_person_1_status IS 'Status de aprovação da primeira pessoa';

COMMENT ON COLUMN risk_registrations.closure_criteria IS 'Critérios de encerramento do risco';

-- Criar índices para performance nos campos mais utilizados
CREATE INDEX IF NOT EXISTS idx_risk_registrations_activity_1_responsible ON risk_registrations(activity_1_responsible);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_activity_1_status ON risk_registrations(activity_1_status);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_approval_person_1_status ON risk_registrations(approval_person_1_status);
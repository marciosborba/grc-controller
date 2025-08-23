-- Migration para adicionar campos faltantes na tabela risk_registrations
-- Data: 2025-01-15
-- Objetivo: Corrigir problemas de salvamento do formulário de registro de risco

-- Adicionar campos que estão sendo enviados pelo formulário mas não existem na tabela

-- Campos da Etapa 1 (Identificação) - Corrigir nomes
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS identification_date DATE,
ADD COLUMN IF NOT EXISTS responsible_area VARCHAR(100);

-- Campos da Etapa 2 (Análise) - Adicionar campos faltantes
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS methodology_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS probability_score INTEGER;

-- Campos da Etapa 3 (Classificação GUT) - Adicionar campos alternativos
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS gravity_score INTEGER CHECK (gravity_score >= 1 AND gravity_score <= 5),
ADD COLUMN IF NOT EXISTS urgency_score INTEGER CHECK (urgency_score >= 1 AND urgency_score <= 5),
ADD COLUMN IF NOT EXISTS tendency_score INTEGER CHECK (tendency_score >= 1 AND tendency_score <= 5);

-- Campos da Etapa 7 (Monitoramento) - Adicionar campos faltantes
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS monitoring_responsible VARCHAR(255),
ADD COLUMN IF NOT EXISTS review_date DATE,
ADD COLUMN IF NOT EXISTS residual_risk_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS residual_probability INTEGER,
ADD COLUMN IF NOT EXISTS closure_criteria TEXT,
ADD COLUMN IF NOT EXISTS monitoring_notes TEXT,
ADD COLUMN IF NOT EXISTS kpi_definition TEXT;

-- Adicionar campo de data de finalização
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN risk_registrations.identification_date IS 'Data de identificação do risco (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.responsible_area IS 'Área responsável pelo risco (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.methodology_id IS 'ID da metodologia de análise (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.probability_score IS 'Score de probabilidade (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.gravity_score IS 'Score de gravidade GUT (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.urgency_score IS 'Score de urgência GUT (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.tendency_score IS 'Score de tendência GUT (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.monitoring_responsible IS 'Responsável pelo monitoramento (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.review_date IS 'Data de revisão (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.residual_risk_level IS 'Nível do risco residual (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.residual_probability IS 'Probabilidade do risco residual (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.closure_criteria IS 'Critérios de encerramento (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.monitoring_notes IS 'Notas de monitoramento (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.kpi_definition IS 'Definição de KPIs (usado pelo formulário)';
COMMENT ON COLUMN risk_registrations.completed_at IS 'Data e hora de finalização do registro';

-- Criar índices para performance nos novos campos mais utilizados
CREATE INDEX IF NOT EXISTS idx_risk_registrations_identification_date ON risk_registrations(identification_date);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_responsible_area ON risk_registrations(responsible_area);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_methodology_id ON risk_registrations(methodology_id);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_monitoring_responsible ON risk_registrations(monitoring_responsible);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_completed_at ON risk_registrations(completed_at);

-- Atualizar trigger para incluir novos campos no updated_at
-- (O trigger já existe e funciona para toda a tabela)

-- Log da migration
INSERT INTO risk_registration_history (
    risk_registration_id,
    step_number,
    step_name,
    completed_by,
    notes
) 
SELECT 
    id,
    0,
    'Database Migration',
    created_by,
    'Adicionados campos faltantes para compatibilidade com formulário'
FROM risk_registrations 
WHERE created_at > NOW() - INTERVAL '1 day'
ON CONFLICT DO NOTHING;
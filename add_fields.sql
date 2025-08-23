-- Adicionar campos faltantes na tabela risk_registrations

-- Campos da Etapa 1 (Identificação)
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS identification_date DATE;
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS responsible_area VARCHAR(100);

-- Campos da Etapa 2 (Análise)
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS methodology_id VARCHAR(50);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS probability_score INTEGER;

-- Campos da Etapa 3 (Classificação GUT)
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS gravity_score INTEGER CHECK (gravity_score >= 1 AND gravity_score <= 5);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS urgency_score INTEGER CHECK (urgency_score >= 1 AND urgency_score <= 5);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS tendency_score INTEGER CHECK (tendency_score >= 1 AND tendency_score <= 5);

-- Campos da Etapa 7 (Monitoramento)
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_responsible VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS review_date DATE;
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS residual_risk_level VARCHAR(50);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS residual_probability INTEGER;
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS closure_criteria TEXT;
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_notes TEXT;
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS kpi_definition TEXT;

-- Campo de data de finalização
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
-- Script SQL direto para adicionar campos faltantes na tabela risk_registrations
-- Execute este script diretamente no Supabase SQL Editor ou via CLI

-- Verificar e adicionar campos faltantes
DO $$ 
BEGIN
    RAISE NOTICE 'Iniciando adição de campos faltantes na tabela risk_registrations...';

    -- Adicionar methodology_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'methodology_id') THEN
        ALTER TABLE risk_registrations ADD COLUMN methodology_id VARCHAR(50);
        RAISE NOTICE '✅ Campo methodology_id adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo methodology_id já existe';
    END IF;

    -- Adicionar probability_score se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'probability_score') THEN
        ALTER TABLE risk_registrations ADD COLUMN probability_score INTEGER;
        RAISE NOTICE '✅ Campo probability_score adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo probability_score já existe';
    END IF;

    -- Adicionar campos alternativos para GUT
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'gravity_score') THEN
        ALTER TABLE risk_registrations ADD COLUMN gravity_score INTEGER CHECK (gravity_score >= 1 AND gravity_score <= 5);
        RAISE NOTICE '✅ Campo gravity_score adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo gravity_score já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'urgency_score') THEN
        ALTER TABLE risk_registrations ADD COLUMN urgency_score INTEGER CHECK (urgency_score >= 1 AND urgency_score <= 5);
        RAISE NOTICE '✅ Campo urgency_score adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo urgency_score já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'tendency_score') THEN
        ALTER TABLE risk_registrations ADD COLUMN tendency_score INTEGER CHECK (tendency_score >= 1 AND tendency_score <= 5);
        RAISE NOTICE '✅ Campo tendency_score adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo tendency_score já existe';
    END IF;

    -- Adicionar monitoring_responsible se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'monitoring_responsible') THEN
        ALTER TABLE risk_registrations ADD COLUMN monitoring_responsible VARCHAR(255);
        RAISE NOTICE '✅ Campo monitoring_responsible adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo monitoring_responsible já existe';
    END IF;

    -- Adicionar review_date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'review_date') THEN
        ALTER TABLE risk_registrations ADD COLUMN review_date DATE;
        RAISE NOTICE '✅ Campo review_date adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo review_date já existe';
    END IF;

    -- Adicionar residual_risk_level se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'residual_risk_level') THEN
        ALTER TABLE risk_registrations ADD COLUMN residual_risk_level VARCHAR(50);
        RAISE NOTICE '✅ Campo residual_risk_level adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo residual_risk_level já existe';
    END IF;

    -- Adicionar residual_probability se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'residual_probability') THEN
        ALTER TABLE risk_registrations ADD COLUMN residual_probability INTEGER;
        RAISE NOTICE '✅ Campo residual_probability adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo residual_probability já existe';
    END IF;

    -- Adicionar closure_criteria se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'closure_criteria') THEN
        ALTER TABLE risk_registrations ADD COLUMN closure_criteria TEXT;
        RAISE NOTICE '✅ Campo closure_criteria adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo closure_criteria já existe';
    END IF;

    -- Adicionar monitoring_notes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'monitoring_notes') THEN
        ALTER TABLE risk_registrations ADD COLUMN monitoring_notes TEXT;
        RAISE NOTICE '✅ Campo monitoring_notes adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo monitoring_notes já existe';
    END IF;

    -- Adicionar kpi_definition se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'kpi_definition') THEN
        ALTER TABLE risk_registrations ADD COLUMN kpi_definition TEXT;
        RAISE NOTICE '✅ Campo kpi_definition adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo kpi_definition já existe';
    END IF;

    -- Adicionar campos de identificação alternativos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'identification_date') THEN
        ALTER TABLE risk_registrations ADD COLUMN identification_date DATE;
        RAISE NOTICE '✅ Campo identification_date adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo identification_date já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'responsible_area') THEN
        ALTER TABLE risk_registrations ADD COLUMN responsible_area VARCHAR(100);
        RAISE NOTICE '✅ Campo responsible_area adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo responsible_area já existe';
    END IF;

    RAISE NOTICE 'Processo de adição de campos concluído!';

END $$;

-- Criar índices para performance nos novos campos mais utilizados
CREATE INDEX IF NOT EXISTS idx_risk_registrations_methodology_id ON risk_registrations(methodology_id);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_monitoring_responsible ON risk_registrations(monitoring_responsible);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_identification_date ON risk_registrations(identification_date);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_responsible_area ON risk_registrations(responsible_area);

-- Comentários para documentar os novos campos
COMMENT ON COLUMN risk_registrations.methodology_id IS 'ID da metodologia de análise selecionada';
COMMENT ON COLUMN risk_registrations.probability_score IS 'Score de probabilidade alternativo';
COMMENT ON COLUMN risk_registrations.gravity_score IS 'Score de gravidade GUT alternativo';
COMMENT ON COLUMN risk_registrations.urgency_score IS 'Score de urgência GUT alternativo';
COMMENT ON COLUMN risk_registrations.tendency_score IS 'Score de tendência GUT alternativo';
COMMENT ON COLUMN risk_registrations.monitoring_responsible IS 'Responsável pelo monitoramento do risco';
COMMENT ON COLUMN risk_registrations.review_date IS 'Data de revisão do risco';
COMMENT ON COLUMN risk_registrations.residual_risk_level IS 'Nível do risco residual';
COMMENT ON COLUMN risk_registrations.residual_probability IS 'Probabilidade do risco residual';
COMMENT ON COLUMN risk_registrations.closure_criteria IS 'Critérios para encerramento do risco';
COMMENT ON COLUMN risk_registrations.monitoring_notes IS 'Notas de monitoramento';
COMMENT ON COLUMN risk_registrations.kpi_definition IS 'Definição de KPIs para monitoramento';
COMMENT ON COLUMN risk_registrations.identification_date IS 'Data de identificação do risco';
COMMENT ON COLUMN risk_registrations.responsible_area IS 'Área responsável pelo risco';

-- Verificar campos adicionados
SELECT 
    'risk_registrations' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_registrations' 
    AND column_name IN (
        'methodology_id', 'probability_score', 'gravity_score', 'urgency_score', 
        'tendency_score', 'monitoring_responsible', 'review_date', 
        'residual_risk_level', 'residual_probability', 'closure_criteria', 
        'monitoring_notes', 'kpi_definition', 'identification_date', 'responsible_area'
    )
ORDER BY column_name;
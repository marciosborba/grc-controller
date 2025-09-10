-- Script para aplicar campos do wizard diretamente no banco
-- Executar via Supabase SQL Editor

DO $$
BEGIN
    -- Campos da Etapa 5: Plano de Ação - Primeira atividade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'activity_1_name') THEN
        ALTER TABLE risk_registrations ADD COLUMN activity_1_name VARCHAR(255);
        RAISE NOTICE '✅ Campo activity_1_name adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo activity_1_name já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'activity_1_description') THEN
        ALTER TABLE risk_registrations ADD COLUMN activity_1_description TEXT;
        RAISE NOTICE '✅ Campo activity_1_description adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo activity_1_description já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'activity_1_responsible') THEN
        ALTER TABLE risk_registrations ADD COLUMN activity_1_responsible VARCHAR(255);
        RAISE NOTICE '✅ Campo activity_1_responsible adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo activity_1_responsible já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'activity_1_email') THEN
        ALTER TABLE risk_registrations ADD COLUMN activity_1_email VARCHAR(255);
        RAISE NOTICE '✅ Campo activity_1_email adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo activity_1_email já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'activity_1_priority') THEN
        ALTER TABLE risk_registrations ADD COLUMN activity_1_priority VARCHAR(20);
        RAISE NOTICE '✅ Campo activity_1_priority adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo activity_1_priority já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'activity_1_status') THEN
        ALTER TABLE risk_registrations ADD COLUMN activity_1_status VARCHAR(20);
        RAISE NOTICE '✅ Campo activity_1_status adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo activity_1_status já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'activity_1_due_date') THEN
        ALTER TABLE risk_registrations ADD COLUMN activity_1_due_date DATE;
        RAISE NOTICE '✅ Campo activity_1_due_date adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo activity_1_due_date já existe';
    END IF;

    -- Campos da Etapa 6: Comunicação - Pessoas de Ciência
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'awareness_person_1_name') THEN
        ALTER TABLE risk_registrations ADD COLUMN awareness_person_1_name VARCHAR(255);
        RAISE NOTICE '✅ Campo awareness_person_1_name adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo awareness_person_1_name já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'awareness_person_1_position') THEN
        ALTER TABLE risk_registrations ADD COLUMN awareness_person_1_position VARCHAR(255);
        RAISE NOTICE '✅ Campo awareness_person_1_position adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo awareness_person_1_position já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'awareness_person_1_email') THEN
        ALTER TABLE risk_registrations ADD COLUMN awareness_person_1_email VARCHAR(255);
        RAISE NOTICE '✅ Campo awareness_person_1_email adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo awareness_person_1_email já existe';
    END IF;

    -- Campos da Etapa 6: Comunicação - Pessoas de Aprovação
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'approval_person_1_name') THEN
        ALTER TABLE risk_registrations ADD COLUMN approval_person_1_name VARCHAR(255);
        RAISE NOTICE '✅ Campo approval_person_1_name adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo approval_person_1_name já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'approval_person_1_position') THEN
        ALTER TABLE risk_registrations ADD COLUMN approval_person_1_position VARCHAR(255);
        RAISE NOTICE '✅ Campo approval_person_1_position adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo approval_person_1_position já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'approval_person_1_email') THEN
        ALTER TABLE risk_registrations ADD COLUMN approval_person_1_email VARCHAR(255);
        RAISE NOTICE '✅ Campo approval_person_1_email adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo approval_person_1_email já existe';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'approval_person_1_status') THEN
        ALTER TABLE risk_registrations ADD COLUMN approval_person_1_status VARCHAR(20);
        RAISE NOTICE '✅ Campo approval_person_1_status adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo approval_person_1_status já existe';
    END IF;

    -- Campo adicional de monitoramento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'risk_registrations' AND column_name = 'closure_criteria') THEN
        ALTER TABLE risk_registrations ADD COLUMN closure_criteria TEXT;
        RAISE NOTICE '✅ Campo closure_criteria adicionado';
    ELSE
        RAISE NOTICE '⚠️ Campo closure_criteria já existe';
    END IF;

END $$;

-- Adicionar constraints após criar os campos
DO $$
BEGIN
    -- Constraints para activity_1_priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'risk_registrations_activity_1_priority_check') THEN
        ALTER TABLE risk_registrations 
        ADD CONSTRAINT risk_registrations_activity_1_priority_check 
        CHECK (activity_1_priority IN ('low', 'medium', 'high', 'critical'));
        RAISE NOTICE '✅ Constraint activity_1_priority adicionada';
    END IF;

    -- Constraints para activity_1_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'risk_registrations_activity_1_status_check') THEN
        ALTER TABLE risk_registrations 
        ADD CONSTRAINT risk_registrations_activity_1_status_check 
        CHECK (activity_1_status IN ('pending', 'in_progress', 'completed', 'cancelled'));
        RAISE NOTICE '✅ Constraint activity_1_status adicionada';
    END IF;

    -- Constraints para approval_person_1_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'risk_registrations_approval_person_1_status_check') THEN
        ALTER TABLE risk_registrations 
        ADD CONSTRAINT risk_registrations_approval_person_1_status_check 
        CHECK (approval_person_1_status IN ('pending', 'approved', 'rejected', 'reviewing'));
        RAISE NOTICE '✅ Constraint approval_person_1_status adicionada';
    END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_risk_registrations_activity_1_responsible ON risk_registrations(activity_1_responsible);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_activity_1_status ON risk_registrations(activity_1_status);
CREATE INDEX IF NOT EXISTS idx_risk_registrations_approval_person_1_status ON risk_registrations(approval_person_1_status);

-- Adicionar comentários
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

-- Verificar se todos os campos foram criados
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_registrations' 
AND column_name IN (
    'activity_1_name', 'activity_1_description', 'activity_1_responsible', 'activity_1_email',
    'activity_1_priority', 'activity_1_status', 'activity_1_due_date',
    'awareness_person_1_name', 'awareness_person_1_position', 'awareness_person_1_email',
    'approval_person_1_name', 'approval_person_1_position', 'approval_person_1_email', 'approval_person_1_status',
    'closure_criteria'
)
ORDER BY column_name;
-- Script mínimo para corrigir problemas essenciais da tabela risk_assessments
-- Execute este SQL no Dashboard do Supabase: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd

-- 1. Verificar estrutura atual
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
ORDER BY ordinal_position;

-- 2. Remover constraints problemáticos se existirem
DO $$
BEGIN
    -- Remover constraint de probability que está causando erro
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_probability_check'
    ) THEN
        ALTER TABLE public.risk_assessments DROP CONSTRAINT risk_assessments_probability_check;
        RAISE NOTICE 'Constraint risk_assessments_probability_check removido';
    END IF;
    
    -- Remover outros constraints problemáticos
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name LIKE '%probability%'
    ) THEN
        EXECUTE 'ALTER TABLE public.risk_assessments DROP CONSTRAINT ' || 
                (SELECT constraint_name FROM information_schema.table_constraints 
                 WHERE table_name = 'risk_assessments' AND constraint_name LIKE '%probability%' LIMIT 1);
        RAISE NOTICE 'Constraint de probability removido';
    END IF;
END $$;

-- 3. Adicionar tenant_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.risk_assessments ADD COLUMN tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f';
        RAISE NOTICE 'Coluna tenant_id adicionada';
    END IF;
END $$;

-- 4. Alterar assigned_to para TEXT se for UUID
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'assigned_to' 
        AND data_type = 'uuid'
    ) THEN
        -- Limpar dados inválidos primeiro
        UPDATE public.risk_assessments SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
        
        -- Alterar tipo da coluna
        ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;
        RAISE NOTICE 'Campo assigned_to alterado para TEXT';
    END IF;
END $$;

-- 5. Garantir que campos de score existam e sejam INTEGER
DO $$
BEGIN
    -- Verificar e ajustar probability
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'probability'
        AND data_type = 'integer'
    ) THEN
        -- Se probability for string, converter para integer
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'risk_assessments' 
            AND column_name = 'probability'
        ) THEN
            ALTER TABLE public.risk_assessments ALTER COLUMN probability TYPE INTEGER USING CASE 
                WHEN probability ~ '^[0-9]+$' THEN probability::INTEGER 
                ELSE 3 
            END;
        ELSE
            ALTER TABLE public.risk_assessments ADD COLUMN probability INTEGER DEFAULT 3;
        END IF;
        RAISE NOTICE 'Campo probability ajustado para INTEGER';
    END IF;
    
    -- Verificar likelihood_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'likelihood_score'
    ) THEN
        ALTER TABLE public.risk_assessments ADD COLUMN likelihood_score INTEGER DEFAULT 3;
        RAISE NOTICE 'Campo likelihood_score adicionado';
    END IF;
    
    -- Verificar impact_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'impact_score'
    ) THEN
        ALTER TABLE public.risk_assessments ADD COLUMN impact_score INTEGER DEFAULT 3;
        RAISE NOTICE 'Campo impact_score adicionado';
    END IF;
END $$;

-- 6. Adicionar constraints corretos (sem conflito)
DO $$
BEGIN
    -- Constraint para probability
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_probability_range'
    ) THEN
        ALTER TABLE public.risk_assessments ADD CONSTRAINT risk_assessments_probability_range 
        CHECK (probability >= 1 AND probability <= 5);
        RAISE NOTICE 'Constraint probability_range adicionado';
    END IF;
    
    -- Constraint para likelihood_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_likelihood_range'
    ) THEN
        ALTER TABLE public.risk_assessments ADD CONSTRAINT risk_assessments_likelihood_range 
        CHECK (likelihood_score >= 1 AND likelihood_score <= 5);
        RAISE NOTICE 'Constraint likelihood_range adicionado';
    END IF;
    
    -- Constraint para impact_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_impact_range'
    ) THEN
        ALTER TABLE public.risk_assessments ADD CONSTRAINT risk_assessments_impact_range 
        CHECK (impact_score >= 1 AND impact_score <= 5);
        RAISE NOTICE 'Constraint impact_range adicionado';
    END IF;
END $$;

-- 7. Atualizar dados existentes para serem válidos
UPDATE public.risk_assessments 
SET 
    probability = CASE 
        WHEN probability < 1 THEN 1 
        WHEN probability > 5 THEN 5 
        ELSE probability 
    END,
    likelihood_score = CASE 
        WHEN likelihood_score < 1 THEN 1 
        WHEN likelihood_score > 5 THEN 5 
        ELSE likelihood_score 
    END,
    impact_score = CASE 
        WHEN impact_score < 1 THEN 1 
        WHEN impact_score > 5 THEN 5 
        ELSE impact_score 
    END
WHERE probability IS NOT NULL OR likelihood_score IS NOT NULL OR impact_score IS NOT NULL;

-- 8. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
AND column_name IN ('tenant_id', 'assigned_to', 'probability', 'likelihood_score', 'impact_score')
ORDER BY column_name;

-- 9. Verificar constraints
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'risk_assessments'
AND constraint_name LIKE '%probability%' OR constraint_name LIKE '%likelihood%' OR constraint_name LIKE '%impact%';

RAISE NOTICE 'Correções mínimas aplicadas com sucesso!';
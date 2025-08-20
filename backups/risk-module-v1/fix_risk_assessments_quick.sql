-- Script para corrigir rapidamente a tabela risk_assessments
-- Execute este SQL no Dashboard do Supabase

-- 1. Remover constraint problemático se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_probability_check'
    ) THEN
        ALTER TABLE public.risk_assessments DROP CONSTRAINT risk_assessments_probability_check;
        RAISE NOTICE 'Constraint risk_assessments_probability_check removido';
    END IF;
END $$;

-- 2. Adicionar tenant_id se não existir
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

-- 3. Alterar assigned_to para TEXT se for UUID
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'assigned_to' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;
        RAISE NOTICE 'Coluna assigned_to alterada para TEXT';
    END IF;
END $$;

-- 4. Adicionar constraint correto para probability
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'risk_assessments' 
        AND constraint_name = 'risk_assessments_probability_range'
    ) THEN
        ALTER TABLE public.risk_assessments ADD CONSTRAINT risk_assessments_probability_range 
        CHECK (probability >= 1 AND probability <= 5);
        RAISE NOTICE 'Constraint probability_range adicionado';
    END IF;
END $$;

-- 5. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
ORDER BY ordinal_position;

-- 6. Verificar constraints
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'risk_assessments';

RAISE NOTICE 'Correções aplicadas com sucesso!';
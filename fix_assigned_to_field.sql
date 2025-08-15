-- Script para corrigir o campo assigned_to na tabela risk_assessments
-- Execute este SQL no Dashboard do Supabase: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd

-- 1. Verificar estrutura atual do campo assigned_to
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
AND column_name = 'assigned_to';

-- 2. Se o campo for UUID, alterar para TEXT
DO $$
BEGIN
    -- Verificar se o campo existe e é UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'assigned_to' 
        AND data_type = 'uuid'
    ) THEN
        -- Limpar dados existentes que podem estar inválidos
        UPDATE public.risk_assessments SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
        
        -- Alterar tipo da coluna para TEXT
        ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;
        
        RAISE NOTICE 'Campo assigned_to alterado de UUID para TEXT';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'assigned_to'
    ) THEN
        RAISE NOTICE 'Campo assigned_to já existe como TEXT';
    ELSE
        -- Criar campo se não existir
        ALTER TABLE public.risk_assessments ADD COLUMN assigned_to TEXT;
        RAISE NOTICE 'Campo assigned_to criado como TEXT';
    END IF;
END $$;

-- 3. Verificar se tenant_id existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.risk_assessments ADD COLUMN tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f';
        RAISE NOTICE 'Campo tenant_id adicionado';
    ELSE
        RAISE NOTICE 'Campo tenant_id já existe';
    END IF;
END $$;

-- 4. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
AND column_name IN ('assigned_to', 'tenant_id', 'probability', 'likelihood_score', 'impact_score')
ORDER BY column_name;

-- 5. Verificar constraints problemáticos
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'risk_assessments'
AND constraint_name LIKE '%probability%';

RAISE NOTICE 'Verificação completa da estrutura da tabela risk_assessments finalizada!';
-- Script para adicionar coluna analysis_data na tabela risk_assessments
-- Execute este SQL no Dashboard do Supabase: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd

-- Verificar se a coluna analysis_data existe
DO $$
BEGIN
    -- Adicionar coluna analysis_data se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'risk_assessments' 
        AND column_name = 'analysis_data'
    ) THEN
        ALTER TABLE public.risk_assessments ADD COLUMN analysis_data JSONB DEFAULT '{}';
        RAISE NOTICE 'Coluna analysis_data adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna analysis_data já existe';
    END IF;
END $$;

-- Criar índice para a coluna analysis_data se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'risk_assessments' 
        AND indexname = 'idx_risk_assessments_analysis_data'
    ) THEN
        CREATE INDEX idx_risk_assessments_analysis_data ON public.risk_assessments USING gin (analysis_data);
        RAISE NOTICE 'Índice para analysis_data criado';
    ELSE
        RAISE NOTICE 'Índice para analysis_data já existe';
    END IF;
END $$;

-- Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
AND column_name = 'analysis_data';

RAISE NOTICE 'Coluna analysis_data configurada com sucesso!';
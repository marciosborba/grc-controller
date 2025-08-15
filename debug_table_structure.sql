-- Script para debugar a estrutura da tabela risk_assessments
-- Execute este SQL no Dashboard do Supabase: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd

-- 1. Verificar estrutura completa da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT 
    constraint_name, 
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'risk_assessments'
ORDER BY constraint_type, constraint_name;

-- 3. Verificar constraints de check específicos
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%risk_assessments%'
ORDER BY constraint_name;

-- 4. Verificar se a tabela existe
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'risk_assessments'
) as table_exists;

-- 5. Verificar campos UUID específicos
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
AND data_type = 'uuid'
ORDER BY column_name;

-- 6. Tentar inserir um registro de teste para identificar o problema
-- CUIDADO: Este INSERT pode falhar, mas vai mostrar qual campo está causando erro
/*
INSERT INTO public.risk_assessments (
    title,
    description,
    risk_category,
    probability,
    likelihood_score,
    impact_score,
    risk_level,
    status,
    assigned_to,
    tenant_id,
    created_by,
    severity
) VALUES (
    'Teste Debug',
    'Teste para identificar problema',
    'Operacional',
    3,
    3,
    3,
    'Médio',
    'Identificado',
    'teste',  -- Este é o valor que está causando erro
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    'medium'
);
*/

RAISE NOTICE 'Estrutura da tabela risk_assessments verificada!';
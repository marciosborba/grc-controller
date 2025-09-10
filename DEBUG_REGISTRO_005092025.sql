-- ============================================================================
-- SCRIPT DE DEBUG PARA REGISTRO 005092025
-- ============================================================================
-- Execute este script no SQL Editor do Supabase para verificar os dados

-- 1. Verificar se os campos do wizard existem na tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'risk_registrations' 
AND column_name IN (
    'activity_1_name', 'activity_1_description', 'activity_1_responsible', 'activity_1_email',
    'activity_1_priority', 'activity_1_status', 'activity_1_due_date',
    'awareness_person_1_name', 'awareness_person_1_position', 'awareness_person_1_email',
    'approval_person_1_name', 'approval_person_1_position', 'approval_person_1_email', 'approval_person_1_status',
    'treatment_rationale', 'treatment_cost', 'treatment_timeline',
    'monitoring_frequency', 'monitoring_responsible', 'closure_criteria'
)
ORDER BY column_name;

-- 2. Buscar o registro 005092025 por diferentes critérios
SELECT 
    '=== BUSCA POR RISK_CODE ===' as info;

SELECT 
    id,
    risk_code,
    risk_title,
    status,
    created_at
FROM risk_registrations 
WHERE risk_code = '005092025'
LIMIT 5;

-- 3. Buscar por título que contenha 005092025
SELECT 
    '=== BUSCA POR TÍTULO ===' as info;

SELECT 
    id,
    risk_code,
    risk_title,
    status,
    created_at
FROM risk_registrations 
WHERE risk_title ILIKE '%005092025%'
LIMIT 5;

-- 4. Buscar registros mais recentes (caso o código seja diferente)
SELECT 
    '=== REGISTROS MAIS RECENTES ===' as info;

SELECT 
    id,
    risk_code,
    risk_title,
    status,
    created_at,
    -- Verificar se tem dados do wizard
    CASE WHEN activity_1_name IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_plano_acao,
    CASE WHEN awareness_person_1_name IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_comunicacao,
    CASE WHEN treatment_rationale IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_tratamento
FROM risk_registrations 
ORDER BY created_at DESC
LIMIT 10;

-- 5. Se encontrar o registro, mostrar todos os dados do wizard
DO $$
DECLARE
    target_record RECORD;
BEGIN
    -- Tentar encontrar o registro por diferentes critérios
    SELECT * INTO target_record
    FROM risk_registrations 
    WHERE risk_code = '005092025' 
       OR risk_title ILIKE '%005092025%'
       OR id::text ILIKE '%005092025%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF target_record.id IS NOT NULL THEN
        RAISE NOTICE '🎯 REGISTRO ENCONTRADO: %', target_record.id;
        RAISE NOTICE '📋 Código: %', target_record.risk_code;
        RAISE NOTICE '📝 Título: %', target_record.risk_title;
        RAISE NOTICE '📅 Criado em: %', target_record.created_at;
        RAISE NOTICE '';
        RAISE NOTICE '=== DADOS DO PLANO DE AÇÃO ===';
        RAISE NOTICE 'activity_1_name: %', COALESCE(target_record.activity_1_name, 'NULL');
        RAISE NOTICE 'activity_1_description: %', COALESCE(target_record.activity_1_description, 'NULL');
        RAISE NOTICE 'activity_1_responsible: %', COALESCE(target_record.activity_1_responsible, 'NULL');
        RAISE NOTICE 'activity_1_email: %', COALESCE(target_record.activity_1_email, 'NULL');
        RAISE NOTICE '';
        RAISE NOTICE '=== DADOS DE COMUNICAÇÃO ===';
        RAISE NOTICE 'awareness_person_1_name: %', COALESCE(target_record.awareness_person_1_name, 'NULL');
        RAISE NOTICE 'awareness_person_1_position: %', COALESCE(target_record.awareness_person_1_position, 'NULL');
        RAISE NOTICE 'awareness_person_1_email: %', COALESCE(target_record.awareness_person_1_email, 'NULL');
        RAISE NOTICE 'approval_person_1_name: %', COALESCE(target_record.approval_person_1_name, 'NULL');
        RAISE NOTICE '';
        RAISE NOTICE '=== DADOS DE TRATAMENTO ===';
        RAISE NOTICE 'treatment_rationale: %', COALESCE(target_record.treatment_rationale, 'NULL');
        RAISE NOTICE 'treatment_cost: %', COALESCE(target_record.treatment_cost::text, 'NULL');
        RAISE NOTICE 'treatment_timeline: %', COALESCE(target_record.treatment_timeline, 'NULL');
    ELSE
        RAISE NOTICE '❌ REGISTRO 005092025 NÃO ENCONTRADO';
        RAISE NOTICE 'Verificando registros similares...';
        
        -- Mostrar registros que podem ser o que estamos procurando
        FOR target_record IN 
            SELECT id, risk_code, risk_title, created_at
            FROM risk_registrations 
            ORDER BY created_at DESC
            LIMIT 5
        LOOP
            RAISE NOTICE 'Registro: % | Código: % | Título: %', 
                target_record.id, 
                COALESCE(target_record.risk_code, 'SEM CÓDIGO'), 
                target_record.risk_title;
        END LOOP;
    END IF;
END $$;

-- 6. Verificar se existem dados nas tabelas relacionadas
SELECT 
    '=== TABELAS RELACIONADAS ===' as info;

-- Action plans
SELECT 
    'risk_action_plans' as tabela,
    COUNT(*) as total_registros
FROM risk_action_plans;

-- Stakeholders  
SELECT 
    'risk_stakeholders' as tabela,
    COUNT(*) as total_registros
FROM risk_stakeholders;

-- 7. Verificar se o registro tem dados nas tabelas relacionadas
SELECT 
    '=== DADOS RELACIONADOS PARA 005092025 ===' as info;

-- Buscar action plans relacionados
SELECT 
    rap.id,
    rap.activity_name,
    rap.responsible_person,
    rap.status,
    rr.risk_code,
    rr.risk_title
FROM risk_action_plans rap
JOIN risk_registrations rr ON rap.risk_registration_id = rr.id
WHERE rr.risk_code = '005092025' 
   OR rr.risk_title ILIKE '%005092025%';

-- Buscar stakeholders relacionados
SELECT 
    rs.id,
    rs.person_name,
    rs.person_position,
    rs.stakeholder_type,
    rr.risk_code,
    rr.risk_title
FROM risk_stakeholders rs
JOIN risk_registrations rr ON rs.risk_registration_id = rr.id
WHERE rr.risk_code = '005092025' 
   OR rr.risk_title ILIKE '%005092025%';
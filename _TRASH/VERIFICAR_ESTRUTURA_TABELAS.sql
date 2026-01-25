-- ============================================================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DAS TABELAS RELACIONADAS
-- ============================================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela risk_action_plans
SELECT 
    '=== ESTRUTURA DA TABELA risk_action_plans ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_action_plans'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela risk_stakeholders
SELECT 
    '=== ESTRUTURA DA TABELA risk_stakeholders ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_stakeholders'
ORDER BY ordinal_position;

-- 3. Verificar se as tabelas existem
SELECT 
    '=== TABELAS RELACIONADAS EXISTENTES ===' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('risk_action_plans', 'risk_stakeholders', 'risk_registration_action_plans')
ORDER BY table_name;

-- 4. Verificar dados de exemplo nas tabelas
SELECT 
    '=== DADOS DE EXEMPLO - risk_action_plans ===' as info;

SELECT 
    id,
    risk_registration_id,
    -- Tentar diferentes nomes de campos possíveis
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risk_action_plans' AND column_name = 'activity_name') 
        THEN 'activity_name existe'
        ELSE 'activity_name NÃO existe'
    END as activity_name_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risk_action_plans' AND column_name = 'name') 
        THEN 'name existe'
        ELSE 'name NÃO existe'
    END as name_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risk_action_plans' AND column_name = 'description') 
        THEN 'description existe'
        ELSE 'description NÃO existe'
    END as description_status
FROM risk_action_plans
LIMIT 1;

-- 5. Verificar dados de exemplo nas stakeholders
SELECT 
    '=== DADOS DE EXEMPLO - risk_stakeholders ===' as info;

SELECT 
    id,
    risk_registration_id,
    -- Tentar diferentes nomes de campos possíveis
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risk_stakeholders' AND column_name = 'person_name') 
        THEN 'person_name existe'
        ELSE 'person_name NÃO existe'
    END as person_name_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risk_stakeholders' AND column_name = 'name') 
        THEN 'name existe'
        ELSE 'name NÃO existe'
    END as name_status
FROM risk_stakeholders
LIMIT 1;

-- 6. Verificar se existe tabela alternativa risk_registration_action_plans
SELECT 
    '=== VERIFICANDO TABELA ALTERNATIVA ===' as info;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'risk_registration_action_plans') THEN
        RAISE NOTICE '✅ Tabela risk_registration_action_plans existe';
        
        -- Mostrar estrutura
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'risk_registration_action_plans'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Campo: % - Tipo: %', rec.column_name, rec.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Tabela risk_registration_action_plans NÃO existe';
    END IF;
END $$;

-- 7. Testar query correta baseada na estrutura real
DO $$
DECLARE
    query_text TEXT;
    rec RECORD;
BEGIN
    RAISE NOTICE '=== TESTANDO QUERY CORRETA ===';
    
    -- Construir query baseada nos campos que realmente existem
    query_text := 'SELECT rr.id, rr.risk_title';
    
    -- Adicionar campos de action plans se a tabela existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'risk_action_plans') THEN
        RAISE NOTICE 'Tabela risk_action_plans encontrada';
        
        -- Verificar quais campos existem e adicionar à query
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risk_action_plans' AND column_name = 'activity_name') THEN
            query_text := query_text || ', rap.activity_name';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'risk_action_plans' AND column_name = 'description') THEN
            query_text := query_text || ', rap.description';
        END IF;
        
        query_text := query_text || ' FROM risk_registrations rr LEFT JOIN risk_action_plans rap ON rr.id = rap.risk_registration_id';
    ELSE
        query_text := query_text || ' FROM risk_registrations rr';
    END IF;
    
    query_text := query_text || ' LIMIT 1';
    
    RAISE NOTICE 'Query sugerida: %', query_text;
    
    -- Tentar executar a query
    BEGIN
        EXECUTE query_text;
        RAISE NOTICE '✅ Query executada com sucesso';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro na query: %', SQLERRM;
    END;
END $$;
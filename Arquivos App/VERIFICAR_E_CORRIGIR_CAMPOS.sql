-- ============================================================================
-- SCRIPT PARA VERIFICAR E CORRIGIR CAMPOS DO WIZARD
-- ============================================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se os campos existem
DO $$
DECLARE
    campos_faltantes TEXT[] := ARRAY[]::TEXT[];
    campo TEXT;
    campos_necessarios TEXT[] := ARRAY[
        'activity_1_name',
        'activity_1_description', 
        'activity_1_responsible',
        'activity_1_email',
        'activity_1_priority',
        'activity_1_status',
        'activity_1_due_date',
        'awareness_person_1_name',
        'awareness_person_1_position',
        'awareness_person_1_email',
        'approval_person_1_name',
        'approval_person_1_position', 
        'approval_person_1_email',
        'approval_person_1_status',
        'treatment_rationale',
        'treatment_cost',
        'treatment_timeline',
        'monitoring_frequency',
        'monitoring_responsible',
        'closure_criteria'
    ];
BEGIN
    RAISE NOTICE '🔍 Verificando campos do wizard na tabela risk_registrations...';
    
    FOREACH campo IN ARRAY campos_necessarios
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'risk_registrations' 
            AND column_name = campo
        ) THEN
            campos_faltantes := array_append(campos_faltantes, campo);
        END IF;
    END LOOP;
    
    IF array_length(campos_faltantes, 1) > 0 THEN
        RAISE NOTICE '❌ Campos faltantes encontrados: %', array_to_string(campos_faltantes, ', ');
        RAISE NOTICE '🔧 Adicionando campos faltantes...';
        
        -- Adicionar campos faltantes
        FOREACH campo IN ARRAY campos_faltantes
        LOOP
            BEGIN
                CASE 
                    WHEN campo LIKE '%_due_date' THEN
                        EXECUTE format('ALTER TABLE risk_registrations ADD COLUMN %I DATE', campo);
                    WHEN campo LIKE '%_cost' THEN
                        EXECUTE format('ALTER TABLE risk_registrations ADD COLUMN %I DECIMAL(15,2)', campo);
                    ELSE
                        EXECUTE format('ALTER TABLE risk_registrations ADD COLUMN %I VARCHAR(255)', campo);
                END CASE;
                RAISE NOTICE '✅ Campo % adicionado', campo;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Erro ao adicionar campo %: %', campo, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE '🎉 Todos os campos foram adicionados!';
    ELSE
        RAISE NOTICE '✅ Todos os campos já existem na tabela!';
    END IF;
END $$;

-- 2. Verificar o registro específico 005092025
DO $$
DECLARE
    registro RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Procurando registro 005092025...';
    
    -- Buscar por diferentes critérios
    SELECT * INTO registro
    FROM risk_registrations 
    WHERE risk_code = '005092025' 
       OR risk_title ILIKE '%005092025%'
       OR id::text ILIKE '%005092025%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF registro.id IS NOT NULL THEN
        RAISE NOTICE '✅ Registro encontrado!';
        RAISE NOTICE 'ID: %', registro.id;
        RAISE NOTICE 'Código: %', COALESCE(registro.risk_code, 'NULL');
        RAISE NOTICE 'Título: %', registro.risk_title;
        RAISE NOTICE '';
        
        -- Verificar dados do plano de ação
        IF registro.activity_1_name IS NOT NULL THEN
            RAISE NOTICE '✅ TEM dados de plano de ação:';
            RAISE NOTICE '  - Nome: %', registro.activity_1_name;
            RAISE NOTICE '  - Responsável: %', COALESCE(registro.activity_1_responsible, 'NULL');
        ELSE
            RAISE NOTICE '❌ NÃO tem dados de plano de ação';
        END IF;
        
        -- Verificar dados de comunicação
        IF registro.awareness_person_1_name IS NOT NULL OR registro.approval_person_1_name IS NOT NULL THEN
            RAISE NOTICE '✅ TEM dados de comunicação:';
            RAISE NOTICE '  - Pessoa ciência: %', COALESCE(registro.awareness_person_1_name, 'NULL');
            RAISE NOTICE '  - Pessoa aprovação: %', COALESCE(registro.approval_person_1_name, 'NULL');
        ELSE
            RAISE NOTICE '❌ NÃO tem dados de comunicação';
        END IF;
        
        -- Verificar dados de tratamento
        IF registro.treatment_rationale IS NOT NULL THEN
            RAISE NOTICE '✅ TEM dados de tratamento:';
            RAISE NOTICE '  - Justificativa: %', LEFT(registro.treatment_rationale, 50) || '...';
        ELSE
            RAISE NOTICE '❌ NÃO tem dados de tratamento';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Registro 005092025 NÃO encontrado!';
        RAISE NOTICE 'Registros recentes disponíveis:';
        
        FOR registro IN 
            SELECT id, risk_code, risk_title, created_at
            FROM risk_registrations 
            ORDER BY created_at DESC
            LIMIT 5
        LOOP
            RAISE NOTICE '  - % | % | %', 
                COALESCE(registro.risk_code, 'SEM CÓDIGO'), 
                LEFT(registro.risk_title, 30),
                registro.created_at::date;
        END LOOP;
    END IF;
END $$;

-- 3. Mostrar estrutura atual da tabela
SELECT 
    '=== ESTRUTURA ATUAL DA TABELA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'risk_registrations' 
AND column_name LIKE '%activity_1%' 
   OR column_name LIKE '%awareness_%'
   OR column_name LIKE '%approval_%'
   OR column_name LIKE '%treatment_%'
   OR column_name LIKE '%monitoring_%'
ORDER BY column_name;
-- ============================================================================
-- COMANDOS SIMPLES PARA EXECUTAR UM POR VEZ NO SUPABASE
-- ============================================================================
-- Execute cada comando separadamente no SQL Editor

-- 1. VERIFICAR SE OS RISCOS EXISTEM
SELECT COUNT(*) as total_riscos FROM risk_registrations;

-- 2. VERIFICAR SE OS CAMPOS DO WIZARD EXISTEM
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'risk_registrations' 
AND column_name LIKE 'activity_1%'
ORDER BY column_name;

-- 3. VERIFICAR CAMPOS DE COMUNICAÇÃO
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'risk_registrations' 
AND column_name LIKE 'awareness_%'
ORDER BY column_name;

-- 4. VERIFICAR ÚLTIMOS REGISTROS
SELECT id, risk_code, risk_title, created_at 
FROM risk_registrations 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. PROCURAR REGISTRO 005092025
SELECT id, risk_code, risk_title, activity_1_name, awareness_person_1_name
FROM risk_registrations 
WHERE risk_code = '005092025' 
   OR risk_title ILIKE '%005092025%';
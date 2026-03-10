-- DEBUG SCRIPT - Database State for Incidents
-- Execute este script no Supabase SQL Editor para verificar o estado do banco

-- 1. Verificar estrutura da tabela incidents
SELECT 
    'incidents_table_structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'incidents' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS ativas
SELECT 
    'rls_policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'incidents'
ORDER BY cmd;

-- 3. Verificar se RLS está habilitado
SELECT 
    'rls_status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'incidents';

-- 4. Verificar dados de exemplo na tabela incidents
SELECT 
    'sample_incidents' as check_type,
    id,
    title,
    tenant_id,
    reporter_id,
    assignee_id,
    created_at,
    updated_at
FROM incidents 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar usuários platform_admin
SELECT 
    'platform_admins' as check_type,
    pa.user_id,
    pa.role,
    pa.created_at,
    p.email,
    p.full_name
FROM platform_admins pa
LEFT JOIN profiles p ON pa.user_id = p.id
ORDER BY pa.created_at DESC;

-- 6. Verificar perfis de usuários e seus tenant_id
SELECT 
    'user_profiles' as check_type,
    p.id,
    p.email,
    p.full_name,
    p.tenant_id,
    CASE 
        WHEN pa.user_id IS NOT NULL THEN 'platform_admin'
        ELSE 'regular_user'
    END as user_type
FROM profiles p
LEFT JOIN platform_admins pa ON p.id = pa.user_id
ORDER BY p.created_at DESC
LIMIT 10;

-- 7. Verificar tenants disponíveis
SELECT 
    'available_tenants' as check_type,
    id,
    name,
    slug,
    is_active,
    created_at
FROM tenants 
WHERE is_active = true
ORDER BY created_at DESC;

-- 8. Testar política RLS para um usuário específico
-- Substitua 'USER_ID_AQUI' pelo ID do usuário que está tentando editar
/*
SET LOCAL "request.jwt.claims" = '{"sub": "USER_ID_AQUI"}';
SELECT 
    'rls_test_select' as check_type,
    id,
    title,
    tenant_id
FROM incidents 
LIMIT 3;
*/

-- 9. Verificar se há triggers na tabela incidents
SELECT 
    'table_triggers' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'incidents';

-- 10. Verificar constraints da tabela incidents
SELECT 
    'table_constraints' as check_type,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'incidents';

-- 11. Verificar foreign keys
SELECT 
    'foreign_keys' as check_type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'incidents';

-- 12. Verificar índices da tabela incidents
SELECT 
    'table_indexes' as check_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'incidents';

-- 13. Verificar permissões da tabela incidents
SELECT 
    'table_permissions' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'incidents';

-- 14. Verificar se há funções relacionadas a incidents
SELECT 
    'related_functions' as check_type,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%incidents%'
    OR routine_name ILIKE '%incident%';

-- 15. Verificar logs de auditoria (se existir tabela de audit)
SELECT 
    'audit_logs' as check_type,
    table_name,
    operation,
    old_values,
    new_values,
    created_at
FROM audit_logs 
WHERE table_name = 'incidents'
ORDER BY created_at DESC
LIMIT 5;

-- 16. Verificar estatísticas da tabela
SELECT 
    'table_stats' as check_type,
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE tablename = 'incidents';
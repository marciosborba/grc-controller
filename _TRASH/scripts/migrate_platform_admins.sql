-- ============================================================================
-- MIGRAÇÃO DE SEGURANÇA: PLATFORM ADMINS
-- ============================================================================
-- Este script migra usuários administrativos para a tabela platform_admins
-- e implementa as recomendações de segurança.

-- 1. Verificar estado atual das tabelas
SELECT 'VERIFICAÇÃO INICIAL' as step;

-- Verificar usuários na tabela platform_admins
SELECT 
    'platform_admins' as table_name,
    COUNT(*) as total_users,
    array_agg(pa.user_id) as user_ids
FROM platform_admins pa;

-- Verificar usuários com roles administrativas
SELECT 
    'user_roles_admin' as table_name,
    COUNT(*) as total_users,
    array_agg(DISTINCT ur.user_id) as user_ids,
    array_agg(DISTINCT ur.role) as roles
FROM user_roles ur 
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin');

-- Verificar usuários com perfis administrativos
SELECT 
    'profiles_with_admin_roles' as table_name,
    COUNT(*) as total_users,
    array_agg(p.user_id) as user_ids,
    array_agg(p.full_name) as names,
    array_agg(p.email) as emails
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin');

-- ============================================================================
-- 2. MIGRAÇÃO SEGURA
-- ============================================================================

-- Inserir usuários administrativos na tabela platform_admins (se não existirem)
INSERT INTO platform_admins (user_id, created_at, updated_at)
SELECT DISTINCT 
    ur.user_id,
    NOW() as created_at,
    NOW() as updated_at
FROM user_roles ur
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
AND ur.user_id NOT IN (
    SELECT user_id FROM platform_admins
)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar resultado da migração
SELECT 'APÓS MIGRAÇÃO' as step;

SELECT 
    'platform_admins_after_migration' as table_name,
    COUNT(*) as total_users,
    array_agg(pa.user_id) as user_ids
FROM platform_admins pa;

-- ============================================================================
-- 3. AUDITORIA E VERIFICAÇÃO
-- ============================================================================

-- Verificar usuários que são platform admin por ambos os métodos
SELECT 
    'users_in_both_tables' as verification,
    p.full_name,
    p.email,
    pa.user_id,
    pa.created_at as platform_admin_since,
    array_agg(DISTINCT ur.role) as roles
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
LEFT JOIN user_roles ur ON pa.user_id = ur.user_id AND ur.role IN ('admin', 'super_admin', 'platform_admin')
GROUP BY p.full_name, p.email, pa.user_id, pa.created_at
ORDER BY pa.created_at;

-- Verificar usuários que têm roles admin mas não estão na tabela platform_admins
SELECT 
    'admin_roles_not_in_platform_table' as potential_issue,
    p.full_name,
    p.email,
    ur.user_id,
    array_agg(DISTINCT ur.role) as admin_roles
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
AND ur.user_id NOT IN (SELECT user_id FROM platform_admins)
GROUP BY p.full_name, p.email, ur.user_id;

-- ============================================================================
-- 4. RELATÓRIO FINAL
-- ============================================================================

SELECT 'RELATÓRIO FINAL DE MIGRAÇÃO' as report;

-- Resumo da migração
SELECT 
    'migration_summary' as summary,
    (SELECT COUNT(*) FROM platform_admins) as total_platform_admins,
    (SELECT COUNT(*) FROM user_roles WHERE role IN ('admin', 'super_admin', 'platform_admin')) as total_admin_roles,
    (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role IN ('admin', 'super_admin', 'platform_admin')) as unique_users_with_admin_roles;

-- Lista final de platform admins
SELECT 
    'final_platform_admins_list' as final_list,
    p.full_name,
    p.email,
    pa.user_id,
    pa.created_at,
    CASE 
        WHEN ur.user_id IS NOT NULL THEN 'HAS_ADMIN_ROLE'
        ELSE 'PLATFORM_ADMINS_ONLY'
    END as status
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
LEFT JOIN (
    SELECT DISTINCT user_id 
    FROM user_roles 
    WHERE role IN ('admin', 'super_admin', 'platform_admin')
) ur ON pa.user_id = ur.user_id
ORDER BY pa.created_at;
-- ============================================================================
-- MIGRAÇÃO RÁPIDA: PLATFORM ADMINS
-- ============================================================================
-- Script simplificado para migrar usuários administrativos

-- 1. Verificar estado atual
SELECT 'ESTADO ATUAL' as status;

-- Usuários na tabela platform_admins
SELECT 
    'platform_admins' as table_name,
    COUNT(*) as count
FROM platform_admins;

-- Usuários com roles administrativas
SELECT 
    'admin_roles' as table_name,
    COUNT(*) as count
FROM user_roles 
WHERE role IN ('admin', 'super_admin', 'platform_admin');

-- 2. Migrar usuários com roles admin para platform_admins
INSERT INTO platform_admins (user_id, created_at, updated_at)
SELECT DISTINCT 
    ur.user_id,
    NOW(),
    NOW()
FROM user_roles ur
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
AND ur.user_id NOT IN (
    SELECT user_id FROM platform_admins
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verificar resultado
SELECT 'APÓS MIGRAÇÃO' as status;

-- Lista final de platform admins
SELECT 
    'platform_admins_final' as result,
    p.full_name,
    p.email,
    pa.user_id,
    pa.created_at
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
ORDER BY p.full_name;

-- Estatísticas finais
SELECT 
    'migration_stats' as summary,
    (SELECT COUNT(*) FROM platform_admins) as total_platform_admins,
    (SELECT COUNT(*) FROM user_roles WHERE role IN ('admin', 'super_admin', 'platform_admin')) as total_admin_roles;
-- ============================================================================
-- LIMPEZA DE SEGURANÇA: REMOVER ROLES ADMINISTRATIVAS REDUNDANTES
-- ============================================================================
-- ATENÇÃO: Execute este script APENAS após confirmar que:
-- 1. Todos os platform admins estão na tabela platform_admins
-- 2. O sistema está funcionando corretamente
-- 3. Você fez backup do banco de dados

-- ============================================================================
-- 1. VERIFICAÇÃO PRÉ-LIMPEZA
-- ============================================================================

-- Verificar estado atual antes da limpeza
SELECT 'PRÉ-LIMPEZA: Estado atual' as step;

-- Usuários na tabela platform_admins
SELECT 
    'platform_admins_count' as metric,
    COUNT(*) as value
FROM platform_admins;

-- Roles administrativas na tabela user_roles
SELECT 
    'admin_roles_count' as metric,
    COUNT(*) as value
FROM user_roles 
WHERE role IN ('admin', 'super_admin', 'platform_admin');

-- Usuários únicos com roles administrativas
SELECT 
    'unique_users_with_admin_roles' as metric,
    COUNT(DISTINCT user_id) as value
FROM user_roles 
WHERE role IN ('admin', 'super_admin', 'platform_admin');

-- Lista detalhada de usuários que serão afetados
SELECT 
    'users_to_be_affected' as info,
    p.full_name,
    p.email,
    ur.user_id,
    ur.role,
    CASE 
        WHEN pa.user_id IS NOT NULL THEN 'SAFE_TO_REMOVE'
        ELSE 'WARNING_NOT_IN_PLATFORM_ADMINS'
    END as safety_status
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
LEFT JOIN platform_admins pa ON ur.user_id = pa.user_id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
ORDER BY safety_status, p.full_name;

-- ============================================================================
-- 2. VERIFICAÇÃO DE SEGURANÇA
-- ============================================================================

-- Verificar se todos os usuários com roles admin estão na tabela platform_admins
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM user_roles ur
    WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
    AND ur.user_id NOT IN (SELECT user_id FROM platform_admins);
    
    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'ERRO DE SEGURANÇA: % usuários com roles admin não estão na tabela platform_admins. Execute primeiro o script de migração!', orphaned_count;
    ELSE
        RAISE NOTICE 'VERIFICAÇÃO OK: Todos os usuários com roles admin estão na tabela platform_admins';
    END IF;
END $$;

-- ============================================================================
-- 3. LIMPEZA SEGURA
-- ============================================================================

-- Criar backup das roles que serão removidas
CREATE TEMP TABLE admin_roles_backup AS
SELECT 
    ur.*,
    p.full_name,
    p.email,
    NOW() as backup_timestamp
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin');

-- Mostrar backup criado
SELECT 'BACKUP CRIADO' as step;
SELECT * FROM admin_roles_backup ORDER BY full_name;

-- Remover roles administrativas da tabela user_roles
-- APENAS para usuários que estão na tabela platform_admins
DELETE FROM user_roles 
WHERE role IN ('admin', 'super_admin', 'platform_admin')
AND user_id IN (SELECT user_id FROM platform_admins);

-- ============================================================================
-- 4. VERIFICAÇÃO PÓS-LIMPEZA
-- ============================================================================

SELECT 'PÓS-LIMPEZA: Verificação' as step;

-- Verificar se ainda existem roles administrativas
SELECT 
    'remaining_admin_roles' as metric,
    COUNT(*) as value,
    array_agg(DISTINCT role) as roles
FROM user_roles 
WHERE role IN ('admin', 'super_admin', 'platform_admin');

-- Verificar se todos os platform admins ainda têm acesso
SELECT 
    'platform_admins_verification' as verification,
    COUNT(*) as total_platform_admins
FROM platform_admins;

-- Lista final de platform admins
SELECT 
    'final_platform_admins' as final_state,
    p.full_name,
    p.email,
    pa.user_id,
    pa.created_at
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
ORDER BY p.full_name;

-- ============================================================================
-- 5. RELATÓRIO DE LIMPEZA
-- ============================================================================

SELECT 'RELATÓRIO DE LIMPEZA CONCLUÍDO' as report;

-- Estatísticas da limpeza
SELECT 
    'cleanup_summary' as summary,
    (SELECT COUNT(*) FROM admin_roles_backup) as roles_removed,
    (SELECT COUNT(*) FROM platform_admins) as platform_admins_preserved,
    (SELECT COUNT(*) FROM user_roles WHERE role IN ('admin', 'super_admin', 'platform_admin')) as remaining_admin_roles;

-- Mostrar backup para referência
SELECT 'BACKUP DAS ROLES REMOVIDAS (para referência)' as backup_info;
SELECT 
    full_name,
    email,
    role,
    backup_timestamp
FROM admin_roles_backup 
ORDER BY full_name, role;
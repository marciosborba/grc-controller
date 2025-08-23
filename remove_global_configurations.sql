-- ============================================================================
-- SCRIPT PARA REMOVER CONFIGURAÇÕES GLOBAIS
-- ============================================================================
-- Este script remove configurações globais que possam ter sido adicionadas
-- ao banco de dados relacionadas ao módulo de regras globais da plataforma

-- ============================================================================
-- 1. REMOVER DADOS DE CONFIGURAÇÕES GLOBAIS
-- ============================================================================

-- Limpar configurações globais do campo settings dos tenants
-- (remove qualquer configuração global que possa ter sido armazenada)
UPDATE tenants 
SET settings = settings - 'global_rules' - 'platform_settings' - 'global_config'
WHERE settings ? 'global_rules' 
   OR settings ? 'platform_settings' 
   OR settings ? 'global_config';

-- ============================================================================
-- 2. REMOVER TABELAS DE CONFIGURAÇÕES GLOBAIS (SE EXISTIREM)
-- ============================================================================

-- Verificar e remover tabelas relacionadas a configurações globais
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS global_settings CASCADE;
DROP TABLE IF EXISTS global_configurations CASCADE;
DROP TABLE IF EXISTS platform_configurations CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS global_rules CASCADE;
DROP TABLE IF EXISTS platform_rules CASCADE;

-- ============================================================================
-- 3. REMOVER TIPOS ENUM RELACIONADOS (SE EXISTIREM)
-- ============================================================================

DROP TYPE IF EXISTS global_setting_type CASCADE;
DROP TYPE IF EXISTS platform_setting_type CASCADE;
DROP TYPE IF EXISTS global_rule_type CASCADE;

-- ============================================================================
-- 4. REMOVER FUNÇÕES RELACIONADAS A CONFIGURAÇÕES GLOBAIS
-- ============================================================================

DROP FUNCTION IF EXISTS get_global_setting(TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_global_setting(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_platform_config() CASCADE;
DROP FUNCTION IF EXISTS update_platform_config(JSONB) CASCADE;
DROP FUNCTION IF EXISTS manage_global_rules(TEXT, JSONB) CASCADE;

-- ============================================================================
-- 5. REMOVER POLÍTICAS RLS RELACIONADAS
-- ============================================================================

-- As políticas serão removidas automaticamente com as tabelas

-- ============================================================================
-- 6. LIMPAR LOGS DE ATIVIDADE RELACIONADOS
-- ============================================================================

-- Remover logs relacionados a configurações globais
DELETE FROM activity_logs 
WHERE resource_type IN ('GLOBAL_SETTING', 'PLATFORM_CONFIG', 'GLOBAL_RULE')
   OR action LIKE '%global%'
   OR action LIKE '%platform_config%';

-- ============================================================================
-- 7. LIMPAR DADOS DE INTEGRAÇÕES RELACIONADAS A CONFIGURAÇÕES GLOBAIS
-- ============================================================================

-- Remover integrações que possam ter sido criadas para configurações globais
DELETE FROM integration_logs 
WHERE message LIKE '%global%config%' 
   OR message LIKE '%platform%setting%';

-- Remover integrações relacionadas a configurações globais
DELETE FROM integrations 
WHERE name LIKE '%Global%' 
   OR name LIKE '%Platform Config%'
   OR type = 'global_config';

-- ============================================================================
-- 8. VERIFICAR E LIMPAR PERMISSÕES RELACIONADAS
-- ============================================================================

-- Remover permissões relacionadas a configurações globais dos platform_admins
UPDATE platform_admins 
SET permissions = (
    SELECT jsonb_agg(perm)
    FROM jsonb_array_elements_text(permissions) AS perm
    WHERE perm NOT LIKE '%global%'
      AND perm NOT LIKE '%platform_config%'
      AND perm NOT LIKE '%global_rules%'
)
WHERE permissions::text LIKE '%global%' 
   OR permissions::text LIKE '%platform_config%'
   OR permissions::text LIKE '%global_rules%';

-- ============================================================================
-- 9. LIMPAR CONFIGURAÇÕES DE BACKUP RELACIONADAS
-- ============================================================================

-- Remover configurações de backup que possam estar relacionadas a configs globais
DELETE FROM backup_configurations 
WHERE name LIKE '%Global%Config%' 
   OR name LIKE '%Platform%Settings%';

-- ============================================================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se ainda existem referências a configurações globais
DO $$
DECLARE
    table_count INTEGER;
    setting_count INTEGER;
    log_count INTEGER;
BEGIN
    -- Verificar tabelas restantes
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND (table_name LIKE '%global%' OR table_name LIKE '%platform_config%');
    
    -- Verificar configurações restantes nos tenants
    SELECT COUNT(*) INTO setting_count
    FROM tenants 
    WHERE settings::text LIKE '%global%' 
       OR settings::text LIKE '%platform%';
    
    -- Verificar logs restantes
    SELECT COUNT(*) INTO log_count
    FROM activity_logs 
    WHERE resource_type LIKE '%GLOBAL%' 
       OR resource_type LIKE '%PLATFORM%';
    
    -- Relatório final
    RAISE NOTICE 'RELATÓRIO DE LIMPEZA:';
    RAISE NOTICE '- Tabelas relacionadas restantes: %', table_count;
    RAISE NOTICE '- Configurações nos tenants restantes: %', setting_count;
    RAISE NOTICE '- Logs relacionados restantes: %', log_count;
    
    IF table_count = 0 AND setting_count = 0 AND log_count = 0 THEN
        RAISE NOTICE 'SUCESSO: Todas as configurações globais foram removidas!';
    ELSE
        RAISE NOTICE 'ATENÇÃO: Ainda existem algumas referências que podem precisar de limpeza manual.';
    END IF;
END $$;

-- ============================================================================
-- LOG DA OPERAÇÃO
-- ============================================================================

INSERT INTO activity_logs (
    id, 
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    details, 
    created_at
) VALUES (
    gen_random_uuid(),
    NULL,
    'DELETE',
    'MAINTENANCE',
    'global_configurations_cleanup',
    'Removed all global configurations and related data from database',
    NOW()
);

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

COMMIT;
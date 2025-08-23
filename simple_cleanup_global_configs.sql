-- ============================================================================
-- LIMPEZA SIMPLES DE CONFIGURAÇÕES GLOBAIS
-- ============================================================================
-- Execute este script no Supabase SQL Editor para remover configurações globais

BEGIN;

-- 1. Limpar configurações globais dos tenants
UPDATE tenants 
SET settings = settings - 'global_rules' - 'platform_settings' - 'global_config' - 'global_configurations'
WHERE settings ? 'global_rules' 
   OR settings ? 'platform_settings' 
   OR settings ? 'global_config'
   OR settings ? 'global_configurations';

-- 2. Remover tabelas relacionadas a configurações globais (se existirem)
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS global_settings CASCADE;
DROP TABLE IF EXISTS global_configurations CASCADE;
DROP TABLE IF EXISTS platform_configurations CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS global_rules CASCADE;
DROP TABLE IF EXISTS platform_rules CASCADE;
DROP TABLE IF EXISTS theme_configurations CASCADE;
DROP TABLE IF EXISTS font_configurations CASCADE;
DROP TABLE IF EXISTS custom_roles CASCADE;

-- 3. Remover tipos enum relacionados
DROP TYPE IF EXISTS global_setting_type CASCADE;
DROP TYPE IF EXISTS platform_setting_type CASCADE;
DROP TYPE IF EXISTS global_rule_type CASCADE;
DROP TYPE IF EXISTS theme_type CASCADE;

-- 4. Remover funções relacionadas
DROP FUNCTION IF EXISTS get_global_setting(TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_global_setting(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_platform_config() CASCADE;
DROP FUNCTION IF EXISTS update_platform_config(JSONB) CASCADE;
DROP FUNCTION IF EXISTS manage_global_rules(TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS apply_global_theme(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_platform_themes() CASCADE;

-- 5. Limpar logs relacionados
DELETE FROM activity_logs 
WHERE resource_type IN ('GLOBAL_SETTING', 'PLATFORM_CONFIG', 'GLOBAL_RULE', 'THEME_CONFIG', 'FONT_CONFIG')
   OR action LIKE '%global%'
   OR action LIKE '%platform_config%'
   OR action LIKE '%theme%'
   OR details::text LIKE '%global%rule%'
   OR details::text LIKE '%platform%setting%';

-- 6. Limpar integrações relacionadas
DELETE FROM integration_logs 
WHERE message LIKE '%global%config%' 
   OR message LIKE '%platform%setting%'
   OR message LIKE '%theme%config%';

DELETE FROM integrations 
WHERE name LIKE '%Global%' 
   OR name LIKE '%Platform Config%'
   OR name LIKE '%Theme%'
   OR type = 'global_config';

-- 7. Limpar permissões relacionadas dos platform_admins
UPDATE platform_admins 
SET permissions = (
    SELECT COALESCE(jsonb_agg(perm), '[]'::jsonb)
    FROM jsonb_array_elements_text(COALESCE(permissions, '[]'::jsonb)) AS perm
    WHERE perm NOT LIKE '%global%'
      AND perm NOT LIKE '%platform_config%'
      AND perm NOT LIKE '%global_rules%'
      AND perm NOT LIKE '%theme%'
      AND perm NOT LIKE '%font%'
)
WHERE permissions::text LIKE '%global%' 
   OR permissions::text LIKE '%platform_config%'
   OR permissions::text LIKE '%global_rules%'
   OR permissions::text LIKE '%theme%'
   OR permissions::text LIKE '%font%';

-- 8. Verificar resultado
DO $$
DECLARE
    table_count INTEGER;
    setting_count INTEGER;
    log_count INTEGER;
    integration_count INTEGER;
BEGIN
    -- Contar tabelas relacionadas restantes
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND (table_name LIKE '%global%' 
           OR table_name LIKE '%platform_config%'
           OR table_name LIKE '%theme%'
           OR table_name LIKE '%font%');
    
    -- Contar configurações restantes nos tenants
    SELECT COUNT(*) INTO setting_count
    FROM tenants 
    WHERE settings::text LIKE '%global%' 
       OR settings::text LIKE '%platform%'
       OR settings::text LIKE '%theme%'
       OR settings::text LIKE '%font%';
    
    -- Contar logs relacionados restantes
    SELECT COUNT(*) INTO log_count
    FROM activity_logs 
    WHERE resource_type LIKE '%GLOBAL%' 
       OR resource_type LIKE '%PLATFORM%'
       OR resource_type LIKE '%THEME%'
       OR resource_type LIKE '%FONT%';
    
    -- Contar integrações relacionadas restantes
    SELECT COUNT(*) INTO integration_count
    FROM integrations 
    WHERE name LIKE '%Global%' 
       OR name LIKE '%Platform%'
       OR name LIKE '%Theme%'
       OR type = 'global_config';
    
    -- Relatório
    RAISE NOTICE '=== RELATÓRIO DE LIMPEZA ===';
    RAISE NOTICE 'Tabelas relacionadas restantes: %', table_count;
    RAISE NOTICE 'Configurações nos tenants restantes: %', setting_count;
    RAISE NOTICE 'Logs relacionados restantes: %', log_count;
    RAISE NOTICE 'Integrações relacionadas restantes: %', integration_count;
    
    IF table_count = 0 AND setting_count = 0 AND log_count = 0 AND integration_count = 0 THEN
        RAISE NOTICE 'SUCESSO: Todas as configurações globais foram removidas!';
    ELSE
        RAISE NOTICE 'ATENÇÃO: Ainda existem % itens que podem precisar de limpeza manual.', 
                     (table_count + setting_count + log_count + integration_count);
    END IF;
END $$;

-- 9. Log da operação
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
    jsonb_build_object(
        'operation', 'cleanup_global_configurations',
        'timestamp', NOW(),
        'description', 'Removed all global configurations and related data from database'
    ),
    NOW()
);

COMMIT;

-- Mensagem final
SELECT 'Limpeza de configurações globais concluída! Verifique as mensagens acima para detalhes.' as resultado;
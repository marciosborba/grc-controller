-- Migration para adicionar configuração de matriz de risco por tenant
-- Data: 2025-08-22

-- Função para atualizar configurações de matriz de risco nos tenants existentes
DO $$ 
DECLARE
    tenant_record RECORD;
    default_risk_matrix JSONB;
BEGIN
    -- Configuração padrão da matriz 5x5
    default_risk_matrix := '{
        "type": "5x5",
        "impact_labels": ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"],
        "probability_labels": ["Raro", "Improvável", "Possível", "Provável", "Quase Certo"],
        "risk_levels": {
            "1-4": "Muito Baixo",
            "5-8": "Baixo", 
            "9-15": "Médio",
            "16-20": "Alto",
            "21-25": "Muito Alto"
        },
        "colors": {
            "Muito Baixo": "#22c55e",
            "Baixo": "#84cc16",
            "Médio": "#eab308", 
            "Alto": "#f97316",
            "Muito Alto": "#dc2626"
        },
        "matrix_4x4": {
            "type": "4x4",
            "impact_labels": ["Baixo", "Médio", "Alto", "Muito Alto"],
            "probability_labels": ["Raro", "Possível", "Provável", "Quase Certo"],
            "risk_levels": {
                "1-2": "Baixo",
                "3-6": "Médio", 
                "7-12": "Alto",
                "13-16": "Muito Alto"
            }
        }
    }'::JSONB;

    -- Atualizar todos os tenants que não têm configuração de matriz de risco
    FOR tenant_record IN 
        SELECT id, settings FROM tenants 
        WHERE settings IS NULL OR NOT (settings ? 'risk_matrix')
    LOOP
        -- Atualizar tenant com configuração padrão
        UPDATE tenants 
        SET settings = COALESCE(settings, '{}'::JSONB) || jsonb_build_object('risk_matrix', default_risk_matrix)
        WHERE id = tenant_record.id;
        
        RAISE NOTICE 'Updated tenant % with default risk matrix configuration', tenant_record.id;
    END LOOP;
END $$;

-- Adicionar índice para performance nas configurações
CREATE INDEX IF NOT EXISTS idx_tenants_settings_risk_matrix ON tenants USING GIN ((settings->'risk_matrix'));

-- Comentários
COMMENT ON COLUMN tenants.settings IS 'Configurações do tenant incluindo matriz de risco (risk_matrix)';

-- Inserir log de aplicação da migration
INSERT INTO activity_logs (
    user_id,
    tenant_id, 
    action,
    entity_type,
    entity_id,
    changes,
    created_at
) VALUES (
    NULL,
    NULL,
    'CREATE',
    'SYSTEM',
    'risk_matrix_configuration',
    jsonb_build_object(
        'operation', 'add_risk_matrix_tenant_config',
        'timestamp', NOW(),
        'description', 'Added default risk matrix configuration to all tenants',
        'matrix_type', '5x5_default',
        'fallback_4x4', 'supported'
    ),
    NOW()
);

-- Verificação final
DO $$
DECLARE
    tenant_count INTEGER;
    configured_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenants;
    SELECT COUNT(*) INTO configured_count FROM tenants WHERE settings ? 'risk_matrix';
    
    RAISE NOTICE 'Migration completed: %/% tenants now have risk matrix configuration', configured_count, tenant_count;
    
    IF configured_count < tenant_count THEN
        RAISE WARNING 'Some tenants may not have been updated properly';
    END IF;
END $$;
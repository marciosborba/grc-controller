-- ============================================================================
-- MIGRATION: CORREÇÃO DA FUNÇÃO APPLY_THEME
-- ============================================================================
-- Corrige a função apply_theme para sincronizar global_ui_settings e global_ui_themes

-- Função corrigida para aplicar tema
CREATE OR REPLACE FUNCTION apply_theme(theme_uuid UUID, tenant_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    theme_record global_ui_themes%ROWTYPE;
    previous_theme_id UUID;
BEGIN
    -- Buscar o tema
    SELECT * INTO theme_record 
    FROM global_ui_themes 
    WHERE id = theme_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tema não encontrado: %', theme_uuid;
    END IF;
    
    -- Buscar tema anterior para histórico
    SELECT active_theme_id INTO previous_theme_id
    FROM global_ui_settings 
    WHERE tenant_id = tenant_uuid OR (tenant_uuid IS NULL AND tenant_id IS NULL)
    LIMIT 1;
    
    -- 1. DESATIVAR TODOS OS TEMAS (importante para evitar conflitos)
    UPDATE global_ui_themes 
    SET is_active = false 
    WHERE (tenant_id = tenant_uuid OR (tenant_uuid IS NULL AND tenant_id IS NULL));
    
    -- 2. ATIVAR O TEMA SELECIONADO
    UPDATE global_ui_themes 
    SET is_active = true 
    WHERE id = theme_uuid;
    
    -- 3. ATUALIZAR/CRIAR CONFIGURAÇÕES DO TENANT
    INSERT INTO global_ui_settings (tenant_id, active_theme_id, created_by, updated_at)
    VALUES (tenant_uuid, theme_uuid, auth.uid(), NOW())
    ON CONFLICT (tenant_id) DO UPDATE SET
        active_theme_id = theme_uuid,
        updated_at = NOW();
    
    -- 4. REGISTRAR NO HISTÓRICO
    INSERT INTO theme_change_history (
        tenant_id,
        previous_theme_id,
        new_theme_id,
        changed_by,
        change_reason,
        previous_config,
        new_config
    ) VALUES (
        tenant_uuid,
        previous_theme_id,
        theme_uuid,
        auth.uid(),
        'Tema aplicado via interface administrativa',
        CASE 
            WHEN previous_theme_id IS NOT NULL THEN 
                (SELECT row_to_json(t.*) FROM global_ui_themes t WHERE t.id = previous_theme_id)
            ELSE NULL 
        END,
        row_to_json(theme_record)
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar estado dos temas (utilitária)
CREATE OR REPLACE FUNCTION sync_theme_state()
RETURNS BOOLEAN AS $$
BEGIN
    -- Sincronizar global_ui_themes com global_ui_settings
    -- Desativar todos os temas primeiro
    UPDATE global_ui_themes SET is_active = false;
    
    -- Ativar temas que estão em global_ui_settings
    UPDATE global_ui_themes 
    SET is_active = true 
    WHERE id IN (
        SELECT active_theme_id 
        FROM global_ui_settings 
        WHERE active_theme_id IS NOT NULL
    );
    
    -- Se nenhum tema estiver ativo, ativar o tema nativo
    IF NOT EXISTS (SELECT 1 FROM global_ui_themes WHERE is_active = true) THEN
        UPDATE global_ui_themes 
        SET is_active = true 
        WHERE is_native_theme = true 
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Executar sincronização inicial
SELECT sync_theme_state();
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
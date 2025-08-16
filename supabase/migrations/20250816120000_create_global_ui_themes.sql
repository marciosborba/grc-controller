-- ============================================================================
-- MIGRATION: CONFIGURAÇÕES GLOBAIS DE UI E TEMAS
-- ============================================================================
-- Criação das tabelas para gerenciamento de temas e configurações de UI globais

-- ============================================================================
-- TABELA DE TEMAS GLOBAIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS global_ui_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Identificador especial para o tema nativo
    is_native_theme BOOLEAN DEFAULT false,
    is_system_theme BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    is_dark_mode BOOLEAN DEFAULT false,
    
    -- Configurações de cores (formato HSL)
    primary_color VARCHAR(20) NOT NULL,
    primary_foreground VARCHAR(20) NOT NULL,
    primary_hover VARCHAR(20),
    primary_glow VARCHAR(20),
    
    secondary_color VARCHAR(20) NOT NULL,
    secondary_foreground VARCHAR(20) NOT NULL,
    
    accent_color VARCHAR(20) NOT NULL,
    accent_foreground VARCHAR(20) NOT NULL,
    
    background_color VARCHAR(20) NOT NULL,
    foreground_color VARCHAR(20) NOT NULL,
    
    card_color VARCHAR(20) NOT NULL,
    card_foreground VARCHAR(20) NOT NULL,
    
    border_color VARCHAR(20) NOT NULL,
    input_color VARCHAR(20) NOT NULL,
    ring_color VARCHAR(20) NOT NULL,
    
    muted_color VARCHAR(20) NOT NULL,
    muted_foreground VARCHAR(20) NOT NULL,
    
    popover_color VARCHAR(20) NOT NULL,
    popover_foreground VARCHAR(20) NOT NULL,
    
    -- Cores específicas do GRC
    success_color VARCHAR(20) NOT NULL,
    success_foreground VARCHAR(20) NOT NULL,
    success_light VARCHAR(20),
    
    warning_color VARCHAR(20) NOT NULL,
    warning_foreground VARCHAR(20) NOT NULL,
    warning_light VARCHAR(20),
    
    danger_color VARCHAR(20) NOT NULL,
    danger_foreground VARCHAR(20) NOT NULL,
    danger_light VARCHAR(20),
    
    destructive_color VARCHAR(20) NOT NULL,
    destructive_foreground VARCHAR(20) NOT NULL,
    
    -- Cores de risco
    risk_critical VARCHAR(20) NOT NULL,
    risk_high VARCHAR(20) NOT NULL,
    risk_medium VARCHAR(20) NOT NULL,
    risk_low VARCHAR(20) NOT NULL,
    
    -- Cores do sidebar
    sidebar_background VARCHAR(20) NOT NULL,
    sidebar_foreground VARCHAR(20) NOT NULL,
    sidebar_primary VARCHAR(20) NOT NULL,
    sidebar_primary_foreground VARCHAR(20) NOT NULL,
    sidebar_accent VARCHAR(20) NOT NULL,
    sidebar_accent_foreground VARCHAR(20) NOT NULL,
    sidebar_border VARCHAR(20) NOT NULL,
    sidebar_ring VARCHAR(20) NOT NULL,
    
    -- Configurações de tipografia
    font_family VARCHAR(255) NOT NULL DEFAULT 'Inter',
    font_size_base INTEGER NOT NULL DEFAULT 14,
    font_weights JSON, -- Array de pesos disponíveis
    
    -- Configurações de layout
    border_radius INTEGER NOT NULL DEFAULT 8,
    shadow_intensity DECIMAL(3,2) NOT NULL DEFAULT 0.1,
    
    -- Configurações de animação
    transition_fast VARCHAR(100) DEFAULT 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    transition_smooth VARCHAR(100) DEFAULT 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transition_slow VARCHAR(100) DEFAULT 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    
    -- Configurações avançadas (JSON para flexibilidade)
    gradients JSON, -- Gradientes personalizados
    shadows JSON, -- Sombras personalizadas
    custom_css_variables JSON, -- Variáveis CSS extras
    
    -- Metadados
    version VARCHAR(20) DEFAULT '1.0',
    tenant_id UUID REFERENCES tenants(id), -- NULL para temas globais
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE CONFIGURAÇÕES GLOBAIS DE UI
-- ============================================================================

CREATE TABLE IF NOT EXISTS global_ui_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id), -- NULL para configurações globais
    
    -- Tema ativo
    active_theme_id UUID REFERENCES global_ui_themes(id),
    
    -- Configurações gerais de UI
    enable_animations BOOLEAN DEFAULT true,
    enable_dark_mode_toggle BOOLEAN DEFAULT true,
    default_dark_mode BOOLEAN DEFAULT false,
    auto_dark_mode BOOLEAN DEFAULT false, -- Baseado no horário
    dark_mode_start_time TIME DEFAULT '18:00',
    dark_mode_end_time TIME DEFAULT '06:00',
    
    -- Configurações de responsividade
    mobile_breakpoint INTEGER DEFAULT 768,
    tablet_breakpoint INTEGER DEFAULT 1024,
    desktop_breakpoint INTEGER DEFAULT 1280,
    
    -- Configurações de acessibilidade
    high_contrast_mode BOOLEAN DEFAULT false,
    reduce_motion BOOLEAN DEFAULT false,
    focus_indicators BOOLEAN DEFAULT true,
    keyboard_navigation BOOLEAN DEFAULT true,
    
    -- Configurações de densidade
    compact_mode BOOLEAN DEFAULT false,
    sidebar_collapsed_default BOOLEAN DEFAULT false,
    table_density VARCHAR(20) DEFAULT 'normal' CHECK (table_density IN ('compact', 'normal', 'comfortable')),
    
    -- Configurações de notificações visuais
    show_toast_notifications BOOLEAN DEFAULT true,
    toast_position VARCHAR(20) DEFAULT 'bottom-right' CHECK (toast_position IN ('top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center')),
    notification_duration INTEGER DEFAULT 5000, -- em millisegundos
    
    -- Configurações de logo e branding
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    company_name VARCHAR(255),
    
    -- Configurações avançadas
    custom_css TEXT, -- CSS personalizado injetado
    custom_js TEXT, -- JavaScript personalizado (com cuidado)
    
    -- Metadados
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint para garantir apenas uma configuração por tenant
    CONSTRAINT unique_tenant_ui_settings UNIQUE (tenant_id)
);

-- ============================================================================
-- TABELA DE FONTES PERSONALIZADAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_fonts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    family VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    
    -- Fonte do sistema ou externa
    is_system_font BOOLEAN DEFAULT false,
    is_google_font BOOLEAN DEFAULT false,
    font_url VARCHAR(500), -- URL para Google Fonts ou CDN
    
    -- Configurações da fonte
    font_weights JSON NOT NULL, -- Array de pesos disponíveis [300, 400, 500, 600, 700]
    font_styles JSON DEFAULT '["normal"]', -- normal, italic
    subsets JSON DEFAULT '["latin"]', -- latin, latin-ext, etc.
    
    -- Configurações de fallback
    fallback_fonts JSON DEFAULT '["system-ui", "-apple-system", "sans-serif"]',
    
    -- Status
    is_active BOOLEAN DEFAULT false,
    is_preload BOOLEAN DEFAULT false, -- Precarregar a fonte
    
    -- Metadados
    tenant_id UUID REFERENCES tenants(id), -- NULL para fontes globais
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE HISTÓRICO DE MUDANÇAS DE TEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS theme_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    
    -- Tema anterior e novo
    previous_theme_id UUID REFERENCES global_ui_themes(id),
    new_theme_id UUID REFERENCES global_ui_themes(id),
    
    -- Detalhes da mudança
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    automatic_change BOOLEAN DEFAULT false, -- Mudança automática (ex: dark mode)
    
    -- Snapshot das configurações (para auditoria)
    previous_config JSON,
    new_config JSON,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Global UI Themes
CREATE INDEX IF NOT EXISTS idx_global_ui_themes_tenant_id ON global_ui_themes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_global_ui_themes_active ON global_ui_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_global_ui_themes_native ON global_ui_themes(is_native_theme);
CREATE INDEX IF NOT EXISTS idx_global_ui_themes_system ON global_ui_themes(is_system_theme);

-- Global UI Settings
CREATE INDEX IF NOT EXISTS idx_global_ui_settings_tenant_id ON global_ui_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_global_ui_settings_theme_id ON global_ui_settings(active_theme_id);

-- Custom Fonts
CREATE INDEX IF NOT EXISTS idx_custom_fonts_tenant_id ON custom_fonts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_fonts_active ON custom_fonts(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_fonts_system ON custom_fonts(is_system_font);

-- Theme Change History
CREATE INDEX IF NOT EXISTS idx_theme_change_history_tenant_id ON theme_change_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_theme_change_history_created_at ON theme_change_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_theme_change_history_changed_by ON theme_change_history(changed_by);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_global_ui_themes_updated_at 
    BEFORE UPDATE ON global_ui_themes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_ui_settings_updated_at 
    BEFORE UPDATE ON global_ui_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_fonts_updated_at 
    BEFORE UPDATE ON custom_fonts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE global_ui_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_ui_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_change_history ENABLE ROW LEVEL SECURITY;

-- Políticas para global_ui_themes
CREATE POLICY "Users can view global and own tenant themes" ON global_ui_themes FOR SELECT USING (
    tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all themes" ON global_ui_themes FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can manage tenant themes" ON global_ui_themes FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas para global_ui_settings
CREATE POLICY "Users can view global and own tenant settings" ON global_ui_settings FOR SELECT USING (
    tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all settings" ON global_ui_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas para custom_fonts
CREATE POLICY "Users can view global and own tenant fonts" ON custom_fonts FOR SELECT USING (
    tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all fonts" ON custom_fonts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas para theme_change_history
CREATE POLICY "Users can view own tenant theme history" ON theme_change_history FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all theme history" ON theme_change_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para capturar o estado atual da UI como tema nativo
CREATE OR REPLACE FUNCTION capture_native_ui_theme()
RETURNS UUID AS $$
DECLARE
    theme_id UUID;
BEGIN
    -- Primeiro, desativar qualquer tema nativo existente
    UPDATE global_ui_themes 
    SET is_native_theme = false, is_active = false 
    WHERE is_native_theme = true;
    
    -- Inserir o tema nativo baseado nas variáveis CSS atuais
    INSERT INTO global_ui_themes (
        name,
        display_name,
        description,
        is_native_theme,
        is_system_theme,
        is_active,
        is_dark_mode,
        
        -- Cores baseadas no atual src/index.css
        primary_color,
        primary_foreground,
        primary_hover,
        primary_glow,
        
        secondary_color,
        secondary_foreground,
        
        accent_color,
        accent_foreground,
        
        background_color,
        foreground_color,
        
        card_color,
        card_foreground,
        
        border_color,
        input_color,
        ring_color,
        
        muted_color,
        muted_foreground,
        
        popover_color,
        popover_foreground,
        
        success_color,
        success_foreground,
        success_light,
        
        warning_color,
        warning_foreground,
        warning_light,
        
        danger_color,
        danger_foreground,
        danger_light,
        
        destructive_color,
        destructive_foreground,
        
        risk_critical,
        risk_high,
        risk_medium,
        risk_low,
        
        sidebar_background,
        sidebar_foreground,
        sidebar_primary,
        sidebar_primary_foreground,
        sidebar_accent,
        sidebar_accent_foreground,
        sidebar_border,
        sidebar_ring,
        
        font_family,
        font_size_base,
        border_radius,
        shadow_intensity,
        
        gradients,
        shadows,
        custom_css_variables,
        
        version
    ) VALUES (
        'ui_nativa',
        'UI Nativa',
        'Tema padrão baseado no estado atual da interface do sistema',
        true,
        true,
        true,
        false,
        
        -- Cores do tema light atual
        '219 78% 26%',     -- primary
        '210 40% 98%',     -- primary-foreground
        '219 78% 22%',     -- primary-hover
        '219 95% 68%',     -- primary-glow
        
        '210 20% 96%',     -- secondary
        '225 71% 12%',     -- secondary-foreground
        
        '142 76% 36%',     -- accent
        '210 40% 98%',     -- accent-foreground
        
        '0 0% 100%',       -- background
        '225 71% 12%',     -- foreground
        
        '0 0% 100%',       -- card
        '225 71% 12%',     -- card-foreground
        
        '214 32% 91%',     -- border
        '214 32% 91%',     -- input
        '219 78% 26%',     -- ring
        
        '210 20% 96%',     -- muted
        '215 16% 47%',     -- muted-foreground
        
        '0 0% 100%',       -- popover
        '225 71% 12%',     -- popover-foreground
        
        '142 76% 36%',     -- success
        '210 40% 98%',     -- success-foreground
        '142 76% 94%',     -- success-light
        
        '38 92% 50%',      -- warning
        '225 71% 12%',     -- warning-foreground
        '38 92% 94%',      -- warning-light
        
        '0 84% 60%',       -- danger
        '210 40% 98%',     -- danger-foreground
        '0 84% 94%',       -- danger-light
        
        '0 84% 60%',       -- destructive
        '210 40% 98%',     -- destructive-foreground
        
        '0 84% 60%',       -- risk-critical
        '24 95% 53%',      -- risk-high
        '38 92% 50%',      -- risk-medium
        '142 76% 36%',     -- risk-low
        
        '0 0% 98%',        -- sidebar-background
        '240 5.3% 26.1%',  -- sidebar-foreground
        '240 5.9% 10%',    -- sidebar-primary
        '0 0% 98%',        -- sidebar-primary-foreground
        '240 4.8% 95.9%',  -- sidebar-accent
        '240 5.9% 10%',    -- sidebar-accent-foreground
        '220 13% 91%',     -- sidebar-border
        '217.2 91.2% 59.8%', -- sidebar-ring
        
        'Inter',
        14,
        8,
        0.1,
        
        '{"brand": "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))", "success": "linear-gradient(135deg, hsl(var(--success)), hsl(142 76% 50%))", "danger": "linear-gradient(135deg, hsl(var(--danger)), hsl(0 84% 70%))", "hero": "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)"}',
        '{"elevation-1": "0 2px 4px -1px hsl(var(--primary) / 0.1)", "elevation-2": "0 4px 8px -2px hsl(var(--primary) / 0.15)", "elevation-3": "0 8px 16px -4px hsl(var(--primary) / 0.2)", "glow": "0 0 32px hsl(var(--primary-glow) / 0.3)"}',
        '{"transition-fast": "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)", "transition-smooth": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "transition-slow": "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}',
        
        '1.0'
    )
    RETURNING id INTO theme_id;
    
    RETURN theme_id;
END;
$$ LANGUAGE plpgsql;

-- Função para aplicar tema
CREATE OR REPLACE FUNCTION apply_theme(theme_uuid UUID, tenant_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    theme_record global_ui_themes%ROWTYPE;
BEGIN
    -- Buscar o tema
    SELECT * INTO theme_record 
    FROM global_ui_themes 
    WHERE id = theme_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tema não encontrado: %', theme_uuid;
    END IF;
    
    -- Atualizar configurações do tenant (ou global se tenant_uuid for NULL)
    INSERT INTO global_ui_settings (tenant_id, active_theme_id, created_by, updated_at)
    VALUES (tenant_uuid, theme_uuid, auth.uid(), NOW())
    ON CONFLICT (tenant_id) DO UPDATE SET
        active_theme_id = theme_uuid,
        updated_at = NOW();
    
    -- Registrar no histórico
    INSERT INTO theme_change_history (
        tenant_id,
        new_theme_id,
        changed_by,
        change_reason,
        new_config
    ) VALUES (
        tenant_uuid,
        theme_uuid,
        auth.uid(),
        'Tema aplicado manualmente',
        row_to_json(theme_record)
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Função para obter tema ativo
CREATE OR REPLACE FUNCTION get_active_theme(tenant_uuid UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    theme_config JSON;
BEGIN
    SELECT row_to_json(t.*) INTO theme_config
    FROM global_ui_themes t
    JOIN global_ui_settings s ON s.active_theme_id = t.id
    WHERE s.tenant_id = tenant_uuid OR (tenant_uuid IS NULL AND s.tenant_id IS NULL)
    LIMIT 1;
    
    -- Se não encontrar configuração específica, usar tema nativo global
    IF theme_config IS NULL THEN
        SELECT row_to_json(t.*) INTO theme_config
        FROM global_ui_themes t
        WHERE t.is_native_theme = true AND t.is_active = true
        LIMIT 1;
    END IF;
    
    RETURN COALESCE(theme_config, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA - TEMA NATIVO
-- ============================================================================

-- Capturar e criar o tema nativo automaticamente
SELECT capture_native_ui_theme();

-- Criar algumas fontes padrão
INSERT INTO custom_fonts (name, family, display_name, is_system_font, font_weights, is_active) VALUES
('inter', 'Inter, sans-serif', 'Inter', false, '[300, 400, 500, 600, 700]', true),
('system-ui', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'System UI', true, '[400, 500, 600, 700]', false),
('roboto', 'Roboto, sans-serif', 'Roboto', false, '[300, 400, 500, 700]', false);

-- Criar configuração global padrão
INSERT INTO global_ui_settings (
    active_theme_id,
    enable_animations,
    enable_dark_mode_toggle,
    default_dark_mode
) 
SELECT 
    id,
    true,
    true,
    false
FROM global_ui_themes 
WHERE is_native_theme = true
LIMIT 1;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE global_ui_themes IS 'Temas de interface global com todas as configurações de cores e estilo';
COMMENT ON TABLE global_ui_settings IS 'Configurações globais de UI e comportamento da interface';
COMMENT ON TABLE custom_fonts IS 'Fontes personalizadas disponíveis na plataforma';
COMMENT ON TABLE theme_change_history IS 'Histórico de mudanças de tema para auditoria';

COMMENT ON COLUMN global_ui_themes.is_native_theme IS 'Indica se é o tema nativo capturado do estado atual da UI';
COMMENT ON COLUMN global_ui_themes.is_system_theme IS 'Indica se é um tema do sistema (não pode ser editado)';

-- Log da migração
INSERT INTO activity_logs (
    id, 
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    details, 
    created_at
) VALUES (
    uuid_generate_v4(),
    NULL,
    'CREATE',
    'MIGRATION',
    'global_ui_themes',
    '{"message": "Created Global UI Themes and Settings module with native theme capture"}',
    NOW()
) ON CONFLICT DO NOTHING;
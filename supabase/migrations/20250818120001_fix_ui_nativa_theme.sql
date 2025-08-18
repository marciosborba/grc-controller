-- ============================================================================
-- MIGRATION: CORREÇÃO DO TEMA UI NATIVA
-- ============================================================================
-- Atualização do tema UI Nativa para corresponder exatamente às cores do CSS atual

-- Atualizar o tema UI Nativa com as cores corretas do src/index.css
UPDATE global_ui_themes 
SET 
    -- Cores principais baseadas no CSS atual
    primary_color = '173 88% 58%',        -- Corrige para verde/teal atual
    primary_foreground = '210 40% 98%',   
    primary_hover = '173 88% 54%',        
    primary_glow = '173 95% 78%',         
    
    secondary_color = '272 64% 47%',      -- Purple correto
    secondary_foreground = '210 40% 98%',
    
    accent_color = '335 56% 42%',         -- Pink correto
    accent_foreground = '210 40% 98%',
    
    background_color = '0 0% 100%',       -- Branco puro
    foreground_color = '225 71% 12%',     -- Azul escuro para texto
    
    card_color = '0 0% 100%',             -- Branco puro para cards
    card_foreground = '225 71% 12%',      
    
    border_color = '214 32% 91%',         -- Cinza claro para bordas
    input_color = '214 32% 91%',          
    ring_color = '219 78% 26%',           
    
    muted_color = '210 20% 96%',          -- Cinza muito claro
    muted_foreground = '215 16% 47%',     -- Cinza médio para texto
    
    popover_color = '0 0% 100%',          
    popover_foreground = '225 71% 12%',   
    
    -- Cores de status corretas
    success_color = '142 76% 36%',        -- Verde confiança
    success_foreground = '210 40% 98%',   
    success_light = '142 76% 94%',        
    
    warning_color = '38 92% 50%',         -- Laranja atenção
    warning_foreground = '225 71% 12%',   
    warning_light = '38 92% 94%',         
    
    danger_color = '0 84% 60%',           -- Vermelho alerta
    danger_foreground = '210 40% 98%',    
    danger_light = '0 84% 94%',           
    
    destructive_color = '0 84% 60%',      
    destructive_foreground = '210 40% 98%',
    
    -- Cores de risco corretas
    risk_critical = '0 84% 60%',          
    risk_high = '24 95% 53%',             
    risk_medium = '38 92% 50%',           
    risk_low = '142 76% 36%',             
    
    -- Cores do sidebar corretas
    sidebar_background = '0 0% 98%',      -- Cinza muito claro
    sidebar_foreground = '240 5.3% 26.1%',
    sidebar_primary = '240 5.9% 10%',     
    sidebar_primary_foreground = '0 0% 98%',
    sidebar_accent = '240 4.8% 95.9%',    
    sidebar_accent_foreground = '240 5.9% 10%',
    sidebar_border = '220 13% 91%',       -- Cinza claro para bordas
    sidebar_ring = '217.2 91.2% 59.8%',  
    
    -- Metadados
    updated_at = NOW(),
    version = '1.1',
    description = 'Tema padrão atualizado para corresponder exatamente às cores do CSS atual (v1.1)'
    
WHERE name = 'ui_nativa' AND is_native_theme = true;

-- Se não existir o tema UI Nativa, criar um novo
INSERT INTO global_ui_themes (
    name,
    display_name,
    description,
    is_native_theme,
    is_system_theme,
    is_active,
    is_dark_mode,
    
    -- Cores corretas do CSS atual
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
)
SELECT 
    'ui_nativa',
    'UI Nativa',
    'Tema padrão com cores corretas do CSS atual (v1.1)',
    true,
    true,
    true,
    false,
    
    -- Cores corretas do CSS atual  
    '173 88% 58%',        -- primary (verde/teal atual)
    '210 40% 98%',        -- primary-foreground
    '173 88% 54%',        -- primary-hover
    '173 95% 78%',        -- primary-glow
    
    '272 64% 47%',        -- secondary (purple)
    '210 40% 98%',        -- secondary-foreground
    
    '335 56% 42%',        -- accent (pink)
    '210 40% 98%',        -- accent-foreground
    
    '0 0% 100%',          -- background (branco puro)
    '225 71% 12%',        -- foreground (azul escuro)
    
    '0 0% 100%',          -- card (branco puro)
    '225 71% 12%',        -- card-foreground
    
    '214 32% 91%',        -- border (cinza claro correto)
    '214 32% 91%',        -- input
    '219 78% 26%',        -- ring
    
    '210 20% 96%',        -- muted (cinza muito claro)
    '215 16% 47%',        -- muted-foreground
    
    '0 0% 100%',          -- popover
    '225 71% 12%',        -- popover-foreground
    
    '142 76% 36%',        -- success
    '210 40% 98%',        -- success-foreground
    '142 76% 94%',        -- success-light
    
    '38 92% 50%',         -- warning
    '225 71% 12%',        -- warning-foreground
    '38 92% 94%',         -- warning-light
    
    '0 84% 60%',          -- danger
    '210 40% 98%',        -- danger-foreground
    '0 84% 94%',          -- danger-light
    
    '0 84% 60%',          -- destructive
    '210 40% 98%',        -- destructive-foreground
    
    '0 84% 60%',          -- risk-critical
    '24 95% 53%',         -- risk-high
    '38 92% 50%',         -- risk-medium
    '142 76% 36%',        -- risk-low
    
    '0 0% 98%',           -- sidebar-background
    '240 5.3% 26.1%',     -- sidebar-foreground
    '240 5.9% 10%',       -- sidebar-primary
    '0 0% 98%',           -- sidebar-primary-foreground
    '240 4.8% 95.9%',     -- sidebar-accent
    '240 5.9% 10%',       -- sidebar-accent-foreground
    '220 13% 91%',        -- sidebar-border (cinza claro)
    '217.2 91.2% 59.8%',  -- sidebar-ring
    
    'Inter',
    14,
    8,
    0.1,
    
    '{"brand": "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))", "success": "linear-gradient(135deg, hsl(var(--success)), hsl(142 76% 50%))", "danger": "linear-gradient(135deg, hsl(var(--danger)), hsl(0 84% 70%))", "hero": "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)"}',
    '{"elevation-1": "0 2px 4px -1px hsl(var(--primary) / 0.1)", "elevation-2": "0 4px 8px -2px hsl(var(--primary) / 0.15)", "elevation-3": "0 8px 16px -4px hsl(var(--primary) / 0.2)", "glow": "0 0 32px hsl(var(--primary-glow) / 0.3)"}',
    '{"transition-fast": "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)", "transition-smooth": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "transition-slow": "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}',
    
    '1.1'

WHERE NOT EXISTS (
    SELECT 1 FROM global_ui_themes WHERE name = 'ui_nativa' AND is_native_theme = true
);

-- Garantir que seja o tema ativo
UPDATE global_ui_themes SET is_active = false WHERE is_active = true;
UPDATE global_ui_themes SET is_active = true WHERE name = 'ui_nativa' AND is_native_theme = true;

-- Atualizar configurações para usar o tema corrigido
INSERT INTO global_ui_settings (
    tenant_id,
    active_theme_id,
    enable_animations,
    enable_dark_mode_toggle,
    default_dark_mode
) 
SELECT 
    NULL,
    id,
    true,
    true,
    false
FROM global_ui_themes 
WHERE name = 'ui_nativa' AND is_native_theme = true
ON CONFLICT (tenant_id) DO UPDATE SET
    active_theme_id = (SELECT id FROM global_ui_themes WHERE name = 'ui_nativa' AND is_native_theme = true LIMIT 1),
    updated_at = NOW();

-- Log da correção
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
    'UPDATE',
    'MIGRATION',
    'ui_nativa_theme',
    '{"message": "Corrigido tema UI Nativa para usar cores corretas do CSS", "version": "1.1"}',
    NOW()
) ON CONFLICT DO NOTHING;
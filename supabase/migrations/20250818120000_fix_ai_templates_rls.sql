-- ============================================================================
-- MIGRATION: CORREÇÃO DAS POLÍTICAS RLS PARA TEMPLATES DE IA
-- ============================================================================
-- Ajustar as políticas RLS para permitir acesso completo aos administradores
-- já que apenas eles têm acesso ao módulo de Gestão de IA

-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Users can view public templates and own tenant templates" ON ai_grc_prompt_templates;
DROP POLICY IF EXISTS "Users can manage own templates" ON ai_grc_prompt_templates;

-- Criar políticas mais permissivas para administradores
-- Política para visualização: Platform admins podem ver todos os templates
CREATE POLICY "Platform admins can view all templates" ON ai_grc_prompt_templates FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
);

-- Política para gerenciamento: Platform admins podem gerenciar todos os templates
CREATE POLICY "Platform admins can manage all templates" ON ai_grc_prompt_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
);

-- Política adicional para permitir que usuários vejam templates públicos (para casos específicos)
CREATE POLICY "Users can view public templates" ON ai_grc_prompt_templates FOR SELECT USING (
    is_public = true
);

-- Política para permitir que criadores gerenciem seus próprios templates
CREATE POLICY "Users can manage own templates" ON ai_grc_prompt_templates FOR ALL USING (
    created_by = auth.uid()
);

-- ============================================================================
-- AJUSTAR OUTRAS TABELAS DE IA PARA ADMINISTRADORES
-- ============================================================================

-- AI Module Prompts - permitir acesso completo para admins
DROP POLICY IF EXISTS "Users can view own tenant ai_module_prompts" ON ai_module_prompts;
DROP POLICY IF EXISTS "Users can manage own tenant ai_module_prompts" ON ai_module_prompts;

CREATE POLICY "Admins can view all ai_module_prompts" ON ai_module_prompts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
    OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage all ai_module_prompts" ON ai_module_prompts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
    OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- AI Configurations - permitir acesso completo para admins
DROP POLICY IF EXISTS "Users can view own tenant ai_configurations" ON ai_configurations;
DROP POLICY IF EXISTS "Users can manage own tenant ai_configurations" ON ai_configurations;

CREATE POLICY "Admins can view all ai_configurations" ON ai_configurations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
    OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage all ai_configurations" ON ai_configurations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
    OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- AI Providers - permitir acesso completo para admins
DROP POLICY IF EXISTS "Users can view own tenant ai_grc_providers" ON ai_grc_providers;
DROP POLICY IF EXISTS "Users can manage own tenant ai_grc_providers" ON ai_grc_providers;

CREATE POLICY "Admins can view all ai_grc_providers" ON ai_grc_providers FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
    OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage all ai_grc_providers" ON ai_grc_providers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
    OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON POLICY "Platform admins can view all templates" ON ai_grc_prompt_templates IS 
'Permite que administradores da plataforma vejam todos os templates de IA';

COMMENT ON POLICY "Platform admins can manage all templates" ON ai_grc_prompt_templates IS 
'Permite que administradores da plataforma gerenciem todos os templates de IA';

COMMENT ON POLICY "Users can view public templates" ON ai_grc_prompt_templates IS 
'Permite que usuários vejam templates públicos para casos específicos';

COMMENT ON POLICY "Users can manage own templates" ON ai_grc_prompt_templates IS 
'Permite que usuários gerenciem seus próprios templates criados';

-- ============================================================================
-- LOG DA MIGRAÇÃO
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
    uuid_generate_v4(),
    NULL,
    'UPDATE',
    'MIGRATION',
    'ai_templates_rls_fix',
    'Fixed RLS policies for AI templates to allow full access for administrators since only admins have access to AI Management module',
    NOW()
) ON CONFLICT DO NOTHING;
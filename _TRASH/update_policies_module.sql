-- =====================================================
-- ATUALIZAÇÃO DO MÓDULO DE GESTÃO DE POLÍTICAS E NORMAS
-- Criado por Alex Policy - Especialista em Políticas Corporativas
-- =====================================================

-- Habilitar RLS para todas as tabelas
SET row_security = on;

-- =====================================================
-- 1. ATUALIZAR TABELA PRINCIPAL DE POLÍTICAS
-- =====================================================

-- Adicionar colunas que faltam na tabela policies
ALTER TABLE policies 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'policy',
ADD COLUMN IF NOT EXISTS workflow_stage VARCHAR(50) DEFAULT 'elaboration',
ADD COLUMN IF NOT EXISTS parent_policy_id UUID REFERENCES policies(id),
ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_training BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS next_review_date DATE,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Adicionar constraints se não existirem
DO $$
BEGIN
    -- Verificar e adicionar constraint para status
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_status_policies') THEN
        ALTER TABLE policies ADD CONSTRAINT valid_status_policies 
        CHECK (status IN ('draft', 'review', 'approved', 'published', 'expired', 'archived'));
    END IF;
    
    -- Verificar e adicionar constraint para type
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_type_policies') THEN
        ALTER TABLE policies ADD CONSTRAINT valid_type_policies 
        CHECK (type IN ('policy', 'procedure', 'guideline', 'standard'));
    END IF;
    
    -- Verificar e adicionar constraint para priority
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_priority_policies') THEN
        ALTER TABLE policies ADD CONSTRAINT valid_priority_policies 
        CHECK (priority IN ('low', 'medium', 'high', 'critical'));
    END IF;
    
    -- Verificar e adicionar constraint para datas
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_dates_policies') THEN
        ALTER TABLE policies ADD CONSTRAINT valid_dates_policies 
        CHECK (expiry_date IS NULL OR effective_date IS NULL OR expiry_date > effective_date);
    END IF;
END $$;

-- =====================================================
-- 2. CRIAR TABELA DE ETAPAS DO WORKFLOW (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Configuração da etapa
    step_type VARCHAR(50) NOT NULL, -- 'elaboration', 'technical_review', 'compliance_review', 'legal_review', 'approval', 'publication'
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    
    -- Status da etapa
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected', 'skipped'
    
    -- Responsáveis
    assigned_to UUID REFERENCES auth.users(id),
    assigned_role VARCHAR(50), -- Para casos onde é por role, não usuário específico
    completed_by UUID REFERENCES auth.users(id),
    
    -- Dados da execução
    comments TEXT,
    attachments JSONB DEFAULT '[]',
    ai_suggestions JSONB DEFAULT '{}',
    
    -- Datas
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_step_status CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'skipped'))
);

-- =====================================================
-- 3. CRIAR TABELA DE APROVAÇÕES (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Configuração da aprovação
    approval_level INTEGER NOT NULL, -- 1, 2, 3... para níveis hierárquicos
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    approver_role VARCHAR(50),
    
    -- Status e resultado
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'delegated'
    decision VARCHAR(30), -- 'approve', 'reject', 'request_changes'
    
    -- Feedback
    comments TEXT,
    conditions TEXT, -- Condições para aprovação
    
    -- Datas
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    due_date TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
    CONSTRAINT valid_decision CHECK (decision IS NULL OR decision IN ('approve', 'reject', 'request_changes'))
);

-- =====================================================
-- 4. CRIAR TABELA DE NOTIFICAÇÕES DE POLÍTICAS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Configuração da notificação
    notification_type VARCHAR(50) NOT NULL, -- 'new_policy', 'policy_update', 'review_required', 'approval_needed', 'expiry_warning'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Destinatários
    recipient_id UUID REFERENCES auth.users(id),
    recipient_role VARCHAR(50),
    recipient_email VARCHAR(255),
    
    -- Canais
    channels JSONB DEFAULT '["in_app"]', -- ['in_app', 'email', 'sms']
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Ação requerida
    action_required BOOLEAN DEFAULT false,
    action_type VARCHAR(50), -- 'read_policy', 'approve', 'review', 'acknowledge'
    action_url VARCHAR(500),
    
    -- Datas
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_notification_status CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    CONSTRAINT valid_notification_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- =====================================================
-- 5. CRIAR TABELA DE MÉTRICAS E ANALYTICS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Tipo de métrica
    metric_type VARCHAR(50) NOT NULL, -- 'read_rate', 'compliance_rate', 'training_completion', 'feedback_score'
    metric_category VARCHAR(50) NOT NULL, -- 'engagement', 'compliance', 'effectiveness', 'performance'
    
    -- Valores
    value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    unit VARCHAR(20), -- '%', 'count', 'days', 'score'
    
    -- Contexto
    dimension_1 VARCHAR(100), -- Ex: department, role, location
    dimension_2 VARCHAR(100),
    dimension_3 VARCHAR(100),
    
    -- Insights da IA
    ai_generated_insights JSONB DEFAULT '{}',
    
    -- Período
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 6. CRIAR TABELA DE TEMPLATES DE POLÍTICAS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL para templates globais
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    
    -- Conteúdo do template
    template_content JSONB NOT NULL,
    variables JSONB DEFAULT '{}', -- Variáveis que podem ser substituídas
    
    -- Configurações
    is_global BOOLEAN DEFAULT false, -- Templates globais disponíveis para todos os tenants
    is_active BOOLEAN DEFAULT true,
    requires_customization BOOLEAN DEFAULT true,
    
    -- Metadados
    applicable_frameworks JSONB DEFAULT '[]', -- ISO, COSO, etc.
    compliance_domains JSONB DEFAULT '[]',
    industry_sectors JSONB DEFAULT '[]',
    
    -- Estatísticas
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    avg_completion_time INTEGER, -- em dias
    
    -- Auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_template_type CHECK (type IN ('policy', 'procedure', 'guideline', 'standard'))
);

-- =====================================================
-- 7. CRIAR TABELA DE HISTÓRICO DE MUDANÇAS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Tipo de mudança
    change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'approved', 'published', 'expired', 'archived'
    change_description TEXT,
    
    -- Dados da mudança
    old_values JSONB,
    new_values JSONB,
    changed_fields JSONB DEFAULT '[]',
    
    -- Contexto
    reason VARCHAR(255),
    impact_assessment TEXT,
    
    -- Responsável
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    change_source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'automated', 'ai_suggestion'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 8. CRIAR TABELA DE LEITURAS E ACKNOWLEDGMENTS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Status do acknowledgment
    status VARCHAR(30) NOT NULL DEFAULT 'required', -- 'required', 'read', 'acknowledged', 'trained', 'exempted'
    
    -- Datas importantes
    required_by DATE,
    first_read_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    training_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Detalhes
    read_count INTEGER DEFAULT 0,
    time_spent_reading INTEGER, -- em segundos
    acknowledgment_method VARCHAR(50), -- 'digital_signature', 'checkbox', 'quiz', 'training'
    
    -- Feedback
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comments TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_ack_status CHECK (status IN ('required', 'read', 'acknowledged', 'trained', 'exempted'))
);

-- Adicionar constraint unique se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'policy_acknowledgments_policy_user_unique') THEN
        ALTER TABLE policy_acknowledgments ADD CONSTRAINT policy_acknowledgments_policy_user_unique UNIQUE(policy_id, user_id);
    END IF;
END $$;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE (criar apenas se não existirem)
-- =====================================================

-- Políticas (alguns já existem)
CREATE INDEX IF NOT EXISTS idx_policies_expiry_date ON policies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_policies_content_gin ON policies USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_policies_metadata_gin ON policies USING GIN (metadata);

-- Workflow
CREATE INDEX IF NOT EXISTS idx_workflow_steps_policy_id ON policy_workflow_steps(policy_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_assigned_to ON policy_workflow_steps(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON policy_workflow_steps(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_tenant_id ON policy_workflow_steps(tenant_id);

-- Aprovações
CREATE INDEX IF NOT EXISTS idx_approvals_policy_id ON policy_approvals(policy_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver_id ON policy_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON policy_approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_tenant_id ON policy_approvals(tenant_id);

-- Notificações
CREATE INDEX IF NOT EXISTS idx_notifications_policy_id ON policy_notifications(policy_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON policy_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON policy_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON policy_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON policy_notifications(tenant_id);

-- Métricas
CREATE INDEX IF NOT EXISTS idx_metrics_policy_id ON policy_metrics(policy_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON policy_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_period ON policy_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_metrics_tenant_id ON policy_metrics(tenant_id);

-- Templates
CREATE INDEX IF NOT EXISTS idx_templates_tenant_id ON policy_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON policy_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_global ON policy_templates(is_global);

-- Acknowledgments
CREATE INDEX IF NOT EXISTS idx_acknowledgments_policy_id ON policy_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_user_id ON policy_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_status ON policy_acknowledgments(status);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_tenant_id ON policy_acknowledgments(tenant_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Usar tabela profiles em vez de user_profiles
-- =====================================================

-- Workflow Steps
ALTER TABLE policy_workflow_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access workflow steps from their tenant" ON policy_workflow_steps;
CREATE POLICY "Users can access workflow steps from their tenant" ON policy_workflow_steps
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Aprovações
ALTER TABLE policy_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access approvals from their tenant" ON policy_approvals;
CREATE POLICY "Users can access approvals from their tenant" ON policy_approvals
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Notificações
ALTER TABLE policy_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access notifications from their tenant" ON policy_notifications;
CREATE POLICY "Users can access notifications from their tenant" ON policy_notifications
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Métricas
ALTER TABLE policy_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access metrics from their tenant" ON policy_metrics;
CREATE POLICY "Users can access metrics from their tenant" ON policy_metrics
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Templates
ALTER TABLE policy_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access templates from their tenant or global templates" ON policy_templates;
CREATE POLICY "Users can access templates from their tenant or global templates" ON policy_templates
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) 
        OR is_global = true
    );

-- Histórico
ALTER TABLE policy_change_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access change history from their tenant" ON policy_change_history;
CREATE POLICY "Users can access change history from their tenant" ON policy_change_history
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Acknowledgments
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access acknowledgments from their tenant" ON policy_acknowledgments;
CREATE POLICY "Users can access acknowledgments from their tenant" ON policy_acknowledgments
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- TRIGGERS PARA AUDITORIA E AUTOMAÇÃO
-- =====================================================

-- Aplicar trigger em tabelas que não têm
DO $$
BEGIN
    -- Workflow steps
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workflow_steps_updated_at') THEN
        CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON policy_workflow_steps
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Aprovações
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approvals_updated_at') THEN
        CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON policy_approvals
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Notificações
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
        CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON policy_notifications
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Métricas
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_metrics_updated_at') THEN
        CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON policy_metrics
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Templates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_templates_updated_at') THEN
        CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON policy_templates
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Acknowledgments
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_acknowledgments_updated_at') THEN
        CREATE TRIGGER update_acknowledgments_updated_at BEFORE UPDATE ON policy_acknowledgments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular métricas de política
CREATE OR REPLACE FUNCTION calculate_policy_metrics(policy_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_users INTEGER;
    acknowledged_users INTEGER;
    read_rate DECIMAL;
BEGIN
    -- Calcular taxa de leitura
    SELECT COUNT(*) INTO total_users 
    FROM profiles 
    WHERE tenant_id = (SELECT tenant_id FROM policies WHERE id = policy_uuid);
    
    SELECT COUNT(*) INTO acknowledged_users 
    FROM policy_acknowledgments 
    WHERE policy_id = policy_uuid AND status IN ('acknowledged', 'trained');
    
    read_rate := CASE 
        WHEN total_users > 0 THEN (acknowledged_users::DECIMAL / total_users::DECIMAL) * 100 
        ELSE 0 
    END;
    
    result := jsonb_build_object(
        'total_users', total_users,
        'acknowledged_users', acknowledged_users,
        'read_rate', read_rate,
        'calculated_at', now()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar políticas próximas do vencimento
CREATE OR REPLACE FUNCTION get_expiring_policies(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
    policy_id UUID,
    title TEXT,
    expiry_date DATE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.expiry_date,
        (p.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
    FROM policies p
    WHERE p.expiry_date IS NOT NULL 
        AND p.expiry_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
        AND p.status = 'published'
        AND p.is_active = true
    ORDER BY p.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSERIR TEMPLATES GLOBAIS BÁSICOS
-- =====================================================

-- Inserir apenas se não existirem
INSERT INTO policy_templates (
    name, description, category, type, template_content, variables, 
    is_global, created_by, applicable_frameworks, compliance_domains
) 
SELECT 
    'Política de Segurança da Informação',
    'Template padrão para política de segurança da informação baseada em ISO 27001',
    'it',
    'policy',
    '{
        "sections": [
            {
                "title": "1. Objetivo",
                "content": "Esta política estabelece as diretrizes para proteção das informações da {organization_name}."
            },
            {
                "title": "2. Escopo",
                "content": "Aplica-se a todos os colaboradores, terceiros e sistemas da organização."
            },
            {
                "title": "3. Responsabilidades",
                "content": "Definir responsabilidades por área e função."
            }
        ]
    }',
    '{"organization_name": "Nome da Organização", "effective_date": "Data de Vigência"}',
    true,
    (SELECT id FROM auth.users LIMIT 1),
    '["ISO 27001", "NIST Cybersecurity Framework"]',
    '["Segurança da Informação", "Proteção de Dados"]'
WHERE NOT EXISTS (
    SELECT 1 FROM policy_templates WHERE name = 'Política de Segurança da Informação'
);

INSERT INTO policy_templates (
    name, description, category, type, template_content, variables, 
    is_global, created_by, applicable_frameworks, compliance_domains
) 
SELECT 
    'Código de Ética e Conduta',
    'Template para código de ética corporativa',
    'governance',
    'policy',
    '{
        "sections": [
            {
                "title": "1. Princípios Fundamentais",
                "content": "Os valores que norteiam a conduta na {organization_name}."
            },
            {
                "title": "2. Relacionamento com Stakeholders",
                "content": "Diretrizes para relacionamento ético."
            }
        ]
    }',
    '{"organization_name": "Nome da Organização"}',
    true,
    (SELECT id FROM auth.users LIMIT 1),
    '["COSO", "ISO 37001"]',
    '["Ética", "Compliance", "Governança"]'
WHERE NOT EXISTS (
    SELECT 1 FROM policy_templates WHERE name = 'Código de Ética e Conduta'
);

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON TABLE policies IS 'Tabela principal para gestão de políticas e normas corporativas - ATUALIZADA';
COMMENT ON TABLE policy_workflow_steps IS 'Etapas do workflow de elaboração e aprovação de políticas';
COMMENT ON TABLE policy_approvals IS 'Controle de aprovações hierárquicas de políticas';
COMMENT ON TABLE policy_notifications IS 'Sistema de notificações específico para políticas';
COMMENT ON TABLE policy_metrics IS 'Métricas e analytics de efetividade das políticas';
COMMENT ON TABLE policy_templates IS 'Templates reutilizáveis para criação de políticas';
COMMENT ON TABLE policy_change_history IS 'Histórico completo de mudanças nas políticas';
COMMENT ON TABLE policy_acknowledgments IS 'Controle de leitura e acknowledgment de políticas pelos usuários';

-- Fim do script de atualização das tabelas do módulo de políticas
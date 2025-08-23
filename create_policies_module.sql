-- =====================================================
-- MÓDULO DE GESTÃO DE POLÍTICAS E NORMAS
-- Criado por Alex Policy - Especialista em Políticas Corporativas
-- =====================================================

-- Habilitar RLS para todas as tabelas
SET row_security = on;

-- =====================================================
-- 1. TABELA PRINCIPAL DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Informações básicas
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'governance', 'compliance', 'operational', 'hr', 'it', 'financial'
    type VARCHAR(50) NOT NULL, -- 'policy', 'procedure', 'guideline', 'standard'
    
    -- Status e workflow
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published', 'expired', 'archived'
    workflow_stage VARCHAR(50) DEFAULT 'elaboration', -- 'elaboration', 'technical_review', 'compliance_review', 'approval', 'publication'
    
    -- Versionamento
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    parent_policy_id UUID REFERENCES policies(id),
    is_current_version BOOLEAN DEFAULT true,
    
    -- Conteúdo estruturado
    content JSONB NOT NULL DEFAULT '{}', -- Estrutura flexível para diferentes tipos de política
    metadata JSONB DEFAULT '{}', -- Tags, keywords, áreas aplicáveis, etc.
    
    -- Configurações
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    requires_approval BOOLEAN DEFAULT true,
    requires_training BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Datas importantes
    effective_date DATE,
    expiry_date DATE,
    review_date DATE,
    next_review_date DATE,
    
    -- Auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    published_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'approved', 'published', 'expired', 'archived')),
    CONSTRAINT valid_type CHECK (type IN ('policy', 'procedure', 'guideline', 'standard')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_dates CHECK (expiry_date IS NULL OR effective_date IS NULL OR expiry_date > effective_date)
);

-- =====================================================
-- 2. ETAPAS DO WORKFLOW
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
-- 3. APROVAÇÕES
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
-- 4. NOTIFICAÇÕES DE POLÍTICAS
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
-- 5. MÉTRICAS E ANALYTICS
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
-- 6. TEMPLATES DE POLÍTICAS
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
-- 7. HISTÓRICO DE MUDANÇAS
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
-- 8. LEITURAS E ACKNOWLEDGMENTS
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
    
    CONSTRAINT valid_ack_status CHECK (status IN ('required', 'read', 'acknowledged', 'trained', 'exempted')),
    UNIQUE(policy_id, user_id) -- Um acknowledgment por usuário por política
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Políticas
CREATE INDEX IF NOT EXISTS idx_policies_tenant_id ON policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_expiry_date ON policies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_policies_review_date ON policies(review_date);
CREATE INDEX IF NOT EXISTS idx_policies_created_by ON policies(created_by);
CREATE INDEX IF NOT EXISTS idx_policies_content_gin ON policies USING GIN (content);

-- Workflow
CREATE INDEX IF NOT EXISTS idx_workflow_steps_policy_id ON policy_workflow_steps(policy_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_assigned_to ON policy_workflow_steps(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON policy_workflow_steps(status);

-- Aprovações
CREATE INDEX IF NOT EXISTS idx_approvals_policy_id ON policy_approvals(policy_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver_id ON policy_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON policy_approvals(status);

-- Notificações
CREATE INDEX IF NOT EXISTS idx_notifications_policy_id ON policy_notifications(policy_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON policy_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON policy_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON policy_notifications(scheduled_for);

-- Métricas
CREATE INDEX IF NOT EXISTS idx_metrics_policy_id ON policy_metrics(policy_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON policy_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_period ON policy_metrics(period_start, period_end);

-- Templates
CREATE INDEX IF NOT EXISTS idx_templates_tenant_id ON policy_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON policy_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_global ON policy_templates(is_global);

-- Acknowledgments
CREATE INDEX IF NOT EXISTS idx_acknowledgments_policy_id ON policy_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_user_id ON policy_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_status ON policy_acknowledgments(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Políticas
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access policies from their tenant" ON policies
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- Workflow Steps
ALTER TABLE policy_workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access workflow steps from their tenant" ON policy_workflow_steps
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- Aprovações
ALTER TABLE policy_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access approvals from their tenant" ON policy_approvals
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- Notificações
ALTER TABLE policy_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access notifications from their tenant" ON policy_notifications
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- Métricas
ALTER TABLE policy_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access metrics from their tenant" ON policy_metrics
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- Templates
ALTER TABLE policy_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access templates from their tenant or global templates" ON policy_templates
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()) 
        OR is_global = true
    );

-- Histórico
ALTER TABLE policy_change_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access change history from their tenant" ON policy_change_history
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- Acknowledgments
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access acknowledgments from their tenant" ON policy_acknowledgments
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- =====================================================
-- TRIGGERS PARA AUDITORIA E AUTOMAÇÃO
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON policy_workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON policy_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON policy_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON policy_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON policy_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acknowledgments_updated_at BEFORE UPDATE ON policy_acknowledgments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    FROM user_profiles 
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
    title VARCHAR,
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
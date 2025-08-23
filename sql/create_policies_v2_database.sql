-- =====================================================
-- MÓDULO DE GESTÃO DE POLÍTICAS E NORMAS V2
-- Estrutura de banco de dados completa
-- Integrado com Alex Policy IA
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA PRINCIPAL DE POLÍTICAS V2
-- =====================================================
CREATE TABLE IF NOT EXISTS policies_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Informações básicas
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT,
    summary TEXT,
    
    -- Classificação
    category VARCHAR(100) NOT NULL, -- governance, compliance, security, hr, finance, operations, legal
    policy_type VARCHAR(100) NOT NULL, -- policy, procedure, guideline, standard, manual
    priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    
    -- Status e workflow
    status VARCHAR(100) NOT NULL DEFAULT 'draft', -- draft, under_review, pending_approval, approved, published, expired, archived
    workflow_stage VARCHAR(100) NOT NULL DEFAULT 'elaboration', -- elaboration, review, approval, publication, validity_management
    
    -- Versionamento
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    parent_policy_id UUID REFERENCES policies_v2(id),
    is_current_version BOOLEAN DEFAULT true,
    
    -- Responsabilidades
    created_by UUID NOT NULL REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    owner_id UUID REFERENCES profiles(id),
    
    -- Datas importantes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    effective_date DATE,
    expiry_date DATE,
    review_date DATE,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados e IA
    tags TEXT[],
    keywords TEXT[],
    metadata JSONB DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT false,
    alex_suggestions JSONB DEFAULT '{}',
    compliance_frameworks TEXT[],
    
    -- Configurações
    requires_acknowledgment BOOLEAN DEFAULT false,
    is_mandatory BOOLEAN DEFAULT true,
    applies_to_all_users BOOLEAN DEFAULT true,
    target_audience TEXT[],
    
    -- Auditoria
    created_at_tz TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at_tz TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- ETAPAS DO WORKFLOW DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies_v2(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Definição da etapa
    step_type VARCHAR(100) NOT NULL, -- elaboration, review, approval, publication, validity_management
    step_name VARCHAR(200) NOT NULL,
    step_order INTEGER NOT NULL,
    
    -- Responsabilidade
    assignee_id UUID REFERENCES profiles(id),
    assignee_role VARCHAR(100),
    
    -- Status e prazos
    status VARCHAR(100) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped, cancelled
    due_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES profiles(id),
    
    -- Conteúdo
    instructions TEXT,
    comments TEXT,
    attachments JSONB DEFAULT '[]',
    alex_assistance JSONB DEFAULT '{}',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- APROVAÇÕES DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies_v2(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Aprovador
    approver_id UUID NOT NULL REFERENCES profiles(id),
    approver_role VARCHAR(100),
    approval_level INTEGER NOT NULL, -- 1, 2, 3 (níveis de aprovação)
    
    -- Status da aprovação
    status VARCHAR(100) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, delegated
    decision_date TIMESTAMP WITH TIME ZONE,
    
    -- Feedback
    comments TEXT,
    conditions TEXT, -- condições para aprovação
    suggestions JSONB DEFAULT '[]',
    
    -- Delegação
    delegated_to UUID REFERENCES profiles(id),
    delegation_reason TEXT,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- REVISÕES DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies_v2(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Revisor
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    review_type VARCHAR(100) NOT NULL, -- technical, legal, compliance, business, security
    
    -- Status da revisão
    status VARCHAR(100) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Conteúdo da revisão
    findings TEXT,
    recommendations JSONB DEFAULT '[]',
    issues_found JSONB DEFAULT '[]',
    compliance_check JSONB DEFAULT '{}',
    
    -- Classificação
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    requires_changes BOOLEAN DEFAULT false,
    
    -- Alex Policy insights
    alex_analysis JSONB DEFAULT '{}',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- PUBLICAÇÕES DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies_v2(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Detalhes da publicação
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_date DATE NOT NULL,
    
    -- Canais de comunicação
    channels JSONB DEFAULT '[]', -- email, intranet, portal, meeting, training
    target_audience JSONB DEFAULT '[]',
    
    -- Configurações
    acknowledgment_required BOOLEAN DEFAULT false,
    training_required BOOLEAN DEFAULT false,
    
    -- Métricas
    total_recipients INTEGER DEFAULT 0,
    acknowledgments_received INTEGER DEFAULT 0,
    read_receipts INTEGER DEFAULT 0,
    
    -- Conteúdo da comunicação
    announcement_title VARCHAR(500),
    announcement_content TEXT,
    communication_materials JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(100) NOT NULL DEFAULT 'scheduled', -- scheduled, published, completed
    
    -- Auditoria
    published_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- RECONHECIMENTOS DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies_v2(id) ON DELETE CASCADE,
    publication_id UUID NOT NULL REFERENCES policy_publications(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Usuário
    user_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Reconhecimento
    acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    acknowledgment_method VARCHAR(100), -- email_click, portal_confirmation, training_completion
    
    -- Detalhes
    ip_address INET,
    user_agent TEXT,
    comments TEXT,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- MÉTRICAS DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Tipo de métrica
    metric_type VARCHAR(100) NOT NULL, -- compliance_rate, approval_time, review_efficiency, publication_reach
    metric_category VARCHAR(100) NOT NULL, -- performance, compliance, efficiency, adoption
    
    -- Valores
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(50), -- percentage, days, count, score
    
    -- Contexto
    policy_id UUID REFERENCES policies_v2(id),
    policy_category VARCHAR(100),
    
    -- Período
    period_start DATE,
    period_end DATE,
    calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    alex_insights JSONB DEFAULT '{}',
    
    -- Auditoria
    calculated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- TEMPLATES DE POLÍTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS policy_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL para templates globais
    
    -- Informações básicas
    name VARCHAR(300) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    policy_type VARCHAR(100) NOT NULL,
    
    -- Conteúdo do template
    template_content TEXT NOT NULL,
    sections JSONB DEFAULT '[]',
    variables JSONB DEFAULT '{}',
    
    -- Configurações
    is_active BOOLEAN DEFAULT true,
    is_global BOOLEAN DEFAULT false,
    requires_customization BOOLEAN DEFAULT true,
    
    -- Compliance
    compliance_frameworks TEXT[],
    regulatory_requirements JSONB DEFAULT '[]',
    
    -- Uso e popularidade
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    
    -- Alex Policy
    alex_generated BOOLEAN DEFAULT false,
    alex_recommendations JSONB DEFAULT '{}',
    
    -- Auditoria
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Políticas V2
CREATE INDEX IF NOT EXISTS idx_policies_v2_tenant_id ON policies_v2(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policies_v2_status ON policies_v2(status);
CREATE INDEX IF NOT EXISTS idx_policies_v2_category ON policies_v2(category);
CREATE INDEX IF NOT EXISTS idx_policies_v2_expiry_date ON policies_v2(expiry_date);
CREATE INDEX IF NOT EXISTS idx_policies_v2_review_date ON policies_v2(review_date);
CREATE INDEX IF NOT EXISTS idx_policies_v2_created_by ON policies_v2(created_by);
CREATE INDEX IF NOT EXISTS idx_policies_v2_workflow_stage ON policies_v2(workflow_stage);

-- Workflow Steps
CREATE INDEX IF NOT EXISTS idx_policy_workflow_steps_policy_id ON policy_workflow_steps(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_workflow_steps_assignee ON policy_workflow_steps(assignee_id);
CREATE INDEX IF NOT EXISTS idx_policy_workflow_steps_status ON policy_workflow_steps(status);
CREATE INDEX IF NOT EXISTS idx_policy_workflow_steps_due_date ON policy_workflow_steps(due_date);

-- Aprovações
CREATE INDEX IF NOT EXISTS idx_policy_approvals_policy_id ON policy_approvals(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_approver ON policy_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_status ON policy_approvals(status);

-- Revisões
CREATE INDEX IF NOT EXISTS idx_policy_reviews_policy_id ON policy_reviews(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_reviews_reviewer ON policy_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_policy_reviews_status ON policy_reviews(status);

-- Publicações
CREATE INDEX IF NOT EXISTS idx_policy_publications_policy_id ON policy_publications(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_publications_date ON policy_publications(publication_date);
CREATE INDEX IF NOT EXISTS idx_policy_publications_status ON policy_publications(status);

-- Reconhecimentos
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_policy_id ON policy_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_user_id ON policy_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_publication_id ON policy_acknowledgments(publication_id);

-- Métricas
CREATE INDEX IF NOT EXISTS idx_policy_metrics_tenant_id ON policy_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_metrics_type ON policy_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_policy_metrics_date ON policy_metrics(calculation_date);

-- Templates
CREATE INDEX IF NOT EXISTS idx_policy_templates_tenant_id ON policy_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_templates_category ON policy_templates(category);
CREATE INDEX IF NOT EXISTS idx_policy_templates_active ON policy_templates(is_active);

-- =====================================================
-- TRIGGERS PARA AUDITORIA
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_policies_v2_updated_at BEFORE UPDATE ON policies_v2 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_workflow_steps_updated_at BEFORE UPDATE ON policy_workflow_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_approvals_updated_at BEFORE UPDATE ON policy_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_reviews_updated_at BEFORE UPDATE ON policy_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_publications_updated_at BEFORE UPDATE ON policy_publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_metrics_updated_at BEFORE UPDATE ON policy_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_templates_updated_at BEFORE UPDATE ON policy_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
ALTER TABLE policies_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para policies_v2
CREATE POLICY "Users can view policies from their tenant" ON policies_v2
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create policies in their tenant" ON policies_v2
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update policies in their tenant" ON policies_v2
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete policies in their tenant" ON policies_v2
    FOR DELETE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para workflow_steps
CREATE POLICY "Users can view workflow steps from their tenant" ON policy_workflow_steps
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create workflow steps in their tenant" ON policy_workflow_steps
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update workflow steps in their tenant" ON policy_workflow_steps
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para aprovações
CREATE POLICY "Users can view approvals from their tenant" ON policy_approvals
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create approvals in their tenant" ON policy_approvals
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update approvals in their tenant" ON policy_approvals
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para revisões
CREATE POLICY "Users can view reviews from their tenant" ON policy_reviews
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create reviews in their tenant" ON policy_reviews
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update reviews in their tenant" ON policy_reviews
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para publicações
CREATE POLICY "Users can view publications from their tenant" ON policy_publications
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create publications in their tenant" ON policy_publications
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update publications in their tenant" ON policy_publications
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para reconhecimentos
CREATE POLICY "Users can view acknowledgments from their tenant" ON policy_acknowledgments
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create acknowledgments in their tenant" ON policy_acknowledgments
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para métricas
CREATE POLICY "Users can view metrics from their tenant" ON policy_metrics
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create metrics in their tenant" ON policy_metrics
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para templates
CREATE POLICY "Users can view templates from their tenant or global templates" ON policy_templates
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR tenant_id IS NULL);

CREATE POLICY "Users can create templates in their tenant" ON policy_templates
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update templates in their tenant" ON policy_templates
    FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON TABLE policies_v2 IS 'Tabela principal para gestão completa de políticas e normas com integração Alex Policy';
COMMENT ON TABLE policy_workflow_steps IS 'Etapas do workflow de políticas (elaboração, revisão, aprovação, publicação, validade)';
COMMENT ON TABLE policy_approvals IS 'Controle de aprovações com múltiplos níveis';
COMMENT ON TABLE policy_reviews IS 'Revisões técnicas e de compliance das políticas';
COMMENT ON TABLE policy_publications IS 'Gestão de publicação e comunicação das políticas';
COMMENT ON TABLE policy_acknowledgments IS 'Reconhecimentos e confirmações de leitura';
COMMENT ON TABLE policy_metrics IS 'Métricas e KPIs de gestão de políticas';
COMMENT ON TABLE policy_templates IS 'Templates reutilizáveis para criação de políticas';
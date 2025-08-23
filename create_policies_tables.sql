-- ============================================================================
-- CRIAÇÃO DAS TABELAS DO MÓDULO DE POLÍTICAS
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA PRINCIPAL: POLICIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações Básicas
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) DEFAULT 'Política',
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    -- Status e Aprovação
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    
    -- Datas
    effective_date DATE,
    review_date DATE,
    expiration_date DATE,
    last_reviewed_at TIMESTAMPTZ,
    
    -- Documentos
    document_url TEXT,
    document_path TEXT,
    
    -- Proprietário e Responsabilidade
    owner_id UUID,
    created_by UUID,
    updated_by UUID,
    
    -- Controle de auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadados adicionais
    tags TEXT[],
    compliance_frameworks TEXT[],
    related_policies UUID[],
    impact_areas TEXT[],
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'rejected', 
        'archived', 'under_review', 'expired', 'published'
    )),
    CONSTRAINT valid_category CHECK (category IN (
        'Segurança da Informação', 'Privacidade de Dados', 'Recursos Humanos',
        'Financeiro', 'Operacional', 'Compliance', 'Gestão de Riscos',
        'Ética', 'Qualidade', 'Ambiental'
    )),
    CONSTRAINT valid_document_type CHECK (document_type IN (
        'Política', 'Procedimento', 'Instrução de Trabalho', 'Manual',
        'Regulamento', 'Norma', 'Diretriz', 'Padrão', 'Código'
    ))
);

-- ============================================================================
-- TABELA: POLICY_APPROVALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Aprovador
    approver_id UUID NOT NULL,
    approver_role VARCHAR(100),
    
    -- Decisão
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    comments TEXT,
    decision_date TIMESTAMPTZ,
    
    -- Delegação
    delegated_to UUID,
    delegation_reason TEXT,
    
    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'reviewed'))
);

-- ============================================================================
-- TABELA: POLICY_APPROVERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Aprovador
    approver_id UUID NOT NULL,
    approver_role VARCHAR(100) NOT NULL,
    
    -- Configuração
    is_required BOOLEAN NOT NULL DEFAULT true,
    order_sequence INTEGER NOT NULL DEFAULT 1,
    can_delegate BOOLEAN NOT NULL DEFAULT false,
    
    -- Notificações
    notification_days_before INTEGER DEFAULT 7,
    escalation_days INTEGER DEFAULT 3,
    escalation_to UUID,
    
    -- Controle
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_order_sequence CHECK (order_sequence > 0),
    CONSTRAINT positive_notification_days CHECK (notification_days_before >= 0),
    CONSTRAINT positive_escalation_days CHECK (escalation_days >= 0)
);

-- ============================================================================
-- TABELA: POLICY_REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Revisão
    review_type VARCHAR(20) NOT NULL DEFAULT 'periodic',
    reviewer_id UUID NOT NULL,
    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    
    -- Resultado
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    findings TEXT,
    recommendations TEXT,
    
    -- Classificação
    severity VARCHAR(20),
    compliance_status VARCHAR(30),
    
    -- Controle
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_review_type CHECK (review_type IN ('periodic', 'ad_hoc', 'compliance', 'incident_based')),
    CONSTRAINT valid_review_status CHECK (status IN ('completed', 'pending', 'overdue')),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_compliance_status CHECK (compliance_status IN ('compliant', 'non_compliant', 'partially_compliant'))
);

-- ============================================================================
-- TABELA: POLICY_ACTION_ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_review_id UUID NOT NULL REFERENCES policy_reviews(id) ON DELETE CASCADE,
    
    -- Ação
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    assigned_to UUID NOT NULL,
    due_date TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    completion_date TIMESTAMPTZ,
    completion_notes TEXT,
    
    -- Controle
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_action_status CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'))
);

-- ============================================================================
-- TABELA: POLICY_TRAINING
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Participante
    employee_id UUID NOT NULL,
    trainer_id UUID,
    
    -- Treinamento
    training_date TIMESTAMPTZ NOT NULL,
    training_method VARCHAR(20) NOT NULL DEFAULT 'online',
    duration_hours DECIMAL(4,2),
    
    -- Resultado
    completion_status VARCHAR(20) NOT NULL DEFAULT 'incomplete',
    score INTEGER,
    certification_date TIMESTAMPTZ,
    expiration_date TIMESTAMPTZ,
    
    -- Evidências
    certificate_url TEXT,
    notes TEXT,
    
    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_training_method CHECK (training_method IN ('online', 'classroom', 'video', 'document', 'workshop')),
    CONSTRAINT valid_completion_status CHECK (completion_status IN ('completed', 'incomplete', 'failed', 'expired')),
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100),
    CONSTRAINT positive_duration CHECK (duration_hours >= 0)
);

-- ============================================================================
-- TABELA: POLICY_ATTACHMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Arquivo
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Metadados
    description TEXT,
    category VARCHAR(30) NOT NULL DEFAULT 'document',
    
    -- Versão
    version VARCHAR(20) DEFAULT '1.0',
    is_current_version BOOLEAN NOT NULL DEFAULT true,
    
    -- Controle
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_attachment_category CHECK (category IN (
        'document', 'template', 'evidence', 'reference', 'training_material'
    )),
    CONSTRAINT positive_file_size CHECK (file_size > 0)
);

-- ============================================================================
-- TABELA: POLICY_CHANGE_LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Mudança
    change_type VARCHAR(30) NOT NULL,
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    
    -- Contexto
    reason TEXT,
    impact_assessment TEXT,
    stakeholders_notified BOOLEAN DEFAULT false,
    
    -- Controle
    changed_by UUID NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_change_type CHECK (change_type IN (
        'created', 'updated', 'status_changed', 'approved', 'rejected', 
        'archived', 'version_updated'
    ))
);

-- ============================================================================
-- TABELA: PROFILES (se não existir)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_owner ON policies(owner_id);
CREATE INDEX IF NOT EXISTS idx_policies_effective_date ON policies(effective_date);
CREATE INDEX IF NOT EXISTS idx_policies_review_date ON policies(review_date);
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at DESC);

-- Índices para aprovações
CREATE INDEX IF NOT EXISTS idx_policy_approvals_policy ON policy_approvals(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_approver ON policy_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_status ON policy_approvals(status);

-- Índices para aprovadores
CREATE INDEX IF NOT EXISTS idx_policy_approvers_policy ON policy_approvers(policy_id);

-- Índices para reviews
CREATE INDEX IF NOT EXISTS idx_policy_reviews_policy ON policy_reviews(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_reviews_reviewer ON policy_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_policy_reviews_due_date ON policy_reviews(due_date);

-- Índices para training
CREATE INDEX IF NOT EXISTS idx_policy_training_policy ON policy_training(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_training_employee ON policy_training(employee_id);

-- Índices para change log
CREATE INDEX IF NOT EXISTS idx_policy_change_log_policy ON policy_change_log(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_change_log_date ON policy_change_log(changed_at DESC);

SELECT 'Tabelas do módulo de políticas criadas com sucesso!' as status;
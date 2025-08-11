-- ============================================================================
-- MIGRA��O: M�DULO DE GEST�O DE POL�TICAS
-- ============================================================================
-- Cria��o de tabelas e estrutura para o m�dulo de gest�o de pol�ticas corporativas

-- Extens�es necess�rias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA PRINCIPAL: POLICIES
-- ============================================================================

-- Atualizar tabela policies existente ou criar nova
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informa��es B�sicas
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) DEFAULT 'Pol�tica',
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    -- Status e Aprova��o
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    
    -- Datas
    effective_date DATE,
    review_date DATE,
    expiration_date DATE,
    last_reviewed_at TIMESTAMPTZ,
    
    -- Documentos
    document_url TEXT,
    document_path TEXT,
    
    -- Propriet�rio e Responsabilidade
    owner_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
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
        'archived', 'under_review', 'expired'
    )),
    CONSTRAINT valid_category CHECK (category IN (
        'Seguran�a da Informa��o', 'Privacidade de Dados', 'Recursos Humanos',
        'Financeiro', 'Operacional', 'Compliance', 'Gest�o de Riscos',
        '�tica', 'Qualidade', 'Ambiental'
    )),
    CONSTRAINT valid_document_type CHECK (document_type IN (
        'Pol�tica', 'Procedimento', 'Instru��o de Trabalho', 'Manual',
        'Regulamento', 'Norma', 'Diretriz', 'Padr�o'
    ))
);

-- ============================================================================
-- TABELA: POLICY_APPROVALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Aprovador
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    approver_role VARCHAR(100),
    
    -- Decis�o
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    comments TEXT,
    decision_date TIMESTAMPTZ,
    
    -- Delega��o
    delegated_to UUID REFERENCES auth.users(id),
    delegation_reason TEXT,
    
    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'reviewed')),
    CONSTRAINT unique_policy_approver UNIQUE(policy_id, approver_id, created_at)
);

-- ============================================================================
-- TABELA: POLICY_APPROVERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS policy_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    
    -- Aprovador
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    approver_role VARCHAR(100) NOT NULL,
    
    -- Configura��o
    is_required BOOLEAN NOT NULL DEFAULT true,
    order_sequence INTEGER NOT NULL DEFAULT 1,
    can_delegate BOOLEAN NOT NULL DEFAULT false,
    
    -- Notifica��es
    notification_days_before INTEGER DEFAULT 7,
    escalation_days INTEGER DEFAULT 3,
    escalation_to UUID REFERENCES auth.users(id),
    
    -- Controle
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_policy_approver_sequence UNIQUE(policy_id, order_sequence),
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
    
    -- Revis�o
    review_type VARCHAR(20) NOT NULL DEFAULT 'periodic',
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    
    -- Resultado
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    findings TEXT,
    recommendations TEXT,
    
    -- Classifica��o
    severity VARCHAR(20),
    compliance_status VARCHAR(30),
    
    -- Controle
    created_by UUID NOT NULL REFERENCES auth.users(id),
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
    
    -- A��o
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    assigned_to UUID NOT NULL REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    completion_date TIMESTAMPTZ,
    completion_notes TEXT,
    
    -- Controle
    created_by UUID NOT NULL REFERENCES auth.users(id),
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
    employee_id UUID NOT NULL REFERENCES auth.users(id),
    trainer_id UUID REFERENCES auth.users(id),
    
    -- Treinamento
    training_date TIMESTAMPTZ NOT NULL,
    training_method VARCHAR(20) NOT NULL DEFAULT 'online',
    duration_hours DECIMAL(4,2),
    
    -- Resultado
    completion_status VARCHAR(20) NOT NULL DEFAULT 'incomplete',
    score INTEGER,
    certification_date TIMESTAMPTZ,
    expiration_date TIMESTAMPTZ,
    
    -- Evid�ncias
    certificate_url TEXT,
    notes TEXT,
    
    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_training_method CHECK (training_method IN ('online', 'classroom', 'video', 'document', 'workshop')),
    CONSTRAINT valid_completion_status CHECK (completion_status IN ('completed', 'incomplete', 'failed', 'expired')),
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100),
    CONSTRAINT positive_duration CHECK (duration_hours >= 0),
    CONSTRAINT unique_employee_policy_training UNIQUE(policy_id, employee_id, training_date)
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
    
    -- Vers�o
    version VARCHAR(20) DEFAULT '1.0',
    is_current_version BOOLEAN NOT NULL DEFAULT true,
    
    -- Controle
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
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
    
    -- Mudan�a
    change_type VARCHAR(30) NOT NULL,
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    
    -- Contexto
    reason TEXT,
    impact_assessment TEXT,
    stakeholders_notified BOOLEAN DEFAULT false,
    
    -- Controle
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_change_type CHECK (change_type IN (
        'created', 'updated', 'status_changed', 'approved', 'rejected', 
        'archived', 'version_updated'
    ))
);

-- ============================================================================
-- �NDICES PARA PERFORMANCE
-- ============================================================================

-- �ndices principais
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_owner ON policies(owner_id);
CREATE INDEX IF NOT EXISTS idx_policies_effective_date ON policies(effective_date);
CREATE INDEX IF NOT EXISTS idx_policies_review_date ON policies(review_date);
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at DESC);

-- �ndices para aprova��es
CREATE INDEX IF NOT EXISTS idx_policy_approvals_policy ON policy_approvals(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_approver ON policy_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_status ON policy_approvals(status);

-- �ndices para aprovadores
CREATE INDEX IF NOT EXISTS idx_policy_approvers_policy ON policy_approvers(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvers_order ON policy_approvers(policy_id, order_sequence);

-- �ndices para reviews
CREATE INDEX IF NOT EXISTS idx_policy_reviews_policy ON policy_reviews(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_reviews_reviewer ON policy_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_policy_reviews_due_date ON policy_reviews(due_date);

-- �ndices para training
CREATE INDEX IF NOT EXISTS idx_policy_training_policy ON policy_training(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_training_employee ON policy_training(employee_id);

-- �ndices para change log
CREATE INDEX IF NOT EXISTS idx_policy_change_log_policy ON policy_change_log(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_change_log_date ON policy_change_log(changed_at DESC);

-- ============================================================================
-- TRIGGERS PARA AUDITORIA
-- ============================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas principais
DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policy_approvals_updated_at ON policy_approvals;
CREATE TRIGGER update_policy_approvals_updated_at
    BEFORE UPDATE ON policy_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policy_approvers_updated_at ON policy_approvers;
CREATE TRIGGER update_policy_approvers_updated_at
    BEFORE UPDATE ON policy_approvers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para log de mudan�as
CREATE OR REPLACE FUNCTION log_policy_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO policy_change_log (policy_id, change_type, changed_by)
        VALUES (NEW.id, 'created', NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log mudan�as significativas
        IF OLD.status != NEW.status THEN
            INSERT INTO policy_change_log (policy_id, change_type, field_changed, old_value, new_value, changed_by)
            VALUES (NEW.id, 'status_changed', 'status', OLD.status, NEW.status, NEW.updated_by);
        END IF;
        
        IF OLD.version != NEW.version THEN
            INSERT INTO policy_change_log (policy_id, change_type, field_changed, old_value, new_value, changed_by)
            VALUES (NEW.id, 'version_updated', 'version', OLD.version, NEW.version, NEW.updated_by);
        END IF;
        
        -- Log aprova��o
        IF OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL THEN
            INSERT INTO policy_change_log (policy_id, change_type, changed_by)
            VALUES (NEW.id, 'approved', NEW.approved_by);
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS log_policy_changes_trigger ON policies;
CREATE TRIGGER log_policy_changes_trigger
    AFTER INSERT OR UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION log_policy_changes();

-- ============================================================================
-- FUN��ES AUXILIARES
-- ============================================================================

-- Fun��o para calcular m�tricas de pol�ticas
CREATE OR REPLACE FUNCTION calculate_policy_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_policies', (SELECT COUNT(*) FROM policies),
        'policies_by_status', (
            SELECT json_object_agg(status, count)
            FROM (
                SELECT status, COUNT(*) as count
                FROM policies
                GROUP BY status
            ) status_counts
        ),
        'policies_by_category', (
            SELECT json_object_agg(category, count)
            FROM (
                SELECT category, COUNT(*) as count
                FROM policies
                GROUP BY category
            ) category_counts
        ),
        'upcoming_reviews', (
            SELECT COUNT(*)
            FROM policies
            WHERE review_date IS NOT NULL
            AND review_date <= CURRENT_DATE + INTERVAL '30 days'
            AND review_date >= CURRENT_DATE
        ),
        'overdue_reviews', (
            SELECT COUNT(*)
            FROM policies
            WHERE review_date IS NOT NULL
            AND review_date < CURRENT_DATE
        ),
        'pending_approvals', (
            SELECT COUNT(*)
            FROM policies
            WHERE status = 'pending_approval'
        ),
        'compliance_rate', (
            CASE 
                WHEN (SELECT COUNT(*) FROM policies) = 0 THEN 0
                ELSE ROUND(
                    (SELECT COUNT(*)::numeric FROM policies WHERE status = 'approved') * 100.0 / 
                    (SELECT COUNT(*) FROM policies), 2
                )
            END
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fun��o para obter pol�ticas que precisam de revis�o
CREATE OR REPLACE FUNCTION get_policies_for_review(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    policy_id UUID,
    title VARCHAR(255),
    category VARCHAR(100),
    review_date DATE,
    days_until_review INTEGER,
    owner_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.category,
        p.review_date,
        (p.review_date - CURRENT_DATE)::INTEGER as days_until_review,
        pr.full_name as owner_name
    FROM policies p
    LEFT JOIN profiles pr ON p.owner_id = pr.user_id
    WHERE p.review_date IS NOT NULL
    AND p.review_date <= CURRENT_DATE + days_ahead
    AND p.status = 'approved'
    ORDER BY p.review_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POL�TICAS DE SEGURAN�A (RLS)
-- ============================================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_training ENABLE ROW LEVEL SECURITY;

-- Pol�tica b�sica: usu�rios autenticados podem ver pol�ticas
CREATE POLICY "Users can view policies" ON policies FOR SELECT TO authenticated USING (true);

-- Pol�tica: usu�rios podem editar pol�ticas que criaram ou s�o propriet�rios
CREATE POLICY "Users can edit their policies" ON policies FOR UPDATE TO authenticated 
USING (created_by = auth.uid() OR owner_id = auth.uid());

-- Pol�tica: usu�rios podem criar pol�ticas
CREATE POLICY "Users can create policies" ON policies FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Pol�tica: apenas propriet�rios ou administradores podem deletar
CREATE POLICY "Owners can delete policies" ON policies FOR DELETE TO authenticated 
USING (created_by = auth.uid() OR owner_id = auth.uid());

-- Pol�ticas para aprova��es
CREATE POLICY "Users can view approvals" ON policy_approvals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Approvers can create approvals" ON policy_approvals FOR INSERT TO authenticated 
WITH CHECK (approver_id = auth.uid());

CREATE POLICY "Approvers can update their approvals" ON policy_approvals FOR UPDATE TO authenticated 
USING (approver_id = auth.uid());

-- ============================================================================
-- DADOS INICIAIS DE EXEMPLO (OPCIONAL)
-- ============================================================================

-- Inserir algumas pol�ticas de exemplo se necess�rio
-- INSERT INTO policies (title, description, category, created_by, owner_id) VALUES
-- ('Pol�tica de Seguran�a da Informa��o', 'Define as diretrizes para prote��o das informa��es corporativas', 'Seguran�a da Informa��o', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
-- ('C�digo de �tica Corporativa', 'Estabelece os princ�pios �ticos e de conduta da organiza��o', '�tica', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000');

-- ============================================================================
-- COMENT�RIOS E DOCUMENTA��O
-- ============================================================================

COMMENT ON TABLE policies IS 'Tabela principal para armazenar pol�ticas corporativas';
COMMENT ON TABLE policy_approvals IS 'Registra o hist�rico de aprova��es das pol�ticas';
COMMENT ON TABLE policy_approvers IS 'Define os aprovadores configurados para cada pol�tica';
COMMENT ON TABLE policy_reviews IS 'Armazena os resultados das revis�es peri�dicas de pol�ticas';
COMMENT ON TABLE policy_training IS 'Registra os treinamentos relacionados �s pol�ticas';
COMMENT ON TABLE policy_attachments IS 'Anexos e documentos relacionados �s pol�ticas';
COMMENT ON TABLE policy_change_log IS 'Log de todas as mudan�as realizadas nas pol�ticas';

COMMENT ON COLUMN policies.status IS 'Status atual da pol�tica: draft, pending_approval, approved, rejected, archived, under_review, expired';
COMMENT ON COLUMN policies.category IS 'Categoria da pol�tica conforme taxonomia organizacional';
COMMENT ON COLUMN policies.version IS 'Vers�o da pol�tica no formato sem�ntico (ex: 1.0, 2.1.3)';
COMMENT ON COLUMN policies.tags IS 'Tags para facilitar busca e categoriza��o';
COMMENT ON COLUMN policies.compliance_frameworks IS 'Frameworks de compliance relacionados (ISO 27001, LGPD, etc.)';

-- Finaliza��o
SELECT 'M�dulo de Gest�o de Pol�ticas criado com sucesso!' as status;
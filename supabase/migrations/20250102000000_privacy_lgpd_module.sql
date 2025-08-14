-- ============================================================================
-- MIGRAÇÃO: MÓDULO DE PRIVACIDADE E LGPD
-- ============================================================================
-- Criação de tabelas e estrutura para o módulo completo de Privacidade e LGPD
-- Atende integralmente aos requisitos da Lei Geral de Proteção de Dados

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABELA: DATA_DISCOVERY_SOURCES
-- ============================================================================
-- Fontes de dados para discovery (sistemas, bancos de dados, aplicações)

CREATE TABLE IF NOT EXISTS data_discovery_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações da fonte
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(500) NOT NULL,
    
    -- Conexão
    connection_string TEXT,
    credentials_stored BOOLEAN DEFAULT false,
    last_scan_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    scan_frequency VARCHAR(30) DEFAULT 'monthly',
    
    -- Responsável
    data_steward_id UUID REFERENCES auth.users(id),
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_discovery_source_type CHECK (type IN (
        'database', 'file_system', 'cloud_storage', 'application', 
        'api', 'email_system', 'crm', 'erp', 'hr_system', 'other'
    )),
    CONSTRAINT valid_discovery_source_status CHECK (status IN ('active', 'inactive', 'error', 'scanning')),
    CONSTRAINT valid_scan_frequency CHECK (scan_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'manual'))
);

-- ============================================================================
-- 2. TABELA: DATA_DISCOVERY_RESULTS
-- ============================================================================
-- Resultados do discovery de dados pessoais

CREATE TABLE IF NOT EXISTS data_discovery_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES data_discovery_sources(id) ON DELETE CASCADE,
    
    -- Localização dos dados
    table_name VARCHAR(255),
    field_name VARCHAR(255),
    file_path TEXT,
    
    -- Classificação dos dados
    data_category VARCHAR(100) NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    sensitivity_level VARCHAR(20) NOT NULL,
    
    -- Análise
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    sample_data TEXT,
    estimated_records BIGINT DEFAULT 0,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'discovered',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Controle
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_data_category CHECK (data_category IN (
        'identificacao', 'contato', 'localizacao', 'financeiro', 'saude', 
        'biometrico', 'comportamental', 'profissional', 'educacional', 'outros'
    )),
    CONSTRAINT valid_data_type CHECK (data_type IN (
        'nome', 'cpf', 'rg', 'email', 'telefone', 'endereco', 'data_nascimento',
        'conta_bancaria', 'cartao_credito', 'biometria', 'fotografia', 'video',
        'historico_compras', 'preferencias', 'localizacao_gps', 'outros'
    )),
    CONSTRAINT valid_sensitivity_level CHECK (sensitivity_level IN ('baixa', 'media', 'alta', 'critica')),
    CONSTRAINT valid_discovery_status CHECK (status IN ('discovered', 'validated', 'classified', 'ignored')),
    CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00)
);

-- ============================================================================
-- 3. TABELA: DATA_INVENTORY
-- ============================================================================
-- Inventário completo de dados pessoais

CREATE TABLE IF NOT EXISTS data_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação do dado
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    data_types TEXT[] NOT NULL, -- Array de tipos de dados
    
    -- Localização
    system_name VARCHAR(255) NOT NULL,
    database_name VARCHAR(255),
    table_field_names TEXT[],
    file_locations TEXT[],
    
    -- Volume e retenção
    estimated_volume BIGINT DEFAULT 0,
    retention_period_months INTEGER,
    retention_justification TEXT,
    
    -- Classificação
    sensitivity_level VARCHAR(20) NOT NULL,
    data_origin VARCHAR(100) NOT NULL,
    
    -- Responsabilidade
    data_controller_id UUID NOT NULL REFERENCES auth.users(id),
    data_processor_id UUID REFERENCES auth.users(id),
    data_steward_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    last_reviewed_at TIMESTAMPTZ,
    next_review_date DATE,
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_inventory_sensitivity CHECK (sensitivity_level IN ('baixa', 'media', 'alta', 'critica')),
    CONSTRAINT valid_data_origin CHECK (data_origin IN (
        'coleta_direta', 'terceiros', 'fontes_publicas', 'cookies', 
        'sistemas_internos', 'parceiros', 'fornecedores', 'outros'
    )),
    CONSTRAINT valid_inventory_status CHECK (status IN ('active', 'archived', 'deleted', 'migrated')),
    CONSTRAINT positive_retention_period CHECK (retention_period_months > 0)
);

-- ============================================================================
-- 4. TABELA: LEGAL_BASES
-- ============================================================================
-- Bases legais para tratamento de dados pessoais

CREATE TABLE IF NOT EXISTS legal_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    legal_basis_type VARCHAR(50) NOT NULL,
    
    -- Detalhamento legal
    legal_article TEXT NOT NULL,
    justification TEXT NOT NULL,
    
    -- Aplicabilidade
    applies_to_categories TEXT[] NOT NULL, -- Categorias de dados que se aplicam
    applies_to_processing TEXT[] NOT NULL, -- Tipos de processamento
    
    -- Validade
    valid_from DATE NOT NULL,
    valid_until DATE,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    
    -- Responsável jurídico
    legal_responsible_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_legal_basis_type CHECK (legal_basis_type IN (
        'consentimento', 'contrato', 'obrigacao_legal', 'protecao_vida',
        'interesse_publico', 'interesse_legitimo', 'exercicio_direitos'
    )),
    CONSTRAINT valid_legal_basis_status CHECK (status IN ('active', 'suspended', 'expired', 'revoked'))
);

-- ============================================================================
-- 5. TABELA: CONSENTS
-- ============================================================================
-- Gestão de consentimentos de titulares de dados

CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Titular dos dados
    data_subject_email VARCHAR(255) NOT NULL,
    data_subject_name VARCHAR(255),
    data_subject_document VARCHAR(20), -- CPF ou outro documento
    
    -- Consentimento
    purpose TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    legal_basis_id UUID REFERENCES legal_bases(id),
    
    -- Status do consentimento
    status VARCHAR(30) NOT NULL DEFAULT 'granted',
    granted_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    
    -- Método de coleta
    collection_method VARCHAR(50) NOT NULL,
    collection_source VARCHAR(255),
    evidence_url TEXT,
    
    -- Características do consentimento LGPD
    is_informed BOOLEAN NOT NULL DEFAULT true,
    is_specific BOOLEAN NOT NULL DEFAULT true,
    is_free BOOLEAN NOT NULL DEFAULT true,
    is_unambiguous BOOLEAN NOT NULL DEFAULT true,
    
    -- Comunicação
    privacy_policy_version VARCHAR(20),
    terms_of_service_version VARCHAR(20),
    language VARCHAR(10) DEFAULT 'pt-BR',
    
    -- Controle de auditoria
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_consent_status CHECK (status IN ('granted', 'revoked', 'expired', 'pending')),
    CONSTRAINT valid_collection_method CHECK (collection_method IN (
        'website_form', 'mobile_app', 'phone_call', 'email', 'physical_form', 
        'api', 'import', 'other'
    )),
    CONSTRAINT consent_logic_check CHECK (
        (status = 'revoked' AND revoked_at IS NOT NULL) OR
        (status != 'revoked' AND revoked_at IS NULL)
    )
);

-- ============================================================================
-- 6. TABELA: PROCESSING_ACTIVITIES (RAT)
-- ============================================================================
-- Registro de Atividades de Tratamento conforme Art. 37 da LGPD

CREATE TABLE IF NOT EXISTS processing_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação da atividade
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    purpose TEXT NOT NULL,
    
    -- Dados tratados
    data_categories TEXT[] NOT NULL,
    data_types TEXT[] NOT NULL,
    data_subjects_categories TEXT[] NOT NULL, -- ex: funcionários, clientes, fornecedores
    
    -- Base legal
    legal_basis_id UUID NOT NULL REFERENCES legal_bases(id),
    legal_basis_justification TEXT NOT NULL,
    
    -- Agentes de tratamento
    data_controller_name VARCHAR(255) NOT NULL,
    data_controller_contact TEXT NOT NULL,
    data_processor_name VARCHAR(255),
    data_processor_contact TEXT,
    
    -- Compartilhamento
    data_sharing_third_parties TEXT[],
    international_transfer BOOLEAN DEFAULT false,
    international_transfer_countries TEXT[],
    international_transfer_safeguards TEXT,
    
    -- Retenção
    retention_period_months INTEGER NOT NULL,
    retention_criteria TEXT NOT NULL,
    deletion_procedure TEXT,
    
    -- Medidas de segurança
    security_measures TEXT[] NOT NULL,
    technical_measures TEXT,
    organizational_measures TEXT,
    
    -- Gestão
    data_protection_officer_id UUID REFERENCES auth.users(id),
    responsible_area VARCHAR(255) NOT NULL,
    responsible_person_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Status e revisões
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    last_reviewed_at TIMESTAMPTZ,
    next_review_date DATE NOT NULL,
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_processing_status CHECK (status IN ('active', 'suspended', 'terminated', 'under_review')),
    CONSTRAINT positive_retention_months CHECK (retention_period_months > 0),
    CONSTRAINT future_review_date CHECK (next_review_date >= CURRENT_DATE)
);

-- ============================================================================
-- 7. TABELA: DPIA_ASSESSMENTS
-- ============================================================================
-- Data Protection Impact Assessment (DPIA/AIPD)

CREATE TABLE IF NOT EXISTS dpia_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    processing_activity_id UUID REFERENCES processing_activities(id),
    
    -- Triggers para DPIA (Art. 38 LGPD)
    involves_high_risk BOOLEAN NOT NULL DEFAULT false,
    involves_sensitive_data BOOLEAN NOT NULL DEFAULT false,
    involves_large_scale BOOLEAN NOT NULL DEFAULT false,
    involves_profiling BOOLEAN NOT NULL DEFAULT false,
    involves_automated_decisions BOOLEAN NOT NULL DEFAULT false,
    involves_vulnerable_individuals BOOLEAN NOT NULL DEFAULT false,
    involves_new_technology BOOLEAN NOT NULL DEFAULT false,
    
    -- Avaliação de necessidade
    dpia_required BOOLEAN NOT NULL DEFAULT false,
    dpia_justification TEXT NOT NULL,
    
    -- Avaliação de risco
    privacy_risks TEXT[],
    risk_level VARCHAR(20) DEFAULT 'medium',
    likelihood_assessment INTEGER, -- 1-5
    impact_assessment INTEGER, -- 1-5
    
    -- Medidas mitigadoras
    mitigation_measures TEXT[],
    residual_risk_level VARCHAR(20),
    
    -- Consulta à ANPD
    anpd_consultation_required BOOLEAN DEFAULT false,
    anpd_consultation_date DATE,
    anpd_response_date DATE,
    anpd_recommendation TEXT,
    
    -- Responsáveis
    conducted_by UUID NOT NULL REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    dpo_id UUID REFERENCES auth.users(id),
    
    -- Status e datas
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dpia_status CHECK (status IN (
        'draft', 'in_progress', 'pending_review', 'pending_approval', 
        'approved', 'rejected', 'requires_anpd_consultation'
    )),
    CONSTRAINT valid_risk_level CHECK (risk_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    CONSTRAINT valid_assessments CHECK (
        likelihood_assessment >= 1 AND likelihood_assessment <= 5 AND
        impact_assessment >= 1 AND impact_assessment <= 5
    )
);

-- ============================================================================
-- 8. TABELA: DATA_SUBJECT_REQUESTS
-- ============================================================================
-- Solicitações de titulares de dados

CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação do titular
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_document VARCHAR(20),
    requester_phone VARCHAR(20),
    
    -- Tipo de solicitação (Art. 18 LGPD)
    request_type VARCHAR(50) NOT NULL,
    request_description TEXT,
    
    -- Dados específicos da solicitação
    specific_data_requested TEXT,
    data_categories TEXT[],
    
    -- Verificação de identidade
    identity_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(50),
    verification_documents TEXT[],
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    
    -- Processamento
    status VARCHAR(30) NOT NULL DEFAULT 'received',
    assigned_to UUID REFERENCES auth.users(id),
    due_date DATE NOT NULL, -- 15 dias conforme LGPD
    
    -- Resposta
    response TEXT,
    response_method VARCHAR(30),
    response_attachments TEXT[],
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES auth.users(id),
    
    -- Tracking
    internal_notes TEXT,
    escalated BOOLEAN DEFAULT false,
    escalated_to UUID REFERENCES auth.users(id),
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    
    -- Controle de auditoria
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_request_type CHECK (request_type IN (
        'acesso', 'correcao', 'anonimizacao', 'bloqueio', 'eliminacao',
        'portabilidade', 'informacao_uso_compartilhamento', 'revogacao_consentimento',
        'oposicao', 'revisao_decisoes_automatizadas'
    )),
    CONSTRAINT valid_request_status CHECK (status IN (
        'received', 'under_verification', 'verified', 'in_progress', 
        'completed', 'rejected', 'partially_completed', 'escalated'
    )),
    CONSTRAINT valid_verification_method CHECK (verification_method IN (
        'document_upload', 'email_confirmation', 'phone_verification', 
        'video_call', 'in_person', 'digital_certificate'
    )),
    CONSTRAINT valid_response_method CHECK (response_method IN (
        'email', 'portal', 'phone', 'mail', 'in_person'
    )),
    CONSTRAINT future_due_date CHECK (due_date >= CURRENT_DATE)
);

-- ============================================================================
-- 9. TABELA: PRIVACY_INCIDENTS
-- ============================================================================
-- Incidentes de privacidade e violações de dados pessoais

CREATE TABLE IF NOT EXISTS privacy_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    
    -- Classificação
    severity_level VARCHAR(20) NOT NULL,
    affected_data_categories TEXT[] NOT NULL,
    estimated_affected_individuals INTEGER DEFAULT 0,
    
    -- Descoberta e timeline
    discovered_at TIMESTAMPTZ NOT NULL,
    discovered_by UUID REFERENCES auth.users(id),
    occurred_at TIMESTAMPTZ,
    contained_at TIMESTAMPTZ,
    
    -- Causa e origem
    root_cause TEXT,
    incident_source VARCHAR(100),
    
    -- Impacto
    impact_description TEXT,
    financial_impact DECIMAL(12,2),
    reputational_impact VARCHAR(20),
    regulatory_impact_risk VARCHAR(20),
    
    -- Resposta ao incidente
    containment_measures TEXT[],
    investigation_findings TEXT,
    corrective_actions TEXT[],
    
    -- Comunicações
    internal_notification_sent BOOLEAN DEFAULT false,
    internal_notified_at TIMESTAMPTZ,
    
    -- Notificação ANPD (Art. 48 LGPD)
    anpd_notification_required BOOLEAN DEFAULT false,
    anpd_notified BOOLEAN DEFAULT false,
    anpd_notification_date TIMESTAMPTZ,
    anpd_response_received BOOLEAN DEFAULT false,
    anpd_response_date TIMESTAMPTZ,
    anpd_reference_number VARCHAR(50),
    
    -- Comunicação aos titulares
    data_subjects_notification_required BOOLEAN DEFAULT false,
    data_subjects_notified BOOLEAN DEFAULT false,
    data_subjects_notification_date TIMESTAMPTZ,
    notification_method VARCHAR(50),
    
    -- Responsáveis
    incident_manager_id UUID NOT NULL REFERENCES auth.users(id),
    dpo_id UUID REFERENCES auth.users(id),
    legal_team_notified BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    closed_at TIMESTAMPTZ,
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_incident_type CHECK (incident_type IN (
        'data_breach', 'unauthorized_access', 'data_loss', 'data_theft',
        'system_compromise', 'human_error', 'malware', 'phishing',
        'insider_threat', 'third_party_breach', 'other'
    )),
    CONSTRAINT valid_incident_severity CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_incident_status CHECK (status IN (
        'open', 'investigating', 'contained', 'resolved', 'closed'
    )),
    CONSTRAINT positive_affected_individuals CHECK (estimated_affected_individuals >= 0),
    CONSTRAINT logical_timeline CHECK (occurred_at <= discovered_at)
);

-- ============================================================================
-- 10. TABELA: ANPD_COMMUNICATIONS
-- ============================================================================
-- Registro de comunicações com a ANPD

CREATE TABLE IF NOT EXISTS anpd_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referência
    communication_type VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    
    -- Relacionamentos
    privacy_incident_id UUID REFERENCES privacy_incidents(id),
    dpia_assessment_id UUID REFERENCES dpia_assessments(id),
    
    -- Comunicação
    communication_date TIMESTAMPTZ NOT NULL,
    method VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[],
    
    -- Resposta
    response_required BOOLEAN DEFAULT true,
    response_deadline DATE,
    response_received BOOLEAN DEFAULT false,
    response_date TIMESTAMPTZ,
    response_content TEXT,
    response_attachments TEXT[],
    
    -- Ações resultantes
    actions_required TEXT[],
    compliance_status VARCHAR(30) DEFAULT 'pending',
    
    -- Responsáveis
    sent_by UUID NOT NULL REFERENCES auth.users(id),
    dpo_id UUID REFERENCES auth.users(id),
    legal_responsible_id UUID REFERENCES auth.users(id),
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_communication_type CHECK (communication_type IN (
        'incident_notification', 'dpia_consultation', 'formal_inquiry', 
        'compliance_report', 'request_response', 'voluntary_communication'
    )),
    CONSTRAINT valid_method CHECK (method IN (
        'online_platform', 'email', 'physical_mail', 'phone', 'in_person'
    )),
    CONSTRAINT valid_compliance_status CHECK (compliance_status IN (
        'pending', 'compliant', 'non_compliant', 'partially_compliant', 'under_review'
    ))
);

-- ============================================================================
-- 11. TABELA: PRIVACY_TRAINING
-- ============================================================================
-- Treinamentos em privacidade e LGPD

CREATE TABLE IF NOT EXISTS privacy_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações do treinamento
    title VARCHAR(255) NOT NULL,
    description TEXT,
    training_type VARCHAR(50) NOT NULL,
    target_audience TEXT[] NOT NULL,
    
    -- Conteúdo
    content_topics TEXT[] NOT NULL,
    training_materials TEXT[],
    duration_hours DECIMAL(4,2) NOT NULL,
    
    -- Participante
    participant_id UUID NOT NULL REFERENCES auth.users(id),
    instructor_id UUID REFERENCES auth.users(id),
    
    -- Execução
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    completion_method VARCHAR(30),
    
    -- Avaliação
    assessment_score INTEGER,
    certification_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    certificate_valid_until DATE,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_training_type CHECK (training_type IN (
        'lgpd_awareness', 'dpo_certification', 'technical_privacy', 
        'incident_response', 'data_governance', 'privacy_by_design'
    )),
    CONSTRAINT valid_training_status CHECK (status IN (
        'scheduled', 'in_progress', 'completed', 'cancelled', 'expired'
    )),
    CONSTRAINT valid_completion_method CHECK (completion_method IN (
        'online', 'classroom', 'workshop', 'self_paced', 'video_conference'
    )),
    CONSTRAINT valid_assessment_score CHECK (assessment_score >= 0 AND assessment_score <= 100),
    CONSTRAINT positive_duration CHECK (duration_hours > 0)
);

-- ============================================================================
-- 12. TABELA: PRIVACY_AUDITS
-- ============================================================================
-- Auditorias de privacidade e compliance LGPD

CREATE TABLE IF NOT EXISTS privacy_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações da auditoria
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audit_type VARCHAR(50) NOT NULL,
    scope TEXT NOT NULL,
    
    -- Planejamento
    planned_start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Equipe de auditoria
    lead_auditor_id UUID NOT NULL REFERENCES auth.users(id),
    audit_team_ids UUID[],
    auditee_area VARCHAR(255) NOT NULL,
    auditee_responsible_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Metodologia
    audit_framework VARCHAR(100),
    audit_criteria TEXT[],
    audit_procedures TEXT[],
    
    -- Resultados
    findings TEXT[],
    non_conformities TEXT[],
    opportunities_improvement TEXT[],
    overall_rating VARCHAR(20),
    
    -- Ações corretivas
    corrective_actions TEXT[],
    action_plan_due_date DATE,
    follow_up_required BOOLEAN DEFAULT true,
    follow_up_date DATE,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
    
    -- Documentos
    audit_report_url TEXT,
    evidence_documents TEXT[],
    
    -- Controle de auditoria
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_audit_type CHECK (audit_type IN (
        'compliance_audit', 'internal_audit', 'third_party_audit', 
        'certification_audit', 'follow_up_audit'
    )),
    CONSTRAINT valid_audit_status CHECK (status IN (
        'planned', 'in_progress', 'draft_report', 'completed', 'cancelled'
    )),
    CONSTRAINT valid_overall_rating CHECK (overall_rating IN (
        'excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'
    )),
    CONSTRAINT logical_dates CHECK (planned_end_date >= planned_start_date)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Data Discovery
CREATE INDEX IF NOT EXISTS idx_discovery_sources_type ON data_discovery_sources(type);
CREATE INDEX IF NOT EXISTS idx_discovery_sources_status ON data_discovery_sources(status);
CREATE INDEX IF NOT EXISTS idx_discovery_results_source ON data_discovery_results(source_id);
CREATE INDEX IF NOT EXISTS idx_discovery_results_category ON data_discovery_results(data_category);
CREATE INDEX IF NOT EXISTS idx_discovery_results_sensitivity ON data_discovery_results(sensitivity_level);

-- Data Inventory
CREATE INDEX IF NOT EXISTS idx_data_inventory_category ON data_inventory(data_category);
CREATE INDEX IF NOT EXISTS idx_data_inventory_sensitivity ON data_inventory(sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_data_inventory_controller ON data_inventory(data_controller_id);
CREATE INDEX IF NOT EXISTS idx_data_inventory_steward ON data_inventory(data_steward_id);
CREATE INDEX IF NOT EXISTS idx_data_inventory_review_date ON data_inventory(next_review_date);

-- Bases Legais
CREATE INDEX IF NOT EXISTS idx_legal_bases_type ON legal_bases(legal_basis_type);
CREATE INDEX IF NOT EXISTS idx_legal_bases_status ON legal_bases(status);
CREATE INDEX IF NOT EXISTS idx_legal_bases_valid_dates ON legal_bases(valid_from, valid_until);

-- Consentimentos
CREATE INDEX IF NOT EXISTS idx_consents_email ON consents(data_subject_email);
CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(status);
CREATE INDEX IF NOT EXISTS idx_consents_granted_date ON consents(granted_at);
CREATE INDEX IF NOT EXISTS idx_consents_legal_basis ON consents(legal_basis_id);

-- RAT
CREATE INDEX IF NOT EXISTS idx_processing_activities_status ON processing_activities(status);
CREATE INDEX IF NOT EXISTS idx_processing_activities_legal_basis ON processing_activities(legal_basis_id);
CREATE INDEX IF NOT EXISTS idx_processing_activities_responsible ON processing_activities(responsible_person_id);
CREATE INDEX IF NOT EXISTS idx_processing_activities_review_date ON processing_activities(next_review_date);

-- DPIA
CREATE INDEX IF NOT EXISTS idx_dpia_status ON dpia_assessments(status);
CREATE INDEX IF NOT EXISTS idx_dpia_risk_level ON dpia_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_dpia_conducted_by ON dpia_assessments(conducted_by);
CREATE INDEX IF NOT EXISTS idx_dpia_processing_activity ON dpia_assessments(processing_activity_id);

-- Solicitações de Titulares
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_email ON data_subject_requests(requester_email);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_due_date ON data_subject_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_assigned ON data_subject_requests(assigned_to);

-- Incidentes de Privacidade
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_severity ON privacy_incidents(severity_level);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_type ON privacy_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_status ON privacy_incidents(status);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_discovered ON privacy_incidents(discovered_at);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_manager ON privacy_incidents(incident_manager_id);

-- Comunicações ANPD
CREATE INDEX IF NOT EXISTS idx_anpd_communications_type ON anpd_communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_anpd_communications_date ON anpd_communications(communication_date);
CREATE INDEX IF NOT EXISTS idx_anpd_communications_incident ON anpd_communications(privacy_incident_id);

-- Treinamentos
CREATE INDEX IF NOT EXISTS idx_privacy_training_participant ON privacy_training(participant_id);
CREATE INDEX IF NOT EXISTS idx_privacy_training_type ON privacy_training(training_type);
CREATE INDEX IF NOT EXISTS idx_privacy_training_status ON privacy_training(status);

-- Auditorias
CREATE INDEX IF NOT EXISTS idx_privacy_audits_type ON privacy_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_privacy_audits_status ON privacy_audits(status);
CREATE INDEX IF NOT EXISTS idx_privacy_audits_lead_auditor ON privacy_audits(lead_auditor_id);
CREATE INDEX IF NOT EXISTS idx_privacy_audits_dates ON privacy_audits(planned_start_date, planned_end_date);

-- ============================================================================
-- TRIGGERS PARA AUDITORIA
-- ============================================================================

-- Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers nas tabelas principais

-- Data Discovery Sources
DROP TRIGGER IF EXISTS update_data_discovery_sources_updated_at ON data_discovery_sources;
CREATE TRIGGER update_data_discovery_sources_updated_at
    BEFORE UPDATE ON data_discovery_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data Inventory
DROP TRIGGER IF EXISTS update_data_inventory_updated_at ON data_inventory;
CREATE TRIGGER update_data_inventory_updated_at
    BEFORE UPDATE ON data_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Legal Bases
DROP TRIGGER IF EXISTS update_legal_bases_updated_at ON legal_bases;
CREATE TRIGGER update_legal_bases_updated_at
    BEFORE UPDATE ON legal_bases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Consents
DROP TRIGGER IF EXISTS update_consents_updated_at ON consents;
CREATE TRIGGER update_consents_updated_at
    BEFORE UPDATE ON consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Processing Activities
DROP TRIGGER IF EXISTS update_processing_activities_updated_at ON processing_activities;
CREATE TRIGGER update_processing_activities_updated_at
    BEFORE UPDATE ON processing_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DPIA Assessments
DROP TRIGGER IF EXISTS update_dpia_assessments_updated_at ON dpia_assessments;
CREATE TRIGGER update_dpia_assessments_updated_at
    BEFORE UPDATE ON dpia_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data Subject Requests
DROP TRIGGER IF EXISTS update_data_subject_requests_updated_at ON data_subject_requests;
CREATE TRIGGER update_data_subject_requests_updated_at
    BEFORE UPDATE ON data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Privacy Incidents
DROP TRIGGER IF EXISTS update_privacy_incidents_updated_at ON privacy_incidents;
CREATE TRIGGER update_privacy_incidents_updated_at
    BEFORE UPDATE ON privacy_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGERS AUTOMÁTICOS PARA REGRAS DE NEGÓCIO
-- ============================================================================

-- Trigger para calcular automaticamente o due_date das solicitações de titulares (15 dias)
CREATE OR REPLACE FUNCTION set_data_subject_request_due_date()
RETURNS TRIGGER AS $$
BEGIN
    -- LGPD Art. 19: 15 dias para responder
    NEW.due_date = (NEW.received_at::date + INTERVAL '15 days')::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_due_date_trigger ON data_subject_requests;
CREATE TRIGGER set_due_date_trigger
    BEFORE INSERT ON data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION set_data_subject_request_due_date();

-- Trigger para definir automaticamente se DPIA é obrigatória
CREATE OR REPLACE FUNCTION evaluate_dpia_requirement()
RETURNS TRIGGER AS $$
BEGIN
    -- DPIA é obrigatória se pelo menos um dos critérios for verdadeiro
    NEW.dpia_required = (
        NEW.involves_high_risk OR 
        NEW.involves_sensitive_data OR 
        NEW.involves_large_scale OR 
        NEW.involves_profiling OR 
        NEW.involves_automated_decisions OR 
        NEW.involves_vulnerable_individuals OR 
        NEW.involves_new_technology
    );
    
    -- Se DPIA é obrigatória, status deve ser apropriado
    IF NEW.dpia_required AND NEW.status = 'draft' THEN
        NEW.status = 'in_progress';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS evaluate_dpia_trigger ON dpia_assessments;
CREATE TRIGGER evaluate_dpia_trigger
    BEFORE INSERT OR UPDATE ON dpia_assessments
    FOR EACH ROW EXECUTE FUNCTION evaluate_dpia_requirement();

-- Trigger para log de atividades críticas
CREATE OR REPLACE FUNCTION log_privacy_activities()
RETURNS TRIGGER AS $$
BEGIN
    -- Log apenas para operações críticas
    IF TG_TABLE_NAME = 'privacy_incidents' THEN
        INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details)
        VALUES (
            COALESCE(NEW.updated_by, NEW.created_by),
            TG_OP,
            'privacy_incident',
            NEW.id,
            json_build_object(
                'title', NEW.title,
                'severity', NEW.severity_level,
                'status', NEW.status
            )
        );
    ELSIF TG_TABLE_NAME = 'data_subject_requests' THEN
        INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details)
        VALUES (
            COALESCE(NEW.updated_by, NEW.created_by),
            TG_OP,
            'data_subject_request',
            NEW.id,
            json_build_object(
                'request_type', NEW.request_type,
                'status', NEW.status,
                'requester_email', NEW.requester_email
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_privacy_incidents_trigger ON privacy_incidents;
CREATE TRIGGER log_privacy_incidents_trigger
    AFTER INSERT OR UPDATE ON privacy_incidents
    FOR EACH ROW EXECUTE FUNCTION log_privacy_activities();

DROP TRIGGER IF EXISTS log_data_subject_requests_trigger ON data_subject_requests;
CREATE TRIGGER log_data_subject_requests_trigger
    AFTER INSERT OR UPDATE ON data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION log_privacy_activities();

-- ============================================================================
-- FUNÇÕES AUXILIARES E RPC
-- ============================================================================

-- Função para calcular métricas de privacidade
CREATE OR REPLACE FUNCTION calculate_privacy_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'data_inventory', json_build_object(
            'total_inventories', (SELECT COUNT(*) FROM data_inventory),
            'by_sensitivity', (
                SELECT json_object_agg(sensitivity_level, count)
                FROM (
                    SELECT sensitivity_level, COUNT(*) as count
                    FROM data_inventory
                    WHERE status = 'active'
                    GROUP BY sensitivity_level
                ) sensitivity_counts
            ),
            'needs_review', (
                SELECT COUNT(*) FROM data_inventory
                WHERE next_review_date <= CURRENT_DATE + INTERVAL '30 days'
                AND status = 'active'
            )
        ),
        'consents', json_build_object(
            'total_active', (SELECT COUNT(*) FROM consents WHERE status = 'granted'),
            'total_revoked', (SELECT COUNT(*) FROM consents WHERE status = 'revoked'),
            'expiring_soon', (
                SELECT COUNT(*) FROM consents
                WHERE expired_at IS NOT NULL
                AND expired_at <= CURRENT_DATE + INTERVAL '30 days'
                AND status = 'granted'
            )
        ),
        'data_subject_requests', json_build_object(
            'total_requests', (SELECT COUNT(*) FROM data_subject_requests),
            'pending_requests', (
                SELECT COUNT(*) FROM data_subject_requests
                WHERE status IN ('received', 'under_verification', 'verified', 'in_progress')
            ),
            'overdue_requests', (
                SELECT COUNT(*) FROM data_subject_requests
                WHERE due_date < CURRENT_DATE
                AND status NOT IN ('completed', 'rejected')
            ),
            'by_type', (
                SELECT json_object_agg(request_type, count)
                FROM (
                    SELECT request_type, COUNT(*) as count
                    FROM data_subject_requests
                    GROUP BY request_type
                ) request_type_counts
            )
        ),
        'privacy_incidents', json_build_object(
            'total_incidents', (SELECT COUNT(*) FROM privacy_incidents),
            'open_incidents', (
                SELECT COUNT(*) FROM privacy_incidents
                WHERE status IN ('open', 'investigating', 'contained')
            ),
            'anpd_notifications_required', (
                SELECT COUNT(*) FROM privacy_incidents
                WHERE anpd_notification_required = true
                AND anpd_notified = false
            ),
            'by_severity', (
                SELECT json_object_agg(severity_level, count)
                FROM (
                    SELECT severity_level, COUNT(*) as count
                    FROM privacy_incidents
                    GROUP BY severity_level
                ) severity_counts
            )
        ),
        'dpia_assessments', json_build_object(
            'total_dpias', (SELECT COUNT(*) FROM dpia_assessments),
            'pending_dpias', (
                SELECT COUNT(*) FROM dpia_assessments
                WHERE status IN ('draft', 'in_progress', 'pending_review')
            ),
            'high_risk_dpias', (
                SELECT COUNT(*) FROM dpia_assessments
                WHERE risk_level IN ('high', 'very_high')
            )
        ),
        'compliance_overview', json_build_object(
            'processing_activities', (SELECT COUNT(*) FROM processing_activities WHERE status = 'active'),
            'legal_bases', (SELECT COUNT(*) FROM legal_bases WHERE status = 'active'),
            'training_completion_rate', (
                CASE 
                    WHEN (SELECT COUNT(*) FROM privacy_training) = 0 THEN 0
                    ELSE ROUND(
                        (SELECT COUNT(*)::numeric FROM privacy_training WHERE status = 'completed') * 100.0 / 
                        (SELECT COUNT(*) FROM privacy_training), 2
                    )
                END
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para obter dashboard de privacidade
CREATE OR REPLACE FUNCTION get_privacy_dashboard()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'metrics', calculate_privacy_metrics(),
        'recent_incidents', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'severity_level', severity_level,
                    'status', status,
                    'discovered_at', discovered_at
                )
            )
            FROM (
                SELECT id, title, severity_level, status, discovered_at
                FROM privacy_incidents
                ORDER BY discovered_at DESC
                LIMIT 5
            ) recent_incidents_data
        ),
        'urgent_requests', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'requester_name', requester_name,
                    'request_type', request_type,
                    'status', status,
                    'due_date', due_date,
                    'days_until_due', (due_date - CURRENT_DATE)::integer
                )
            )
            FROM (
                SELECT id, requester_name, request_type, status, due_date
                FROM data_subject_requests
                WHERE due_date <= CURRENT_DATE + INTERVAL '7 days'
                AND status NOT IN ('completed', 'rejected')
                ORDER BY due_date ASC
                LIMIT 10
            ) urgent_requests_data
        ),
        'expiring_consents', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'data_subject_email', data_subject_email,
                    'purpose', purpose,
                    'expired_at', expired_at,
                    'days_until_expiry', (expired_at::date - CURRENT_DATE)::integer
                )
            )
            FROM (
                SELECT id, data_subject_email, purpose, expired_at
                FROM consents
                WHERE expired_at IS NOT NULL
                AND expired_at::date <= CURRENT_DATE + INTERVAL '30 days'
                AND status = 'granted'
                ORDER BY expired_at ASC
                LIMIT 10
            ) expiring_consents_data
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar compliance LGPD
CREATE OR REPLACE FUNCTION check_lgpd_compliance()
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_checks INTEGER := 0;
    passed_checks INTEGER := 0;
BEGIN
    -- Verificações de compliance
    
    -- 1. Todas as atividades de tratamento têm base legal?
    total_checks := total_checks + 1;
    IF (SELECT COUNT(*) FROM processing_activities WHERE legal_basis_id IS NULL AND status = 'active') = 0 THEN
        passed_checks := passed_checks + 1;
    END IF;
    
    -- 2. DPIAs foram realizadas onde necessário?
    total_checks := total_checks + 1;
    IF (SELECT COUNT(*) FROM processing_activities pa 
        WHERE NOT EXISTS (SELECT 1 FROM dpia_assessments da WHERE da.processing_activity_id = pa.id)
        AND pa.status = 'active') = 0 THEN
        passed_checks := passed_checks + 1;
    END IF;
    
    -- 3. Solicitações de titulares são atendidas no prazo?
    total_checks := total_checks + 1;
    IF (SELECT COUNT(*) FROM data_subject_requests 
        WHERE due_date < CURRENT_DATE 
        AND status NOT IN ('completed', 'rejected')) = 0 THEN
        passed_checks := passed_checks + 1;
    END IF;
    
    -- 4. Incidentes graves foram notificados à ANPD?
    total_checks := total_checks + 1;
    IF (SELECT COUNT(*) FROM privacy_incidents 
        WHERE anpd_notification_required = true 
        AND anpd_notified = false
        AND severity_level IN ('high', 'critical')) = 0 THEN
        passed_checks := passed_checks + 1;
    END IF;
    
    -- 5. Inventário de dados está atualizado?
    total_checks := total_checks + 1;
    IF (SELECT COUNT(*) FROM data_inventory 
        WHERE next_review_date < CURRENT_DATE 
        AND status = 'active') = 0 THEN
        passed_checks := passed_checks + 1;
    END IF;
    
    SELECT json_build_object(
        'compliance_score', ROUND((passed_checks::numeric / total_checks) * 100, 2),
        'total_checks', total_checks,
        'passed_checks', passed_checks,
        'failed_checks', (total_checks - passed_checks),
        'compliance_level', 
            CASE 
                WHEN passed_checks::numeric / total_checks >= 0.9 THEN 'Excelente'
                WHEN passed_checks::numeric / total_checks >= 0.8 THEN 'Bom'
                WHEN passed_checks::numeric / total_checks >= 0.7 THEN 'Satisfatório'
                WHEN passed_checks::numeric / total_checks >= 0.6 THEN 'Precisa Melhorar'
                ELSE 'Crítico'
            END,
        'recommendations', ARRAY[
            CASE WHEN (SELECT COUNT(*) FROM processing_activities WHERE legal_basis_id IS NULL AND status = 'active') > 0
                THEN 'Definir base legal para todas as atividades de tratamento'
                ELSE NULL END,
            CASE WHEN (SELECT COUNT(*) FROM data_subject_requests WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'rejected')) > 0
                THEN 'Atender solicitações de titulares em atraso'
                ELSE NULL END,
            CASE WHEN (SELECT COUNT(*) FROM privacy_incidents WHERE anpd_notification_required = true AND anpd_notified = false AND severity_level IN ('high', 'critical')) > 0
                THEN 'Notificar ANPD sobre incidentes críticos'
                ELSE NULL END
        ]
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE data_discovery_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpia_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE anpd_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_audits ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: usuários autenticados podem visualizar dados gerais
CREATE POLICY "Users can view data inventory" ON data_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view legal bases" ON legal_bases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view processing activities" ON processing_activities FOR SELECT TO authenticated USING (true);

-- Políticas restritivas: apenas responsáveis podem editar dados sensíveis
CREATE POLICY "Data stewards can edit inventory" ON data_inventory FOR UPDATE TO authenticated 
USING (data_steward_id = auth.uid() OR data_controller_id = auth.uid());

CREATE POLICY "Legal team can manage legal bases" ON legal_bases FOR ALL TO authenticated 
USING (legal_responsible_id = auth.uid());

CREATE POLICY "Users can view their own requests" ON data_subject_requests FOR SELECT TO authenticated 
USING (created_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Privacy officers can manage incidents" ON privacy_incidents FOR ALL TO authenticated 
USING (incident_manager_id = auth.uid() OR dpo_id = auth.uid());

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE data_discovery_sources IS 'Fontes de dados para descoberta automática de dados pessoais';
COMMENT ON TABLE data_discovery_results IS 'Resultados do processo de descoberta de dados pessoais';
COMMENT ON TABLE data_inventory IS 'Inventário completo de dados pessoais conforme Art. 37 LGPD';
COMMENT ON TABLE legal_bases IS 'Bases legais para tratamento de dados pessoais conforme Art. 7 e 11 LGPD';
COMMENT ON TABLE consents IS 'Gestão de consentimentos dos titulares conforme Art. 8 LGPD';
COMMENT ON TABLE processing_activities IS 'Registro de Atividades de Tratamento (RAT) conforme Art. 37 LGPD';
COMMENT ON TABLE dpia_assessments IS 'Relatórios de Impacto à Proteção de Dados conforme Art. 38 LGPD';
COMMENT ON TABLE data_subject_requests IS 'Solicitações de titulares de dados conforme Art. 18 LGPD';
COMMENT ON TABLE privacy_incidents IS 'Incidentes de privacidade e violações de dados pessoais';
COMMENT ON TABLE anpd_communications IS 'Comunicações oficiais com a Autoridade Nacional de Proteção de Dados';
COMMENT ON TABLE privacy_training IS 'Registro de treinamentos em privacidade e LGPD';
COMMENT ON TABLE privacy_audits IS 'Auditorias de compliance de privacidade e LGPD';

COMMENT ON COLUMN consents.is_informed IS 'Consentimento informado - titular ciente do tratamento';
COMMENT ON COLUMN consents.is_specific IS 'Consentimento específico - finalidade clara e determinada';
COMMENT ON COLUMN consents.is_free IS 'Consentimento livre - sem vício de vontade';
COMMENT ON COLUMN consents.is_unambiguous IS 'Consentimento inequívoco - manifestação clara';

COMMENT ON COLUMN data_subject_requests.request_type IS 'Tipos: acesso, correção, anonimização, bloqueio, eliminação, portabilidade, etc.';
COMMENT ON COLUMN data_subject_requests.due_date IS 'Prazo de 15 dias conforme Art. 19 LGPD';

COMMENT ON COLUMN privacy_incidents.anpd_notification_required IS 'Notificação obrigatória à ANPD conforme Art. 48 LGPD';
COMMENT ON COLUMN privacy_incidents.data_subjects_notification_required IS 'Comunicação aos titulares quando há risco ou dano relevante';

-- Finalização
SELECT 'Módulo de Privacidade e LGPD criado com sucesso!' as status,
       'Todas as funcionalidades LGPD implementadas conforme legislação brasileira' as description;
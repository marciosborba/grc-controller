-- =============================================================================
-- MIGRAÇÃO COMPLETA DO MÓDULO DE ÉTICA E CANAL DE DENÚNCIAS
-- =============================================================================
-- Esta migração cria um sistema robusto de canal de denúncias éticas
-- compatível com melhores práticas de compliance corporativo

-- Primeiro, vamos corrigir a tabela existente ethics_reports adicionando tenant_id
-- e campos essenciais que estão faltando

-- 1. Adicionar tenant_id e outros campos essenciais à tabela existente
ALTER TABLE ethics_reports 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS protocol_number VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web',
ADD COLUMN IF NOT EXISTS reporter_type VARCHAR(20) DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS investigation_summary TEXT,
ADD COLUMN IF NOT EXISTS evidence_files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sla_breach BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS closure_reason VARCHAR(100),
ADD COLUMN IF NOT EXISTS satisfied_resolution BOOLEAN,
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ethics_reports_tenant_id ON ethics_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ethics_reports_protocol ON ethics_reports(protocol_number);
CREATE INDEX IF NOT EXISTS idx_ethics_reports_status ON ethics_reports(status);
CREATE INDEX IF NOT EXISTS idx_ethics_reports_category ON ethics_reports(category);
CREATE INDEX IF NOT EXISTS idx_ethics_reports_severity ON ethics_reports(severity);
CREATE INDEX IF NOT EXISTS idx_ethics_reports_created_at ON ethics_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_ethics_reports_due_date ON ethics_reports(due_date);

-- 2. Criar tabela de categorias de ética (configurável por tenant)
CREATE TABLE IF NOT EXISTS ethics_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6b7280',
    icon VARCHAR(50) DEFAULT 'AlertTriangle',
    is_active BOOLEAN DEFAULT TRUE,
    default_severity VARCHAR(20) DEFAULT 'medium',
    default_priority VARCHAR(20) DEFAULT 'medium',
    sla_days INTEGER DEFAULT 30,
    requires_investigation BOOLEAN DEFAULT TRUE,
    auto_assign_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notification_template TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    UNIQUE(tenant_id, code)
);

-- Índices para ethics_categories
CREATE INDEX idx_ethics_categories_tenant_id ON ethics_categories(tenant_id);
CREATE INDEX idx_ethics_categories_code ON ethics_categories(code);
CREATE INDEX idx_ethics_categories_active ON ethics_categories(is_active);

-- 3. Criar tabela de comunicações do caso (mensagens entre investigador e denunciante)
CREATE TABLE IF NOT EXISTS ethics_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL DEFAULT 'update', -- 'update', 'question', 'response', 'resolution'
    sender_type VARCHAR(20) NOT NULL, -- 'system', 'investigator', 'reporter'
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Se true, apenas investigadores veem
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Validações
    CONSTRAINT valid_message_type CHECK (message_type IN ('update', 'question', 'response', 'resolution', 'closure')),
    CONSTRAINT valid_sender_type CHECK (sender_type IN ('system', 'investigator', 'reporter', 'admin'))
);

-- Índices para ethics_communications
CREATE INDEX idx_ethics_communications_tenant_id ON ethics_communications(tenant_id);
CREATE INDEX idx_ethics_communications_report_id ON ethics_communications(report_id);
CREATE INDEX idx_ethics_communications_created_at ON ethics_communications(created_at);
CREATE INDEX idx_ethics_communications_message_type ON ethics_communications(message_type);
CREATE INDEX idx_ethics_communications_is_internal ON ethics_communications(is_internal);

-- 4. Criar tabela de workflow/atividades do caso
CREATE TABLE IF NOT EXISTS ethics_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    performed_by_name VARCHAR(200), -- Para casos anônimos ou externos
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Tipos comuns: 'created', 'status_changed', 'assigned', 'priority_changed', 
    -- 'message_sent', 'evidence_uploaded', 'resolved', 'closed'
    CONSTRAINT valid_activity_type CHECK (
        activity_type IN (
            'created', 'updated', 'status_changed', 'assigned', 'unassigned',
            'priority_changed', 'severity_changed', 'category_changed',
            'message_sent', 'message_received', 'evidence_uploaded',
            'investigation_started', 'investigation_completed',
            'resolved', 'closed', 'reopened', 'escalated',
            'due_date_changed', 'sla_breach', 'comment_added'
        )
    )
);

-- Índices para ethics_activities
CREATE INDEX idx_ethics_activities_tenant_id ON ethics_activities(tenant_id);
CREATE INDEX idx_ethics_activities_report_id ON ethics_activities(report_id);
CREATE INDEX idx_ethics_activities_type ON ethics_activities(activity_type);
CREATE INDEX idx_ethics_activities_created_at ON ethics_activities(created_at);
CREATE INDEX idx_ethics_activities_performed_by ON ethics_activities(performed_by);

-- 5. Criar tabela de anexos/evidências
CREATE TABLE IF NOT EXISTS ethics_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
    communication_id UUID REFERENCES ethics_communications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    file_path TEXT NOT NULL, -- Caminho no storage
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    uploaded_by_name VARCHAR(200), -- Para casos anônimos
    is_evidence BOOLEAN DEFAULT TRUE,
    is_confidential BOOLEAN DEFAULT FALSE,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ethics_attachments
CREATE INDEX idx_ethics_attachments_tenant_id ON ethics_attachments(tenant_id);
CREATE INDEX idx_ethics_attachments_report_id ON ethics_attachments(report_id);
CREATE INDEX idx_ethics_attachments_communication_id ON ethics_attachments(communication_id);
CREATE INDEX idx_ethics_attachments_created_at ON ethics_attachments(created_at);

-- 6. Criar tabela de configurações do módulo de ética por tenant
CREATE TABLE IF NOT EXISTS ethics_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    
    -- Configurações gerais
    module_enabled BOOLEAN DEFAULT TRUE,
    public_submissions_enabled BOOLEAN DEFAULT TRUE,
    anonymous_submissions_enabled BOOLEAN DEFAULT TRUE,
    require_evidence BOOLEAN DEFAULT FALSE,
    auto_acknowledge BOOLEAN DEFAULT TRUE,
    
    -- SLA e prazos
    default_sla_days INTEGER DEFAULT 30,
    escalation_days INTEGER DEFAULT 7,
    closure_approval_required BOOLEAN DEFAULT FALSE,
    
    -- Notificações
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    sms_notifications_enabled BOOLEAN DEFAULT FALSE,
    notify_on_new_report BOOLEAN DEFAULT TRUE,
    notify_on_status_change BOOLEAN DEFAULT TRUE,
    notify_on_sla_breach BOOLEAN DEFAULT TRUE,
    
    -- Responsáveis padrão
    default_investigator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ethics_committee_emails TEXT[] DEFAULT '{}',
    escalation_emails TEXT[] DEFAULT '{}',
    
    -- Personalizações
    welcome_message TEXT DEFAULT 'Obrigado por utilizar nosso canal de ética. Sua denúncia foi recebida.',
    closure_message TEXT DEFAULT 'Agradecemos sua denúncia. O caso foi concluído.',
    disclaimer_text TEXT DEFAULT 'Todas as denúncias são tratadas com confidencialidade.',
    
    -- Configurações de protocolo
    protocol_prefix VARCHAR(10) DEFAULT 'ETH',
    protocol_format VARCHAR(50) DEFAULT '{prefix}-{year}-{sequence:04d}',
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Índice para ethics_settings
CREATE INDEX idx_ethics_settings_tenant_id ON ethics_settings(tenant_id);

-- 7. Criar tabela de templates de notificação
CREATE TABLE IF NOT EXISTS ethics_notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    body_text TEXT,
    body_html TEXT,
    variables JSONB DEFAULT '[]'::jsonb, -- Lista de variáveis disponíveis
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Tipos: 'report_received', 'status_update', 'assignment', 'escalation', 'closure'
    CONSTRAINT valid_template_type CHECK (
        template_type IN (
            'report_received', 'acknowledgment', 'status_update', 
            'assignment', 'escalation', 'investigation_started',
            'additional_info_requested', 'resolution_proposed',
            'case_closed', 'sla_warning', 'sla_breach'
        )
    ),
    
    UNIQUE(tenant_id, template_type, name)
);

-- Índices para ethics_notification_templates
CREATE INDEX idx_ethics_notification_templates_tenant_id ON ethics_notification_templates(tenant_id);
CREATE INDEX idx_ethics_notification_templates_type ON ethics_notification_templates(template_type);
CREATE INDEX idx_ethics_notification_templates_active ON ethics_notification_templates(is_active);

-- 8. Função para gerar protocolo único
CREATE OR REPLACE FUNCTION generate_ethics_protocol(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_format TEXT;
    v_year TEXT;
    v_sequence INTEGER;
    v_protocol TEXT;
BEGIN
    -- Buscar configurações do tenant
    SELECT 
        COALESCE(protocol_prefix, 'ETH'),
        COALESCE(protocol_format, '{prefix}-{year}-{sequence:04d}')
    INTO v_prefix, v_format
    FROM ethics_settings 
    WHERE tenant_id = p_tenant_id;
    
    -- Se não encontrou configurações, usar padrão
    IF v_prefix IS NULL THEN
        v_prefix := 'ETH';
        v_format := '{prefix}-{year}-{sequence:04d}';
    END IF;
    
    v_year := EXTRACT(year FROM NOW())::TEXT;
    
    -- Buscar próximo número da sequência para o ano atual
    SELECT COALESCE(MAX(
        CASE 
            WHEN protocol_number ~ ('^' || v_prefix || '-' || v_year || '-[0-9]+$')
            THEN CAST(SUBSTRING(protocol_number FROM '[0-9]+$') AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO v_sequence
    FROM ethics_reports 
    WHERE tenant_id = p_tenant_id;
    
    -- Gerar protocolo
    v_protocol := REPLACE(v_format, '{prefix}', v_prefix);
    v_protocol := REPLACE(v_protocol, '{year}', v_year);
    v_protocol := REPLACE(v_protocol, '{sequence:04d}', LPAD(v_sequence::TEXT, 4, '0'));
    
    RETURN v_protocol;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para gerar protocolo automaticamente
CREATE OR REPLACE FUNCTION trigger_generate_ethics_protocol()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.protocol_number IS NULL THEN
        NEW.protocol_number := generate_ethics_protocol(NEW.tenant_id);
    END IF;
    
    -- Atualizar timestamp de última atividade
    NEW.last_activity_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ethics_reports_generate_protocol
    BEFORE INSERT ON ethics_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_ethics_protocol();

-- 10. Trigger para atualizar last_activity_at
CREATE OR REPLACE FUNCTION trigger_update_ethics_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    NEW.last_activity_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ethics_reports_update_activity
    BEFORE UPDATE ON ethics_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_ethics_activity();

-- 11. Inserir categorias padrão (será aplicado via dados de teste)
-- As categorias serão inseridas via seed data para cada tenant

-- 12. Função para calcular SLA e verificar violações
CREATE OR REPLACE FUNCTION check_ethics_sla()
RETURNS TABLE(
    report_id UUID,
    tenant_id UUID,
    protocol_number TEXT,
    days_elapsed INTEGER,
    sla_days INTEGER,
    is_breach BOOLEAN,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id as report_id,
        er.tenant_id,
        er.protocol_number,
        EXTRACT(days FROM NOW() - er.created_at)::INTEGER as days_elapsed,
        COALESCE(ec.sla_days, es.default_sla_days, 30) as sla_days,
        EXTRACT(days FROM NOW() - er.created_at) > COALESCE(ec.sla_days, es.default_sla_days, 30) as is_breach,
        GREATEST(0, EXTRACT(days FROM NOW() - er.created_at)::INTEGER - COALESCE(ec.sla_days, es.default_sla_days, 30)) as days_overdue
    FROM ethics_reports er
    LEFT JOIN ethics_categories ec ON er.category = ec.code AND er.tenant_id = ec.tenant_id
    LEFT JOIN ethics_settings es ON er.tenant_id = es.tenant_id
    WHERE er.status NOT IN ('resolved', 'closed')
    AND er.due_date IS NOT NULL
    ORDER BY days_overdue DESC;
END;
$$ LANGUAGE plpgsql;

-- 13. Atualizar campos de updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at em todas as tabelas relevantes
CREATE TRIGGER ethics_categories_updated_at
    BEFORE UPDATE ON ethics_categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER ethics_settings_updated_at
    BEFORE UPDATE ON ethics_settings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER ethics_notification_templates_updated_at
    BEFORE UPDATE ON ethics_notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

-- 14. Row Level Security (RLS)
ALTER TABLE ethics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_notification_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (serão refinadas conforme necessário)
CREATE POLICY "Users can access their tenant ethics data"
    ON ethics_reports
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE tenant_id = ethics_reports.tenant_id 
            OR tenant_id IS NULL -- Platform admins
        )
    );

-- Aplicar política similar para outras tabelas
CREATE POLICY "Users can access their tenant ethics categories"
    ON ethics_categories FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE tenant_id = ethics_categories.tenant_id 
            OR tenant_id IS NULL
        )
    );

CREATE POLICY "Users can access their tenant ethics communications"
    ON ethics_communications FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE tenant_id = ethics_communications.tenant_id 
            OR tenant_id IS NULL
        )
    );

CREATE POLICY "Users can access their tenant ethics activities"
    ON ethics_activities FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE tenant_id = ethics_activities.tenant_id 
            OR tenant_id IS NULL
        )
    );

CREATE POLICY "Users can access their tenant ethics attachments"
    ON ethics_attachments FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE tenant_id = ethics_attachments.tenant_id 
            OR tenant_id IS NULL
        )
    );

CREATE POLICY "Users can access their tenant ethics settings"
    ON ethics_settings FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE tenant_id = ethics_settings.tenant_id 
            OR tenant_id IS NULL
        )
    );

CREATE POLICY "Users can access their tenant notification templates"
    ON ethics_notification_templates FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE tenant_id = ethics_notification_templates.tenant_id 
            OR tenant_id IS NULL
        )
    );

-- 15. Comentários nas tabelas para documentação
COMMENT ON TABLE ethics_reports IS 'Tabela principal de relatórios de ética e denúncias';
COMMENT ON TABLE ethics_categories IS 'Categorias configuráveis de tipos de denúncia por tenant';
COMMENT ON TABLE ethics_communications IS 'Comunicações entre investigadores e denunciantes';
COMMENT ON TABLE ethics_activities IS 'Log de atividades e workflow dos casos';
COMMENT ON TABLE ethics_attachments IS 'Anexos e evidências dos casos';
COMMENT ON TABLE ethics_settings IS 'Configurações do módulo de ética por tenant';
COMMENT ON TABLE ethics_notification_templates IS 'Templates de notificação personalizáveis';

-- 16. Criar índices de texto para busca
CREATE INDEX IF NOT EXISTS idx_ethics_reports_search ON ethics_reports 
USING gin(to_tsvector('portuguese', title || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_ethics_communications_search ON ethics_communications 
USING gin(to_tsvector('portuguese', subject || ' ' || message));

-- FIM DA MIGRAÇÃO
-- =============================================================================
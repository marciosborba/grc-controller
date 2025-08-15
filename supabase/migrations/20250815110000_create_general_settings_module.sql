-- ============================================================================
-- MIGRATION: MÓDULO CONFIGURAÇÕES GERAIS
-- ============================================================================
-- Criação das tabelas para o módulo de configurações gerais e integrações

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELA PRINCIPAL DE INTEGRAÇÕES
-- ============================================================================

-- Tabela de integrações (overview geral)
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('api', 'mcp', 'email', 'sso', 'webhook', 'backup')),
    status VARCHAR(30) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
    tenant_id UUID REFERENCES tenants(id),
    last_sync TIMESTAMPTZ,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 0,
    config_hash VARCHAR(64), -- Para detectar mudanças na configuração
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INTEGRAÇÕES DE APIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_type VARCHAR(20) NOT NULL CHECK (api_type IN ('rest', 'graphql', 'soap')),
    base_url VARCHAR(500) NOT NULL,
    auth_type VARCHAR(20) NOT NULL CHECK (auth_type IN ('none', 'api-key', 'bearer', 'basic', 'oauth2')),
    
    -- Credenciais (criptografadas)
    api_key_encrypted TEXT,
    bearer_token_encrypted TEXT,
    username_encrypted TEXT,
    password_encrypted TEXT,
    oauth2_config JSON, -- client_id, client_secret, etc.
    
    -- Configurações
    headers JSON, -- headers personalizados
    rate_limit_per_minute INTEGER DEFAULT 60,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    retry_delay_seconds INTEGER DEFAULT 5,
    
    -- Monitoramento
    last_request_at TIMESTAMPTZ,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms DECIMAL(10,2),
    
    tenant_id UUID REFERENCES tenants(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODEL CONTEXT PROTOCOL (MCP) - PROVEDORES DE IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS mcp_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('claude', 'openai', 'custom')),
    endpoint VARCHAR(500),
    model VARCHAR(100), -- ex: gpt-4-turbo, claude-3-5-sonnet
    
    -- Credenciais (criptografadas)
    api_key_encrypted TEXT NOT NULL,
    organization_id VARCHAR(100), -- Para OpenAI
    
    -- Configurações do modelo
    context_window INTEGER DEFAULT 8000,
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 1000,
    top_p DECIMAL(3,2) DEFAULT 1.0,
    frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
    presence_penalty DECIMAL(3,2) DEFAULT 0.0,
    
    -- Perfis de contexto
    context_profiles JSON, -- Array de perfis com prompts especializados
    
    -- Monitoramento
    tokens_used_today INTEGER DEFAULT 0,
    tokens_limit_per_day INTEGER DEFAULT 100000,
    last_request_at TIMESTAMPTZ,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms DECIMAL(10,2),
    
    tenant_id UUID REFERENCES tenants(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROVEDORES DE EMAIL
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('smtp', 'sendgrid', 'ses', 'mailgun', 'graph', 'custom')),
    
    -- SMTP Configuration
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_secure BOOLEAN DEFAULT true, -- TLS/SSL
    smtp_username_encrypted TEXT,
    smtp_password_encrypted TEXT,
    
    -- API Configuration (SendGrid, SES, Mailgun, etc.)
    api_key_encrypted TEXT,
    api_endpoint VARCHAR(500),
    region VARCHAR(50), -- Para AWS SES
    
    -- Microsoft Graph
    tenant_id_graph VARCHAR(100),
    client_id_encrypted TEXT,
    client_secret_encrypted TEXT,
    
    -- Configurações gerais
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) DEFAULT 'Sistema GRC',
    reply_to VARCHAR(255),
    
    -- Templates de email
    templates JSON, -- Array de templates com variáveis dinâmicas
    
    -- Rate limiting
    rate_limit_per_hour INTEGER DEFAULT 1000,
    
    -- Monitoramento
    emails_sent_today INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_bounced INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    last_sent_at TIMESTAMPTZ,
    
    tenant_id UUID REFERENCES tenants(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROVEDORES DE SSO
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('azure-ad', 'google', 'okta', 'auth0', 'saml', 'oidc')),
    
    -- URLs e endpoints
    authorization_url VARCHAR(500),
    token_url VARCHAR(500),
    userinfo_url VARCHAR(500),
    jwks_url VARCHAR(500),
    metadata_url VARCHAR(500),
    
    -- Credenciais (criptografadas)
    client_id_encrypted TEXT NOT NULL,
    client_secret_encrypted TEXT NOT NULL,
    tenant_id_provider VARCHAR(100), -- Para Azure AD
    
    -- SAML Configuration
    saml_entity_id VARCHAR(500),
    saml_sso_url VARCHAR(500),
    saml_certificate TEXT,
    
    -- Configurações
    scopes JSON, -- Array de scopes OAuth
    attribute_mapping JSON, -- Mapeamento de atributos
    auto_provisioning BOOLEAN DEFAULT false,
    default_roles JSON, -- Roles padrão para novos usuários
    
    -- Configurações de segurança
    require_2fa BOOLEAN DEFAULT false,
    session_timeout_minutes INTEGER DEFAULT 480, -- 8 horas
    
    -- Monitoramento
    logins_today INTEGER DEFAULT 0,
    successful_logins INTEGER DEFAULT 0,
    failed_logins INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    
    tenant_id UUID REFERENCES tenants(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WEBHOOKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    method VARCHAR(10) DEFAULT 'POST' CHECK (method IN ('POST', 'PUT', 'PATCH')),
    
    -- Eventos a monitorar
    events JSON NOT NULL, -- Array de eventos: risk.created, incident.resolved, etc.
    
    -- Segurança
    hmac_secret_encrypted TEXT,
    custom_headers JSON,
    
    -- Configurações de retry
    retry_attempts INTEGER DEFAULT 3,
    retry_delay_seconds INTEGER DEFAULT 5,
    timeout_seconds INTEGER DEFAULT 30,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Monitoramento
    deliveries_today INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    last_delivery_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    last_failure_reason TEXT,
    avg_response_time_ms DECIMAL(10,2),
    
    tenant_id UUID REFERENCES tenants(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONFIGURAÇÕES DE BACKUP
-- ============================================================================

CREATE TABLE IF NOT EXISTS backup_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('local', 'aws-s3', 'google-drive', 'onedrive', 'ftp', 'sftp')),
    
    -- Configurações de destino
    destination_config JSON, -- Credenciais e configurações específicas do destino
    
    -- AWS S3
    s3_bucket VARCHAR(255),
    s3_region VARCHAR(50),
    s3_access_key_encrypted TEXT,
    s3_secret_key_encrypted TEXT,
    s3_prefix VARCHAR(255),
    
    -- Google Drive
    gdrive_folder_id VARCHAR(255),
    gdrive_service_account_encrypted TEXT,
    
    -- FTP/SFTP
    ftp_host VARCHAR(255),
    ftp_port INTEGER,
    ftp_username_encrypted TEXT,
    ftp_password_encrypted TEXT,
    ftp_path VARCHAR(500),
    
    -- Agendamento
    schedule_type VARCHAR(20) DEFAULT 'manual' CHECK (schedule_type IN ('manual', 'hourly', 'daily', 'weekly', 'monthly')),
    schedule_time VARCHAR(8), -- HH:MM formato
    schedule_day_of_week INTEGER, -- 0-6 (domingo=0)
    schedule_day_of_month INTEGER, -- 1-31
    
    -- Tipos de dados para backup
    include_database BOOLEAN DEFAULT true,
    include_uploads BOOLEAN DEFAULT true,
    include_logs BOOLEAN DEFAULT false,
    include_configurations BOOLEAN DEFAULT true,
    include_reports BOOLEAN DEFAULT true,
    
    -- Configurações avançadas
    compression_enabled BOOLEAN DEFAULT true,
    encryption_enabled BOOLEAN DEFAULT true,
    encryption_key_encrypted TEXT,
    
    -- Política de retenção
    retention_days INTEGER DEFAULT 30,
    max_backups INTEGER DEFAULT 10,
    
    -- Sincronização
    sync_type VARCHAR(20) DEFAULT 'one-way' CHECK (sync_type IN ('one-way', 'two-way')),
    conflict_resolution VARCHAR(20) DEFAULT 'local-wins' CHECK (conflict_resolution IN ('local-wins', 'remote-wins', 'create-duplicate', 'manual')),
    
    -- Status e monitoramento
    is_active BOOLEAN DEFAULT true,
    last_backup_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    last_failure_reason TEXT,
    total_backups INTEGER DEFAULT 0,
    successful_backups INTEGER DEFAULT 0,
    failed_backups INTEGER DEFAULT 0,
    backup_size_bytes BIGINT DEFAULT 0,
    
    tenant_id UUID REFERENCES tenants(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LOGS DE INTEGRAÇÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    log_type VARCHAR(20) NOT NULL CHECK (log_type IN ('request', 'response', 'error', 'sync', 'webhook', 'backup')),
    level VARCHAR(10) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    details JSON,
    request_url VARCHAR(500),
    response_status INTEGER,
    response_time_ms INTEGER,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Integrations
CREATE INDEX IF NOT EXISTS idx_integrations_tenant_id ON integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

-- API Connections
CREATE INDEX IF NOT EXISTS idx_api_connections_integration_id ON api_connections(integration_id);
CREATE INDEX IF NOT EXISTS idx_api_connections_tenant_id ON api_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_connections_type ON api_connections(api_type);

-- MCP Providers
CREATE INDEX IF NOT EXISTS idx_mcp_providers_integration_id ON mcp_providers(integration_id);
CREATE INDEX IF NOT EXISTS idx_mcp_providers_tenant_id ON mcp_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mcp_providers_type ON mcp_providers(provider_type);

-- Email Providers
CREATE INDEX IF NOT EXISTS idx_email_providers_integration_id ON email_providers(integration_id);
CREATE INDEX IF NOT EXISTS idx_email_providers_tenant_id ON email_providers(tenant_id);

-- SSO Providers
CREATE INDEX IF NOT EXISTS idx_sso_providers_integration_id ON sso_providers(integration_id);
CREATE INDEX IF NOT EXISTS idx_sso_providers_tenant_id ON sso_providers(tenant_id);

-- Webhook Endpoints
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_integration_id ON webhook_endpoints(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_tenant_id ON webhook_endpoints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(is_active);

-- Backup Configurations
CREATE INDEX IF NOT EXISTS idx_backup_configurations_integration_id ON backup_configurations(integration_id);
CREATE INDEX IF NOT EXISTS idx_backup_configurations_tenant_id ON backup_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_backup_configurations_active ON backup_configurations(is_active);

-- Integration Logs
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_tenant_id ON integration_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_level ON integration_logs(level);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas as tabelas
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_connections_updated_at BEFORE UPDATE ON api_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mcp_providers_updated_at BEFORE UPDATE ON mcp_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_providers_updated_at BEFORE UPDATE ON email_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sso_providers_updated_at BEFORE UPDATE ON sso_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_endpoints_updated_at BEFORE UPDATE ON webhook_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_configurations_updated_at BEFORE UPDATE ON backup_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Usuários só podem ver integrações do seu tenant
CREATE POLICY "Users can view own tenant integrations" ON integrations FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own tenant integrations" ON integrations FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Políticas similares para todas as tabelas filhas
CREATE POLICY "Users can view own tenant api_connections" ON api_connections FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own tenant api_connections" ON api_connections FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- MCP Providers
CREATE POLICY "Users can view own tenant mcp_providers" ON mcp_providers FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own tenant mcp_providers" ON mcp_providers FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Email Providers
CREATE POLICY "Users can view own tenant email_providers" ON email_providers FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own tenant email_providers" ON email_providers FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- SSO Providers
CREATE POLICY "Users can view own tenant sso_providers" ON sso_providers FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own tenant sso_providers" ON sso_providers FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Webhook Endpoints
CREATE POLICY "Users can view own tenant webhook_endpoints" ON webhook_endpoints FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own tenant webhook_endpoints" ON webhook_endpoints FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Backup Configurations
CREATE POLICY "Users can view own tenant backup_configurations" ON backup_configurations FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own tenant backup_configurations" ON backup_configurations FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Integration Logs
CREATE POLICY "Users can view own tenant integration_logs" ON integration_logs FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para criptografar dados sensíveis
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, key_name TEXT DEFAULT 'general_settings')
RETURNS TEXT AS $$
BEGIN
    IF data IS NULL OR data = '' THEN
        RETURN NULL;
    END IF;
    
    -- Usando pgcrypto para criptografar
    RETURN encode(
        pgp_sym_encrypt(data, key_name), 
        'base64'
    );
END;
$$ LANGUAGE plpgsql;

-- Função para descriptografar dados sensíveis
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, key_name TEXT DEFAULT 'general_settings')
RETURNS TEXT AS $$
BEGIN
    IF encrypted_data IS NULL OR encrypted_data = '' THEN
        RETURN NULL;
    END IF;
    
    BEGIN
        RETURN pgp_sym_decrypt(
            decode(encrypted_data, 'base64'), 
            key_name
        );
    EXCEPTION WHEN OTHERS THEN
        RETURN NULL; -- Retorna NULL se não conseguir descriptografar
    END;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular estatísticas de integração
CREATE OR REPLACE FUNCTION get_integration_stats(tenant_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_integrations', COUNT(*),
        'connected', COUNT(*) FILTER (WHERE status = 'connected'),
        'disconnected', COUNT(*) FILTER (WHERE status = 'disconnected'),
        'error', COUNT(*) FILTER (WHERE status = 'error'),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'avg_uptime', ROUND(AVG(uptime_percentage), 2),
        'by_type', json_object_agg(type, type_count)
    )
    INTO stats
    FROM (
        SELECT 
            status,
            type,
            uptime_percentage,
            COUNT(*) OVER (PARTITION BY type) as type_count
        FROM integrations 
        WHERE tenant_id = tenant_uuid
    ) t;
    
    RETURN COALESCE(stats, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE integrations IS 'Tabela principal para todas as integrações do módulo Configurações Gerais';
COMMENT ON TABLE api_connections IS 'Configurações de conexões com APIs REST, GraphQL e SOAP';
COMMENT ON TABLE mcp_providers IS 'Provedores de Model Context Protocol para IA (Claude, OpenAI, etc.)';
COMMENT ON TABLE email_providers IS 'Configurações de provedores de email (SMTP, SendGrid, SES, etc.)';
COMMENT ON TABLE sso_providers IS 'Provedores de Single Sign-On (Azure AD, Google, SAML, etc.)';
COMMENT ON TABLE webhook_endpoints IS 'Endpoints de webhook para notificações em tempo real';
COMMENT ON TABLE backup_configurations IS 'Configurações de backup e sincronização de dados';
COMMENT ON TABLE integration_logs IS 'Logs detalhados de todas as operações das integrações';

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

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
    'general_settings_module',
    'Created General Settings Module with all integration tables and security policies',
    NOW()
) ON CONFLICT DO NOTHING;
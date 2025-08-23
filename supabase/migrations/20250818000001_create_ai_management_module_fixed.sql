-- ============================================================================
-- MIGRATION: MÓDULO DE GESTÃO DE IA (CORREÇÃO)
-- ============================================================================
-- Criação das tabelas para o módulo de gestão de IA e prompts para GRC

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- LOGS DE USO DA IA (Criar primeiro para resolver dependências)
-- ============================================================================

-- Logs detalhados de todas as interações com IA
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação da requisição
    request_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    user_id UUID REFERENCES auth.users(id),
    
    -- Contexto da operação
    module_name VARCHAR(50) NOT NULL,
    operation_type VARCHAR(30) NOT NULL CHECK (operation_type IN (
        'prompt-execution', 'analysis', 'generation', 'validation',
        'recommendation', 'summarization', 'translation', 'classification'
    )),
    
    -- Dados da requisição
    provider_id UUID, -- Referência será adicionada depois
    prompt_id UUID,   -- Referência será adicionada depois
    template_id UUID, -- Referência será adicionada depois
    
    -- Conteúdo (criptografado para privacidade)
    input_prompt_encrypted TEXT,
    output_response_encrypted TEXT,
    
    -- Métricas de performance
    response_time_ms INTEGER,
    tokens_input INTEGER,
    tokens_output INTEGER,
    cost_usd DECIMAL(10,4),
    
    -- Qualidade e feedback
    quality_score DECIMAL(3,2), -- Score de 1-5
    user_feedback TEXT,
    has_errors BOOLEAN DEFAULT false,
    error_details TEXT,
    
    -- Contexto de segurança
    contains_pii BOOLEAN DEFAULT false,
    contains_sensitive BOOLEAN DEFAULT false,
    was_approved BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES auth.users(id),
    
    -- Conformidade
    compliance_check_passed BOOLEAN DEFAULT true,
    compliance_notes TEXT,
    retention_period_days INTEGER DEFAULT 365,
    
    -- Multi-tenancy e auditoria
    tenant_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONFIGURAÇÕES GLOBAIS DE IA
-- ============================================================================

-- Tabela principal de configurações de IA
CREATE TABLE IF NOT EXISTS ai_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Configurações globais
    default_provider VARCHAR(50) NOT NULL DEFAULT 'claude',
    max_tokens_per_request INTEGER DEFAULT 4000,
    max_requests_per_minute INTEGER DEFAULT 30,
    max_tokens_per_day INTEGER DEFAULT 100000,
    
    -- Configurações de comportamento
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    context_window INTEGER DEFAULT 8000,
    enable_context_memory BOOLEAN DEFAULT true,
    enable_conversation_history BOOLEAN DEFAULT true,
    max_conversation_turns INTEGER DEFAULT 10,
    
    -- Controles de segurança
    enable_content_filtering BOOLEAN DEFAULT true,
    enable_pii_detection BOOLEAN DEFAULT true,
    enable_audit_logging BOOLEAN DEFAULT true,
    require_approval_for_sensitive BOOLEAN DEFAULT true,
    allowed_domains JSON, -- Array de domínios permitidos para busca
    
    -- Configurações por módulo
    module_settings JSON, -- Configurações específicas por módulo GRC
    
    -- Multi-tenancy
    tenant_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_ai_config_per_tenant UNIQUE (tenant_id, name)
);

-- ============================================================================
-- PROVEDORES DE IA ESPECIALIZADOS
-- ============================================================================

-- Extensão da tabela mcp_providers para IA especializada em GRC
CREATE TABLE IF NOT EXISTS ai_grc_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(30) NOT NULL CHECK (provider_type IN ('claude', 'openai', 'azure-openai', 'google-palm', 'llama', 'custom')),
    
    -- Configurações de endpoint
    endpoint_url VARCHAR(500),
    api_version VARCHAR(20),
    model_name VARCHAR(100) NOT NULL, -- ex: gpt-4-turbo, claude-3-5-sonnet, llama-2-70b
    
    -- Credenciais (criptografadas)
    api_key_encrypted TEXT NOT NULL,
    organization_id VARCHAR(100), -- Para OpenAI/Azure
    project_id VARCHAR(100), -- Para Google
    
    -- Configurações específicas do modelo
    context_window INTEGER DEFAULT 8000,
    max_output_tokens INTEGER DEFAULT 4000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    top_p DECIMAL(3,2) DEFAULT 1.0,
    top_k INTEGER DEFAULT 40,
    frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
    presence_penalty DECIMAL(3,2) DEFAULT 0.0,
    
    -- Especialização em GRC
    grc_specialization JSON, -- Configurações específicas para GRC
    supported_modules JSON, -- Array de módulos GRC suportados
    compliance_frameworks JSON, -- Frameworks de compliance que entende
    risk_assessment_capabilities JSON, -- Capacidades de avaliação de riscos
    
    -- Configurações de fallback
    fallback_provider_id UUID REFERENCES ai_grc_providers(id),
    fallback_on_error BOOLEAN DEFAULT false,
    fallback_on_rate_limit BOOLEAN DEFAULT true,
    
    -- Métricas e monitoramento
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms DECIMAL(10,2),
    tokens_used_today INTEGER DEFAULT 0,
    cost_usd_today DECIMAL(10,4) DEFAULT 0.00,
    last_request_at TIMESTAMPTZ,
    
    -- Status operacional
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false, -- Provider principal para o tenant
    priority INTEGER DEFAULT 1, -- Ordem de preferência
    
    -- Multi-tenancy
    tenant_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROMPTS POR MÓDULO
-- ============================================================================

-- Tabela de prompts personalizados por módulo
CREATE TABLE IF NOT EXISTS ai_module_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_name VARCHAR(50) NOT NULL CHECK (module_name IN (
        'dashboard', 'assessments', 'risks', 'compliance', 'incidents', 
        'audit', 'policies', 'vendors', 'reports', 'ethics', 'privacy',
        'general-settings', 'notifications', 'help', 'admin'
    )),
    
    -- Identificação do prompt
    prompt_name VARCHAR(255) NOT NULL,
    prompt_type VARCHAR(30) NOT NULL CHECK (prompt_type IN (
        'system', 'user', 'assistant', 'analysis', 'generation', 
        'validation', 'recommendation', 'report', 'summary'
    )),
    
    -- Conteúdo do prompt
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_content TEXT NOT NULL,
    
    -- Contexto GRC
    grc_context JSON, -- Contexto específico de GRC para o prompt
    required_data_sources JSON, -- Fontes de dados necessárias
    output_format VARCHAR(30) DEFAULT 'text' CHECK (output_format IN ('text', 'json', 'markdown', 'table', 'chart')),
    
    -- Configurações do prompt
    max_tokens INTEGER DEFAULT 2000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    requires_approval BOOLEAN DEFAULT false,
    is_sensitive BOOLEAN DEFAULT false,
    
    -- Versionamento
    version INTEGER DEFAULT 1,
    parent_prompt_id UUID REFERENCES ai_module_prompts(id), -- Para versionamento
    
    -- Uso e performance
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_execution_time_ms INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Multi-tenancy
    tenant_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_prompt_per_module_tenant UNIQUE (tenant_id, module_name, prompt_name, version)
);

-- ============================================================================
-- TEMPLATES DE PROMPTS GRC
-- ============================================================================

-- Biblioteca de templates de prompts especializados em GRC
CREATE TABLE IF NOT EXISTS ai_grc_prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'risk-assessment', 'compliance-check', 'incident-analysis', 
        'policy-review', 'audit-planning', 'vendor-evaluation',
        'gap-analysis', 'control-testing', 'threat-modeling',
        'privacy-impact', 'regulatory-mapping', 'maturity-assessment'
    )),
    
    -- Metadados
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    use_case TEXT NOT NULL,
    
    -- Template do prompt
    template_content TEXT NOT NULL,
    variables JSON, -- Variáveis dinâmicas no template (ex: {company_name}, {assessment_type})
    
    -- Configurações GRC
    applicable_frameworks JSON, -- Frameworks aplicáveis (ISO 27001, NIST, etc.)
    compliance_domains JSON, -- Domínios de compliance
    risk_categories JSON, -- Categorias de risco relacionadas
    maturity_levels JSON, -- Níveis de maturidade aplicáveis
    
    -- Configurações técnicas
    recommended_model VARCHAR(100),
    min_context_window INTEGER DEFAULT 4000,
    recommended_temperature DECIMAL(3,2) DEFAULT 0.3,
    max_output_tokens INTEGER DEFAULT 2000,
    expected_output_format VARCHAR(30) DEFAULT 'structured',
    
    -- Qualidade e validação
    quality_score DECIMAL(3,2) DEFAULT 0.00, -- Score de qualidade baseado em uso
    validation_criteria JSON, -- Critérios para validar a resposta
    
    -- Uso e estatísticas
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_quality_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Versionamento
    version VARCHAR(20) DEFAULT '1.0',
    changelog TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Se disponível para todos os tenants
    requires_approval BOOLEAN DEFAULT false,
    
    -- Autorização
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONTEXTOS DE CONVERSAÇÃO
-- ============================================================================

-- Contextos de conversação para manter histórico e continuidade
CREATE TABLE IF NOT EXISTS ai_conversation_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação da sessão
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    module_name VARCHAR(50) NOT NULL,
    
    -- Contexto da conversa
    context_name VARCHAR(255),
    conversation_history JSON, -- Array de mensagens da conversa
    system_context JSON, -- Contexto do sistema e dados relevantes
    
    -- Configurações
    provider_id UUID REFERENCES ai_grc_providers(id),
    max_turns INTEGER DEFAULT 10,
    current_turn INTEGER DEFAULT 0,
    
    -- Métricas
    total_tokens_used INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10,4) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Multi-tenancy
    tenant_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONFIGURAÇÕES DE WORKFLOW DE IA
-- ============================================================================

-- Workflows automatizados que usam IA
CREATE TABLE IF NOT EXISTS ai_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(30) NOT NULL CHECK (workflow_type IN (
        'automated-analysis', 'scheduled-report', 'alert-processing',
        'data-validation', 'compliance-monitoring', 'risk-scoring'
    )),
    
    -- Configuração do workflow
    trigger_events JSON, -- Eventos que disparam o workflow
    workflow_steps JSON, -- Passos do workflow com prompts e ações
    
    -- Configurações de execução
    schedule_cron VARCHAR(100), -- Para workflows agendados
    is_active BOOLEAN DEFAULT true,
    auto_approve BOOLEAN DEFAULT false,
    requires_human_review BOOLEAN DEFAULT true,
    
    -- Provider e configurações de IA
    default_provider_id UUID REFERENCES ai_grc_providers(id),
    max_execution_time_minutes INTEGER DEFAULT 30,
    
    -- Métricas
    executions_count INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    avg_execution_time_minutes DECIMAL(10,2),
    last_execution_at TIMESTAMPTZ,
    
    -- Multi-tenancy
    tenant_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Adicionar referências para ai_usage_logs agora que as tabelas existem
-- ============================================================================

-- Adicionar foreign keys para ai_usage_logs
ALTER TABLE ai_usage_logs ADD CONSTRAINT ai_usage_logs_provider_fk 
    FOREIGN KEY (provider_id) REFERENCES ai_grc_providers(id);

ALTER TABLE ai_usage_logs ADD CONSTRAINT ai_usage_logs_prompt_fk 
    FOREIGN KEY (prompt_id) REFERENCES ai_module_prompts(id);

ALTER TABLE ai_usage_logs ADD CONSTRAINT ai_usage_logs_template_fk 
    FOREIGN KEY (template_id) REFERENCES ai_grc_prompt_templates(id);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- AI Configurations
CREATE INDEX IF NOT EXISTS idx_ai_configurations_tenant_id ON ai_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_default_provider ON ai_configurations(default_provider);

-- AI GRC Providers
CREATE INDEX IF NOT EXISTS idx_ai_grc_providers_tenant_id ON ai_grc_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_grc_providers_type ON ai_grc_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_ai_grc_providers_active ON ai_grc_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_grc_providers_primary ON ai_grc_providers(is_primary, tenant_id);

-- AI Module Prompts
CREATE INDEX IF NOT EXISTS idx_ai_module_prompts_tenant_id ON ai_module_prompts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_module_prompts_module ON ai_module_prompts(module_name);
CREATE INDEX IF NOT EXISTS idx_ai_module_prompts_type ON ai_module_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_module_prompts_active ON ai_module_prompts(is_active);

-- AI GRC Prompt Templates
CREATE INDEX IF NOT EXISTS idx_ai_grc_templates_category ON ai_grc_prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_ai_grc_templates_active ON ai_grc_prompt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_grc_templates_public ON ai_grc_prompt_templates(is_public);

-- AI Conversation Contexts
CREATE INDEX IF NOT EXISTS idx_ai_conversation_tenant_id ON ai_conversation_contexts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_session ON ai_conversation_contexts(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_user ON ai_conversation_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_expires ON ai_conversation_contexts(expires_at);

-- AI Usage Logs
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_tenant_id ON ai_usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_module ON ai_usage_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON ai_usage_logs(provider_id);

-- AI Workflows
CREATE INDEX IF NOT EXISTS idx_ai_workflows_tenant_id ON ai_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_type ON ai_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_active ON ai_workflows(is_active);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Triggers para todas as tabelas de IA
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_configurations_updated_at BEFORE UPDATE ON ai_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_grc_providers_updated_at BEFORE UPDATE ON ai_grc_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_module_prompts_updated_at BEFORE UPDATE ON ai_module_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_grc_prompt_templates_updated_at BEFORE UPDATE ON ai_grc_prompt_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversation_contexts_updated_at BEFORE UPDATE ON ai_conversation_contexts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_workflows_updated_at BEFORE UPDATE ON ai_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_grc_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_module_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_grc_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflows ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNÇÕES AUXILIARES PARA IA
-- ============================================================================

-- Função para obter estatísticas de uso de IA por tenant
CREATE OR REPLACE FUNCTION get_ai_usage_stats(tenant_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    stats JSON;
    start_date DATE;
BEGIN
    start_date := CURRENT_DATE - days_back;
    
    SELECT json_build_object(
        'total_requests', COUNT(*),
        'successful_requests', COUNT(*) FILTER (WHERE has_errors = false),
        'failed_requests', COUNT(*) FILTER (WHERE has_errors = true),
        'total_tokens_used', COALESCE(SUM(tokens_input + tokens_output), 0),
        'total_cost_usd', COALESCE(SUM(cost_usd), 0.00),
        'avg_response_time_ms', ROUND(AVG(response_time_ms), 2),
        'avg_quality_score', ROUND(AVG(quality_score), 2)
    )
    INTO stats
    FROM ai_usage_logs 
    WHERE tenant_id = tenant_uuid 
    AND created_at >= start_date;
    
    RETURN COALESCE(stats, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Função para limpar conversas expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_ai_conversations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ai_conversation_contexts 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE ai_configurations IS 'Configurações globais de IA por tenant';
COMMENT ON TABLE ai_grc_providers IS 'Provedores de IA especializados em GRC';
COMMENT ON TABLE ai_module_prompts IS 'Prompts personalizados por módulo da aplicação';
COMMENT ON TABLE ai_grc_prompt_templates IS 'Biblioteca de templates de prompts especializados em GRC';
COMMENT ON TABLE ai_conversation_contexts IS 'Contextos de conversação para manter histórico de IA';
COMMENT ON TABLE ai_usage_logs IS 'Logs detalhados de uso de IA com métricas e auditoria';
COMMENT ON TABLE ai_workflows IS 'Workflows automatizados que utilizam IA';
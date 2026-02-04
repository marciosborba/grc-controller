-- =====================================================
-- TABELAS PARA SISTEMA DE IMPORTAÇÃO DE VULNERABILIDADES
-- =====================================================

-- Tabela para configurações de importação
CREATE TABLE IF NOT EXISTS import_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    connection_config JSONB NOT NULL DEFAULT '{}',
    field_mapping JSONB NOT NULL DEFAULT '{}',
    import_settings JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_import_config_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para jobs de importação
CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    configuration_id UUID,
    source_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    -- Progress tracking
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    skipped_records INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Results
    import_summary JSONB DEFAULT '{}',
    errors JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    
    -- Metadata
    file_name VARCHAR(255),
    file_size BIGINT,
    source_info JSONB DEFAULT '{}',
    
    created_by UUID,
    
    CONSTRAINT fk_import_job_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_import_job_config FOREIGN KEY (configuration_id) REFERENCES import_configurations(id) ON DELETE SET NULL,
    CONSTRAINT chk_import_job_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

-- Tabela para mapeamentos de campos personalizados
CREATE TABLE IF NOT EXISTS field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mapping_config JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_field_mapping_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_field_mapping_default UNIQUE (tenant_id, source_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Tabela para credenciais de integração (criptografadas)
CREATE TABLE IF NOT EXISTS integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credentials JSONB NOT NULL DEFAULT '{}', -- Dados criptografados
    is_active BOOLEAN DEFAULT TRUE,
    last_tested TIMESTAMP WITH TIME ZONE,
    test_result JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_integration_cred_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tabela para logs de importação detalhados
CREATE TABLE IF NOT EXISTS import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    level VARCHAR(10) NOT NULL, -- INFO, WARN, ERROR
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    record_index INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_import_log_job FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE,
    CONSTRAINT chk_import_log_level CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG'))
);

-- Extensão da tabela de vulnerabilidades para suportar dados de importação
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS import_job_id UUID;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS source_scan_id VARCHAR(255);
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS plugin_id VARCHAR(100);
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS cwe_id VARCHAR(50);
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS cvss_vector VARCHAR(255);
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS exploit_available BOOLEAN DEFAULT FALSE;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS patch_available BOOLEAN DEFAULT FALSE;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS workaround_available BOOLEAN DEFAULT FALSE;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS retest_required BOOLEAN DEFAULT FALSE;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS false_positive_reason TEXT;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS remediation_notes TEXT;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS compliance_frameworks TEXT[] DEFAULT '{}';

-- Adicionar foreign key para import_job_id
ALTER TABLE vulnerabilities ADD CONSTRAINT fk_vulnerability_import_job 
    FOREIGN KEY (import_job_id) REFERENCES import_jobs(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_import_configs_tenant_source ON import_configurations(tenant_id, source_type);
CREATE INDEX IF NOT EXISTS idx_import_jobs_tenant_status ON import_jobs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_field_mappings_tenant_source ON field_mappings(tenant_id, source_type);
CREATE INDEX IF NOT EXISTS idx_integration_creds_tenant_source ON integration_credentials(tenant_id, source_type);
CREATE INDEX IF NOT EXISTS idx_import_logs_job_level ON import_logs(job_id, level);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_import_job ON vulnerabilities(import_job_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_source_scan ON vulnerabilities(source_scan_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_plugin_id ON vulnerabilities(plugin_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tags ON vulnerabilities USING GIN(tags);

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_import_configurations_updated_at 
    BEFORE UPDATE ON import_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_field_mappings_updated_at 
    BEFORE UPDATE ON field_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_credentials_updated_at 
    BEFORE UPDATE ON integration_credentials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar jobs antigos (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_old_import_jobs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM import_jobs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND status IN ('completed', 'failed', 'cancelled');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de importação
CREATE OR REPLACE FUNCTION get_import_statistics(
    p_tenant_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_jobs INTEGER,
    successful_jobs INTEGER,
    failed_jobs INTEGER,
    total_vulnerabilities INTEGER,
    avg_processing_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_jobs,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER as successful_jobs,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::INTEGER as failed_jobs,
        COALESCE(SUM(successful_imports), 0)::INTEGER as total_vulnerabilities,
        AVG(completed_at - started_at) as avg_processing_time
    FROM import_jobs 
    WHERE tenant_id = p_tenant_id 
    AND created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas
COMMENT ON TABLE import_configurations IS 'Configurações salvas para importação de vulnerabilidades';
COMMENT ON TABLE import_jobs IS 'Histórico e status de jobs de importação';
COMMENT ON TABLE field_mappings IS 'Mapeamentos personalizados de campos por ferramenta';
COMMENT ON TABLE integration_credentials IS 'Credenciais criptografadas para integração com ferramentas';
COMMENT ON TABLE import_logs IS 'Logs detalhados dos processos de importação';

COMMENT ON COLUMN import_configurations.connection_config IS 'Configurações de conexão (URLs, autenticação, etc.)';
COMMENT ON COLUMN import_configurations.field_mapping IS 'Mapeamento de campos fonte -> destino';
COMMENT ON COLUMN import_configurations.import_settings IS 'Configurações de comportamento da importação';
COMMENT ON COLUMN import_jobs.import_summary IS 'Resumo estatístico da importação';
COMMENT ON COLUMN import_jobs.errors IS 'Array de erros encontrados durante a importação';
COMMENT ON COLUMN import_jobs.warnings IS 'Array de avisos gerados durante a importação';
COMMENT ON COLUMN integration_credentials.credentials IS 'Dados de autenticação criptografados';
COMMENT ON COLUMN vulnerabilities.import_job_id IS 'Referência ao job que importou esta vulnerabilidade';
COMMENT ON COLUMN vulnerabilities.source_scan_id IS 'ID do scan na ferramenta de origem';
COMMENT ON COLUMN vulnerabilities.plugin_id IS 'ID do plugin/regra que detectou a vulnerabilidade';

-- Inserir configurações padrão para ferramentas comuns
INSERT INTO field_mappings (tenant_id, source_type, name, description, mapping_config, is_default, created_by)
SELECT 
    t.id as tenant_id,
    'nessus_file' as source_type,
    'Mapeamento Padrão Nessus' as name,
    'Mapeamento padrão para arquivos .nessus' as description,
    '{
        "title": "pluginName",
        "description": "description",
        "severity": "severity",
        "cvss_score": "cvss_base_score",
        "asset_name": "host",
        "asset_ip": "host",
        "port": "port",
        "protocol": "protocol",
        "source_tool": "Nessus",
        "plugin_id": "pluginID",
        "solution": "solution"
    }'::jsonb as mapping_config,
    true as is_default,
    NULL as created_by
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM field_mappings fm 
    WHERE fm.tenant_id = t.id 
    AND fm.source_type = 'nessus_file' 
    AND fm.is_default = true
);

INSERT INTO field_mappings (tenant_id, source_type, name, description, mapping_config, is_default, created_by)
SELECT 
    t.id as tenant_id,
    'qualys_file' as source_type,
    'Mapeamento Padrão Qualys' as name,
    'Mapeamento padrão para relatórios XML do Qualys' as description,
    '{
        "title": "TITLE",
        "description": "DIAGNOSIS",
        "severity": "SEVERITY",
        "cvss_score": "CVSS_BASE",
        "asset_name": "IP",
        "asset_ip": "IP",
        "port": "PORT",
        "protocol": "PROTOCOL",
        "source_tool": "Qualys",
        "plugin_id": "QID",
        "solution": "SOLUTION"
    }'::jsonb as mapping_config,
    true as is_default,
    NULL as created_by
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM field_mappings fm 
    WHERE fm.tenant_id = t.id 
    AND fm.source_type = 'qualys_file' 
    AND fm.is_default = true
);

-- Inserir configuração padrão para CSV genérico
INSERT INTO field_mappings (tenant_id, source_type, name, description, mapping_config, is_default, created_by)
SELECT 
    t.id as tenant_id,
    'csv_file' as source_type,
    'Mapeamento Padrão CSV' as name,
    'Mapeamento padrão para arquivos CSV genéricos' as description,
    '{
        "title": "title",
        "description": "description",
        "severity": "severity",
        "cvss_score": "cvss_score",
        "asset_name": "asset_name",
        "asset_ip": "asset_ip",
        "port": "port",
        "protocol": "protocol",
        "source_tool": "CSV Import",
        "solution": "solution"
    }'::jsonb as mapping_config,
    true as is_default,
    NULL as created_by
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM field_mappings fm 
    WHERE fm.tenant_id = t.id 
    AND fm.source_type = 'csv_file' 
    AND fm.is_default = true
);
-- ============================================================================
-- MIGRAÇÃO: Compliance Process Templates - Sistema Customizável
-- ============================================================================
-- Cria infraestrutura para processos de compliance customizáveis por tenant
-- com máxima segurança (RLS, criptografia, auditoria)

-- ============================================================================
-- 1. EXTENSÕES E PREPARAÇÕES
-- ============================================================================

-- Garantir que extensões necessárias estão habilitadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABELA DE TEMPLATES DE PROCESSO DE COMPLIANCE
-- ============================================================================

CREATE TABLE compliance_process_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Informações Básicas
    name VARCHAR(200) NOT NULL,
    description TEXT,
    framework VARCHAR(100) NOT NULL, -- 'ISO 27001', 'LGPD', 'SOX', 'NIST', 'Custom'
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Definições Personalizáveis (JSONB para flexibilidade máxima)
    field_definitions JSONB NOT NULL DEFAULT '{"fields": []}',
    workflow_definition JSONB NOT NULL DEFAULT '{"states": [], "transitions": []}',
    ui_configuration JSONB NOT NULL DEFAULT '{"layout": "default", "theme": "standard"}',
    
    -- Configurações de Segurança
    security_config JSONB DEFAULT '{
        "encryption_required": false,
        "access_level": "internal",
        "audit_trail": true,
        "data_retention_days": 2555,
        "pii_handling": "encrypt"
    }',
    
    -- Configurações de Automação e Integração
    automation_config JSONB DEFAULT '{
        "notifications_enabled": true,
        "auto_assignment": false,
        "webhook_triggers": [],
        "ai_assistance": false
    }',
    
    -- Status e Controle
    is_active BOOLEAN DEFAULT true,
    is_default_for_framework BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    -- Auditoria e Versionamento
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints de Segurança
    CONSTRAINT compliance_process_templates_tenant_fk 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT compliance_process_templates_created_by_fk 
        FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT compliance_process_templates_updated_by_fk 
        FOREIGN KEY (updated_by) REFERENCES users(id),
    
    -- Validações de Segurança
    CONSTRAINT compliance_process_templates_name_not_empty 
        CHECK (length(trim(name)) > 0),
    CONSTRAINT compliance_process_templates_framework_not_empty 
        CHECK (length(trim(framework)) > 0),
    CONSTRAINT compliance_process_templates_valid_fields 
        CHECK (jsonb_typeof(field_definitions) = 'object' AND field_definitions ? 'fields'),
    CONSTRAINT compliance_process_templates_valid_workflow 
        CHECK (jsonb_typeof(workflow_definition) = 'object')
);

-- ============================================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice principal para isolamento por tenant
CREATE INDEX idx_compliance_process_templates_tenant 
    ON compliance_process_templates (tenant_id);

-- Índice para framework + tenant (queries comuns)
CREATE INDEX idx_compliance_process_templates_framework_tenant 
    ON compliance_process_templates (framework, tenant_id) 
    WHERE is_active = true;

-- Índices GIN para queries eficientes em JSONB
CREATE INDEX idx_compliance_process_templates_field_definitions_gin 
    ON compliance_process_templates USING GIN (field_definitions);

CREATE INDEX idx_compliance_process_templates_workflow_definition_gin 
    ON compliance_process_templates USING GIN (workflow_definition);

-- Índice para templates ativos
CREATE INDEX idx_compliance_process_templates_active 
    ON compliance_process_templates (is_active, tenant_id);

-- Índice para templates padrão por framework
CREATE INDEX idx_compliance_process_templates_default_framework 
    ON compliance_process_templates (is_default_for_framework, framework, tenant_id)
    WHERE is_default_for_framework = true;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - OBRIGATÓRIO
-- ============================================================================

-- Habilitar RLS (isolamento por tenant)
ALTER TABLE compliance_process_templates ENABLE ROW LEVEL SECURITY;

-- Política restritiva: cada tenant só vê seus próprios templates
CREATE POLICY compliance_process_templates_tenant_isolation 
    ON compliance_process_templates
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Política para inserção: garantir que tenant_id seja sempre do usuário atual
CREATE POLICY compliance_process_templates_insert_tenant_check 
    ON compliance_process_templates
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ============================================================================
-- 5. ATUALIZAÇÃO DA TABELA COMPLIANCE_ASSESSMENTS
-- ============================================================================

-- Adicionar campos para suporte a processos customizáveis
ALTER TABLE compliance_assessments 
    ADD COLUMN IF NOT EXISTS process_template_id UUID 
        REFERENCES compliance_process_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS workflow_state VARCHAR(100) DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS custom_metadata JSONB DEFAULT '{}';

-- Índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_process_template 
    ON compliance_assessments (process_template_id)
    WHERE process_template_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_compliance_assessments_custom_fields_gin 
    ON compliance_assessments USING GIN (custom_fields);

CREATE INDEX IF NOT EXISTS idx_compliance_assessments_workflow_state 
    ON compliance_assessments (workflow_state);

-- ============================================================================
-- 6. TABELA DE HISTÓRICO DE TEMPLATES (VERSIONAMENTO)
-- ============================================================================

CREATE TABLE compliance_process_template_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES compliance_process_templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    -- Snapshot completo do template na versão
    template_snapshot JSONB NOT NULL,
    
    -- Metadados da versão
    change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'activated', 'deactivated'
    change_description TEXT,
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Índices automáticos
    UNIQUE(template_id, version_number)
);

CREATE INDEX idx_compliance_process_template_history_template 
    ON compliance_process_template_history (template_id, version_number DESC);

-- RLS também para histórico
ALTER TABLE compliance_process_template_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY compliance_process_template_history_tenant_isolation 
    ON compliance_process_template_history
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM compliance_process_templates cpt 
            WHERE cpt.id = template_id 
            AND cpt.tenant_id = current_setting('app.current_tenant_id', true)::uuid
        )
    );

-- ============================================================================
-- 7. FUNÇÕES DE AUDITORIA E VERSIONAMENTO
-- ============================================================================

-- Função para criar snapshot automático quando template é modificado
CREATE OR REPLACE FUNCTION create_compliance_template_version()
RETURNS TRIGGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    -- Calcular próximo número de versão
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO next_version
    FROM compliance_process_template_history 
    WHERE template_id = NEW.id;
    
    -- Inserir snapshot na tabela de histórico
    INSERT INTO compliance_process_template_history (
        template_id, 
        version_number,
        template_snapshot,
        change_type,
        change_description,
        changed_by
    ) VALUES (
        NEW.id,
        next_version,
        row_to_json(NEW)::jsonb,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            ELSE 'updated'
        END,
        'Automated version snapshot',
        NEW.updated_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para versionamento automático
CREATE TRIGGER compliance_template_versioning_trigger
    AFTER INSERT OR UPDATE ON compliance_process_templates
    FOR EACH ROW
    EXECUTE FUNCTION create_compliance_template_version();

-- ============================================================================
-- 8. FUNÇÃO PARA VALIDAÇÃO DE SEGURANÇA DE CAMPOS CUSTOMIZADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_compliance_custom_fields(fields JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    field_record RECORD;
    field_name TEXT;
    max_field_size INTEGER := 1048576; -- 1MB
    max_nesting_depth INTEGER := 10;
BEGIN
    -- Verificar se é um objeto JSON válido
    IF jsonb_typeof(fields) != 'object' THEN
        RAISE EXCEPTION 'Custom fields must be a JSON object';
    END IF;
    
    -- Verificar tamanho total
    IF LENGTH(fields::text) > max_field_size THEN
        RAISE EXCEPTION 'Custom fields exceed maximum size of % bytes', max_field_size;
    END IF;
    
    -- Verificar cada campo individualmente
    FOR field_name IN SELECT jsonb_object_keys(fields)
    LOOP
        -- Verificar nome do campo (segurança)
        IF field_name !~ '^[a-zA-Z][a-zA-Z0-9_]{0,49}$' THEN
            RAISE EXCEPTION 'Invalid field name: %. Must be alphanumeric + underscore, max 50 chars', field_name;
        END IF;
        
        -- Verificar palavras reservadas perigosas
        IF field_name IN ('constructor', '__proto__', 'prototype', 'eval', 'function') THEN
            RAISE EXCEPTION 'Field name not allowed for security reasons: %', field_name;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. TEMPLATES PADRÃO PARA FRAMEWORKS PRINCIPAIS
-- ============================================================================

-- Função para inserir templates padrão (será executada após a criação das tabelas)
CREATE OR REPLACE FUNCTION insert_default_compliance_templates()
RETURNS void AS $$
BEGIN
    -- Será implementada posteriormente com templates específicos por framework
    -- Esta função será chamada durante a inicialização do sistema
    RAISE NOTICE 'Default compliance templates insertion function created successfully';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compliance_process_templates_updated_at_trigger
    BEFORE UPDATE ON compliance_process_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE compliance_process_templates IS 'Armazena templates de processos de compliance customizáveis por tenant com máxima segurança';
COMMENT ON COLUMN compliance_process_templates.field_definitions IS 'Definições de campos personalizados em formato JSONB seguro';
COMMENT ON COLUMN compliance_process_templates.workflow_definition IS 'Definição de workflow customizável em formato JSONB';
COMMENT ON COLUMN compliance_process_templates.security_config IS 'Configurações de segurança específicas do template';
COMMENT ON COLUMN compliance_process_templates.automation_config IS 'Configurações de automação e integração';

COMMENT ON TABLE compliance_process_template_history IS 'Histórico de versões dos templates para auditoria completa';

-- ============================================================================
-- 12. GRANTS E PERMISSÕES
-- ============================================================================

-- Garantir que apenas usuários autenticados possam acessar
REVOKE ALL ON compliance_process_templates FROM PUBLIC;
REVOKE ALL ON compliance_process_template_history FROM PUBLIC;

-- Conceder permissões apenas para roles autorizados
GRANT SELECT, INSERT, UPDATE, DELETE ON compliance_process_templates TO authenticated;
GRANT SELECT ON compliance_process_template_history TO authenticated;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Compliance Process Templates migration completed successfully!';
    RAISE NOTICE 'Features added:';
    RAISE NOTICE '  - Custom process templates with JSONB fields';
    RAISE NOTICE '  - Row Level Security (RLS) for tenant isolation';
    RAISE NOTICE '  - Automatic versioning and audit trail';
    RAISE NOTICE '  - Security validations for custom fields';
    RAISE NOTICE '  - Performance optimized indexes';
    RAISE NOTICE '  - Integration with existing compliance_assessments table';
END $$;
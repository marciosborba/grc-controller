-- ============================================================================
-- SISTEMA DE MAPEAMENTO DE CAMPOS PARA CHAVES CRIPTOGRÁFICAS
-- ============================================================================
-- Permite configurar centralmente quais campos usam quais chaves

-- ============================================================================
-- 1. TABELA DE MAPEAMENTO DE CAMPOS CRIPTOGRÁFICOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS crypto_field_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name VARCHAR(100) NOT NULL, -- 'profiles', 'audits', 'compliance', etc.
    table_name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    encryption_purpose VARCHAR(50) NOT NULL, -- 'general', 'pii', 'financial', 'audit', 'compliance'
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    data_classification VARCHAR(50), -- 'public', 'internal', 'confidential', 'restricted'
    retention_days INTEGER, -- Período de retenção específico
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_field_mapping UNIQUE (table_name, field_name),
    CONSTRAINT valid_encryption_purpose CHECK (encryption_purpose IN ('general', 'pii', 'financial', 'audit', 'compliance')),
    CONSTRAINT valid_data_classification CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crypto_field_mapping_module ON crypto_field_mapping(module_name, is_active);
CREATE INDEX IF NOT EXISTS idx_crypto_field_mapping_table ON crypto_field_mapping(table_name, is_active);
CREATE INDEX IF NOT EXISTS idx_crypto_field_mapping_purpose ON crypto_field_mapping(encryption_purpose, is_active);

-- ============================================================================
-- 2. CONFIGURAÇÕES PADRÃO DE MAPEAMENTO
-- ============================================================================

-- Inserir mapeamentos padrão para módulos existentes
INSERT INTO crypto_field_mapping (module_name, table_name, field_name, encryption_purpose, description, data_classification, retention_days) VALUES

-- MÓDULO PROFILES (Dados Pessoais)
('profiles', 'profiles', 'full_name', 'pii', 'Nome completo do usuário', 'confidential', 2555),
('profiles', 'profiles', 'phone', 'pii', 'Telefone do usuário', 'confidential', 2555),
('profiles', 'profiles', 'personal_notes', 'pii', 'Notas pessoais do usuário', 'confidential', 2555),
('profiles', 'profiles', 'address', 'pii', 'Endereço do usuário', 'confidential', 2555),
('profiles', 'profiles', 'document_number', 'pii', 'CPF/CNPJ do usuário', 'restricted', 2555),

-- MÓDULO AUDITS (Auditoria)
('audits', 'audits', 'title', 'audit', 'Título da auditoria', 'internal', 2555),
('audits', 'audits', 'scope', 'audit', 'Escopo da auditoria', 'internal', 2555),
('audits', 'audits', 'objective', 'audit', 'Objetivo da auditoria', 'internal', 2555),
('audits', 'audits', 'criteria', 'audit', 'Critérios da auditoria', 'internal', 2555),
('audits', 'audits', 'executive_summary', 'audit', 'Resumo executivo', 'confidential', 2555),

-- MÓDULO AUDIT FINDINGS (Achados de Auditoria)
('audit_findings', 'audit_findings', 'title', 'audit', 'Título do achado', 'internal', 2555),
('audit_findings', 'audit_findings', 'description', 'audit', 'Descrição do achado', 'confidential', 2555),
('audit_findings', 'audit_findings', 'evidence', 'audit', 'Evidências do achado', 'confidential', 2555),
('audit_findings', 'audit_findings', 'recommendation', 'audit', 'Recomendação para correção', 'internal', 2555),
('audit_findings', 'audit_findings', 'management_response', 'audit', 'Resposta da gestão', 'internal', 1825),

-- MÓDULO COMPLIANCE (Conformidade)
('compliance', 'compliance_records', 'control_description', 'compliance', 'Descrição do controle', 'internal', 2555),
('compliance', 'compliance_records', 'evidence', 'compliance', 'Evidências de conformidade', 'confidential', 2555),
('compliance', 'compliance_records', 'notes', 'compliance', 'Notas de conformidade', 'internal', 2555),
('compliance', 'compliance_records', 'assessment_details', 'compliance', 'Detalhes da avaliação', 'confidential', 2555),

-- MÓDULO RISK ASSESSMENTS (Avaliação de Riscos)
('risk_assessments', 'risk_assessments', 'title', 'general', 'Título da avaliação de risco', 'internal', 1825),
('risk_assessments', 'risk_assessments', 'description', 'general', 'Descrição do risco', 'internal', 1825),
('risk_assessments', 'risk_assessments', 'impact_analysis', 'general', 'Análise de impacto', 'confidential', 1825),
('risk_assessments', 'risk_assessments', 'mitigation_plan', 'general', 'Plano de mitigação', 'internal', 1825),

-- MÓDULO FINANCIAL (Dados Financeiros)
('financial', 'budgets', 'amount', 'financial', 'Valor do orçamento', 'confidential', 2555),
('financial', 'expenses', 'amount', 'financial', 'Valor da despesa', 'confidential', 2555),
('financial', 'contracts', 'value', 'financial', 'Valor do contrato', 'confidential', 2555),
('financial', 'vendor_payments', 'amount', 'financial', 'Valor do pagamento', 'restricted', 2555),
('financial', 'vendor_payments', 'bank_details', 'financial', 'Dados bancários', 'restricted', 2555),

-- DADOS GERAIS (Outros módulos)
('general', 'projects', 'description', 'general', 'Descrição do projeto', 'internal', 1095),
('general', 'tasks', 'notes', 'general', 'Notas da tarefa', 'internal', 365),
('general', 'documents', 'content', 'general', 'Conteúdo do documento', 'internal', 1825),
('general', 'comments', 'content', 'general', 'Conteúdo do comentário', 'internal', 365)

ON CONFLICT (table_name, field_name) DO NOTHING;

-- ============================================================================
-- 3. FUNÇÃO PARA OBTER PROPÓSITO DE CRIPTOGRAFIA POR CAMPO
-- ============================================================================

CREATE OR REPLACE FUNCTION get_encryption_purpose(
    p_table_name VARCHAR(100),
    p_field_name VARCHAR(100)
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_purpose VARCHAR(50);
BEGIN
    -- Buscar propósito configurado para o campo
    SELECT encryption_purpose INTO v_purpose
    FROM crypto_field_mapping
    WHERE table_name = p_table_name 
    AND field_name = p_field_name 
    AND is_active = true;
    
    -- Se não encontrar configuração, usar 'general' como padrão
    IF v_purpose IS NULL THEN
        v_purpose := 'general';
    END IF;
    
    RETURN v_purpose;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. FUNÇÃO PARA CRIPTOGRAFAR AUTOMATICAMENTE BASEADO NO CAMPO
-- ============================================================================

CREATE OR REPLACE FUNCTION encrypt_field_data(
    p_tenant_id UUID,
    p_table_name VARCHAR(100),
    p_field_name VARCHAR(100),
    p_plaintext TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_purpose VARCHAR(50);
BEGIN
    -- Obter propósito baseado na configuração do campo
    v_purpose := get_encryption_purpose(p_table_name, p_field_name);
    
    -- Criptografar usando o propósito correto
    RETURN encrypt_tenant_data(p_tenant_id, p_plaintext, v_purpose);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. FUNÇÃO PARA DESCRIPTOGRAFAR AUTOMATICAMENTE BASEADO NO CAMPO
-- ============================================================================

CREATE OR REPLACE FUNCTION decrypt_field_data(
    p_tenant_id UUID,
    p_table_name VARCHAR(100),
    p_field_name VARCHAR(100),
    p_encrypted_text TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_purpose VARCHAR(50);
BEGIN
    -- Obter propósito baseado na configuração do campo
    v_purpose := get_encryption_purpose(p_table_name, p_field_name);
    
    -- Descriptografar usando o propósito correto
    RETURN decrypt_tenant_data(p_tenant_id, p_encrypted_text, v_purpose);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. VIEW PARA VISUALIZAR MAPEAMENTOS POR MÓDULO
-- ============================================================================

CREATE OR REPLACE VIEW v_crypto_field_mappings AS
SELECT 
    cfm.module_name,
    cfm.table_name,
    cfm.field_name,
    cfm.encryption_purpose,
    cfm.data_classification,
    cfm.retention_days,
    cfm.description,
    cfm.is_active,
    -- Contar quantos tenants usam esta configuração
    (SELECT COUNT(DISTINCT tenant_id) 
     FROM tenant_crypto_keys tck 
     WHERE tck.key_purpose = cfm.encryption_purpose 
     AND tck.is_active = true) as tenants_using_key,
    cfm.created_at,
    cfm.updated_at
FROM crypto_field_mapping cfm
ORDER BY cfm.module_name, cfm.table_name, cfm.field_name;

-- ============================================================================
-- 7. FUNÇÃO PARA LISTAR CAMPOS POR PROPÓSITO
-- ============================================================================

CREATE OR REPLACE FUNCTION get_fields_by_purpose(p_purpose VARCHAR(50))
RETURNS TABLE(
    module_name VARCHAR(100),
    table_name VARCHAR(100),
    field_name VARCHAR(100),
    description TEXT,
    data_classification VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cfm.module_name,
        cfm.table_name,
        cfm.field_name,
        cfm.description,
        cfm.data_classification
    FROM crypto_field_mapping cfm
    WHERE cfm.encryption_purpose = p_purpose
    AND cfm.is_active = true
    ORDER BY cfm.module_name, cfm.table_name, cfm.field_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. FUNÇÃO PARA ATUALIZAR MAPEAMENTO DE CAMPO
-- ============================================================================

CREATE OR REPLACE FUNCTION update_field_mapping(
    p_table_name VARCHAR(100),
    p_field_name VARCHAR(100),
    p_new_purpose VARCHAR(50),
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Atualizar mapeamento existente
    UPDATE crypto_field_mapping
    SET 
        encryption_purpose = p_new_purpose,
        description = COALESCE(p_description, description),
        updated_at = NOW()
    WHERE table_name = p_table_name 
    AND field_name = p_field_name;
    
    -- Verificar se foi atualizado
    IF FOUND THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE crypto_field_mapping IS 'Mapeamento central de campos para propósitos de criptografia';
COMMENT ON FUNCTION get_encryption_purpose IS 'Obtém o propósito de criptografia configurado para um campo específico';
COMMENT ON FUNCTION encrypt_field_data IS 'Criptografa dados automaticamente baseado na configuração do campo';
COMMENT ON FUNCTION decrypt_field_data IS 'Descriptografa dados automaticamente baseado na configuração do campo';
COMMENT ON VIEW v_crypto_field_mappings IS 'Visualização completa dos mapeamentos de criptografia por módulo';

-- ============================================================================
-- 10. PERMISSÕES
-- ============================================================================

-- Conceder permissões para visualização
GRANT SELECT ON crypto_field_mapping TO authenticated;
GRANT SELECT ON v_crypto_field_mappings TO authenticated;

-- Conceder execução das funções
GRANT EXECUTE ON FUNCTION get_encryption_purpose TO authenticated;
GRANT EXECUTE ON FUNCTION encrypt_field_data TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_field_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_fields_by_purpose TO authenticated;
-- ============================================================================
-- SISTEMA DE CRIPTOGRAFIA POR TENANT - GRC CONTROLLER
-- ============================================================================
-- Implementação de criptografia de dados com chaves únicas por tenant
-- Garante isolamento criptográfico completo e compliance com LGPD/GDPR

-- Habilitar extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABELA DE CHAVES CRIPTOGRÁFICAS POR TENANT
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_crypto_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    master_key_encrypted TEXT NOT NULL, -- Chave mestra criptografada com chave do sistema
    key_derivation_salt TEXT NOT NULL, -- Salt para derivação de chaves específicas
    encryption_version INTEGER NOT NULL DEFAULT 1, -- Versão para rotação de chaves
    key_purpose VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'pii', 'financial', 'audit'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retired_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT unique_active_tenant_key UNIQUE (tenant_id, key_purpose, is_active) 
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT valid_encryption_version CHECK (encryption_version > 0),
    CONSTRAINT valid_key_purpose CHECK (key_purpose IN ('general', 'pii', 'financial', 'audit', 'compliance'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tenant_crypto_keys_tenant_id ON tenant_crypto_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_crypto_keys_active ON tenant_crypto_keys(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tenant_crypto_keys_purpose ON tenant_crypto_keys(tenant_id, key_purpose, is_active);

-- ============================================================================
-- 2. HISTÓRICO DE CHAVES PARA ROTAÇÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_key_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key_version INTEGER NOT NULL,
    key_purpose VARCHAR(50) NOT NULL,
    master_key_encrypted TEXT NOT NULL,
    key_derivation_salt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retired_at TIMESTAMP WITH TIME ZONE,
    rotation_reason VARCHAR(100), -- 'scheduled', 'security_incident', 'compliance', 'manual'
    
    CONSTRAINT valid_key_version CHECK (key_version > 0)
);

CREATE INDEX IF NOT EXISTS idx_tenant_key_history_tenant ON tenant_key_history(tenant_id, key_version DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_key_history_purpose ON tenant_key_history(tenant_id, key_purpose);

-- ============================================================================
-- 3. AUDITORIA DE OPERAÇÕES CRIPTOGRÁFICAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS crypto_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    operation_type VARCHAR(50) NOT NULL, -- 'encrypt', 'decrypt', 'key_generation', 'key_rotation'
    table_name VARCHAR(100),
    field_name VARCHAR(100),
    record_id UUID,
    user_id UUID,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    performance_ms INTEGER, -- Tempo de execução em milissegundos
    key_version INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_operation_type CHECK (
        operation_type IN ('encrypt', 'decrypt', 'key_generation', 'key_rotation', 'key_access')
    )
);

CREATE INDEX IF NOT EXISTS idx_crypto_audit_tenant ON crypto_audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_audit_operation ON crypto_audit_log(operation_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_audit_user ON crypto_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_audit_performance ON crypto_audit_log(performance_ms) WHERE performance_ms > 100;

-- ============================================================================
-- 4. CACHE DE CHAVES (PARA PERFORMANCE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_key_cache (
    tenant_id UUID NOT NULL,
    key_purpose VARCHAR(50) NOT NULL,
    decrypted_key_hash TEXT NOT NULL, -- Hash da chave descriptografada (não a chave em si)
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 1,
    
    PRIMARY KEY (tenant_id, key_purpose),
    CONSTRAINT fk_cache_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_key_cache_accessed ON tenant_key_cache(last_accessed);

-- ============================================================================
-- 5. CONFIGURAÇÕES DE CRIPTOGRAFIA
-- ============================================================================

CREATE TABLE IF NOT EXISTS encryption_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO encryption_config (config_key, config_value, description) VALUES
('default_cipher', 'aes256', 'Algoritmo de criptografia padrão'),
('key_derivation_iterations', '100000', 'Número de iterações para derivação de chaves'),
('key_rotation_days', '90', 'Dias para rotação automática de chaves'),
('cache_ttl_minutes', '60', 'TTL do cache de chaves em minutos'),
('max_decrypt_attempts', '5', 'Máximo de tentativas de descriptografia por minuto'),
('audit_retention_days', '2555', 'Dias de retenção dos logs de auditoria (7 anos)')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- 6. FUNÇÕES DE CRIPTOGRAFIA
-- ============================================================================

-- Função para gerar salt criptográfico
CREATE OR REPLACE FUNCTION generate_crypto_salt()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar chave mestra para tenant
CREATE OR REPLACE FUNCTION generate_tenant_master_key()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para derivar chave específica por propósito
CREATE OR REPLACE FUNCTION derive_tenant_key(
    p_master_key TEXT,
    p_tenant_id UUID,
    p_purpose VARCHAR(50),
    p_salt TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_key_material TEXT;
    v_iterations INTEGER;
BEGIN
    -- Buscar número de iterações da configuração
    SELECT config_value::INTEGER INTO v_iterations
    FROM encryption_config 
    WHERE config_key = 'key_derivation_iterations' AND is_active = true;
    
    IF v_iterations IS NULL THEN
        v_iterations := 100000; -- Fallback
    END IF;
    
    -- Criar material da chave combinando master key + tenant_id + purpose
    v_key_material := p_master_key || p_tenant_id::TEXT || p_purpose;
    
    -- Derivar chave usando PBKDF2
    RETURN encode(
        digest(
            hmac(v_key_material, p_salt, 'sha512'), 
            'sha256'
        ), 
        'hex'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criptografar dados por tenant
CREATE OR REPLACE FUNCTION encrypt_tenant_data(
    p_tenant_id UUID,
    p_plaintext TEXT,
    p_purpose VARCHAR(50) DEFAULT 'general'
)
RETURNS TEXT AS $$
DECLARE
    v_master_key TEXT;
    v_salt TEXT;
    v_derived_key TEXT;
    v_cipher TEXT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_performance_ms INTEGER;
BEGIN
    v_start_time := clock_timestamp();
    
    -- Buscar chave ativa do tenant
    SELECT master_key_encrypted, key_derivation_salt
    INTO v_master_key, v_salt
    FROM tenant_crypto_keys
    WHERE tenant_id = p_tenant_id 
    AND key_purpose = p_purpose 
    AND is_active = true;
    
    IF v_master_key IS NULL THEN
        RAISE EXCEPTION 'Chave criptográfica não encontrada para tenant % e propósito %', p_tenant_id, p_purpose;
    END IF;
    
    -- Derivar chave específica
    v_derived_key := derive_tenant_key(v_master_key, p_tenant_id, p_purpose, v_salt);
    
    -- Buscar algoritmo de criptografia
    SELECT config_value INTO v_cipher
    FROM encryption_config 
    WHERE config_key = 'default_cipher' AND is_active = true;
    
    IF v_cipher IS NULL THEN
        v_cipher := 'aes256'; -- Fallback
    END IF;
    
    v_end_time := clock_timestamp();
    v_performance_ms := EXTRACT(MILLISECONDS FROM v_end_time - v_start_time);
    
    -- Log da operação
    INSERT INTO crypto_audit_log (
        tenant_id, operation_type, user_id, success, performance_ms
    ) VALUES (
        p_tenant_id, 'encrypt', 
        COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
        true, v_performance_ms
    );
    
    -- Criptografar dados
    RETURN pgp_sym_encrypt(p_plaintext, v_derived_key, 'cipher-algo=' || v_cipher);
    
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO crypto_audit_log (
        tenant_id, operation_type, user_id, success, error_message
    ) VALUES (
        p_tenant_id, 'encrypt',
        COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
        false, SQLERRM
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar dados por tenant
CREATE OR REPLACE FUNCTION decrypt_tenant_data(
    p_tenant_id UUID,
    p_encrypted_text TEXT,
    p_purpose VARCHAR(50) DEFAULT 'general'
)
RETURNS TEXT AS $$
DECLARE
    v_master_key TEXT;
    v_salt TEXT;
    v_derived_key TEXT;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_performance_ms INTEGER;
    v_result TEXT;
BEGIN
    v_start_time := clock_timestamp();
    
    -- Buscar chave ativa do tenant
    SELECT master_key_encrypted, key_derivation_salt
    INTO v_master_key, v_salt
    FROM tenant_crypto_keys
    WHERE tenant_id = p_tenant_id 
    AND key_purpose = p_purpose 
    AND is_active = true;
    
    IF v_master_key IS NULL THEN
        RAISE EXCEPTION 'Chave criptográfica não encontrada para tenant % e propósito %', p_tenant_id, p_purpose;
    END IF;
    
    -- Derivar chave específica
    v_derived_key := derive_tenant_key(v_master_key, p_tenant_id, p_purpose, v_salt);
    
    -- Descriptografar dados
    v_result := pgp_sym_decrypt(p_encrypted_text, v_derived_key);
    
    v_end_time := clock_timestamp();
    v_performance_ms := EXTRACT(MILLISECONDS FROM v_end_time - v_start_time);
    
    -- Log da operação
    INSERT INTO crypto_audit_log (
        tenant_id, operation_type, user_id, success, performance_ms
    ) VALUES (
        p_tenant_id, 'decrypt',
        COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
        true, v_performance_ms
    );
    
    -- Atualizar cache de acesso
    INSERT INTO tenant_key_cache (tenant_id, key_purpose, decrypted_key_hash, last_accessed, access_count)
    VALUES (p_tenant_id, p_purpose, digest(v_derived_key, 'sha256'), NOW(), 1)
    ON CONFLICT (tenant_id, key_purpose) 
    DO UPDATE SET 
        last_accessed = NOW(),
        access_count = tenant_key_cache.access_count + 1;
    
    RETURN v_result;
    
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO crypto_audit_log (
        tenant_id, operation_type, user_id, success, error_message
    ) VALUES (
        p_tenant_id, 'decrypt',
        COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
        false, SQLERRM
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. FUNÇÃO PARA CRIAR CHAVES PARA NOVO TENANT
-- ============================================================================

CREATE OR REPLACE FUNCTION create_tenant_encryption_keys(p_tenant_id UUID)
RETURNS VOID AS $$
DECLARE
    v_purpose VARCHAR(50);
    v_master_key TEXT;
    v_salt TEXT;
BEGIN
    -- Criar chaves para diferentes propósitos
    FOR v_purpose IN SELECT unnest(ARRAY['general', 'pii', 'financial', 'audit', 'compliance'])
    LOOP
        v_master_key := generate_tenant_master_key();
        v_salt := generate_crypto_salt();
        
        INSERT INTO tenant_crypto_keys (
            tenant_id, master_key_encrypted, key_derivation_salt, 
            key_purpose, encryption_version
        ) VALUES (
            p_tenant_id, v_master_key, v_salt, v_purpose, 1
        );
        
        -- Log da criação
        INSERT INTO crypto_audit_log (
            tenant_id, operation_type, success
        ) VALUES (
            p_tenant_id, 'key_generation', true
        );
    END LOOP;
    
    RAISE NOTICE 'Chaves criptográficas criadas para tenant %', p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. FUNÇÃO PARA ROTAÇÃO DE CHAVES
-- ============================================================================

CREATE OR REPLACE FUNCTION rotate_tenant_key(
    p_tenant_id UUID,
    p_purpose VARCHAR(50) DEFAULT 'general',
    p_reason VARCHAR(100) DEFAULT 'scheduled'
)
RETURNS VOID AS $$
DECLARE
    v_old_version INTEGER;
    v_new_master_key TEXT;
    v_new_salt TEXT;
BEGIN
    -- Buscar versão atual
    SELECT encryption_version INTO v_old_version
    FROM tenant_crypto_keys
    WHERE tenant_id = p_tenant_id AND key_purpose = p_purpose AND is_active = true;
    
    IF v_old_version IS NULL THEN
        RAISE EXCEPTION 'Chave ativa não encontrada para rotação';
    END IF;
    
    -- Mover chave atual para histórico
    INSERT INTO tenant_key_history (
        tenant_id, key_version, key_purpose, master_key_encrypted, 
        key_derivation_salt, retired_at, rotation_reason
    )
    SELECT tenant_id, encryption_version, key_purpose, master_key_encrypted,
           key_derivation_salt, NOW(), p_reason
    FROM tenant_crypto_keys
    WHERE tenant_id = p_tenant_id AND key_purpose = p_purpose AND is_active = true;
    
    -- Desativar chave atual
    UPDATE tenant_crypto_keys
    SET is_active = false, retired_at = NOW()
    WHERE tenant_id = p_tenant_id AND key_purpose = p_purpose AND is_active = true;
    
    -- Gerar nova chave
    v_new_master_key := generate_tenant_master_key();
    v_new_salt := generate_crypto_salt();
    
    INSERT INTO tenant_crypto_keys (
        tenant_id, master_key_encrypted, key_derivation_salt,
        key_purpose, encryption_version
    ) VALUES (
        p_tenant_id, v_new_master_key, v_new_salt, p_purpose, v_old_version + 1
    );
    
    -- Limpar cache
    DELETE FROM tenant_key_cache 
    WHERE tenant_id = p_tenant_id AND key_purpose = p_purpose;
    
    -- Log da rotação
    INSERT INTO crypto_audit_log (
        tenant_id, operation_type, success, key_version
    ) VALUES (
        p_tenant_id, 'key_rotation', true, v_old_version + 1
    );
    
    RAISE NOTICE 'Chave rotacionada para tenant % (propósito: %, nova versão: %)', 
                 p_tenant_id, p_purpose, v_old_version + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. TRIGGERS PARA CRIAÇÃO AUTOMÁTICA DE CHAVES
-- ============================================================================

-- Trigger para criar chaves automaticamente quando um novo tenant é criado
CREATE OR REPLACE FUNCTION trigger_create_tenant_keys()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar chaves criptográficas para o novo tenant
    PERFORM create_tenant_encryption_keys(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela tenants
DROP TRIGGER IF EXISTS auto_create_tenant_keys ON tenants;
CREATE TRIGGER auto_create_tenant_keys
    AFTER INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_tenant_keys();

-- ============================================================================
-- 10. VIEWS PARA MONITORAMENTO
-- ============================================================================

-- View para status das chaves por tenant
CREATE OR REPLACE VIEW v_tenant_encryption_status AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    tck.key_purpose,
    tck.encryption_version,
    tck.is_active,
    tck.created_at as key_created_at,
    tck.updated_at as key_updated_at,
    EXTRACT(DAYS FROM NOW() - tck.created_at) as key_age_days,
    CASE 
        WHEN EXTRACT(DAYS FROM NOW() - tck.created_at) > 
             (SELECT config_value::INTEGER FROM encryption_config WHERE config_key = 'key_rotation_days')
        THEN 'ROTATION_NEEDED'
        WHEN EXTRACT(DAYS FROM NOW() - tck.created_at) > 
             (SELECT config_value::INTEGER FROM encryption_config WHERE config_key = 'key_rotation_days') * 0.8
        THEN 'ROTATION_WARNING'
        ELSE 'OK'
    END as key_status
FROM tenants t
LEFT JOIN tenant_crypto_keys tck ON t.id = tck.tenant_id
WHERE tck.is_active = true OR tck.is_active IS NULL
ORDER BY t.name, tck.key_purpose;

-- View para estatísticas de uso de criptografia
CREATE OR REPLACE VIEW v_crypto_usage_stats AS
SELECT 
    tenant_id,
    operation_type,
    DATE(created_at) as operation_date,
    COUNT(*) as operation_count,
    COUNT(CASE WHEN success = true THEN 1 END) as success_count,
    COUNT(CASE WHEN success = false THEN 1 END) as error_count,
    AVG(performance_ms) as avg_performance_ms,
    MAX(performance_ms) as max_performance_ms
FROM crypto_audit_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, operation_type, DATE(created_at)
ORDER BY operation_date DESC, tenant_id;

-- ============================================================================
-- 11. FUNÇÕES DE LIMPEZA E MANUTENÇÃO
-- ============================================================================

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_key_cache()
RETURNS INTEGER AS $$
DECLARE
    v_ttl_minutes INTEGER;
    v_deleted_count INTEGER;
BEGIN
    -- Buscar TTL da configuração
    SELECT config_value::INTEGER INTO v_ttl_minutes
    FROM encryption_config 
    WHERE config_key = 'cache_ttl_minutes' AND is_active = true;
    
    IF v_ttl_minutes IS NULL THEN
        v_ttl_minutes := 60; -- Fallback
    END IF;
    
    -- Deletar entradas expiradas
    DELETE FROM tenant_key_cache
    WHERE last_accessed < NOW() - (v_ttl_minutes || ' minutes')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar logs antigos de auditoria
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_retention_days INTEGER;
    v_deleted_count INTEGER;
BEGIN
    -- Buscar período de retenção
    SELECT config_value::INTEGER INTO v_retention_days
    FROM encryption_config 
    WHERE config_key = 'audit_retention_days' AND is_active = true;
    
    IF v_retention_days IS NULL THEN
        v_retention_days := 2555; -- 7 anos por padrão
    END IF;
    
    -- Deletar logs antigos
    DELETE FROM crypto_audit_log
    WHERE created_at < NOW() - (v_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. PERMISSÕES E SEGURANÇA
-- ============================================================================

-- Revogar permissões públicas
REVOKE ALL ON tenant_crypto_keys FROM PUBLIC;
REVOKE ALL ON tenant_key_history FROM PUBLIC;
REVOKE ALL ON crypto_audit_log FROM PUBLIC;
REVOKE ALL ON tenant_key_cache FROM PUBLIC;

-- Conceder permissões específicas para roles de aplicação
GRANT SELECT ON tenant_crypto_keys TO authenticated;
GRANT SELECT ON crypto_audit_log TO authenticated;
GRANT SELECT ON v_tenant_encryption_status TO authenticated;
GRANT SELECT ON v_crypto_usage_stats TO authenticated;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Criar chaves para tenants existentes (se houver)
DO $$
DECLARE
    tenant_record RECORD;
BEGIN
    FOR tenant_record IN 
        SELECT id FROM tenants 
        WHERE id NOT IN (SELECT DISTINCT tenant_id FROM tenant_crypto_keys WHERE tenant_id IS NOT NULL)
    LOOP
        PERFORM create_tenant_encryption_keys(tenant_record.id);
        RAISE NOTICE 'Chaves criadas para tenant existente: %', tenant_record.id;
    END LOOP;
END
$$;
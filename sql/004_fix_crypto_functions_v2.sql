-- ============================================================================
-- CORREÇÃO DAS FUNÇÕES DE CRIPTOGRAFIA - VERSÃO 2
-- ============================================================================
-- Corrige as funções para usar corretamente as funções pgcrypto

-- Função corrigida para criptografar dados por tenant
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
    v_encrypted_bytea BYTEA;
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
    
    -- Criptografar dados usando extensions.pgp_sym_encrypt
    v_encrypted_bytea := extensions.pgp_sym_encrypt(p_plaintext, v_derived_key, 'cipher-algo=' || v_cipher);
    
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
    
    -- Retornar como texto hexadecimal
    RETURN encode(v_encrypted_bytea, 'hex');
    
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

-- Função corrigida para descriptografar dados por tenant
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
    v_encrypted_bytea BYTEA;
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
    
    -- Converter texto hexadecimal para bytea
    v_encrypted_bytea := decode(p_encrypted_text, 'hex');
    
    -- Descriptografar dados usando extensions.pgp_sym_decrypt
    v_result := extensions.pgp_sym_decrypt(v_encrypted_bytea, v_derived_key);
    
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
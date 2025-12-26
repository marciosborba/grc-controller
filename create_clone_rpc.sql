CREATE OR REPLACE FUNCTION clone_framework(source_framework_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (postgres) to bypass RLS on source if needed
AS $$
DECLARE
    new_fw_id UUID;
    new_domain_id UUID;
    new_control_id UUID;
    src_domain RECORD;
    src_control RECORD;
    src_question RECORD;
    source_fw assessment_frameworks%ROWTYPE;
    current_user_tenant_id UUID;
BEGIN
    -- Get current user's tenant_id (assuming handled by auth.uid() or passed in context)
    -- In Supabase, auth.uid() gives user ID. We need the tenant_id.
    -- Usually stored in users table or jwt.
    -- For simplicity, we will query the source framework's tenant_id if we want to clone within same tenant,
    -- or we assume the caller passes the target tenant.
    -- Wait, this function signature `clone_framework(source_framework_id UUID)` relies on context.
    -- Let's check `auth.jwt() -> 'app_metadata' -> 'tenant_id'`.
    -- Or we can assume the user is logged in and selects their own tenant.
    
    -- Robust approach: Get tenant_id from the session configuration or pass it as param.
    -- Since we call this from client, we can retrieve tenant_id from the `assessment_frameworks` table for the *target*?
    -- No, we are creating a NEW one.
    
    -- Let's change signature to `clone_framework(source_framework_id UUID, target_tenant_id UUID)`.
    -- If target_tenant_id is null, try to infer? No, explict is better.
    
    -- RE-DEF below.
    NULL;
END;
$$;

CREATE OR REPLACE FUNCTION clone_framework(source_framework_id UUID, target_tenant_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_fw_id UUID;
    new_domain_id UUID;
    new_control_id UUID;
    src_domain RECORD;
    src_control RECORD;
    src_question RECORD;
    src_fw assessment_frameworks%ROWTYPE;
BEGIN
    -- 1. Get Source Framework
    SELECT * INTO src_fw FROM assessment_frameworks WHERE id = source_framework_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Framework not found';
    END IF;

    -- 2. Create Clone Framework
    INSERT INTO assessment_frameworks (
        tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, 
        is_standard, publico, status, peso_total, created_at, updated_at
    ) VALUES (
        target_tenant_id,
        src_fw.nome || ' (Cópia)',
        src_fw.codigo || '_COPY_' || floor(extract(epoch from now())), -- Unique code
        src_fw.descricao,
        src_fw.versao,
        src_fw.tipo_framework,
        src_fw.categoria,
        false, -- Clone is NOT standard
        false, -- Clone is NOT public
        'ativo',
        src_fw.peso_total,
        now(),
        now()
    ) RETURNING id INTO new_fw_id;

    -- 3. Clone Domains
    FOR src_domain IN SELECT * FROM assessment_domains WHERE framework_id = source_framework_id ORDER BY ordem LOOP
        INSERT INTO assessment_domains (
            framework_id, tenant_id, nome, codigo, descricao, ordem, peso, ativo, created_at, updated_at
        ) VALUES (
            new_fw_id,
            target_tenant_id,
            src_domain.nome,
            src_domain.codigo,
            src_domain.descricao,
            src_domain.ordem,
            src_domain.peso,
            src_domain.ativo,
            now(),
            now()
        ) RETURNING id INTO new_domain_id;

        -- 4. Clone Controls
        FOR src_control IN SELECT * FROM assessment_controls WHERE domain_id = src_domain.id ORDER BY ordem LOOP
            INSERT INTO assessment_controls (
                domain_id, framework_id, tenant_id, codigo, titulo, descricao, objetivo, 
                tipo_controle, criticidade, peso, ordem, ativo, created_at, updated_at
            ) VALUES (
                new_domain_id,
                new_fw_id,
                target_tenant_id,
                src_control.codigo,
                src_control.titulo,
                src_control.descricao,
                src_control.objetivo,
                src_control.tipo_controle,
                src_control.criticidade,
                src_control.peso,
                src_control.ordem,
                src_control.ativo,
                now(),
                now()
            ) RETURNING id INTO new_control_id;

            -- 5. Clone Questions
            INSERT INTO assessment_questions (
                control_id, tenant_id, codigo, texto, descricao, ordem, tipo_pergunta, 
                opcoes_resposta, obrigatoria, valor_minimo, valor_maximo, regex_validacao, 
                peso, mapeamento_pontuacao, condicoes_exibicao, dependencias, texto_ajuda, 
                exemplos, referencias, ativa, evidencias_requeridas, created_at, updated_at
            )
            SELECT 
                new_control_id, target_tenant_id, codigo, texto, descricao, ordem, tipo_pergunta, 
                opcoes_resposta, obrigatoria, valor_minimo, valor_maximo, regex_validacao, 
                peso, mapeamento_pontuacao, condicoes_exibicao, dependencias, texto_ajuda, 
                exemplos, referencias, ativa, evidencias_requeridas, now(), now()
            FROM assessment_questions
            WHERE control_id = src_control.id;
            
        END LOOP;
    END LOOP;

    RETURN new_fw_id;
END;
$$;

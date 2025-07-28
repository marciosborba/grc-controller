-- Criar usuário administrador de teste
-- Este é um método temporário para criar um usuário admin diretamente

-- Função para criar usuário admin (temporária)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Inserir usuário diretamente na tabela auth.users
    INSERT INTO auth.users (
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        raw_app_meta_data,
        confirmation_token,
        email_change_token_new,
        recovery_token
    ) VALUES (
        gen_random_uuid(),
        'authenticated',
        'authenticated', 
        'admin@grc-controller.com',
        crypt('Admin123!@#', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Administrador do Sistema"}',
        '{}',
        '',
        '',
        ''
    ) 
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('Admin123!@#', gen_salt('bf')),
        updated_at = NOW()
    RETURNING id INTO admin_user_id;

    -- Se o usuário já existia, pegar o ID
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@grc-controller.com';
    END IF;

    -- Criar perfil se não existir
    INSERT INTO public.profiles (
        user_id,
        full_name,
        job_title,
        is_active,
        email
    ) VALUES (
        admin_user_id,
        'Administrador do Sistema',
        'Administrador',
        true,
        'admin@grc-controller.com'
    ) ON CONFLICT (user_id) DO UPDATE SET
        full_name = 'Administrador do Sistema',
        job_title = 'Administrador',
        is_active = true;

    -- Atribuir role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Usuário admin criado/atualizado com sucesso!';
END
$$;
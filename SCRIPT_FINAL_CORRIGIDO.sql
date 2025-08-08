-- =====================================================
-- SCRIPT FINAL CORRIGIDO - MIGRAÇÃO + USUÁRIO
-- =====================================================
-- Este script corrige o problema do provider_id na tabela identities

-- PARTE 1: APLICAR MIGRAÇÃO MULTI-TENANT (apenas as tabelas essenciais)
-- =====================================================

-- Criar enum para tipos de papel do sistema
DO $$ BEGIN
    CREATE TYPE platform_role AS ENUM ('platform_admin', 'tenant_admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de tenants (organizações)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    billing_email VARCHAR(255),
    max_users INTEGER DEFAULT 10 NOT NULL,
    current_users_count INTEGER DEFAULT 0,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT max_users_positive CHECK (max_users > 0),
    CONSTRAINT current_users_non_negative CHECK (current_users_count >= 0),
    CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial'))
);

-- Criar tabela para administradores da plataforma
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    role platform_role DEFAULT 'platform_admin',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Adicionar tenant_id à tabela profiles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
        ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Inserir tenant padrão
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES ('Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true)
ON CONFLICT (slug) DO UPDATE SET 
    contact_email = EXCLUDED.contact_email,
    max_users = EXCLUDED.max_users,
    is_active = true;

-- Função para verificar se usuário é admin da plataforma
CREATE OR REPLACE FUNCTION is_platform_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE user_id = user_id_param
    );
END;
$$;

-- PARTE 2: CRIAR USUÁRIO ADMINISTRADOR (método simplificado)
-- =====================================================

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    existing_user_id UUID;
    tenant_principal_id UUID;
    identity_id UUID := gen_random_uuid();
BEGIN
    -- Obter ID do tenant principal
    SELECT id INTO tenant_principal_id FROM tenants WHERE slug = 'principal';
    
    -- Verificar se usuário já existe
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'adm@grc-controller.com';
    
    IF existing_user_id IS NOT NULL THEN
        -- Usar usuário existente
        new_user_id := existing_user_id;
        RAISE NOTICE 'Usuário já existe, configurando permissões...';
    ELSE
        -- Criar novo usuário na tabela auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000'::uuid,
            'authenticated',
            'authenticated',
            'adm@grc-controller.com',
            crypt('Teste123!@#', gen_salt('bf')),
            now(), -- Email confirmado automaticamente
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Administrador da Plataforma"}',
            false
        );
        
        -- Criar identity com provider_id corrigido
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at,
            email
        ) VALUES (
            identity_id,
            new_user_id,
            json_build_object(
                'sub', new_user_id::text,
                'email', 'adm@grc-controller.com',
                'provider_id', new_user_id::text
            ),
            'email',
            new_user_id::text, -- provider_id obrigatório
            now(),
            now(),
            now(),
            'adm@grc-controller.com'
        );
        
        RAISE NOTICE 'Usuário criado: %', new_user_id;
    END IF;
    
    -- Criar/atualizar perfil do usuário
    INSERT INTO profiles (
        user_id,
        full_name,
        job_title,
        tenant_id,
        is_active,
        email,
        permissions,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'Administrador da Plataforma',
        'Platform Administrator',
        tenant_principal_id,
        true,
        'adm@grc-controller.com',
        '[]'::jsonb,
        now(),
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        job_title = EXCLUDED.job_title,
        tenant_id = EXCLUDED.tenant_id,
        is_active = true,
        email = EXCLUDED.email,
        updated_at = now();
    
    -- Criar role de admin do sistema (se tabela existir)
    BEGIN
        INSERT INTO user_roles (user_id, role, created_at) 
        VALUES (new_user_id, 'admin', now())
        ON CONFLICT (user_id, role) DO NOTHING;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Tabela user_roles não existe, pulando...';
    END;
    
    -- Criar entrada como administrador da plataforma
    INSERT INTO platform_admins (
        user_id,
        role,
        permissions,
        created_at,
        created_by
    ) VALUES (
        new_user_id,
        'platform_admin',
        '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
        now(),
        new_user_id
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions;
    
    RAISE NOTICE '✅ CONFIGURAÇÃO COMPLETA!';
    RAISE NOTICE 'Email: adm@grc-controller.com';
    RAISE NOTICE 'Senha: Teste123!@#';
    
END $$;

-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
    '🎉 USUÁRIO ADMINISTRADOR CONFIGURADO!' as status,
    u.id as user_id,
    u.email,
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmado' ELSE '❌ Não confirmado' END as email_status,
    p.full_name,
    p.job_title,
    t.name as tenant,
    pa.role as platform_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN tenants t ON p.tenant_id = t.id  
LEFT JOIN platform_admins pa ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';

-- Verificar se usuário pode fazer login
SELECT 
    'TESTE DE LOGIN' as tipo,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        WHEN u.encrypted_password IS NULL THEN '❌ Senha não definida'
        WHEN NOT u.is_super_admin AND u.role != 'authenticated' THEN '⚠️ Role incorreta'
        ELSE '✅ Usuário OK para login'
    END as status_login
FROM auth.users u
WHERE u.email = 'adm@grc-controller.com';

-- Mostrar credenciais
SELECT 
    '🔑 CREDENCIAIS PARA LOGIN' as info,
    'adm@grc-controller.com' as email,
    'Teste123!@#' as senha,
    'http://localhost:8081' as url_da_aplicacao;

-- Comandos úteis para debug se necessário:
-- SELECT * FROM auth.users WHERE email = 'adm@grc-controller.com';
-- SELECT * FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'adm@grc-controller.com');
-- SELECT * FROM profiles WHERE email = 'adm@grc-controller.com';
-- SELECT * FROM platform_admins WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com');
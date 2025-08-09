-- Script para FORÇAR criação do usuário administrador
-- Execute este script se o usuário não foi criado no Dashboard

-- ATENÇÃO: Este método usa inserção direta na tabela auth.users
-- Só use se não conseguir criar pelo Dashboard do Supabase

-- 1. Gerar um UUID para o usuário (execute primeiro para obter um ID)
SELECT gen_random_uuid() as novo_user_id;

-- 2. APÓS obter o UUID acima, substitua 'UUID_GERADO_AQUI' e execute o restante:

BEGIN;

-- Inserir usuário diretamente na tabela auth (método avançado)
-- ⚠️ SUBSTITUA 'UUID_GERADO_AQUI' pelo UUID obtido no passo 1
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone_confirmed_at,
    email_change_confirm_status,
    banned_until,
    reauthentication_sent_at,
    is_sso_user
)
VALUES (
    'UUID_GERADO_AQUI', -- ⚠️ SUBSTITUA pelo UUID gerado
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'adm@grc-controller.com',
    crypt('Teste123!@#', gen_salt('bf')), -- Hash da senha
    now(), -- Email já confirmado
    now(),
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador da Plataforma", "job_title": "Platform Administrator"}',
    false,
    now(),
    now(),
    null,
    0,
    null,
    null,
    false
)
ON CONFLICT (id) DO NOTHING;

-- Inserir na tabela identities
-- ⚠️ SUBSTITUA 'UUID_GERADO_AQUI' pelo mesmo UUID
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'UUID_GERADO_AQUI', -- ⚠️ SUBSTITUA pelo UUID gerado
    '{"sub": "UUID_GERADO_AQUI", "email": "adm@grc-controller.com"}', -- ⚠️ SUBSTITUA também aqui
    'email',
    now(),
    now(),
    now()
)
ON CONFLICT (provider, id) DO NOTHING;

-- 3. Criar tenant padrão
INSERT INTO tenants (
    name, 
    slug, 
    contact_email, 
    max_users, 
    subscription_plan, 
    subscription_status,
    is_active
)
VALUES (
    'Organização Principal',
    'principal',
    'adm@grc-controller.com',
    1000,
    'enterprise',
    'active',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    contact_email = EXCLUDED.contact_email,
    max_users = EXCLUDED.max_users,
    is_active = EXCLUDED.is_active;

-- 4. Criar perfil
-- ⚠️ SUBSTITUA 'UUID_GERADO_AQUI' pelo mesmo UUID
INSERT INTO profiles (
    user_id,
    full_name,
    job_title,
    tenant_id,
    is_active,
    email,
    permissions
)
VALUES (
    'UUID_GERADO_AQUI', -- ⚠️ SUBSTITUA pelo UUID gerado
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
    true,
    'adm@grc-controller.com',
    '[]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    job_title = EXCLUDED.job_title,
    tenant_id = EXCLUDED.tenant_id,
    is_active = EXCLUDED.is_active,
    email = EXCLUDED.email;

-- 5. Criar role admin
-- ⚠️ SUBSTITUA 'UUID_GERADO_AQUI' pelo mesmo UUID
INSERT INTO user_roles (user_id, role)
VALUES (
    'UUID_GERADO_AQUI', -- ⚠️ SUBSTITUA pelo UUID gerado
    'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Criar platform admin
-- ⚠️ SUBSTITUA 'UUID_GERADO_AQUI' pelo mesmo UUID (2 vezes)
INSERT INTO platform_admins (
    user_id,
    role,
    permissions,
    created_by
)
VALUES (
    'UUID_GERADO_AQUI', -- ⚠️ SUBSTITUA pelo UUID gerado
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
    'UUID_GERADO_AQUI' -- ⚠️ SUBSTITUA pelo UUID gerado
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

COMMIT;

-- 7. Verificação final
SELECT 
    '✅ USUÁRIO CRIADO COM SUCESSO!' as status,
    u.id,
    u.email,
    u.email_confirmed_at,
    p.full_name,
    pa.role as platform_role
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
JOIN platform_admins pa ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';

-- Mostrar credenciais para teste
SELECT 
    '🔑 CREDENCIAIS PARA LOGIN:' as info,
    'adm@grc-controller.com' as email,
    'Teste123!@#' as senha;
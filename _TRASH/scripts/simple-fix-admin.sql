-- SCRIPT SIMPLES PARA CORRIGIR LOGIN DO ADMIN
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Primeiro vamos verificar o que existe
SELECT 
    'DIAGNÓSTICO ATUAL' as status,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'adm@grc-controller.com') as auth_users,
    (SELECT COUNT(*) FROM profiles WHERE email = 'adm@grc-controller.com') as profiles,
    (SELECT COUNT(*) FROM platform_admins WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com')) as platform_admins,
    (SELECT COUNT(*) FROM tenants WHERE slug = 'principal') as tenants;

-- PASSO 2: Se não existir usuário, pare aqui e crie no Dashboard primeiro!
-- Dashboard → Authentication → Users → Add user
-- Email: adm@grc-controller.com
-- Password: Teste123!@#
-- ✅ Auto Confirm User

-- PASSO 3: Obter o ID do usuário (anote este ID!)
SELECT 
    'ID DO USUÁRIO (COPIE ESTE!)' as info,
    id as user_id_para_copiar,
    email,
    email_confirmed_at
FROM auth.users 
WHERE email = 'adm@grc-controller.com';

-- PASSO 4: Criar estrutura completa
-- ⚠️ SUBSTITUA 'COLE_O_USER_ID_AQUI' pelo ID obtido no PASSO 3

-- Criar tenant principal
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES ('Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true)
ON CONFLICT (slug) DO UPDATE SET 
    contact_email = EXCLUDED.contact_email,
    is_active = true;

-- Criar perfil (SUBSTITUA o USER_ID)
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
)
SELECT 
    'COLE_O_USER_ID_AQUI'::uuid,  -- ⚠️ SUBSTITUA ESTE VALOR
    'Administrador da Plataforma',
    'Platform Administrator',
    t.id,
    true,
    'adm@grc-controller.com',
    '[]'::jsonb,
    now(),
    now()
FROM tenants t WHERE t.slug = 'principal'
ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    job_title = EXCLUDED.job_title,
    tenant_id = EXCLUDED.tenant_id,
    is_active = true,
    email = EXCLUDED.email,
    updated_at = now();

-- Criar role admin (SUBSTITUA o USER_ID)
INSERT INTO user_roles (user_id, role, created_at)
VALUES ('COLE_O_USER_ID_AQUI'::uuid, 'admin', now())  -- ⚠️ SUBSTITUA ESTE VALOR
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar platform admin (SUBSTITUA o USER_ID)
INSERT INTO platform_admins (user_id, role, permissions, created_at)
VALUES (
    'COLE_O_USER_ID_AQUI'::uuid,  -- ⚠️ SUBSTITUA ESTE VALOR
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- PASSO 5: Verificação final
SELECT 
    '🎉 CONFIGURAÇÃO COMPLETA!' as status,
    u.id,
    u.email,
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmado' ELSE '❌ Não confirmado' END as email_status,
    p.full_name,
    pa.role as platform_role,
    ur.role as system_role,
    t.name as tenant
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN platform_admins pa ON u.id = pa.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'admin'
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE u.email = 'adm@grc-controller.com';

-- CREDENCIAIS PARA LOGIN:
SELECT 
    '🔑 CREDENCIAIS PARA TESTE' as info,
    'adm@grc-controller.com' as email,
    'Teste123!@#' as password,
    'http://localhost:8081' as app_url;
-- Script SQL para criar usuário administrador da plataforma
-- Email: adm@grc-controller.com
-- Senha: Teste123!@#

-- IMPORTANTE: Este script deve ser executado APÓS criar o usuário manualmente
-- no Supabase Dashboard ou via API, pois não podemos criar usuários diretamente no SQL

-- Passo 1: Primeiro crie o usuário no Supabase Dashboard:
-- 1. Vá para Supabase Dashboard > Authentication > Users
-- 2. Clique em "Add user"
-- 3. Email: adm@grc-controller.com
-- 4. Password: Teste123!@#
-- 5. Confirme o email automaticamente
-- 6. Copie o ID do usuário gerado

-- Passo 2: Execute este script substituindo USER_ID_AQUI pelo ID real:

-- Criar tenant padrão se não existir
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES (
    'Organização Principal',
    'principal',
    'adm@grc-controller.com',
    1000,
    'enterprise',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Obter ID do tenant (para usar nas próximas inserções)
-- Substitua TENANT_ID_AQUI pelo ID retornado:
-- SELECT id FROM tenants WHERE slug = 'principal';

-- Criar perfil do usuário (SUBSTITUA OS IDs)
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
    'USER_ID_AQUI', -- Substituir pelo ID real do usuário
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'), -- Busca automaticamente o tenant
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

-- Criar role admin (SUBSTITUA USER_ID_AQUI)
INSERT INTO user_roles (user_id, role)
VALUES (
    'USER_ID_AQUI', -- Substituir pelo ID real do usuário
    'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar entrada como administrador da plataforma (SUBSTITUA USER_ID_AQUI)
INSERT INTO platform_admins (
    user_id,
    role,
    permissions,
    created_at
)
VALUES (
    'USER_ID_AQUI', -- Substituir pelo ID real do usuário
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- Verificar se foi criado corretamente
SELECT 
    pa.*,
    p.full_name,
    p.email,
    t.name as tenant_name
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
JOIN tenants t ON p.tenant_id = t.id
WHERE p.email = 'adm@grc-controller.com';

-- Comandos úteis para verificação:
-- SELECT id, email, created_at FROM auth.users WHERE email = 'adm@grc-controller.com';
-- SELECT * FROM profiles WHERE email = 'adm@grc-controller.com';
-- SELECT * FROM platform_admins WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com');
-- Script simplificado para criar platform admin
-- Execute este script no SQL Editor do Supabase Dashboard
-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo ID do usuário criado

-- 1. PRIMEIRO: Crie o usuário manualmente no Dashboard:
--    Authentication > Users > Add user
--    Email: adm@grc-controller.com
--    Password: Teste123!@#  
--    ✅ Marque "Auto-confirm user"
--    Copie o User ID gerado

-- 2. SUBSTITUA SEU_USER_ID_AQUI pelo ID real do usuário e execute:

BEGIN;

-- Desabilitar RLS temporariamente
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Criar tenant principal
INSERT INTO tenants (
    name, slug, contact_email, max_users, subscription_plan, is_active
) VALUES (
    'Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true
) ON CONFLICT (slug) DO NOTHING;

-- Criar perfil (SEM permissions por enquanto)
INSERT INTO profiles (
    user_id, full_name, job_title, tenant_id, is_active, email
) VALUES (
    'SEU_USER_ID_AQUI',  -- SUBSTITUA AQUI
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
    true,
    'adm@grc-controller.com'
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    job_title = EXCLUDED.job_title,
    tenant_id = EXCLUDED.tenant_id,
    is_active = EXCLUDED.is_active,
    email = EXCLUDED.email;

-- Criar role admin
INSERT INTO user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin')  -- SUBSTITUA AQUI
ON CONFLICT DO NOTHING;

-- Criar platform admin
INSERT INTO platform_admins (user_id, role, permissions)
VALUES (
    'SEU_USER_ID_AQUI',  -- SUBSTITUA AQUI
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- Reabilitar RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 
    'SUCCESS!' as status,
    p.user_id,
    p.email,
    p.full_name,
    pa.role as platform_role,
    ur.role as system_role,
    t.name as tenant_name
FROM profiles p
JOIN platform_admins pa ON p.user_id = pa.user_id
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.email = 'adm@grc-controller.com';

COMMIT;

-- Se você ver "SUCCESS!" e os dados do usuário, está pronto!
-- Faça login na aplicação com adm@grc-controller.com / Teste123!@#
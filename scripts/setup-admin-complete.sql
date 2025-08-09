-- Script completo para configurar administrador da plataforma
-- INSTRUÇÕES:
-- 1. Primeiro crie o usuário no Supabase Dashboard:
--    Email: adm@grc-controller.com
--    Senha: Teste123!@#
-- 2. Copie o ID do usuário criado
-- 3. Substitua 'COLE_SEU_USER_ID_AQUI' pelo ID real em TODAS as ocorrências abaixo
-- 4. Execute este script no SQL Editor do Supabase

-- EXEMPLO DE ID: a1b2c3d4-e5f6-7890-1234-567890abcdef

BEGIN;

-- 1. Criar tenant padrão se não existir
INSERT INTO tenants (
    id,
    name, 
    slug, 
    contact_email, 
    max_users, 
    subscription_plan, 
    subscription_status,
    is_active,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'Organização Principal',
    'principal',
    'adm@grc-controller.com',
    1000,
    'enterprise',
    'active',
    true,
    now(),
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    contact_email = EXCLUDED.contact_email,
    max_users = EXCLUDED.max_users,
    subscription_plan = EXCLUDED.subscription_plan,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- 2. Criar perfil do usuário (⚠️ SUBSTITUA 'COLE_SEU_USER_ID_AQUI' pelo ID real)
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
VALUES (
    'COLE_SEU_USER_ID_AQUI', -- ⚠️ SUBSTITUA ESTE VALOR
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
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
    is_active = EXCLUDED.is_active,
    email = EXCLUDED.email,
    updated_at = now();

-- 3. Criar role admin (⚠️ SUBSTITUA 'COLE_SEU_USER_ID_AQUI' pelo ID real)
INSERT INTO user_roles (user_id, role, created_at)
VALUES (
    'COLE_SEU_USER_ID_AQUI', -- ⚠️ SUBSTITUA ESTE VALOR
    'admin',
    now()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Criar administrador da plataforma (⚠️ SUBSTITUA 'COLE_SEU_USER_ID_AQUI' pelo ID real)
INSERT INTO platform_admins (
    user_id,
    role,
    permissions,
    created_at,
    created_by
)
VALUES (
    'COLE_SEU_USER_ID_AQUI', -- ⚠️ SUBSTITUA ESTE VALOR
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
    now(),
    'COLE_SEU_USER_ID_AQUI' -- ⚠️ SUBSTITUA ESTE VALOR
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    created_at = now();

COMMIT;

-- 5. Verificação final
SELECT 
    '🎉 SUCESSO! Administrador da plataforma configurado!' as status,
    pa.role as platform_role,
    ur.role as system_role,
    p.full_name,
    p.email,
    t.name as tenant_name,
    t.slug as tenant_slug,
    pa.permissions::jsonb as platform_permissions
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
JOIN tenants t ON p.tenant_id = t.id
LEFT JOIN user_roles ur ON pa.user_id = ur.user_id
WHERE p.email = 'adm@grc-controller.com';

-- Comandos adicionais de verificação (opcional):
-- SELECT 'Usuário Auth' as tipo, id, email, created_at FROM auth.users WHERE email = 'adm@grc-controller.com'
-- UNION ALL
-- SELECT 'Perfil' as tipo, user_id::text, email, created_at FROM profiles WHERE email = 'adm@grc-controller.com'
-- UNION ALL  
-- SELECT 'Platform Admin' as tipo, user_id::text, role, created_at FROM platform_admins WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com');

-- Para reverter (se necessário):
-- DELETE FROM platform_admins WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com');
-- DELETE FROM user_roles WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com');
-- DELETE FROM profiles WHERE email = 'adm@grc-controller.com';
-- -- (O usuário auth deve ser removido manualmente no Dashboard)
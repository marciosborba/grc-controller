-- Script para corrigir o platform admin
-- Inserir usuário admin@grc-controller.com na tabela platform_admins

INSERT INTO platform_admins (user_id, role, permissions, created_at)
SELECT 
    u.id, 
    'platform_admin'::platform_role, 
    '["platform_admin", "tenants.manage", "users.manage"]'::JSONB,
    NOW()
FROM auth.users u 
WHERE u.email = 'adm@grc-controller.com'
AND NOT EXISTS (
    SELECT 1 FROM platform_admins pa WHERE pa.user_id = u.id
);

-- Verificar se foi inserido
SELECT 
    pa.id,
    pa.user_id,
    u.email,
    pa.role,
    pa.permissions,
    pa.created_at
FROM platform_admins pa
JOIN auth.users u ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';
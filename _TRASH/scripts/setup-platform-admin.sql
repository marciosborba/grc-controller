-- Script para configurar o primeiro administrador da plataforma
-- Execute este script após aplicar as migrações multi-tenant

-- Substitua os valores abaixo pelo usuário que deve ser o administrador da plataforma
-- USER_EMAIL: email do usuário existente que deve se tornar admin da plataforma
-- USER_ID: ID do usuário (busque na tabela auth.users)

-- Exemplo de como encontrar o USER_ID:
-- SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Inserir o usuário como administrador da plataforma
-- SUBSTITUA 'USER_ID_AQUI' pelo ID real do usuário
INSERT INTO platform_admins (user_id, role, permissions, created_at)
VALUES (
    'USER_ID_AQUI', -- Substituir pelo ID real do usuário
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin"]',
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- Exemplo prático (descomente e substitua pelos valores corretos):
/*
INSERT INTO platform_admins (user_id, role, permissions, created_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- ID do usuário admin
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin"]',
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;
*/

-- Verificar se foi criado com sucesso
-- SELECT * FROM platform_admins;
-- Script para corrigir permissões do usuário Marcio Borba
-- ID: 0c5c1433-2682-460c-992a-f4cce57c0d6d

-- 1. Verificar estado atual do usuário
SELECT 
    id, 
    email, 
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE id = '0c5c1433-2682-460c-992a-f4cce57c0d6d';

-- 2. Verificar perfil atual
SELECT 
    id,
    user_id,
    full_name,
    tenant_id,
    created_at
FROM profiles 
WHERE user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d';

-- 3. Verificar roles atuais
SELECT 
    id,
    user_id,
    role,
    created_at
FROM user_roles 
WHERE user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d';

-- 4. CORRIGIR: Adicionar roles de admin
INSERT INTO user_roles (user_id, role) 
VALUES 
    ('0c5c1433-2682-460c-992a-f4cce57c0d6d', 'platform_admin'),
    ('0c5c1433-2682-460c-992a-f4cce57c0d6d', 'super_admin'),
    ('0c5c1433-2682-460c-992a-f4cce57c0d6d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Verificar se as roles foram adicionadas
SELECT 
    user_id,
    role,
    created_at
FROM user_roles 
WHERE user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d'
ORDER BY created_at;

-- 6. Verificar se existe tabela de permissões
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%permission%';

-- 7. Se existir tabela user_permissions, adicionar permissões
-- (Descomente se a tabela existir)
/*
INSERT INTO user_permissions (user_id, permission) 
VALUES 
    ('0c5c1433-2682-460c-992a-f4cce57c0d6d', 'platform_admin'),
    ('0c5c1433-2682-460c-992a-f4cce57c0d6d', '*'),
    ('0c5c1433-2682-460c-992a-f4cce57c0d6d', 'all')
ON CONFLICT (user_id, permission) DO NOTHING;
*/
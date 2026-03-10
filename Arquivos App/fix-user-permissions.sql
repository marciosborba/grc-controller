-- Script para corrigir permissões do usuário específico
-- Execute no SQL Editor do Supabase

-- 1. Verificar dados do usuário específico
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE id = '0c5c1433-2682-460c-992a-f4cce57c0d6d';

-- 2. Verificar roles atuais do usuário
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at
FROM user_roles ur
WHERE ur.user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d'
ORDER BY ur.created_at DESC;

-- 3. Verificar se já tem platform_admin
SELECT 
  COUNT(*) as has_platform_admin
FROM user_roles ur
WHERE ur.user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d'
  AND ur.role = 'platform_admin';

-- 4. Adicionar platform_admin se não existir
INSERT INTO user_roles (user_id, role)
SELECT 
  '0c5c1433-2682-460c-992a-f4cce57c0d6d',
  'platform_admin'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d' 
  AND role = 'platform_admin'
);

-- 5. Verificar resultado final
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.user_id = '0c5c1433-2682-460c-992a-f4cce57c0d6d'
ORDER BY ur.created_at DESC;

-- 6. Verificar todas as roles de platform_admin
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
ORDER BY ur.created_at DESC;
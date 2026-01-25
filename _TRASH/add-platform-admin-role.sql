-- Script para adicionar role de platform admin ao usuário
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos ver todos os usuários existentes
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar roles existentes para todos os usuários
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC;

-- 3. Para adicionar role de platform admin ao usuário mais recente:
-- (Substitua o user_id pelo ID do usuário correto)

-- Exemplo: Adicionar platform_admin ao usuário mais recente
INSERT INTO user_roles (user_id, role)
SELECT 
  id,
  'platform_admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'  -- Substitua pelo email correto
ON CONFLICT (user_id, role) DO NOTHING;

-- OU, se você souber o user_id específico:
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('user-id-aqui', 'platform_admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verificar se a role foi adicionada
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
ORDER BY ur.created_at DESC;
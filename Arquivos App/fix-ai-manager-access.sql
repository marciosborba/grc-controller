-- Script para corrigir acesso ao AI Manager
-- Execute no SQL Editor do Supabase

-- 1. Verificar usuários existentes
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar roles atuais
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC;

-- 3. Adicionar platform_admin ao usuário mais recente (ajuste conforme necessário)
-- IMPORTANTE: Substitua o email pelo email correto do usuário

-- Opção A: Se você souber o email do usuário
INSERT INTO user_roles (user_id, role)
SELECT 
  au.id,
  'platform_admin'
FROM auth.users au
WHERE au.email = 'seu-email@exemplo.com'  -- SUBSTITUA PELO EMAIL CORRETO
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = au.id 
    AND ur.role = 'platform_admin'
  );

-- Opção B: Adicionar ao usuário mais recente (se houver apenas um usuário)
INSERT INTO user_roles (user_id, role)
SELECT 
  au.id,
  'platform_admin'
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verificar se a role foi adicionada com sucesso
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at as role_created_at,
  au.created_at as user_created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin')
ORDER BY ur.created_at DESC;

-- 5. Verificar estrutura da tabela user_roles (caso haja erro)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 6. Se a tabela user_roles não existir, criar ela:
-- (Descomente apenas se necessário)
/*
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura
CREATE POLICY "Users can read their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para admins gerenciarem roles
CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin', 'platform_admin')
    )
  );
*/
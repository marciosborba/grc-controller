-- Limpar tokens de refresh duplicados e problemas de autenticação
-- Primeiro, vamos limpar tokens duplicados

-- Deletar tokens de refresh duplicados (mantém apenas o mais recente por usuário)
DELETE FROM auth.refresh_tokens 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM auth.refresh_tokens 
    ORDER BY user_id, created_at DESC
);

-- Atualizar usuários existentes para resolver problemas de autenticação
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    phone_confirmed_at = NULL,
    confirmed_at = COALESCE(confirmed_at, NOW()),
    updated_at = NOW()
WHERE email IN ('marciosb@icloud.com', 'compliance@cyberguard.com');

-- Recriar senhas com hash correto
UPDATE auth.users 
SET 
    encrypted_password = crypt('Teste123!@#', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN ('marciosb@icloud.com', 'compliance@cyberguard.com');
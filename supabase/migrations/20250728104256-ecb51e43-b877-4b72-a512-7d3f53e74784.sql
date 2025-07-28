-- Resetar senhas para usuários conhecidos
-- Função para resetar senha (método direto)

DO $$
BEGIN
    -- Atualizar senha para marciosb@icloud.com
    UPDATE auth.users 
    SET encrypted_password = crypt('Teste123!@#', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'marciosb@icloud.com';

    -- Atualizar senha para compliance@cyberguard.com  
    UPDATE auth.users 
    SET encrypted_password = crypt('Teste123!@#', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'compliance@cyberguard.com';

    RAISE NOTICE 'Senhas atualizadas com sucesso!';
END
$$;
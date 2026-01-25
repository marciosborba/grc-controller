-- Script para verificar e criar platform admin
-- Primeiro, vamos ver se existe o usuário e se ele é platform admin

-- Verificar usuário na tabela auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'adm@grc-controller.com';

-- Verificar se existe na tabela platform_admins
SELECT pa.user_id, pa.role, pa.permissions, u.email
FROM platform_admins pa
JOIN auth.users u ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';

-- Se não existir, criar o registro
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'adm@grc-controller.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Verificar se já existe na tabela platform_admins
        IF NOT EXISTS (SELECT 1 FROM platform_admins WHERE user_id = admin_user_id) THEN
            -- Inserir na tabela platform_admins
            INSERT INTO platform_admins (user_id, role, permissions, created_at, updated_at)
            VALUES (
                admin_user_id, 
                'platform_admin', 
                ARRAY['platform_admin', 'tenants.manage', 'users.manage'], 
                NOW(), 
                NOW()
            );
            
            RAISE NOTICE 'Platform admin criado para usuário %', admin_user_id;
        ELSE
            RAISE NOTICE 'Platform admin já existe para usuário %', admin_user_id;
        END IF;
    ELSE
        RAISE NOTICE 'Usuário adm@grc-controller.com não encontrado';
    END IF;
END $$;

-- Verificar novamente após inserção
SELECT pa.user_id, pa.role, pa.permissions, u.email
FROM platform_admins pa
JOIN auth.users u ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';
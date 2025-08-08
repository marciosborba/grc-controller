-- Script para diagnosticar problemas com o usuário administrador
-- Execute este script no SQL Editor do Supabase para verificar o status

-- 1. Verificar se o usuário existe no auth.users
SELECT 
    'USUÁRIO AUTH' as tipo,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'adm@grc-controller.com';

-- 2. Verificar se o perfil foi criado
SELECT 
    'PERFIL' as tipo,
    user_id::text as id,
    email,
    full_name,
    tenant_id,
    is_active,
    created_at
FROM profiles 
WHERE email = 'adm@grc-controller.com';

-- 3. Verificar se é platform admin
SELECT 
    'PLATFORM ADMIN' as tipo,
    user_id::text as id,
    role,
    permissions,
    created_at
FROM platform_admins 
WHERE user_id IN (
    SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com'
);

-- 4. Verificar roles do sistema
SELECT 
    'USER ROLES' as tipo,
    user_id::text as id,
    role,
    created_at
FROM user_roles 
WHERE user_id IN (
    SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com'
);

-- 5. Verificar tenant associado
SELECT 
    'TENANT' as tipo,
    t.id::text,
    t.name,
    t.slug,
    t.is_active,
    t.max_users,
    t.current_users_count
FROM tenants t
WHERE t.id IN (
    SELECT tenant_id FROM profiles WHERE email = 'adm@grc-controller.com'
);

-- 6. Contagem geral para diagnóstico
SELECT 
    (SELECT COUNT(*) FROM auth.users WHERE email = 'adm@grc-controller.com') as usuarios_auth,
    (SELECT COUNT(*) FROM profiles WHERE email = 'adm@grc-controller.com') as perfis,
    (SELECT COUNT(*) FROM platform_admins WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com')) as platform_admins,
    (SELECT COUNT(*) FROM user_roles WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'adm@grc-controller.com')) as roles,
    (SELECT COUNT(*) FROM tenants WHERE slug = 'principal') as tenant_principal;

-- Se nenhum resultado aparecer acima, execute este comando para criar o usuário manualmente:
-- IMPORTANTE: Substitua 'NOVO_UUID_AQUI' por um UUID gerado
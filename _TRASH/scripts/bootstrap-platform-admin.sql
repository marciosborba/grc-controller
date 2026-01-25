-- Script para inicialização bootstrap do primeiro platform admin
-- Execute este script no SQL Editor do Supabase Dashboard como superusuário
-- IMPORTANTE: Substitua 'USER_ID_DO_USUARIO_CRIADO' pelo ID real do usuário

-- PASSO 1: Primeiro crie o usuário manualmente no Dashboard:
-- 1. Vá para Authentication > Users
-- 2. Add user com email adm@grc-controller.com e senha Teste123!@#
-- 3. Marque "Auto-confirm user"
-- 4. Copie o ID do usuário gerado
-- 5. Cole esse ID no lugar de USER_ID_DO_USUARIO_CRIADO neste script

-- PASSO 2: Execute este script substituindo o USER_ID:

-- Temporariamente desabilitar RLS para criação inicial
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Criar tenant principal
INSERT INTO tenants (
    name,
    slug,
    contact_email,
    max_users,
    subscription_plan,
    is_active
) VALUES (
    'Organização Principal',
    'principal',
    'adm@grc-controller.com',
    1000,
    'enterprise',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Obter ID do tenant
DO $$
DECLARE
    tenant_uuid uuid;
    user_uuid uuid := 'USER_ID_DO_USUARIO_CRIADO'; -- SUBSTITUA AQUI PELO ID REAL
BEGIN
    -- Buscar tenant ID
    SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'principal';
    
    -- Criar perfil do platform admin
    INSERT INTO profiles (
        user_id,
        full_name,
        job_title,
        tenant_id,
        is_active,
        email,
        permissions
    ) VALUES (
        user_uuid,
        'Administrador da Plataforma',
        'Platform Administrator',
        tenant_uuid,
        true,
        'adm@grc-controller.com',
        ARRAY['users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage']::text[]
    ) ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        job_title = EXCLUDED.job_title,
        tenant_id = EXCLUDED.tenant_id,
        is_active = EXCLUDED.is_active,
        email = EXCLUDED.email,
        permissions = EXCLUDED.permissions;

    -- Criar role admin do sistema
    INSERT INTO user_roles (user_id, role)
    VALUES (user_uuid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Criar platform admin
    INSERT INTO platform_admins (
        user_id,
        role,
        permissions,
        created_at
    ) VALUES (
        user_uuid,
        'platform_admin',
        '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin", "users.create", "users.read", "users.update", "users.delete"]'::jsonb,
        now()
    ) ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions;
        
    RAISE NOTICE 'Platform admin criado com sucesso para user_id: %', user_uuid;
END $$;

-- Reabilitar RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verificar se foi criado corretamente
SELECT 
    'VERIFICAÇÃO FINAL:' as status,
    pa.user_id,
    pa.role as platform_role,
    p.full_name,
    p.email,
    t.name as tenant_name,
    ur.role as system_role
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id
JOIN tenants t ON p.tenant_id = t.id
LEFT JOIN user_roles ur ON pa.user_id = ur.user_id
WHERE p.email = 'adm@grc-controller.com';

-- Se a query acima retornar resultados, o usuário foi criado com sucesso!

-- INSTRUÇÕES APÓS EXECUÇÃO:
-- 1. Faça login na aplicação com adm@grc-controller.com / Teste123!@#
-- 2. Vá para a página de Administração de Usuários
-- 3. Você deve ver as informações de debug no header mostrando que é Platform Admin
-- 4. Agora pode criar outros usuários normalmente!
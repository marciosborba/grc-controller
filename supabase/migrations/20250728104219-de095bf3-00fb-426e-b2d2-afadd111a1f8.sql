-- Promover usuários existentes a admin e criar perfis
-- Primeiro, vamos criar perfis para usuários existentes que não têm perfil

-- Criar perfis para usuários existentes
INSERT INTO public.profiles (user_id, full_name, job_title, is_active, email)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    CASE 
        WHEN au.email LIKE 'admin%' THEN 'Administrador'
        WHEN au.email LIKE 'compliance%' THEN 'Compliance Officer'
        WHEN au.email LIKE 'auditor%' THEN 'Auditor'
        WHEN au.email LIKE 'risk%' THEN 'Risk Manager'
        ELSE 'Usuário'
    END,
    true,
    au.email
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;

-- Criar roles padrão para usuários existentes
INSERT INTO public.user_roles (user_id, role)
SELECT 
    au.id,
    CASE 
        WHEN au.email IN ('compliance@cyberguard.com', 'marciosb@icloud.com') THEN 'admin'::app_role
        WHEN au.email LIKE 'auditor%' THEN 'auditor'::app_role
        WHEN au.email LIKE 'risk%' THEN 'risk_manager'::app_role
        ELSE 'user'::app_role
    END
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE ur.user_id IS NULL;

-- Promover usuários específicos a admin
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'::app_role
FROM auth.users au
WHERE au.email IN ('compliance@cyberguard.com', 'marciosb@icloud.com')
ON CONFLICT (user_id, role) DO NOTHING;
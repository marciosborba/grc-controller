-- Verificar se o platform admin foi criado
SELECT 
    pa.id,
    pa.user_id,
    u.email,
    pa.role,
    pa.permissions,
    pa.created_at
FROM platform_admins pa
JOIN auth.users u ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';
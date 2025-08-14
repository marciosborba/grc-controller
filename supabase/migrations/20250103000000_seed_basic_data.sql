-- ============================================================================
-- MIGRATION: DADOS BÁSICOS PARA O SISTEMA
-- ============================================================================
-- Inserção de dados básicos necessários para o funcionamento

-- Inserir tenant padrão
INSERT INTO tenants (id, name, slug, description) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Empresa Demonstração', 'demo', 'Tenant de demonstração para testes')
ON CONFLICT (id) DO NOTHING;

-- Criar usuário admin de demonstração se não existir
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Verificar se existe usuário admin
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@demo.com' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        -- Criar usuário na tabela auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'admin@demo.com',
            crypt('senha123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Administrador Demo"}',
            false
        ) RETURNING id INTO admin_user_id;
    END IF;
    
    -- Inserir perfil do usuário
    INSERT INTO profiles (id, email, full_name, tenant_id) VALUES 
    (admin_user_id, 'admin@demo.com', 'Administrador Demo', '550e8400-e29b-41d4-a716-446655440000')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        tenant_id = EXCLUDED.tenant_id;
    
    -- Inserir role de admin
    INSERT INTO user_roles (user_id, role, tenant_id) VALUES 
    (admin_user_id, 'admin', '550e8400-e29b-41d4-a716-446655440000')
    ON CONFLICT DO NOTHING;
    
END $$;

-- Inserir alguns frameworks básicos
INSERT INTO frameworks (id, name, short_name, category, version, description, created_by_user_id, tenant_id) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'LGPD - Lei Geral de Proteção de Dados',
    'LGPD',
    'Proteção de Dados',
    '2020',
    'Lei brasileira de proteção de dados pessoais',
    (SELECT id FROM auth.users WHERE email = 'admin@demo.com' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'ISO/IEC 27001:2022',
    'ISO27001',
    'Segurança da Informação',
    '2022',
    'Framework internacional para sistemas de gestão de segurança da informação',
    (SELECT id FROM auth.users WHERE email = 'admin@demo.com' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT (id) DO NOTHING;
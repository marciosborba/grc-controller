#!/usr/bin/env node

/**
 * Script para criar usuário administrador IMEDIATAMENTE
 * Execute: node create-admin-now.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4"

// Para criar usuário precisamos do service role key
// Se você não tem, use o método manual do SQL

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createAdminUser() {
  try {
    console.log('🚀 Tentando criar usuário administrador...')
    console.log('📧 Email: adm@grc-controller.com')
    console.log('🔑 Senha: Teste123!@#')
    
    // Tentar fazer signup primeiro (método público)
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'adm@grc-controller.com',
      password: 'Teste123!@#',
      options: {
        data: {
          full_name: 'Administrador da Plataforma',
          job_title: 'Platform Administrator'
        }
      }
    })

    if (signupError) {
      console.log('⚠️  Erro no signup (normal se usuário já existe):', signupError.message)
      
      // Se usuário já existe, vamos tentar fazer login para obter o ID
      console.log('🔍 Tentando fazer login para obter ID...')
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'adm@grc-controller.com',
        password: 'Teste123!@#'
      })

      if (loginError) {
        console.log('❌ Não foi possível fazer login. O usuário pode não existir ou senha está incorreta.')
        console.log('💡 SOLUÇÃO: Execute o SQL manual abaixo no Supabase Dashboard:')
        console.log(`
-- 1. Vá para Supabase Dashboard → SQL Editor
-- 2. Execute este comando para criar o usuário manualmente:

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
BEGIN
    -- Inserir na auth.users (requer privilégios especiais)
    INSERT INTO auth.users (
        id, aud, role, email, encrypted_password, 
        email_confirmed_at, created_at, updated_at, raw_user_meta_data
    ) VALUES (
        new_user_id,
        'authenticated',
        'authenticated', 
        'adm@grc-controller.com',
        crypt('Teste123!@#', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"full_name": "Administrador da Plataforma"}'
    );
    
    -- Inserir identity
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        new_user_id,
        json_build_object('sub', new_user_id, 'email', 'adm@grc-controller.com'),
        'email',
        now(),
        now()
    );
    
    -- Criar tenant se não existe
    INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
    VALUES ('Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true)
    ON CONFLICT (slug) DO NOTHING;
    
    -- Criar perfil
    INSERT INTO profiles (user_id, full_name, job_title, tenant_id, is_active, email, permissions)
    VALUES (
        new_user_id,
        'Administrador da Plataforma',
        'Platform Administrator', 
        (SELECT id FROM tenants WHERE slug = 'principal'),
        true,
        'adm@grc-controller.com',
        '[]'::jsonb
    );
    
    -- Criar roles
    INSERT INTO user_roles (user_id, role) VALUES (new_user_id, 'admin');
    
    INSERT INTO platform_admins (user_id, role, permissions, created_by)
    VALUES (
        new_user_id,
        'platform_admin', 
        '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
        new_user_id
    );
    
    -- Mostrar resultado
    RAISE NOTICE 'Usuário criado com ID: %', new_user_id;
END $$;

-- Verificar criação
SELECT 'USUÁRIO CRIADO!' as status, u.id, u.email, p.full_name, pa.role
FROM auth.users u 
JOIN profiles p ON u.id = p.user_id
JOIN platform_admins pa ON u.id = pa.user_id
WHERE u.email = 'adm@grc-controller.com';
        `)
        return
      }

      if (loginData.user) {
        console.log('✅ Login realizado! ID do usuário:', loginData.user.id)
        await setupUserPermissions(loginData.user.id)
      }
    } else {
      console.log('✅ Usuário criado via signup!')
      if (signupData.user) {
        console.log('🆔 ID:', signupData.user.id)
        await setupUserPermissions(signupData.user.id)
      }
    }

  } catch (error) {
    console.error('💥 Erro:', error.message)
    console.log('\n🔧 SOLUÇÃO ALTERNATIVA - Execute no SQL Editor do Supabase:')
    console.log('(Vá para dashboard.supabase.com → seu projeto → SQL Editor)')
    console.log(`
-- Método direto via SQL:

-- 1. Primeiro criar tenant
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES ('Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Se você JÁ CRIOU o usuário no Dashboard, obtenha o ID:
SELECT id FROM auth.users WHERE email = 'adm@grc-controller.com';

-- 3. Substitua USER_ID_AQUI pelo ID e execute:
INSERT INTO profiles (user_id, full_name, job_title, tenant_id, is_active, email, permissions)
VALUES (
    'USER_ID_AQUI'::uuid,
    'Administrador da Plataforma',
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
    true,
    'adm@grc-controller.com',
    '[]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

INSERT INTO user_roles (user_id, role) VALUES ('USER_ID_AQUI'::uuid, 'admin') ON CONFLICT DO NOTHING;

INSERT INTO platform_admins (user_id, role, permissions) 
VALUES (
    'USER_ID_AQUI'::uuid,
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;
    `)
  }
}

async function setupUserPermissions(userId) {
  try {
    console.log('⚙️  Configurando permissões...')
    
    // As próximas operações precisam ser feitas via SQL pois requerem privilégios especiais
    console.log(`
📋 Execute este SQL no Supabase Dashboard para completar a configuração:

-- Criar tenant principal
INSERT INTO tenants (name, slug, contact_email, max_users, subscription_plan, is_active)
VALUES ('Organização Principal', 'principal', 'adm@grc-controller.com', 1000, 'enterprise', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- Configurar perfil do usuário ${userId}
INSERT INTO profiles (user_id, full_name, job_title, tenant_id, is_active, email, permissions)
VALUES (
    '${userId}',
    'Administrador da Plataforma', 
    'Platform Administrator',
    (SELECT id FROM tenants WHERE slug = 'principal'),
    true,
    'adm@grc-controller.com',
    '[]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
    tenant_id = (SELECT id FROM tenants WHERE slug = 'principal'),
    is_active = true,
    full_name = EXCLUDED.full_name,
    job_title = EXCLUDED.job_title;

-- Adicionar role admin
INSERT INTO user_roles (user_id, role) VALUES ('${userId}', 'admin') ON CONFLICT DO NOTHING;

-- Tornar platform admin  
INSERT INTO platform_admins (user_id, role, permissions, created_by)
VALUES (
    '${userId}',
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin"]'::jsonb,
    '${userId}'
) ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- Verificar resultado
SELECT 'CONFIGURAÇÃO COMPLETA!' as status, u.email, pa.role, t.name as tenant
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
JOIN platform_admins pa ON u.id = pa.user_id 
JOIN tenants t ON p.tenant_id = t.id
WHERE u.id = '${userId}';
    `)
    
  } catch (error) {
    console.log('⚠️  Erro nas permissões:', error.message)
  }
}

console.log('🎯 CRIANDO ADMINISTRADOR DA PLATAFORMA')
console.log('=' .repeat(50))

createAdminUser()
  .then(() => {
    console.log('\n✨ Script finalizado!')
    console.log('🔑 Credenciais:')
    console.log('   Email: adm@grc-controller.com')
    console.log('   Senha: Teste123!@#')
    console.log('🌐 URL: http://localhost:8081')
  })
  .catch(console.error)
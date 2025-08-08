// Script para criar admin via função signup da aplicação
// Execute: node scripts/create-admin-via-signup.js

const { createClient } = require('@supabase/supabase-js')

// Configurações - SUBSTITUA pelas suas URLs do Supabase
const SUPABASE_URL = 'https://sua-url-aqui.supabase.co' // ⚠️ SUBSTITUA
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui' // ⚠️ SUBSTITUA

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createAdmin() {
  try {
    console.log('🚀 Criando administrador via signup...')
    
    // 1. Fazer signup do usuário
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
      console.error('❌ Erro no signup:', signupError.message)
      return
    }

    console.log('✅ Usuário criado via signup')
    const userId = signupData.user?.id
    
    if (!userId) {
      console.error('❌ Não foi possível obter ID do usuário')
      return
    }

    // 2. Aguardar um pouco para o usuário ser processado
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Fazer login como admin para executar operações privilegiadas
    // (Aqui você precisaria de credenciais de um usuário admin existente)
    
    console.log('🔧 Configure o usuário manualmente com o SQL:')
    console.log(`
-- Execute este SQL no Supabase:
    
-- Atualizar perfil
UPDATE profiles 
SET 
    full_name = 'Administrador da Plataforma',
    job_title = 'Platform Administrator',
    tenant_id = (SELECT id FROM tenants WHERE slug = 'principal'),
    is_active = true,
    email = 'adm@grc-controller.com'
WHERE user_id = '${userId}';

-- Adicionar role admin
INSERT INTO user_roles (user_id, role) 
VALUES ('${userId}', 'admin')
ON CONFLICT DO NOTHING;

-- Adicionar platform admin
INSERT INTO platform_admins (user_id, role, permissions) 
VALUES (
    '${userId}', 
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin"]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;
`)

    console.log('✅ Script concluído!')
    console.log('📧 Email: adm@grc-controller.com')
    console.log('🔑 Senha: Teste123!@#')

  } catch (error) {
    console.error('💥 Erro:', error.message)
  }
}

createAdmin()
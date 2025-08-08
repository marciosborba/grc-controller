// Script para criar usuário administrador completo
// Inclui: usuário Auth, perfil, tenant, platform admin e roles

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPlatformAdmin(email = 'adm@grc-controller.com') {
  try {
    console.log('🚀 Criando administrador da plataforma...');
    console.log(`   Email: ${email}`);
    console.log('');

    // 1. Criar tenant padrão primeiro
    console.log('📋 1. Criando tenant principal...');
    const { data: existingTenant, error: checkTenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('slug', 'principal')
      .single();

    let tenantId;
    if (checkTenantError && checkTenantError.code === 'PGRST116') {
      // Tenant não existe, criar
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'Organização Principal',
          slug: 'principal',
          contact_email: email,
          max_users: 1000,
          subscription_plan: 'enterprise',
          is_active: true
        })
        .select()
        .single();

      if (tenantError) {
        console.error('❌ Erro ao criar tenant:', tenantError);
        return;
      }
      tenantId = newTenant.id;
      console.log(`✅ Tenant criado: ${newTenant.name} (${tenantId})`);
    } else if (checkTenantError) {
      console.error('❌ Erro ao verificar tenant:', checkTenantError);
      return;
    } else {
      tenantId = existingTenant.id;
      console.log(`✅ Tenant já existe: ${existingTenant.name} (${tenantId})`);
    }
    console.log('');

    // 2. Verificar se usuário já existe
    console.log('👤 2. Verificando usuário existente...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .eq('email', email)
      .single();

    if (!profileCheckError) {
      console.log(`⚠️  Usuário ${email} já existe!`);
      console.log(`   User ID: ${existingProfile.user_id}`);
      console.log('');
      
      // Continuar para verificar/criar platform admin
      const userId = existingProfile.user_id;
      
      // 3. Verificar/criar platform admin
      console.log('🔐 3. Configurando como platform admin...');
      const { data: platformAdmin, error: paCheckError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (paCheckError && paCheckError.code === 'PGRST116') {
        // Criar platform admin
        const { error: paError } = await supabase
          .from('platform_admins')
          .insert({
            user_id: userId,
            role: 'platform_admin',
            permissions: ["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin", "users.create", "users.read", "users.update", "users.delete"]
          });
        
        if (paError) {
          console.error('❌ Erro ao criar platform admin:', paError);
        } else {
          console.log('✅ Platform admin configurado!');
        }
      } else {
        console.log('✅ Já é platform admin');
      }
      
      // 4. Verificar/criar role admin
      console.log('');
      console.log('👑 4. Configurando role admin...');
      const { data: adminRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      if (roleCheckError && roleCheckError.code === 'PGRST116') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin'
          });
        
        if (roleError) {
          console.error('❌ Erro ao criar role admin:', roleError);
        } else {
          console.log('✅ Role admin configurada!');
        }
      } else {
        console.log('✅ Já tem role admin');
      }
      
      console.log('');
      console.log('🎉 CONFIGURAÇÃO CONCLUÍDA!');
      console.log(`   O usuário ${email} já existe e foi configurado como platform admin.`);
      console.log('   Agora você pode fazer login e criar outros usuários.');
      return;
    }

    console.log('ℹ️  Usuário não existe. INSTRUÇÕES PARA CRIAÇÃO MANUAL:');
    console.log('');
    console.log('🔸 PASSO 1: Criar usuário no Supabase Dashboard');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd/auth/users');
    console.log('   2. Clique em "Add user"');
    console.log(`   3. Email: ${email}`);
    console.log('   4. Password: Teste123!@#');
    console.log('   5. ✅ MARQUE "Auto-confirm user"');
    console.log('   6. Clique em "Create user"');
    console.log('   7. COPIE o ID do usuário gerado');
    console.log('');
    
    console.log('🔸 PASSO 2: Execute este comando SQL no Supabase Dashboard:');
    console.log('   (SQL Editor > New query)');
    console.log('');
    console.log(`-- Cole e execute este SQL (substitua USER_ID_AQUI):
BEGIN;

-- Criar perfil
INSERT INTO profiles (
    user_id,
    full_name,
    job_title,
    tenant_id,
    is_active,
    email,
    permissions
)
VALUES (
    'USER_ID_AQUI', -- SUBSTITUA pelo ID do usuário criado
    'Administrador da Plataforma',
    'Platform Administrator', 
    '${tenantId}',
    true,
    '${email}',
    '[]'::jsonb
);

-- Criar role admin
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'admin'); -- SUBSTITUA pelo ID do usuário

-- Criar platform admin
INSERT INTO platform_admins (
    user_id,
    role,
    permissions
)
VALUES (
    'USER_ID_AQUI', -- SUBSTITUA pelo ID do usuário
    'platform_admin',
    '["tenants.manage", "users.global", "platform.admin", "read", "write", "delete", "admin", "users.create", "users.read", "users.update", "users.delete"]'::jsonb
);

COMMIT;`);
    
    console.log('');
    console.log('🔸 PASSO 3: Verificar criação');
    console.log(`   Execute: node scripts/verify-platform-admin.cjs ${email}`);
    console.log('');
    console.log('💡 DICA: Se der erro de permissão, verifique se o usuário foi confirmado no passo 1.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Permitir email como argumento
const email = process.argv[2] || 'adm@grc-controller.com';
createPlatformAdmin(email);
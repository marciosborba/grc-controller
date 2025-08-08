// Script para verificar se o usuário atual é platform admin
// Execute com: node scripts/verify-platform-admin.js

const { createClient } = require('@supabase/supabase-js');

// Usando as configurações do cliente principal
const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPlatformAdmin(email = 'adm@grc-controller.com') {
  try {
    console.log(`🔍 Verificando usuário: ${email}`);
    console.log('⚠️  NOTA: Usando chave pública - algumas verificações limitadas');
    console.log('');

    // Verificar perfil do usuário por email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      if (profileError.code === 'PGRST116') {
        console.log(`❌ Usuário ${email} não encontrado na tabela profiles`);
        console.log('');
        console.log('💡 Para criar o usuário:');
        console.log('   1. Acesse o Supabase Dashboard > Authentication > Users');
        console.log('   2. Clique em "Add user"');
        console.log(`   3. Email: ${email}`);
        console.log('   4. Password: Teste123!@#');
        console.log('   5. Marque "Email confirmed"');
        console.log('   6. Execute o script create-platform-admin.sql');
      }
      return;
    }

    console.log(`✅ Perfil encontrado: ${profile.full_name}`);
    console.log(`   User ID: ${profile.user_id}`);
    console.log(`   Tenant ID: ${profile.tenant_id}`);
    console.log(`   Ativo: ${profile.is_active ? 'Sim' : 'Não'}`);
    console.log(`   Permissions: ${JSON.stringify(profile.permissions || [])}`);
    console.log('');

    // Verificar roles do usuário
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.user_id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
      return;
    }

    console.log(`✅ Roles do usuário: ${userRoles.map(r => r.role).join(', ') || 'Nenhuma'}`);
    console.log('');

    // Verificar se é platform admin
    const { data: platformAdmin, error: platformError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', profile.user_id)
      .single();

    if (platformError) {
      if (platformError.code === 'PGRST116') {
        console.log('❌ NÃO É PLATFORM ADMIN');
        console.log('');
        console.log('💡 Para tornar o usuário platform admin:');
        console.log(`   INSERT INTO platform_admins (user_id, role, permissions)`);
        console.log(`   VALUES ('${profile.user_id}', 'platform_admin', '["tenants.manage", "users.global", "platform.admin"]'::jsonb);`);
      } else {
        console.error('❌ Erro ao verificar platform admin:', platformError);
      }
      return;
    }

    console.log(`✅ É PLATFORM ADMIN!`);
    console.log(`   Role: ${platformAdmin.role}`);
    console.log(`   Permissions: ${JSON.stringify(platformAdmin.permissions || [])}`);
    console.log(`   Criado em: ${platformAdmin.created_at}`);
    console.log('');

    // Verificar tenant
    if (profile.tenant_id) {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (tenantError) {
        console.error('❌ Erro ao buscar tenant:', tenantError);
      } else {
        console.log(`✅ Tenant: ${tenant.name} (${tenant.slug})`);
        console.log(`   Usuários: ${tenant.current_users_count}/${tenant.max_users}`);
        console.log(`   Plano: ${tenant.subscription_plan}`);
        console.log(`   Ativo: ${tenant.is_active ? 'Sim' : 'Não'}`);
      }
    }

    console.log('');
    console.log('🎉 USUÁRIO CONFIGURADO CORRETAMENTE COMO PLATFORM ADMIN!');
    console.log('   Agora você deve conseguir criar usuários na aplicação.');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Permitir email como argumento
const email = process.argv[2] || 'adm@grc-controller.com';
verifyPlatformAdmin(email);
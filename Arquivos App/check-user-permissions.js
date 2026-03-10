// Script para verificar permissões do usuário atual
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usando variáveis de ambiente)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserPermissions() {
  console.log('🔍 Verificando permissões do usuário...\n');
  
  try {
    // 1. Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message);
      return;
    }
    
    if (!session) {
      console.log('❌ Nenhuma sessão ativa encontrada');
      console.log('💡 Faça login primeiro no sistema');
      return;
    }
    
    console.log('✅ Sessão ativa encontrada');
    console.log('👤 User ID:', session.user.id);
    console.log('📧 Email:', session.user.email);
    
    // 2. Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('❌ Erro ao obter perfil:', profileError.message);
    } else if (profile) {
      console.log('✅ Perfil encontrado');
      console.log('👤 Nome:', profile.full_name);
      console.log('🏢 Tenant ID:', profile.tenant_id);
      console.log('💼 Cargo:', profile.job_title);
    } else {
      console.log('⚠️ Nenhum perfil encontrado');
    }
    
    // 3. Verificar roles do usuário
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);
    
    if (rolesError) {
      console.error('❌ Erro ao obter roles:', rolesError.message);
    } else {
      console.log('✅ Roles encontradas:', userRoles?.length || 0);
      if (userRoles && userRoles.length > 0) {
        userRoles.forEach(role => {
          console.log('  - Role:', role.role);
        });
      } else {
        console.log('⚠️ Nenhuma role encontrada');
      }
    }
    
    // 4. Verificar se é platform admin
    const roles = userRoles?.map(r => r.role) || [];
    const isPlatformAdmin = roles.some(role => 
      ['admin', 'super_admin', 'platform_admin'].includes(role)
    );
    
    console.log('\n📊 RESUMO DO ACESSO:');
    console.log('🔐 É Platform Admin?', isPlatformAdmin ? '✅ SIM' : '❌ NÃO');
    console.log('🎯 Pode acessar AI Manager?', isPlatformAdmin ? '✅ SIM' : '❌ NÃO');
    
    if (!isPlatformAdmin) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('Para acessar o AI Manager, o usuário precisa ter uma das seguintes roles:');
      console.log('  - admin');
      console.log('  - super_admin');
      console.log('  - platform_admin');
      console.log('\nPara adicionar uma role, execute no SQL Editor do Supabase:');
      console.log(`INSERT INTO user_roles (user_id, role) VALUES ('${session.user.id}', 'platform_admin');`);
    } else {
      console.log('\n✅ USUÁRIO TEM PERMISSÃO PARA ACESSAR AI MANAGER');
      console.log('🔗 Acesse: http://localhost:8080/admin/ai-management');
    }
    
    // 5. Verificar se as tabelas de AI existem
    console.log('\n🗄️ VERIFICANDO TABELAS DE IA:');
    
    const tables = [
      'ai_grc_providers',
      'ai_grc_prompt_templates', 
      'ai_workflows',
      'ai_usage_logs'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: Erro inesperado`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar verificação
checkUserPermissions();
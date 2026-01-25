const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabaseClient = createClient(supabaseUrl, anonKey);

async function setupDevAuth() {
  console.log('🔧 Configurando autenticação para desenvolvimento...\n');

  try {
    // Verificar usuários existentes
    console.log('1. Verificando usuários existentes...');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError.message);
      return;
    }
    
    console.log(`   → Encontrados ${users?.users?.length || 0} usuários`);
    
    let devUser = null;
    
    // Procurar usuário de desenvolvimento
    if (users?.users?.length > 0) {
      devUser = users.users.find(u => u.email === 'dev@grc.local' || u.email.includes('dev'));
      if (devUser) {
        console.log(`   → Usuário de desenvolvimento encontrado: ${devUser.email}`);
      }
    }
    
    // Criar usuário de desenvolvimento se não existir
    if (!devUser) {
      console.log('2. Criando usuário de desenvolvimento...');
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: 'dev@grc.local',
        password: 'dev123456',
        email_confirm: true,
        user_metadata: {
          full_name: 'Desenvolvedor',
          role: 'admin'
        }
      });
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError.message);
        return;
      }
      
      devUser = newUser.user;
      console.log(`   → ✅ Usuário criado: ${devUser.email}`);
    }
    
    // Tentar fazer login com o usuário de desenvolvimento
    console.log('3. Testando login automático...');
    
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: devUser.email,
      password: 'dev123456'
    });
    
    if (loginError) {
      console.error('❌ Erro ao fazer login:', loginError.message);
      
      // Se senha estiver errada, tentar redefinir
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('   → Redefinindo senha...');
        
        const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
          devUser.id,
          { password: 'dev123456' }
        );
        
        if (resetError) {
          console.error('❌ Erro ao redefinir senha:', resetError.message);
          return;
        }
        
        // Tentar login novamente
        const { data: retryLogin, error: retryError } = await supabaseClient.auth.signInWithPassword({
          email: devUser.email,
          password: 'dev123456'
        });
        
        if (retryError) {
          console.error('❌ Erro ao fazer login após reset:', retryError.message);
          return;
        }
        
        console.log('   → ✅ Login bem-sucedido após reset de senha');
      } else {
        return;
      }
    } else {
      console.log('   → ✅ Login bem-sucedido');
    }
    
    // Agora testar acesso aos dados com usuário autenticado
    console.log('4. Testando acesso aos dados com usuário autenticado...\n');
    
    const tables = ['legal_bases', 'consents', 'data_inventory', 'data_subject_requests', 'privacy_incidents', 'processing_activities'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')
          .limit(3);
        
        if (error) {
          console.error(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${data?.length || 0} registros acessíveis`);
          if (data && data.length > 0) {
            console.log(`   → Exemplo: ${data[0].name || data[0].title || data[0].id}`);
          }
        }
        
      } catch (error) {
        console.error(`❌ ${table}: ${error.message}`);
      }
    }
    
    console.log('\\n🎉 Configuração concluída!');
    console.log('\\n📋 Credenciais para desenvolvimento:');
    console.log('   Email: dev@grc.local');
    console.log('   Senha: dev123456');
    console.log('\\n💡 Use essas credenciais para fazer login no frontend e testar os submódulos.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar configuração
setupDevAuth().catch(console.error);
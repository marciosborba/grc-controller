import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminPassword() {
  console.log('🔧 Corrigindo senha do admin...');
  
  try {
    // Buscar usuário admin
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError);
      return;
    }
    
    const adminUser = users.users.find(u => u.email === 'adm@grc-controller.com');
    if (!adminUser) {
      console.log('❌ Usuário adm@grc-controller.com não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', adminUser.id);
    
    // Redefinir senha para Teste123!@#
    console.log('🔑 Redefinindo senha para "Teste123!@#"...');
    const { error: passwordError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: 'Teste123!@#'
    });
    
    if (passwordError) {
      console.error('❌ Erro ao redefinir senha:', passwordError);
      return;
    }
    
    console.log('✅ Senha redefinida com sucesso para "Teste123!@#"');
    
    // Verificar se usuário está ativo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_active, email, full_name')
      .eq('user_id', adminUser.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao verificar profile:', profileError);
    } else {
      console.log('📋 Status do profile:');
      console.log('- Nome:', profile.full_name);
      console.log('- Email:', profile.email);
      console.log('- Ativo:', profile.is_active);
      
      if (!profile.is_active) {
        console.log('⚠️ Usuário está inativo, ativando...');
        const { error: activateError } = await supabase
          .from('profiles')
          .update({ is_active: true })
          .eq('user_id', adminUser.id);
        
        if (activateError) {
          console.error('❌ Erro ao ativar usuário:', activateError);
        } else {
          console.log('✅ Usuário ativado com sucesso');
        }
      }
    }
    
    // Testar login
    console.log('🧪 Testando login com nova senha...');
    
    const supabaseTest = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4');
    
    const { data: loginData, error: loginError } = await supabaseTest.auth.signInWithPassword({
      email: 'adm@grc-controller.com',
      password: 'Teste123!@#'
    });
    
    if (loginError) {
      console.error('❌ Erro no teste de login:', loginError);
    } else {
      console.log('✅ Login funcionando! User ID:', loginData.user.id);
      
      // Fazer logout do teste
      await supabaseTest.auth.signOut();
    }
    
    console.log('🎉 Correção concluída!');
    console.log('📝 Credenciais corretas:');
    console.log('   Email: adm@grc-controller.com');
    console.log('   Senha: Teste123!@#');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixAdminPassword();
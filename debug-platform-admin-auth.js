import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugPlatformAdminAuth() {
  console.log('🔍 Debug autenticação platform admin...');
  
  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'adm@grc-controller.com',
      password: 'Admin123!@#'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado:', authData.user.id);
    
    // 2. Verificar session
    const { data: session } = await supabase.auth.getSession();
    console.log('📋 Session ativa:', !!session.session);
    
    // 3. Verificar platform admin (como usuário autenticado)
    console.log('2️⃣ Verificando platform admin como usuário autenticado...');
    const { data: platformAdmin, error: platformError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', authData.user.id);
    
    console.log('Platform admin query result:', { data: platformAdmin, error: platformError });
    
    // 4. Simular a lógica do AuthContext
    console.log('3️⃣ Simulando lógica do AuthContext...');
    const isPlatformAdmin = !!(platformAdmin && platformAdmin.length > 0);
    console.log('isPlatformAdmin:', isPlatformAdmin);
    
    // 5. Testar permissões como platform admin
    if (isPlatformAdmin) {
      console.log('4️⃣ Testando permissões de platform admin...');
      
      // Simular hasPermission do useUserManagement
      const hasUsersCreatePermission = true; // Platform admin deveria ter
      console.log('hasPermission("users.create"):', hasUsersCreatePermission);
      
      // Testar criação de usuário como usuário autenticado
      console.log('5️⃣ Testando criação de usuário como usuário autenticado...');
      
      const testEmail = `teste-auth-${Date.now()}@example.com`;
      
      // Esta é a chamada que está falhando na aplicação
      const { data: createResult, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Teste Auth',
          job_title: 'Tester'
        }
      });
      
      if (createError) {
        console.error('❌ Erro ao criar usuário como auth user:', createError);
      } else {
        console.log('✅ Usuário criado como auth user:', createResult.user.id);
        
        // Limpar
        await supabase.auth.admin.deleteUser(createResult.user.id);
      }
    } else {
      console.log('❌ Usuário não é reconhecido como platform admin');
    }
    
    // 6. Logout
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugPlatformAdminAuth();
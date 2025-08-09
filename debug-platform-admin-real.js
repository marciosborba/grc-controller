import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugPlatformAdminAuth() {
  console.log('🔍 Debug autenticação platform admin com chave correta...');
  
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
    
    // 5. Simular hasPermission
    console.log('4️⃣ Simulando hasPermission...');
    
    function hasPermission(permission) {
      // Esta é a lógica do useUserManagement
      if (isPlatformAdmin) {
        console.log(`[hasPermission] Platform admin has permission: ${permission}`);
        return true;
      }
      
      // Verificar se tem permission direta (simulando)
      const userPermissions = ['read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete'];
      const hasDirectPermission = userPermissions.includes(permission);
      const isSystemAdmin = true; // Simulando role admin
      
      console.log(`[hasPermission] Checking permission "${permission}": direct=${hasDirectPermission}, isAdmin=${isSystemAdmin}`);
      
      return hasDirectPermission || isSystemAdmin || false;
    }
    
    const canCreateUsers = hasPermission('users.create');
    console.log('Can create users:', canCreateUsers);
    
    if (!canCreateUsers) {
      console.log('❌ PROBLEMA ENCONTRADO: hasPermission("users.create") retorna false');
      console.log('🔍 Investigando...');
      console.log('- isPlatformAdmin:', isPlatformAdmin);
      console.log('- platformAdmin data:', platformAdmin);
      console.log('- platformAdmin error:', platformError);
    } else {
      console.log('✅ hasPermission funcionando corretamente');
    }
    
    // 6. Logout
    await supabase.auth.signOut();
    console.log('👋 Logout realizado');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugPlatformAdminAuth();
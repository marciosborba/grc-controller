import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugPlatformAdmin() {
  console.log('🔍 Debug Platform Admin para adm@grc-controller.com');
  
  try {
    // Fazer login primeiro
    console.log('1. Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'adm@grc-controller.com',
      password: 'Admin123!@#'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }
    
    const user = authData.user;
    console.log('✅ Login realizado. User ID:', user.id);
    
    // Verificar platform admin
    console.log('2. Verificando platform admin...');
    const { data: platformAdmin, error: platformAdminError } = await supabase
      .from('platform_admins')
      .select('role, permissions')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (platformAdminError && platformAdminError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar platform admin:', platformAdminError);
      return;
    }
    
    const isPlatformAdmin = !!platformAdmin;
    console.log(`✅ Platform admin check: found=${!!platformAdmin}, isPlatformAdmin=${isPlatformAdmin}`);
    
    if (platformAdmin) {
      console.log('📋 Platform admin data:', platformAdmin);
    } else {
      console.log('❌ Nenhum registro de platform admin encontrado');
      
      // Verificar se existe na tabela
      console.log('3. Verificando diretamente na tabela...');
      const { data: directCheck, error: directError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', user.id);
      
      if (directError) {
        console.error('❌ Erro na verificação direta:', directError);
      } else {
        console.log('📋 Verificação direta:', directCheck);
      }
    }
    
    // Verificar roles do usuário
    console.log('4. Verificando roles do usuário...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
    } else {
      console.log('📋 User roles:', userRoles);
    }
    
    // Verificar profile
    console.log('5. Verificando profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('❌ Erro ao buscar profile:', profileError);
    } else {
      console.log('📋 Profile:', profile);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugPlatformAdmin();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminUser() {
  console.log('🔍 Verificando usuário admin no banco...');
  
  try {
    // 1. Buscar usuário na tabela auth.users
    console.log('1️⃣ Buscando usuário em auth.users...');
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
    
    console.log('✅ Usuário encontrado:');
    console.log('- ID:', adminUser.id);
    console.log('- Email:', adminUser.email);
    console.log('- Email confirmado:', adminUser.email_confirmed_at ? 'SIM' : 'NÃO');
    console.log('- Criado em:', adminUser.created_at);
    console.log('- Última atividade:', adminUser.last_sign_in_at);
    
    // 2. Verificar profile
    console.log('2️⃣ Verificando profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar profile:', profileError);
    } else {
      console.log('✅ Profile encontrado:');
      console.log('- Nome:', profile.full_name);
      console.log('- Email no profile:', profile.email);
      console.log('- Tenant ID:', profile.tenant_id);
      console.log('- Ativo:', profile.is_active);
    }
    
    // 3. Verificar roles
    console.log('3️⃣ Verificando roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id);
    
    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
    } else {
      console.log('✅ Roles encontradas:', roles?.map(r => r.role) || []);
    }
    
    // 4. Verificar platform admin
    console.log('4️⃣ Verificando platform admin...');
    const { data: platformAdmin, error: platformError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', adminUser.id);
    
    if (platformError) {
      console.error('❌ Erro ao verificar platform admin:', platformError);
    } else {
      console.log('✅ Platform admin:', platformAdmin?.length > 0 ? 'SIM' : 'NÃO');
      if (platformAdmin?.length > 0) {
        console.log('- Role:', platformAdmin[0].role);
        console.log('- Permissions:', platformAdmin[0].permissions);
      }
    }
    
    // 5. Tentar redefinir senha
    console.log('5️⃣ Redefinindo senha para "Admin123!@#"...');
    const { error: passwordError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: 'Admin123!@#'
    });
    
    if (passwordError) {
      console.error('❌ Erro ao redefinir senha:', passwordError);
    } else {
      console.log('✅ Senha redefinida com sucesso');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAdminUser();
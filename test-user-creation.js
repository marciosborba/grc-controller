import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserCreation() {
  console.log('🧪 Testando criação de usuário usando admin service key...');
  
  try {
    // Tentar criar um usuário de teste usando admin API
    const testEmail = `teste-${Date.now()}@example.com`;
    
    console.log(`1️⃣ Tentando criar usuário: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TempPassword123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuário de Teste',
        job_title: 'Tester'
      }
    });
    
    if (authError) {
      console.error('❌ Erro ao criar usuário no auth:', authError);
      return;
    }
    
    console.log('✅ Usuário criado no auth:', authData.user.id);
    
    // Buscar um tenant existente
    console.log('2️⃣ Buscando tenants disponíveis...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(1);
    
    if (tenantsError) {
      console.error('❌ Erro ao buscar tenants:', tenantsError);
      return;
    }
    
    const tenantId = tenants[0]?.id;
    console.log('✅ Tenant encontrado:', tenantId);
    
    // Criar profile
    console.log('3️⃣ Criando profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: 'Usuário de Teste',
        job_title: 'Tester',
        tenant_id: tenantId,
        email: testEmail
      });
    
    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError);
      return;
    }
    
    console.log('✅ Profile criado com sucesso');
    
    // Criar role
    console.log('4️⃣ Atribuindo role...');
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'user'
      });
    
    if (roleError) {
      console.error('❌ Erro ao criar role:', roleError);
      return;
    }
    
    console.log('✅ Role atribuída com sucesso');
    
    // Verificar se usuário foi criado completamente
    console.log('5️⃣ Verificando usuário criado...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .eq('user_id', authData.user.id)
      .single();
    
    console.log('✅ Usuário final:', profile);
    
    // Limpar usuário de teste
    console.log('6️⃣ Removendo usuário de teste...');
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Usuário de teste removido');
    
    console.log('🎉 Teste de criação de usuário concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testUserCreation();
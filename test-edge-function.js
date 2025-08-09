import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEdgeFunction() {
  console.log('🧪 Testando Edge Function de criação de usuários...');
  
  try {
    // 1. Fazer login com admin
    console.log('1️⃣ Fazendo login como admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'adm@grc-controller.com',
      password: 'Teste123!@#'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado:', authData.user.id);
    
    // 2. Buscar tenant disponível
    console.log('2️⃣ Buscando tenants disponíveis...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .limit(1);
    
    if (tenantsError) {
      console.error('❌ Erro ao buscar tenants:', tenantsError);
      return;
    }
    
    if (!tenants || tenants.length === 0) {
      console.error('❌ Nenhum tenant encontrado');
      return;
    }
    
    const tenantId = tenants[0].id;
    console.log('✅ Tenant encontrado:', tenants[0].name, '(', tenantId, ')');
    
    // 3. Testar Edge Function
    console.log('3️⃣ Testando Edge Function create-user-admin...');
    
    const testEmail = `teste-edge-${Date.now()}@example.com`;
    const userData = {
      email: testEmail,
      password: 'TestPassword123!',
      full_name: 'Usuário de Teste',
      job_title: 'Tester',
      department: 'TI',
      phone: '(11) 99999-9999',
      tenant_id: tenantId,
      roles: ['user'],
      permissions: [],
      send_invitation: false,
      must_change_password: false
    };
    
    console.log('📋 Dados do usuário:', {
      email: userData.email,
      full_name: userData.full_name,
      tenant_id: userData.tenant_id,
      roles: userData.roles
    });
    
    const { data: result, error: functionError } = await supabase.functions.invoke('create-user-admin', {
      body: userData
    });
    
    console.log('📊 Resultado da Edge Function:');
    console.log('- Error:', functionError);
    console.log('- Data:', result);
    
    if (functionError) {
      console.error('❌ Erro na Edge Function:', functionError);
    } else if (!result?.success) {
      console.error('❌ Edge Function retornou erro:', result?.error);
    } else {
      console.log('✅ Usuário criado com sucesso:', result.user);
      
      // Limpar usuário de teste
      console.log('4️⃣ Limpando usuário de teste...');
      const supabaseAdmin = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10');
      
      await supabaseAdmin.auth.admin.deleteUser(result.user.id);
      console.log('✅ Usuário de teste removido');
    }
    
    // 5. Logout
    await supabase.auth.signOut();
    console.log('👋 Logout realizado');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testEdgeFunction();
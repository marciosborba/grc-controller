import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateAppCall() {
  console.log('🎯 Simulando chamada da aplicação React...');
  
  try {
    // 1. Login como na aplicação
    console.log('1️⃣ Fazendo login como admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'adm@grc-controller.com',
      password: 'Teste123!@#'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado');
    
    // 2. Simular dados como enviados pela aplicação
    console.log('2️⃣ Preparando dados como na aplicação...');
    
    // Buscar tenant (como faria a aplicação)
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(1);
    
    const targetTenantId = tenants[0].id;
    console.log('✅ Tenant ID:', targetTenantId);
    
    // Dados exatamente como enviados pelo useUserManagement
    const userData = {
      email: `app-test-${Date.now()}@example.com`,
      password: 'temp-password-123', // Senha padrão da aplicação
      full_name: 'Usuário Teste App',
      job_title: 'Developer',
      department: 'TI',
      phone: '+55 11 99999-9999',
      tenant_id: targetTenantId,
      roles: ['user'],
      permissions: [],
      send_invitation: false,
      must_change_password: false
    };
    
    console.log('📋 Dados preparados:', {
      email: userData.email,
      full_name: userData.full_name,
      tenant_id: userData.tenant_id,
      roles: userData.roles
    });
    
    // 3. Chamar Edge Function EXATAMENTE como a aplicação faz
    console.log('3️⃣ Chamando Edge Function via supabase.functions.invoke...');
    
    const { data: result, error: functionError } = await supabase.functions.invoke('create-user-admin', {
      body: userData
    });
    
    console.log('📊 Resultado:');
    console.log('- functionError:', functionError);
    console.log('- result:', result);
    
    if (functionError) {
      console.error('❌ ERRO DA APLICAÇÃO:', functionError);
      console.error('   Tipo:', typeof functionError);
      console.error('   Propriedades:', Object.keys(functionError));
      
      if (functionError.context) {
        console.error('   Status do context:', functionError.context.status);
        console.error('   Status text:', functionError.context.statusText);
        
        // Tentar ler o corpo da resposta
        try {
          const errorBody = await functionError.context.text();
          console.error('   Corpo do erro:', errorBody);
        } catch (bodyError) {
          console.error('   Erro ao ler corpo:', bodyError.message);
        }
      }
    } else if (!result?.success) {
      console.error('❌ ERRO NO RESULTADO:', result?.error);
    } else {
      console.log('✅ SUCESSO! Usuário criado:', result.user);
      
      // Limpar usuário de teste
      const supabaseAdmin = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10');
      await supabaseAdmin.auth.admin.deleteUser(result.user.id);
      console.log('✅ Usuário de teste removido');
    }
    
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

simulateAppCall();
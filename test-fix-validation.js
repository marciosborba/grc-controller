import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserCreationAfterFix() {
  console.log('🛠️ Testando criação de usuário após correção do tenant_id...');
  
  try {
    // 1. Login como admin
    console.log('1️⃣ Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'adm@grc-controller.com',
      password: 'Teste123!@#'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado');
    
    // 2. Obter session e verificar tenant_id
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    
    // 3. Simular dados como a aplicação enviaria agora (com UUID correto)
    const userData = {
      email: `fix-test-${Date.now()}@example.com`,
      password: 'temp-password-123',
      full_name: 'Usuário Teste Fix',
      job_title: 'Tester',
      department: 'QA',
      tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f', // UUID real agora
      roles: ['user'],
      permissions: [],
      send_invitation: false
    };
    
    console.log('📋 Dados para Edge Function:');
    console.log('- Email:', userData.email);
    console.log('- Tenant ID:', userData.tenant_id);
    console.log('- Roles:', userData.roles);
    
    // 4. Chamar Edge Function via supabase.functions.invoke
    console.log('4️⃣ Chamando Edge Function...');
    
    const { data: result, error: functionError } = await supabase.functions.invoke('create-user-admin', {
      body: userData
    });
    
    console.log('📊 Resultado:');
    console.log('- Error:', functionError);
    console.log('- Result:', result);
    
    if (functionError) {
      console.error('❌ Erro da Edge Function:', functionError.message);
      
      if (functionError.context) {
        console.error('- Status:', functionError.context.status);
        try {
          const errorBody = await functionError.context.text();
          console.error('- Corpo do erro:', errorBody);
        } catch (e) {
          console.error('- Erro ao ler corpo da resposta');
        }
      }
    } else if (!result?.success) {
      console.error('❌ Edge Function retornou erro:', result?.error);
    } else {
      console.log('✅ SUCESSO! Usuário criado:');
      console.log('- ID:', result.user.id);
      console.log('- Email:', result.user.email);
      
      // Limpar usuário de teste
      console.log('🧹 Limpando usuário de teste...');
      const supabaseAdmin = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10');
      await supabaseAdmin.auth.admin.deleteUser(result.user.id);
      console.log('✅ Usuário de teste removido');
    }
    
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testUserCreationAfterFix();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEdgeFunctionDetailed() {
  console.log('🧪 Testando Edge Function com captura de erro detalhado...');
  
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
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .limit(1);
    
    const tenantId = tenants[0].id;
    console.log('✅ Tenant encontrado:', tenants[0].name);
    
    // 3. Chamar Edge Function com fetch direto para capturar erro
    console.log('3️⃣ Chamando Edge Function diretamente...');
    
    const testEmail = `teste-detailed-${Date.now()}@example.com`;
    const userData = {
      email: testEmail,
      password: 'TestPassword123!',
      full_name: 'Usuário de Teste',
      job_title: 'Tester',
      tenant_id: tenantId,
      roles: ['user']
    };
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-user-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(userData)
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Corpo da resposta:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('📊 Dados parseados:', responseData);
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta JSON:', parseError);
    }
    
    // 4. Logout
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testEdgeFunctionDetailed();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthorizationHeader() {
  console.log('🔍 Testando authorization header...');
  
  try {
    // 1. Fazer login
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
    
    // 2. Obter session atual
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    
    if (!session) {
      console.error('❌ Nenhuma sessão encontrada');
      return;
    }
    
    console.log('📋 Session info:');
    console.log('- Access token (primeiros 50 chars):', session.access_token.substring(0, 50) + '...');
    console.log('- Token type:', session.token_type);
    console.log('- User ID:', session.user.id);
    
    // 3. Testar chamada com diferentes formatos de authorization
    const testCases = [
      {
        name: 'Bearer + access_token',
        auth: `Bearer ${session.access_token}`
      },
      {
        name: 'access_token only',
        auth: session.access_token
      },
      {
        name: 'token_type + access_token',
        auth: `${session.token_type} ${session.access_token}`
      }
    ];
    
    const tenants = await supabase.from('tenants').select('id').limit(1);
    const tenantId = tenants.data[0].id;
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Testando: ${testCase.name}`);
      
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/create-user-admin`, {
          method: 'POST',
          headers: {
            'Authorization': testCase.auth,
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({
            email: `test-${Date.now()}@example.com`,
            full_name: 'Test User',
            tenant_id: tenantId,
            roles: ['user']
          })
        });
        
        const responseText = await response.text();
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Resposta: ${responseText}`);
        
        if (response.status === 200) {
          console.log('   ✅ SUCESSO!');
          break;
        }
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAuthorizationHeader();
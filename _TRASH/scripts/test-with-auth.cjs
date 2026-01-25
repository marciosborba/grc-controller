const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWithAuth() {
  try {
    console.log('🔐 Testando CRUD com autenticação...\n');

    // Primeiro, tentar criar um usuário de teste ou fazer login
    console.log('1️⃣ Tentando autenticação...');
    
    // Tentar fazer login com credentials de teste
    const testEmail = 'test@exemplo.com';
    const testPassword = 'testpassword123';

    console.log(`Tentando login com: ${testEmail}`);
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.log('⚠️ Login falhou:', loginError.message);
      
      // Tentar criar o usuário
      console.log('2️⃣ Tentando criar usuário de teste...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (signUpError) {
        console.log('❌ Criação de usuário falhou:', signUpError.message);
        console.log('Detalhes:', signUpError);
      } else {
        console.log('✅ Usuário criado:', signUpData?.user?.email);
      }
    } else {
      console.log('✅ Login bem-sucedido:', loginData?.user?.email);
    }

    // Verificar se está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Usuário não autenticado:', userError?.message);
      
      // Tentar uma abordagem diferente: autenticação anônima se disponível
      console.log('3️⃣ Tentando abordagem alternativa...');
      console.log('RLS está impedindo operações sem autenticação adequada.');
      console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
      console.log('1. Execute manualmente no painel Supabase:');
      console.log('   ALTER TABLE legal_bases DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE consents DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE data_inventory DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE dpia_assessments DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE data_subject_requests DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE privacy_incidents DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE processing_activities DISABLE ROW LEVEL SECURITY;');
      console.log('\n2. Ou configure políticas RLS adequadas');
      console.log('\n3. Ou crie um usuário válido no sistema de autenticação');
      
      return;
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Agora testar inserção com usuário autenticado
    console.log('\n4️⃣ Testando inserção com usuário autenticado...');

    const testData = {
      name: 'Teste com Autenticação',
      description: 'Base legal de teste com usuário autenticado',
      legal_basis_type: 'consentimento',
      legal_article: 'Art. 7º, I da LGPD',
      justification: 'Teste com autenticação para verificar se RLS permite',
      applies_to_categories: ['nome', 'email'],
      applies_to_processing: ['marketing'],
      valid_from: new Date().toISOString().split('T')[0],
      status: 'active',
      created_by: user.id,
      updated_by: user.id
    };

    const { data: insertData, error: insertError } = await supabase
      .from('legal_bases')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('❌ Ainda há erro com autenticação:', insertError.message);
      console.log('Código:', insertError.code);
      console.log('Detalhes:', insertError);
    } else {
      console.log('🎉 SUCESSO! Inserção funcionou com autenticação!');
      console.log('ID criado:', insertData[0]?.id);

      // Limpar o teste
      if (insertData && insertData[0]) {
        await supabase
          .from('legal_bases')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🗑️ Registro de teste removido');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testWithAuth();
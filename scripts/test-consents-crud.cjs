const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConsentsCRUD() {
  try {
    console.log('🧪 Testando CRUD de Consentimentos com autenticação...\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }

    const user = loginData?.user;
    if (!user) {
      console.log('❌ Usuário não encontrado após login');
      return;
    }

    console.log('✅ Login realizado:', user.email);

    // 2. Criar um consentimento
    console.log('\n2️⃣ Criando consentimento...');
    const newConsentData = {
      data_subject_email: 'titular.teste@exemplo.com',
      data_subject_name: 'João da Silva Teste',
      data_subject_document: '123.456.789-00',
      purpose: 'Marketing personalizado e comunicação comercial',
      data_categories: ['nome', 'email', 'telefone', 'preferencias'],
      collection_method: 'web_form',
      collection_source: 'Website principal - Formulário de newsletter',
      is_informed: true,
      is_specific: true,
      is_free: true,
      is_unambiguous: true,
      language: 'pt-BR',
      privacy_policy_version: '1.0',
      terms_of_service_version: '1.0',
      created_by: user.id,
      updated_by: user.id
    };

    const { data: createData, error: createError } = await supabase
      .from('consents')
      .insert([newConsentData])
      .select()
      .single();

    if (createError) {
      console.log('❌ Erro ao criar:', createError.message);
      console.log('Detalhes:', createError);
      return;
    }

    console.log('✅ Consentimento criado com ID:', createData.id);
    const consentId = createData.id;

    // 3. Ler o consentimento criado
    console.log('\n3️⃣ Lendo consentimento criado...');
    const { data: readData, error: readError } = await supabase
      .from('consents')
      .select('*')
      .eq('id', consentId)
      .single();

    if (readError) {
      console.log('❌ Erro ao ler:', readError.message);
    } else {
      console.log('✅ Consentimento lido:', readData.data_subject_name);
      console.log('   Status:', readData.status);
      console.log('   Finalidade:', readData.purpose);
    }

    // 4. Atualizar o consentimento (revogar)
    console.log('\n4️⃣ Revogando consentimento...');
    const revokeData = {
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    const { data: revokedData, error: revokeError } = await supabase
      .from('consents')
      .update(revokeData)
      .eq('id', consentId)
      .select()
      .single();

    if (revokeError) {
      console.log('❌ Erro ao revogar:', revokeError.message);
    } else {
      console.log('✅ Consentimento revogado:', revokedData.status);
      console.log('   Revogado em:', revokedData.revoked_at);
    }

    // 5. Listar todos os consentimentos
    console.log('\n5️⃣ Listando todos os consentimentos...');
    const { data: listData, error: listError, count } = await supabase
      .from('consents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (listError) {
      console.log('❌ Erro ao listar:', listError.message);
    } else {
      console.log(`✅ Total de consentimentos: ${count}`);
      listData?.slice(0, 3).forEach((consent, index) => {
        console.log(`   ${index + 1}. ${consent.data_subject_name} (${consent.status})`);
      });
    }

    // 6. Deletar o consentimento de teste
    console.log('\n6️⃣ Deletando consentimento de teste...');
    const { error: deleteError } = await supabase
      .from('consents')
      .delete()
      .eq('id', consentId);

    if (deleteError) {
      console.log('❌ Erro ao deletar:', deleteError.message);
    } else {
      console.log('✅ Consentimento deletado com sucesso');
    }

    console.log('\n🎉 TESTE CRUD DE CONSENTIMENTOS CONCLUÍDO COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testConsentsCRUD();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLegalBasesCRUD() {
  try {
    console.log('🧪 Testando CRUD de Bases Legais com autenticação...\n');

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

    // 2. Criar uma base legal
    console.log('\n2️⃣ Criando base legal...');
    const newBasisData = {
      name: 'Base Legal de Teste CRUD',
      description: 'Descrição da base legal para teste de CRUD completo',
      legal_basis_type: 'consentimento',
      legal_article: 'Art. 7º, I da LGPD',
      justification: 'Justificativa detalhada para o teste de funcionalidade CRUD',
      applies_to_categories: ['nome', 'email', 'telefone'],
      applies_to_processing: ['marketing', 'comunicacao_comercial'],
      valid_from: new Date().toISOString().split('T')[0],
      status: 'active',
      created_by: user.id,
      updated_by: user.id
    };

    const { data: createData, error: createError } = await supabase
      .from('legal_bases')
      .insert([newBasisData])
      .select()
      .single();

    if (createError) {
      console.log('❌ Erro ao criar:', createError.message);
      console.log('Detalhes:', createError);
      return;
    }

    console.log('✅ Base legal criada com ID:', createData.id);
    const basisId = createData.id;

    // 3. Ler a base legal criada
    console.log('\n3️⃣ Lendo base legal criada...');
    const { data: readData, error: readError } = await supabase
      .from('legal_bases')
      .select('*')
      .eq('id', basisId)
      .single();

    if (readError) {
      console.log('❌ Erro ao ler:', readError.message);
    } else {
      console.log('✅ Base legal lida:', readData.name);
      console.log('   Status:', readData.status);
      console.log('   Tipo:', readData.legal_basis_type);
    }

    // 4. Atualizar a base legal
    console.log('\n4️⃣ Atualizando base legal...');
    const updateData = {
      name: 'Base Legal Atualizada - Teste CRUD',
      description: 'Descrição atualizada durante teste de CRUD',
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    const { data: updatedData, error: updateError } = await supabase
      .from('legal_bases')
      .update(updateData)
      .eq('id', basisId)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erro ao atualizar:', updateError.message);
    } else {
      console.log('✅ Base legal atualizada:', updatedData.name);
    }

    // 5. Listar todas as bases legais
    console.log('\n5️⃣ Listando todas as bases legais...');
    const { data: listData, error: listError, count } = await supabase
      .from('legal_bases')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (listError) {
      console.log('❌ Erro ao listar:', listError.message);
    } else {
      console.log(`✅ Total de bases legais: ${count}`);
      listData?.slice(0, 3).forEach((basis, index) => {
        console.log(`   ${index + 1}. ${basis.name} (${basis.legal_basis_type})`);
      });
    }

    // 6. Deletar a base legal de teste
    console.log('\n6️⃣ Deletando base legal de teste...');
    const { error: deleteError } = await supabase
      .from('legal_bases')
      .delete()
      .eq('id', basisId);

    if (deleteError) {
      console.log('❌ Erro ao deletar:', deleteError.message);
    } else {
      console.log('✅ Base legal deletada com sucesso');
    }

    console.log('\n🎉 TESTE CRUD DE BASES LEGAIS CONCLUÍDO COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testLegalBasesCRUD();
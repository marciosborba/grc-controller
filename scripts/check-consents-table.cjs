const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkConsentsTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela consents...\n');

    // 1. Fazer login primeiro
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    // 2. Tentar inserir com campos mínimos para ver quais campos existem
    console.log('1️⃣ Testando inserção com campos básicos...');
    
    const minimalData = {
      data_subject_email: 'test@example.com',
      purpose: 'teste',
      data_categories: ['nome'],
      collection_method: 'web_form'
    };

    const { data, error } = await supabase
      .from('consents')
      .insert([minimalData])
      .select()
      .single();

    if (error) {
      console.log('❌ Erro:', error.message);
      console.log('Código:', error.code);
      console.log('Detalhes:', error);
    } else {
      console.log('✅ Inserção bem-sucedida com campos básicos');
      console.log('Campos criados:', Object.keys(data));
      
      // Limpar
      await supabase.from('consents').delete().eq('id', data.id);
    }

    // 3. Verificar um registro existente para ver a estrutura
    console.log('\n2️⃣ Verificando estrutura de registros existentes...');
    const { data: existingData } = await supabase
      .from('consents')
      .select('*')
      .limit(1);

    if (existingData && existingData.length > 0) {
      console.log('✅ Estrutura encontrada:');
      console.log('Campos disponíveis:', Object.keys(existingData[0]));
    } else {
      console.log('⚠️ Nenhum registro existente encontrado');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkConsentsTable();
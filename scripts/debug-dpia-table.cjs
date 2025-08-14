const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugDPIATable() {
  try {
    console.log('🔍 DEBUG DA TABELA DPIA_ASSESSMENTS\n');

    // Login
    await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    // 1. Verificar se a tabela existe
    console.log('1️⃣ Verificando existência da tabela...');
    const { count, error: countError } = await supabase
      .from('dpia_assessments')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro ao acessar tabela:', countError.message);
      console.log('Código:', countError.code);
      console.log('Detalhes:', countError);
      return;
    }

    console.log(`✅ Tabela existe com ${count} registros`);

    // 2. Tentar inserção com campos mínimos
    console.log('\n2️⃣ Tentando inserção com campos mínimos...');
    
    const minimalData = { name: 'teste_dpia_debug' };

    const { data, error } = await supabase
      .from('dpia_assessments')
      .insert([minimalData])
      .select()
      .single();

    if (error) {
      console.log('❌ Erro na inserção mínima:', error.message);
      console.log('Código:', error.code);
      console.log('Detalhes completos:');
      console.log(JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Inserção mínima bem-sucedida!');
      console.log('Campos disponíveis:', Object.keys(data));
      
      // Limpar
      await supabase.from('dpia_assessments').delete().eq('id', data.id);
    }

    // 3. Tentar diferentes combinações de campos
    console.log('\n3️⃣ Tentando com campos obrigatórios presumidos...');
    
    const possibleFields = [
      { name: 'teste', description: 'teste desc' },
      { name: 'teste', description: 'teste desc', status: 'draft' },
      { name: 'teste', description: 'teste desc', status: 'draft', risk_level: 'medium' },
      { name: 'teste', purpose: 'teste purpose', status: 'draft' }
    ];

    for (let i = 0; i < possibleFields.length; i++) {
      console.log(`   Tentativa ${i + 1}:`);
      const testData = possibleFields[i];
      
      try {
        const { data: testResult, error: testError } = await supabase
          .from('dpia_assessments')
          .insert([testData])
          .select()
          .single();

        if (testError) {
          console.log(`   ❌ Falhou: ${testError.message}`);
        } else {
          console.log(`   ✅ Sucesso com:`, Object.keys(testData));
          console.log(`   Campos criados:`, Object.keys(testResult));
          
          // Limpar
          await supabase.from('dpia_assessments').delete().eq('id', testResult.id);
          break;
        }
      } catch (err) {
        console.log(`   ❌ Exceção: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugDPIATable();
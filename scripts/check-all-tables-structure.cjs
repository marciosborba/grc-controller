const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAllTablesStructure() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DAS TABELAS LGPD\n');

    // Fazer login primeiro
    await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    const tables = [
      'data_inventory',
      'dpia_assessments', 
      'privacy_incidents',
      'processing_activities'
    ];

    for (const tableName of tables) {
      console.log(`📋 Tabela: ${tableName}`);
      console.log('-'.repeat(40));

      // Tentar inserir dados mínimos para descobrir campos obrigatórios
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert([{ name: 'teste_estrutura' }])
          .select()
          .single();

        if (error) {
          console.log(`❌ Erro: ${error.message}`);
          console.log(`Código: ${error.code}`);
          
          // Se erro de campo obrigatório, listar sugestões
          if (error.message.includes('null value')) {
            console.log('🔍 Possíveis campos obrigatórios detectados');
          }
        } else {
          console.log('✅ Inserção básica bem-sucedida');
          console.log('📄 Campos disponíveis:');
          Object.keys(data).forEach((key, index) => {
            console.log(`   ${index + 1}. ${key}`);
          });
          
          // Limpar o registro de teste
          await supabase.from(tableName).delete().eq('id', data.id);
        }
      } catch (testError) {
        console.log(`❌ Erro no teste: ${testError.message}`);
      }

      // Tentar pegar um registro existente para ver a estrutura
      try {
        const { data: existingData } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (existingData && existingData.length > 0) {
          console.log('✅ Estrutura de registro existente:');
          Object.keys(existingData[0]).forEach((key, index) => {
            const value = existingData[0][key];
            const type = typeof value;
            console.log(`   ${index + 1}. ${key} (${type})`);
          });
        } else {
          console.log('⚠️ Nenhum registro existente encontrado');
        }
      } catch (existingError) {
        console.log(`❌ Erro ao buscar registros existentes: ${existingError.message}`);
      }

      console.log(''); // Linha em branco
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAllTablesStructure();
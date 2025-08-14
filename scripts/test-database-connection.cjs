const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...\n');

    // Verificar tabelas LGPD
    const tables = [
      'legal_bases',
      'consents', 
      'data_inventory',
      'dpia_assessments',
      'data_subject_requests',
      'privacy_incidents',
      'processing_activities'
    ];

    for (const table of tables) {
      try {
        console.log(`📋 Testando tabela: ${table}`);
        
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Erro na tabela ${table}:`, error.message);
        } else {
          console.log(`✅ Tabela ${table}: ${count} registros\n`);
        }
      } catch (err) {
        console.log(`❌ Erro ao acessar ${table}:`, err.message);
      }
    }

    // Teste específico de inserção
    console.log('🧪 Testando inserção em legal_bases...');
    
    const testData = {
      name: 'Teste de Conexão',
      description: 'Base legal de teste para verificar conectividade',
      legal_basis_type: 'consentimento',
      legal_article: 'Art. 7º, I da LGPD',
      justification: 'Teste de conectividade com banco de dados',
      applies_to_categories: ['nome', 'email'],
      applies_to_processing: ['marketing'],
      valid_from: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('legal_bases')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('❌ Erro ao inserir:', insertError.message);
      console.log('Detalhes:', insertError);
    } else {
      console.log('✅ Inserção bem-sucedida!');
      console.log('Dados inseridos:', insertData);

      // Remover o registro de teste
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

testConnection();
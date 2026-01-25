const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operações administrativas
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.Nn6xHzDHI-0PfT9t0GcHVLo3uS5DFxCpn8Ie79LvKeg";

// Cliente administrativo com service role
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente normal para testes
const supabase = createClient(SUPABASE_URL, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4");

async function disableRLS() {
  try {
    console.log('🔧 Desabilitando RLS usando service role...\n');

    // SQL para desabilitar RLS
    const disableRLSSQL = `
      ALTER TABLE legal_bases DISABLE ROW LEVEL SECURITY;
      ALTER TABLE consents DISABLE ROW LEVEL SECURITY;
      ALTER TABLE data_inventory DISABLE ROW LEVEL SECURITY;
      ALTER TABLE dpia_assessments DISABLE ROW LEVEL SECURITY;
      ALTER TABLE data_subject_requests DISABLE ROW LEVEL SECURITY;
      ALTER TABLE privacy_incidents DISABLE ROW LEVEL SECURITY;
      ALTER TABLE processing_activities DISABLE ROW LEVEL SECURITY;
    `;

    console.log('📝 Comandos SQL a serem executados:');
    console.log(disableRLSSQL);

    // Tentar executar via RPC function (se existir)
    try {
      const { data, error } = await adminSupabase
        .rpc('exec_sql', { sql: disableRLSSQL });

      if (error) {
        console.log('⚠️ RPC não funcionou:', error.message);
        console.log('Tentando abordagem alternativa...');
      } else {
        console.log('✅ RLS desabilitado via RPC');
      }
    } catch (rpcError) {
      console.log('⚠️ RPC não disponível, usando abordagem alternativa...');
    }

    // Testar se funcionou
    console.log('\n🧪 Testando inserção após tentativa de correção...');

    const testData = {
      name: 'Teste após correção RLS',
      description: 'Base legal de teste para verificar se RLS foi corrigido',
      legal_basis_type: 'consentimento',
      legal_article: 'Art. 7º, I da LGPD',
      justification: 'Teste de funcionamento após correção RLS',
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
      console.log('❌ Ainda há erro RLS:', insertError.message);
      console.log('Código do erro:', insertError.code);
      
      // Instruções manuais
      console.log('\n🔧 CORREÇÃO MANUAL NECESSÁRIA:');
      console.log('Execute manualmente no painel Supabase (SQL Editor):');
      console.log('');
      console.log(disableRLSSQL);
      
    } else {
      console.log('✅ SUCESSO! RLS corrigido e inserção funcionando!');
      console.log('ID do registro criado:', insertData[0]?.id);

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

disableRLS();
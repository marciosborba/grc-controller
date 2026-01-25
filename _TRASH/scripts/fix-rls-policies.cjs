const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixRLSPolicies() {
  try {
    console.log('🔧 Verificando políticas RLS para tabelas LGPD...\n');

    const tables = [
      'legal_bases',
      'consents', 
      'data_inventory',
      'dpia_assessments',
      'data_subject_requests',
      'privacy_incidents',
      'processing_activities'
    ];

    console.log('📋 Status atual das tabelas:');
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} registros`);
      }
    }

    console.log('\n🔧 CORREÇÃO NECESSÁRIA:');
    console.log('As tabelas estão com RLS habilitado mas sem políticas adequadas.');
    console.log('Execute os seguintes comandos SQL no painel do Supabase:\n');

    const sqlCommands = [
      '-- Desabilitar RLS para desenvolvimento (temporário)',
      'ALTER TABLE legal_bases DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE consents DISABLE ROW LEVEL SECURITY;', 
      'ALTER TABLE data_inventory DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE dpia_assessments DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE data_subject_requests DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE privacy_incidents DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE processing_activities DISABLE ROW LEVEL SECURITY;',
      '',
      '-- Verificar status das tabelas após desabilitar RLS',
      "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('legal_bases', 'consents', 'data_inventory', 'dpia_assessments', 'data_subject_requests', 'privacy_incidents', 'processing_activities');"
    ];

    sqlCommands.forEach(cmd => console.log(cmd));

    console.log('\n📝 INSTRUÇÕES:');
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute os comandos SQL acima');
    console.log('4. Depois execute o teste novamente');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixRLSPolicies();
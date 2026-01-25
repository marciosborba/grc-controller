import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkAllLGPDTables() {
  console.log('🔍 Verificando todas as tabelas LGPD...\n');

  const tables = [
    'data_discovery_sources',
    'data_discovery_results', 
    'data_inventory',
    'legal_bases',
    'consents',
    'processing_activities',
    'dpia_assessments',
    'data_subject_requests',
    'privacy_incidents'
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Verificando tabela: ${table}`);
      
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Erro: ${error.message}`);
      } else {
        console.log(`✅ Total de registros: ${count || 0}`);
        
        // Se há registros, mostrar alguns campos
        if (count && count > 0) {
          const { data, error: sampleError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
            
          if (!sampleError && data && data.length > 0) {
            console.log(`📊 Campos: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      }
      console.log(''); // linha em branco
    } catch (error) {
      console.log(`❌ Erro geral em ${table}:`, error.message);
      console.log(''); // linha em branco
    }
  }
}

checkAllLGPDTables();
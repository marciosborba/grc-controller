import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
  console.log('🔄 Executando SQL:', sql);
  console.log('───────────────────────────────────');
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Resultado:', data);
    }
  } catch (err) {
    console.error('❌ Erro de conexão:', err);
  }
}

// Exemplo de uso - descomente para executar
// await executeSQL("SELECT COUNT(*) as total FROM platform_admins;");

console.log('Script carregado. Use executeSQL("SEU_SQL_AQUI") para executar comandos.');

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
    console.log('🔄 Executando SQL:', sql);
    try {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
        if (error) {
            console.error('❌ Erro:', error);
            // Fallback: try raw query if RPC fails (though RPC is likely the way)
            // Note: Supabase JS client doesn't support raw SQL directly without RPC usually.
        } else {
            console.log('✅ Sucesso:', data);
        }
    } catch (err) {
        console.error('❌ Erro de conexão:', err);
    }
}

async function run() {
    await executeSQL(`ALTER TABLE assessment_frameworks ADD COLUMN IF NOT EXISTS is_standard BOOLEAN DEFAULT false;`);
    await executeSQL(`CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_is_standard ON assessment_frameworks(is_standard);`);
    console.log('Done.');
}

run();

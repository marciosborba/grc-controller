
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
    const sql = `
    DO $$
    BEGIN
        ALTER TABLE assessment_frameworks DROP CONSTRAINT IF EXISTS assessment_frameworks_tipo_framework_check;
        ALTER TABLE assessment_frameworks ADD CONSTRAINT assessment_frameworks_tipo_framework_check 
        CHECK (tipo_framework IN (
            'compliance', 'security', 'privacy', 'operational', 'financial', 
            'governance', 'risk_management', 'quality', 'environmental', 'custom',
            'ISO27001', 'NIST', 'LGPD', 'GDPR', 'PCI_DSS', 'SOX', 'COBIT', 'ITIL', 'CUSTOM'
        ));
    END $$;
    `;
    await executeSQL(sql);
    console.log('Done.');
}

run();

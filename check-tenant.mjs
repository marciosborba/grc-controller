import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('tenants')
        .select('id, name, settings');

    if (error) {
        console.error('Error:', error);
        return;
    }

    for (const t of data) {
        console.log(`Tenant: ${t.name} (${t.id})`);
        if (t.settings && t.settings.risk_matrix) {
            console.log('Matrix Type:', t.settings.risk_matrix.type);
            console.log('Matrix Labels:', t.settings.risk_matrix.impact_labels?.length);
        } else {
            console.log('No risk_matrix config.');
        }
    }
}

check();

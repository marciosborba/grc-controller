import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const query = `
        SELECT tablename, policyname, roles, cmd, qual
        FROM pg_policies
        WHERE tablename IN ('vendor_users', 'vendor_portal_users', 'vendor_registry', 'vendor_assessments', 'action_plans')
        ORDER BY tablename, policyname;
    `;

    // We can't directly run arbitrary SQL without rpc, but there is an execute_sql rpc we added in past conversations!
    const { data: policies, error } = await supabase.rpc('execute_sql', { sql_query: query });
    console.log("Policies via execute_sql:");
    console.log(policies || error);

    // Some scripts use exec_sql
    if (error && error.message.includes("Could not find the function")) {
        const { data: pol2, error: err2 } = await supabase.rpc('exec_sql', { sql: query });
        console.log("Policies via exec_sql:");
        console.log(pol2 || err2);
    }
}

main().catch(console.error);

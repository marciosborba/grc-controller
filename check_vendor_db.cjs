const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const email = 'teste5@teste.com'; // From user's screenshot teste5

    console.log('--- vendor_users ---');
    const { data: users, error: errorUsers } = await supabase.from('vendor_users').select('*');
    console.log(users?.length ? users : errorUsers);

    console.log('--- vendor_portal_users ---');
    const { data: portalUsers, error: errorPortal } = await supabase.from('vendor_portal_users').select('*');
    console.log(portalUsers?.length ? portalUsers : errorPortal);

    console.log('--- vendor_registry ---');
    const { data: registry, error: errorRegistry } = await supabase.from('vendor_registry').select('id, name');
    console.log(registry?.length ? registry : errorRegistry);

    console.log('--- vendor_assessments ---');
    const { data: assessments, error: errorAssess } = await supabase.from('vendor_assessments').select('*').order('created_at', { ascending: false }).limit(5);
    console.log(assessments?.length ? assessments : errorAssess);

    console.log('--- action_plans ---');
    const { data: plans, error: errorPlans } = await supabase.from('action_plans').select('*').limit(5);
    console.log(plans?.length ? plans : errorPlans);
}
main().catch(console.error);

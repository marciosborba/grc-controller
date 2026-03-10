const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

console.log('URL:', process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
console.log('KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    // 1. Get a Validation Tenant
    const { data: tenant, error: tErr } = await supabase.from('tenants').select('id, slug').limit(1).single();

    if (tErr) {
        console.error('Error fetching tenant:', tErr);
        return;
    }

    console.log(`Testing RPC for Tenant: ${tenant.slug} (${tenant.id})`);

    // 2. Call RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_tenant_storage_stats', { tenant_id: tenant.id });

    if (rpcError) {
        console.error('❌ RPC Failed:', rpcError);
        console.error('Details:', rpcError.details);
        console.error('Hint:', rpcError.hint);
        console.error('Message:', rpcError.message);
    } else {
        console.log('✅ RPC Success:', JSON.stringify(rpcData, null, 2));
    }
})();

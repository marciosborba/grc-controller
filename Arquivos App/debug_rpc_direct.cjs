const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to DB');

        // 1. Get Tenant
        const resTenant = await client.query("SELECT id, slug FROM public.tenants WHERE slug ILIKE '%grc-controller%' OR name ILIKE '%grc-controller%' LIMIT 1");
        if (resTenant.rows.length === 0) {
            console.error('❌ Tenant grc-controller not found');
            // List all
            const all = await client.query("SELECT slug, name FROM public.tenants LIMIT 5");
            console.log('Available tenants:', all.rows);
            return;
        }
        const tenant = resTenant.rows[0];
        console.log(`Testing Tenant: ${tenant.slug} (${tenant.id})`);

        // 2. Call RPC
        // Note: In SQL we call functions with SELECT
        const resRpc = await client.query("SELECT public.get_tenant_storage_stats($1)", [tenant.id]);

        console.log('✅ RPC Result:', JSON.stringify(resRpc.rows[0], null, 2));

    } catch (err) {
        console.error('❌ Error executing RPC:', err);
    } finally {
        await client.end();
    }
})();

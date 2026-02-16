const { Client } = require('pg');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_type = 'FUNCTION' 
            AND routine_name = 'get_tenant_storage_stats'
        `);

        console.log('RPC exists?', res.rows.length > 0);

        // If it exists, let's call it for a tenant to see what it returns
        if (res.rows.length > 0) {
            const tenantRes = await client.query('SELECT id FROM tenants LIMIT 1');
            const tenantId = tenantRes.rows[0].id;
            console.log('Testing with tenant:', tenantId);

            // Call it
            const stats = await client.query(`SELECT * FROM get_tenant_storage_stats($1)`, [tenantId]);
            console.log('RPC Result:', stats.rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();

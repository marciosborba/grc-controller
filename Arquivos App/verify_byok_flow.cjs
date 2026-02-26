const { Client } = require('pg');
require('dotenv').config();

const config = {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

async function run() {
    try {
        await client.connect();
        console.log("Verifying BYOK flow...");

        // 1. Get a test tenant (marciosborba/grc-controller usually implies a user context, finding a tenant via profile)
        // We'll pick a tenant that currently has keys or just the first one found.
        const tenantRes = await client.query('SELECT id FROM tenants LIMIT 1');
        if (tenantRes.rows.length === 0) throw new Error("No tenants found");
        const tenantId = tenantRes.rows[0].id;
        console.log(`Using Tenant ID: ${tenantId}`);

        // 2. Simulate "Rotate Key" (Random)
        console.log("Simulating Rotate Key (Random generation)...");
        const rotateRes = await client.query(`
      SELECT public.set_tenant_custom_key($1, NULL) as result
    `, [tenantId]);
        console.log("Rotate Result:", rotateRes.rows[0].result);

        // 3. Simulate "Import Key" (BYOK)
        console.log("Simulating Import Key (Custom)...");
        const customKey = Buffer.from("test-key-material-32-bytes-123456").toString('base64');
        const importRes = await client.query(`
      SELECT public.set_tenant_custom_key($1, $2) as result
    `, [tenantId, customKey]);
        console.log("Import Result:", importRes.rows[0].result);

        // 4. Check Status View
        const statusRes = await client.query(`
      SELECT * FROM v_tenant_encryption_status WHERE tenant_id = $1
    `, [tenantId]);
        console.log("Final Status View:", statusRes.rows[0]);

    } catch (err) {
        console.error("Verification Failed:", err);
    } finally {
        await client.end();
    }
}

run();

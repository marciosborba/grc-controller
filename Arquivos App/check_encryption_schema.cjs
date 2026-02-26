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
        console.log("Checking encryption infrastructure...");

        // Check tenant_keys table
        const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'tenant_keys'
    `);
        console.log(`Table 'tenant_keys': ${tableRes.rowCount > 0 ? 'Existent' : 'MISSING'}`);

        // Check pgcrypto extension
        const extRes = await client.query(`
      SELECT extname FROM pg_extension WHERE extname = 'pgcrypto'
    `);
        console.log(`Extension 'pgcrypto': ${extRes.rowCount > 0 ? 'Existent' : 'MISSING'}`);

        // Check RPCs
        const rpcRes = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name IN ('rotate_tenant_key', 'get_tenant_key_status')
    `);
        console.log("Functions found:", rpcRes.rows.map(r => r.routine_name));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

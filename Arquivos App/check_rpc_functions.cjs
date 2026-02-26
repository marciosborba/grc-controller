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

        const res = await client.query("SELECT routine_name FROM information_schema.routines WHERE routine_name IN ('rotate_tenant_key', 'get_tenant_key_status')");
        console.log('Functions found:', res.rows.map(r => r.routine_name));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

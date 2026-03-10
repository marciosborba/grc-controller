const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();

    const res = await client.query(`
        SELECT p.proname AS function_name, pg_get_functiondef(p.oid) AS definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname = 'manage_risk_registration_action_plan'
    `);

    if (res.rows.length > 0) {
        console.log(res.rows[0].definition);
    } else {
        console.log("Function manage_risk_registration_action_plan not found.");
    }

    await client.end();
}

run().catch(e => { console.error(e.message); client.end(); });

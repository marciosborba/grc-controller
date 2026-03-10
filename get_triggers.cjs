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

    console.log("=== TRIGGERS ON RISK_REGISTRATION_ACTION_PLANS ===");
    const res = await client.query(`
        SELECT t.tgname, pg_get_triggerdef(t.oid) AS definition
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'risk_registration_action_plans'
          AND NOT t.tgisinternal
    `);

    if (res.rows.length > 0) {
        res.rows.forEach(r => console.log(`Trigger: ${r.tgname}\nBody: ${r.definition}\n`));
    } else {
        console.log("No custom triggers found on this table.");
    }

    await client.end();
}

run().catch(e => { console.error(e.message); client.end(); });

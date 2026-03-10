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

    console.log("=== RLS POLICIES ON RISK_REGISTRATION_ACTION_PLANS ===");
    const res = await client.query(`
        SELECT polname, polcmd, polqual, polwithcheck
        FROM pg_policy
        WHERE polrelid = 'public.risk_registration_action_plans'::regclass
    `);

    if (res.rows.length > 0) {
        res.rows.forEach(r => {
            console.log(`Policy: ${r.polname}\nCommand: ${r.polcmd}\nQual: ${r.polqual}\nWithCheck: ${r.polwithcheck}\n`);
        });
    } else {
        console.log("No RLS policies found on this table.");
    }

    await client.end();
}

run().catch(e => { console.error(e.message); client.end(); });

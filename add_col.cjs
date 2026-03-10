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

    console.log("=== ADDING SUB_ACTIVITIES COLUMN ===");
    try {
        await client.query(`
            ALTER TABLE public.risk_registration_action_plans 
            ADD COLUMN IF NOT EXISTS sub_activities jsonb DEFAULT '[]'::jsonb;
        `);
        console.log("Column 'sub_activities' added successfully to risk_registration_action_plans.");

        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log("Schema cache reloaded.");
    } catch (e) {
        console.error("Error adding column:", e.message);
    }

    await client.end();
}

run().catch(e => { console.error(e.message); client.end(); });

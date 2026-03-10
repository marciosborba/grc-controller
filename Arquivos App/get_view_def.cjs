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
        const res = await client.query("SELECT pg_get_viewdef('public.vw_action_plans_unified', true)");
        console.log(res.rows[0].pg_get_viewdef);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

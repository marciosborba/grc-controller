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
        // Fetch function definition
        const res = await client.query(`
      SELECT pg_get_functiondef(oid) 
      FROM pg_proc 
      WHERE proname = 'admin_list_active_sessions' 
      AND pronamespace = 'public'::regnamespace;
    `);

        if (res.rows.length > 0) {
            console.log(res.rows[0].pg_get_functiondef);
        } else {
            console.log('Function not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

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
        console.log("Reading rotate_tenant_key full source...");

        const res = await client.query(`
      SELECT pg_get_functiondef(oid) as code
      FROM pg_proc 
      WHERE proname = 'rotate_tenant_key'
    `);

        if (res.rows.length > 0) {
            console.log("---------------------------------------------------");
            console.log(res.rows[0].code);
            console.log("---------------------------------------------------");
        } else {
            console.log("Function not found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

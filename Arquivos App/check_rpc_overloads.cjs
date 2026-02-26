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
        console.log("Checking overloads for rotate_tenant_key...");

        // pg_proc stores functions. We want to see arguments.
        // pg_get_function_identity_arguments(oid) gives the args list.
        const res = await client.query(`
      SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
      FROM pg_proc 
      WHERE proname = 'rotate_tenant_key'
    `);

        res.rows.forEach(r => {
            console.log(`Function: ${r.proname}(${r.args})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

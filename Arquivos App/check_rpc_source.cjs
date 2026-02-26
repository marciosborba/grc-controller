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
        console.log("Checking RPC definitions...");

        const rpcs = ['get_tenant_key_status', 'rotate_tenant_key'];

        for (const rpc of rpcs) {
            console.log(`\n--- ${rpc} ---`);
            const res = await client.query(`
          SELECT prosrc 
          FROM pg_proc 
          WHERE proname = $1
        `, [rpc]);

            if (res.rows.length > 0) {
                console.log(res.rows[0].prosrc);
            } else {
                console.log("Not found.");
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

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
        console.log("Checking v_tenant_encryption_status...");

        // Get view definition or columns
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'v_tenant_encryption_status'
    `);

        res.rows.forEach(r => {
            console.log(`- ${r.column_name} (${r.data_type})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

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
        console.log("Checking columns for evidencias_auditoria...");

        const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'evidencias_auditoria'
    `);

        const columns = res.rows.map(r => r.column_name);
        console.log("Columns:", columns.join(', '));

        console.log("Has tenant_id?", columns.includes('tenant_id'));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

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
        console.log("Checking columns for policy_acknowledgments...");

        const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'policy_acknowledgments'
    `);

        console.log(res.rows.map(r => r.column_name).join(', '));

        // Also check policy_metrics while we are at it
        console.log("Checking columns for policy_metrics...");
        const res2 = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'policy_metrics'
    `);
        console.log(res2.rows.map(r => r.column_name).join(', '));


    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

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
        console.log("Connected. Listing auth schema tables...");

        const res = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'auth'
      ORDER BY tablename
    `);

        if (res.rows.length === 0) {
            console.log("No tables found in auth schema (or no permission).");
        } else {
            console.log("Auth Tables:");
            res.rows.forEach(r => console.log(r.tablename));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

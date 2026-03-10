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
        console.log("Connected to database.");

        // Only target tables that actually exist from the list
        const sql = `
      DROP POLICY IF EXISTS "allow_read_standard_controls" ON public.assessment_controls;
      DROP POLICY IF EXISTS "allow_read_standard_frameworks" ON public.assessment_frameworks;
    `;

        console.log("Executing SQL...");
        await client.query(sql);
        console.log("Successfully dropped redundant policies on existing tables.");

    } catch (err) {
        console.error("Error executing SQL:", err);
    } finally {
        await client.end();
    }
}

run();

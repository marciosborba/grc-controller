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
        console.log("Connected. Dropping persistent custom_fonts policy...");

        await client.query(`DROP POLICY IF EXISTS "Users can view global and own tenant fonts" ON public.custom_fonts`);

        console.log("Successfully dropped policy.");

        // Verify immediately
        const res = await client.query(`SELECT policyname FROM pg_policies WHERE tablename = 'custom_fonts'`);
        console.log("Remaining policies:", res.rows.map(r => r.policyname));

    } catch (err) {
        console.error("Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();

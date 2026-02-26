const { Client } = require('pg');
const fs = require('fs');
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
        console.log("Connected. Applying batched RLS performance optimizations...");

        const sql = fs.readFileSync('C:\\Users\\marci\\.gemini\\antigravity\\brain\\8b97270b-b1ad-4e4d-86b2-38535a43fac6\\fix_all_auth_uid_perf.sql', 'utf8');
        await client.query(sql);

        console.log("Successfully optimized 20+ policies.");

    } catch (err) {
        console.error("Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();

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
        console.log("Checking custom_fonts policy definition...");

        const res = await client.query(`
      SELECT policyname, qual
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'custom_fonts'
    `);

        res.rows.forEach(r => {
            console.log(`POLICY: "${r.policyname}"`);
            console.log(`SOURCE: ${r.qual}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

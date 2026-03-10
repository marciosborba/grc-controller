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
        console.log("Connected. Checking assessments policies...");

        const query = `
      SELECT policyname, cmd, roles, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'assessments'
      ORDER BY cmd, policyname
    `;

        const res = await client.query(query);
        res.rows.forEach(r => {
            console.log(`\nPolicy: ${r.policyname} (${r.cmd})`);
            console.log(`  Roles: ${r.roles}`);
            console.log(`  USING: ${r.qual}`);
            console.log(`  CHECK: ${r.with_check}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

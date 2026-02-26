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
        console.log("Dumping workflow_steps policies...");

        const res = await client.query(`
      SELECT policyname, roles, cmd
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'workflow_steps'
    `);

        res.rows.forEach(r => {
            console.log(`POLICY: "${r.policyname}" | CMD: ${r.cmd}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

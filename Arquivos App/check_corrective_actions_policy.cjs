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
        console.log("Checking ethics_corrective_actions policy...");

        const res = await client.query(`
      SELECT policyname, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'ethics_corrective_actions'
      AND policyname = 'corrective_actions_tenant_policy'
    `);

        res.rows.forEach(r => {
            console.log(`POLICY: "${r.policyname}"`);
            console.log(`QUAL: ${r.qual}`);
            console.log('---');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

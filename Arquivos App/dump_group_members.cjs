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
        console.log("Dumping FULL group_members policies...");

        const res = await client.query(`
      SELECT policyname, cmd, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'group_members'
    `);

        res.rows.forEach(r => {
            console.log(`POLICY: "${r.policyname}"`);
            console.log(`CMD: ${r.cmd}`);
            console.log(`QUAL: ${r.qual}`);
            console.log(`CHECK: ${r.with_check}`);
            console.log('--------------------------------------------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

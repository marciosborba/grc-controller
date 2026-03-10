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
        console.log("Checking global_ui_themes policies...");

        const res = await client.query(`
      SELECT policyname, roles, cmd, qual
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'global_ui_themes'
    `);

        res.rows.forEach(r => {
            console.log(`POLICY: "${r.policyname}"`);
            console.log(`CMD: ${r.cmd}`);
            console.log(`ROLES: ${r.roles}`);
            console.log('---');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

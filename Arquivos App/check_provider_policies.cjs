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

        const query = `
      SELECT policyname, cmd, roles, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'ai_grc_providers'
    `;

        const res = await client.query(query);
        console.log(`Policies on ai_grc_providers: ${res.rows.length}`);
        for (const r of res.rows) {
            console.log(`\nPolicy: "${r.policyname}"`);
            console.log(`Cmd: ${r.cmd}`);
            console.log(`Roles: ${r.roles}`);
            console.log(`Qual: [${r.qual}]`);
            console.log(`Check: [${r.with_check}]`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

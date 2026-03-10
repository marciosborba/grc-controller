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
        console.log("Scanning for multiple permissive policies...");

        // Find tables with >1 permissive policy for the same (role, cmd) pair
        const res = await client.query(`
      SELECT 
        tablename,
        roles,
        cmd,
        count(*) as policy_count,
        array_agg(policyname) as policies
      FROM pg_policies
      WHERE schemaname = 'public'
      GROUP BY tablename, roles, cmd
      HAVING count(*) > 1
      ORDER BY tablename, cmd
    `);

        res.rows.forEach(r => {
            console.log(`TABLE: ${r.tablename}`);
            console.log(`CMD:   ${r.cmd}`);
            console.log(`ROLES: ${r.roles}`);
            console.log(`COUNT: ${r.policy_count}`);
            console.log(`POLICIES:`);
            r.policies.forEach(p => console.log(`  - "${p}"`));
            console.log('---');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

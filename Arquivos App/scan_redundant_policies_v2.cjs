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
        console.log("Scanning for tables with multiple permissive policies...");

        // Query to find tables/roles/cmds with > 1 permissive policy
        const res = await client.query(`
      SELECT schemaname, tablename, roles, cmd, count(*) 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      GROUP BY schemaname, tablename, roles, cmd 
      HAVING count(*) > 1
      ORDER BY tablename
    `);

        if (res.rows.length === 0) {
            console.log("No redundant policies found!");
        } else {
            console.log("Found redundancies:");
            for (const r of res.rows) {
                console.log(`\nTABLE: ${r.tablename} | CMD: ${r.cmd} | COUNT: ${r.count}`);

                // Fetch the specific policy names for this group
                const policies = await client.query(`
                SELECT policyname, qual 
                FROM pg_policies 
                WHERE schemaname = 'public' 
                AND tablename = $1 
                AND cmd = $2
            `, [r.tablename, r.cmd]);

                policies.rows.forEach(p => {
                    console.log(` - "${p.policyname}"`);
                });
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

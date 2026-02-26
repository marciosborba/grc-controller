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
        console.log("Connected. Scanning for 'Always True' policies...");

        // Find policies where qual or with_check is literally 'true'
        // Filter for INSERT, UPDATE, DELETE (SELECT with true is sometimes valid for public tables, but we can verify those too if needed)
        // The user specifically mentioned INSERT, UPDATE, DELETE in the issue description.

        const query = `
      SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND (
           (qual = 'true' AND cmd IN ('UPDATE', 'DELETE', 'ALL')) 
        OR (with_check = 'true' AND cmd IN ('INSERT', 'UPDATE', 'ALL'))
      )
      ORDER BY tablename, policyname;
    `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log("No 'Always True' policies found for modification commands.");
        } else {
            console.log(`Found ${res.rows.length} potentially insecure policies:`);
            res.rows.forEach(r => {
                console.log(`\nTable: ${r.tablename}`);
                console.log(`  Policy: ${r.policyname}`);
                console.log(`  Cmd: ${r.cmd}`);
                console.log(`  Qual: ${r.qual}`);
                console.log(`  Check: ${r.with_check}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

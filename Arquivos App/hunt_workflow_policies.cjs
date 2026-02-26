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
        console.log("Hunting for workflow policies...");

        // Check table existence
        const tableRes = await client.query("SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'workflow_steps'");
        if (tableRes.rows.length === 0) {
            console.log("Table 'workflow_steps' NOT FOUND.");
        } else {
            console.log(`Table 'workflow_steps' found. RLS enabled: ${tableRes.rows[0].rowsecurity}`);
        }

        // Search policies by partial name
        const res = await client.query(`
      SELECT tablename, policyname, cmd 
      FROM pg_policies 
      WHERE policyname LIKE '%workflow%'
    `);

        if (res.rows.length === 0) {
            console.log("No policies found with 'workflow' in name.");
        } else {
            res.rows.forEach(r => {
                console.log(`Match: Table '${r.tablename}' - Policy '${r.policyname}' (${r.cmd})`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

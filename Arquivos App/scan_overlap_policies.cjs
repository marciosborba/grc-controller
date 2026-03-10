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
        console.log("Scanning for ALL vs Specific Command overlaps...");

        // Find tables that have at least one 'ALL' policy
        const allPolicies = await client.query(`
      SELECT tablename, policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND cmd = 'ALL'
    `);

        const candidates = allPolicies.rows;
        if (candidates.length === 0) {
            console.log("No ALL policies found.");
            return;
        }

        for (const cand of candidates) {
            // Check if this table ALSO has specific command policies
            const specific = await client.query(`
            SELECT policyname, cmd 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = $1 
            AND cmd != 'ALL'
        `, [cand.tablename]);

            if (specific.rows.length > 0) {
                console.log(`\nTABLE: ${cand.tablename}`);
                console.log(` - ALL Policy: "${cand.policyname}"`);
                specific.rows.forEach(s => {
                    console.log(` - Overlap: "${s.policyname}" (${s.cmd})`);
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

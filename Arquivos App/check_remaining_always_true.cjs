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

        // Check specific tables reported
        const tables = ['auth_lockouts', 'policies', 'vendor_assessments', 'vendor_registry'];

        console.log("--- Policies ---");
        for (const t of tables) {
            console.log(`\nTable: ${t}`);
            const res = await client.query(`
          SELECT policyname, cmd, roles, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
        `, [t]);

            res.rows.forEach(r => {
                console.log(`  Policy: ${r.policyname} (${r.cmd})`);
                console.log(`    Qual: ${r.qual}`);
                console.log(`    Check: ${r.with_check}`);
            });
        }

        console.log("\n--- Schema (Column Check) ---");
        for (const t of tables) {
            const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            ORDER BY ordinal_position
        `, [t]);
            const cols = res.rows.map(r => r.column_name);
            console.log(`${t}: ${cols.join(', ')}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

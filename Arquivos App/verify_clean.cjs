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
        console.log("Clean verification of policies...");

        const tables = [
            'ethics_evidence',
            'evidencias_auditoria',
            'global_ui_themes'
        ];

        // Fetch one by one to avoid interleaving issues if any
        for (const table of tables) {
            console.log(`\n--- TABLE: ${table} ---`);
            const res = await client.query(`
          SELECT policyname, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
          ORDER BY policyname
        `, [table]);

            res.rows.forEach(r => {
                console.log(`POLICY: ${r.policyname}`);
                console.log(`QUAL: ${r.qual}`);
                console.log(`CHECK: ${r.with_check}`);
                console.log('-');
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

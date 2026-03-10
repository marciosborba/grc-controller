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
        console.log("Connected. Checking policies for optimization...");

        // Check key tables reported
        const tables = [
            'apontamentos_auditoria',
            'audit_risk_assessments',
            'audit_risk_matrix_config',
            'audit_sampling_configs',
            'audit_sampling_items',
            'audit_sampling_plans',
            'consents',
            'custom_fonts'
        ];

        for (const t of tables) {
            console.log(`\nTable: ${t}`);
            const res = await client.query(`
          SELECT policyname, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
        `, [t]);

            res.rows.forEach(r => {
                // Heuristic check for unwrapped auth calls
                const q = r.qual || '';
                const wc = r.with_check || '';
                // Look for 'auth.uid()' NOT preceded by '(SELECT' approx
                // This is just for visual confirmation for me
                console.log(`  Policy: ${r.policyname}`);
                console.log(`    USING: ${q}`);
                if (wc) console.log(`    CHECK: ${wc}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

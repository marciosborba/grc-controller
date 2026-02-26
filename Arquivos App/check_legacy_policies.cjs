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
        console.log("Connected. Checking for 'Authenticated Access' policies...");

        const tables = [
            'apontamentos_auditoria',
            'audit_risk_matrix_config',
            'audit_risk_assessments',
            'audit_sampling_configs',
            'audit_sampling_items',
            'audit_sampling_plans'
        ];

        for (const t of tables) {
            console.log(`\nTable: ${t}`);
            const res = await client.query(`
          SELECT policyname, cmd, roles, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1
          ORDER BY policyname
        `, [t]);

            if (res.rows.length === 0) console.log("  (No policies)");

            res.rows.forEach(r => {
                console.log(`  [${r.cmd}] ${r.policyname}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();

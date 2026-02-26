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
        console.log("Connected. Dropping legacy 'Authenticated Access' policies...");

        const sql = `
      DROP POLICY IF EXISTS "Authenticated Access" ON public.apontamentos_auditoria;
      DROP POLICY IF EXISTS "Authenticated Access" ON public.audit_risk_matrix_config;
      DROP POLICY IF EXISTS "Authenticated Access" ON public.audit_risk_assessments;
      DROP POLICY IF EXISTS "Authenticated Access" ON public.audit_sampling_configs;
      DROP POLICY IF EXISTS "Authenticated Access" ON public.audit_sampling_items;
      DROP POLICY IF EXISTS "Authenticated Access" ON public.audit_sampling_plans;
    `;

        await client.query(sql);
        console.log("Successfully dropped legacy policies.");

    } catch (err) {
        console.error("Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();

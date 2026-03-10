import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        // Get columns
        const { rows: cols } = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'vendor_risk_action_plans'
            ORDER BY ordinal_position;
        `);
        console.log("vendor_risk_action_plans columns:", cols.map(c => c.column_name));

        // Get all plans
        const { rows: plans } = await pool.query(`
            SELECT * FROM public.vendor_risk_action_plans LIMIT 10;
        `);
        console.log("Plans:", plans);

        // Check action_plans with vendor_risk origin  
        const { rows: aplans } = await pool.query(`
            SELECT id, titulo, status, modulo_origem, entidade_origem_id, tenant_id, created_at 
            FROM public.action_plans 
            WHERE modulo_origem = 'vendor_risk'
            ORDER BY created_at DESC LIMIT 10;
        `);
        console.log("action_plans (vendor_risk):", aplans);
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}
main();

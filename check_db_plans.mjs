import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const { rows } = await pool.query(`
            SELECT id, titulo, status, modulo_origem, tenant_id 
            FROM public.action_plans 
            WHERE modulo_origem = 'vendor_risk' AND status = 'aguardando_validacao';
        `);
        console.log("Action Plans:", rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();

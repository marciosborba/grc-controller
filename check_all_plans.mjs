import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const { rows } = await pool.query(`
            SELECT id, titulo, status, modulo_origem, metadados 
            FROM public.action_plans 
            WHERE modulo_origem = 'vendor_risk'
            ORDER BY created_at DESC LIMIT 10;
        `);
        console.log("All vendor_risk action_plans:", rows.map(r => ({
            titulo: r.titulo,
            status: r.status,
            auto: r.metadados?.auto_generated
        })));
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}
main();

import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        // Update all vendor_risk action_plans with planejado to aguardando_validacao if auto_generated
        const { rowCount } = await pool.query(`
            UPDATE public.action_plans
            SET status = 'aguardando_validacao'
            WHERE modulo_origem = 'vendor_risk'
            AND status = 'planejado'
            AND (metadados->>'auto_generated')::text = 'true';
        `);
        console.log(`Updated ${rowCount} plans to aguardando_validacao.`);
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}
main();

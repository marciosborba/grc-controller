import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        // Check vendor_assessments
        const { rows } = await pool.query(`
      SELECT id, tenant_id, assessment_name, status, created_at FROM public.vendor_assessments ORDER BY created_at DESC LIMIT 5
    `);
        console.log('vendor_assessments:');
        rows.forEach(r => console.log(JSON.stringify(r)));

        // Check assessments table
        const { rows: r2 } = await pool.query(`
      SELECT id, tenant_id, titulo, status, created_at FROM public.assessments ORDER BY created_at DESC LIMIT 5
    `);
        console.log('\nassessments:');
        r2.forEach(r => console.log(JSON.stringify(r)));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();

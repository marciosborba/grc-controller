import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        // Check columns of vendor_assessments
        const { rows: cols } = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='vendor_assessments'
      ORDER BY ordinal_position
    `);
        console.log('vendor_assessments columns:', cols.map(r => r.column_name).join(', '));

        // Fetch a sample row
        const { rows } = await pool.query(`
      SELECT * FROM public.vendor_assessments LIMIT 1
    `);
        if (rows.length > 0) {
            console.log('\nSample row keys:', Object.keys(rows[0]).join(', '));
            console.log('Sample row:', JSON.stringify(rows[0], null, 2).substring(0, 500));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();

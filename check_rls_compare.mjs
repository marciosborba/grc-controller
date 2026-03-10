import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const { rows } = await pool.query(`
      SELECT tablename, policyname, qual 
      FROM pg_policies 
      WHERE schemaname = 'public'
        AND tablename IN ('assessments', 'vendor_assessments')
      ORDER BY tablename, policyname
    `);
        rows.forEach(r => {
            console.log(`\n=== ${r.tablename} | ${r.policyname} ===`);
            if (r.qual) console.log(r.qual);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();

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
        AND tablename IN ('vendor_assessments', 'vendor_registry', 'assessments')
      ORDER BY tablename, policyname
    `);
        rows.forEach(r => {
            console.log(`Table: ${r.tablename} | Policy: ${r.policyname}`);
            if (r.qual) {
                const shortQual = r.qual.length > 200 ? r.qual.substring(0, 200) + '...' : r.qual;
                console.log(`  Condition: ${shortQual}\n`);
            }
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();

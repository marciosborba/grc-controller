import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vendor_assessments' OR table_name = 'vendor_registry';
        `);
        console.log("Columns:", res.rows.map(r => r.column_name));

        // Also let's check one assessment
        const res2 = await pool.query(`SELECT * FROM vendor_assessments LIMIT 1`);
        console.log("Assessment sample:", Object.keys(res2.rows[0]));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

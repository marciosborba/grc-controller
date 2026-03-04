import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const query = `
          SELECT *
          FROM public.vendor_assessments 
          WHERE id = '497aadf4-015e-43e0-9eb0-0ba3fb4ac69e';
        `;
        const res = await pool.query(query);
        fs.writeFileSync('tmp_assessment_raw.json', JSON.stringify(res.rows[0], null, 2), 'utf8');
        console.log("Exported to tmp_assessment_raw.json");
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

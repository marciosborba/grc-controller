import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    const { rows } = await pool.query(`
        SELECT id, assessment_name, status, overall_score, risk_level, 
               submission_summary, metadata
        FROM public.vendor_assessments 
        WHERE vendor_id = '6302338c-9d89-4489-8bb1-8b6c002dda00'
    `);
    rows.forEach(r => {
        // Limit metadata output
        if (r.metadata) r.metadata = JSON.stringify(r.metadata).substring(0, 300) + '...';
        if (r.submission_summary) r.submission_summary = r.submission_summary.substring(0, 300) + '...';
    });
    fs.writeFileSync('vendor_scores_dump.txt', JSON.stringify(rows, null, 2));
    console.log('Done');
    pool.end();
}
main().catch(console.error);

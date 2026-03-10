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
        const data = res.rows;

        let out = [];

        for (const assessment of data) {
            let questions = assessment.metadata?.questions || [];
            if (questions.length === 0 && assessment.metadata?.vendor_framework_id) {
                const fwQuery = `
                    SELECT vaf.questions 
                    FROM public.vendor_assessment_frameworks vaf
                    WHERE vaf.id = $1
                 `;
                const fwRes = await pool.query(fwQuery, [assessment.metadata.vendor_framework_id]);
                if (fwRes.rows.length > 0) {
                    questions = fwRes.rows[0].questions || [];
                }
            }

            out.push({
                id: assessment.id,
                name: assessment.assessment_name,
                status: assessment.status,
                responses: assessment.responses,
                questions: questions.map(q => ({ id: q.id, type: q.type, category: q.category, text: q.text || q.question }))
            });
        }

        fs.writeFileSync('tmp_assessments_full.json', JSON.stringify(out, null, 2), 'utf8');
        console.log("Exported to tmp_assessments_full.json");
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

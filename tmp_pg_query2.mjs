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
          SELECT id, assessment_name, responses, metadata, framework_id
          FROM public.vendor_assessments 
          WHERE responses IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 1;
        `;
        const res = await pool.query(query);
        const data = res.rows;

        if (data.length > 0) {
            const assessment = data[0];
            let questions = assessment.metadata?.questions || [];

            if (questions.length === 0) {
                const fwQuery = `
                    SELECT vaf.questions 
                    FROM public.vendor_assessments va
                    JOIN public.vendor_assessment_frameworks vaf ON vaf.id = (va.metadata->>'vendor_framework_id')::uuid
                    WHERE va.id = $1
                 `;
                const fwRes = await pool.query(fwQuery, [assessment.id]);
                if (fwRes.rows.length > 0) {
                    questions = fwRes.rows[0].questions || [];
                }
            }

            const out = {
                id: assessment.id,
                name: assessment.assessment_name,
                responses: assessment.responses,
                questions: questions.map(q => ({ id: q.id, type: q.type, category: q.category, text: q.text || q.question }))
            };

            fs.writeFileSync('tmp_assessment_export.json', JSON.stringify(out, null, 2), 'utf8');
            console.log("Exported to tmp_assessment_export.json");
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

import pg from 'pg';

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
          LIMIT 3;
        `;
        const res = await pool.query(query);
        const data = res.rows;

        if (data.length > 0) {
            const assessment = data[0];
            const metadata = assessment.metadata || {};
            const questions = metadata.questions || [];

            console.log("ASSESSMENT ID:", assessment.id);
            console.log("NAME:", assessment.assessment_name);
            console.log("RESPONSES SNAPSHOT:", assessment.responses);

            console.log("QUESTIONS SNAPSHOT (metadata):");
            questions.forEach(q => {
                console.log(`- ID: ${q.id} | TYPE: ${q.type} | CAT: ${q.category} | TEXT: ${q.text || q.question}`);
                if (q.options) console.log(`  OPTIONS:`, q.options);
            });

            // Also fetch the framework questions if metadata is empty
            if (questions.length === 0) {
                const fwQuery = `
                    SELECT vaf.questions 
                    FROM public.vendor_assessments va
                    JOIN public.vendor_assessment_frameworks vaf ON vaf.id = (va.metadata->>'vendor_framework_id')::uuid
                    WHERE va.id = $1
                 `;
                const fwRes = await pool.query(fwQuery, [assessment.id]);
                if (fwRes.rows.length > 0) {
                    console.log("QUESTIONS FROM FRAMEWORK:");
                    fwRes.rows[0].questions.forEach(q => {
                        console.log(`- ID: ${q.id} | TYPE: ${q.type} | CAT: ${q.category} | TEXT: ${q.text || q.question}`);
                    });
                }
            }
        } else {
            console.log("No pending standard assessments found.");
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

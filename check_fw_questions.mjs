import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        const { rows } = await pool.query(`
            SELECT id, name, framework_type,
                jsonb_array_length(questions) as question_count,
                jsonb_typeof(questions) as questions_type
            FROM vendor_assessment_frameworks
            ORDER BY name;
        `);
        console.log('Frameworks and their question counts:');
        rows.forEach(r => console.log(`  ${r.name} (${r.framework_type}): ${r.question_count} questions [type: ${r.questions_type}]`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

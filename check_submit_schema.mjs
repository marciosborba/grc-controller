import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('Checking recent vendor assessments statuses');
        const assessments = await pool.query(`
            SELECT id, vendor_id, framework_id, status, public_link, public_link_expires_at
            FROM vendor_assessments
            ORDER BY created_at DESC
            LIMIT 5
        `);
        console.table(assessments.rows);

        console.log('\nTesting the RPC locally with a dummy call to see the exact error:');

        if (assessments.rows.length > 0) {
            const a = assessments.rows[0];

            // Just test if the action_plans schema matches what the RPC tries to insert
            const columns = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'action_plans'
            `);
            console.log('action_plans columns:');
            columns.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));

            // Check action_plan_categories
            const catCols = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'action_plan_categories'
            `);
            console.log('\naction_plan_categories columns:');
            catCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

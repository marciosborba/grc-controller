import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    // UPDATE policy for vendor users on action_plan_activities
    await pool.query(`
        CREATE POLICY "vendor_update_activities" ON action_plan_activities
        FOR UPDATE
        USING (
            action_plan_id IN (
                SELECT ap.id FROM action_plans ap
                WHERE ap.entidade_origem_id IN (SELECT auth_vendor_ids())
            )
        )
        WITH CHECK (
            action_plan_id IN (
                SELECT ap.id FROM action_plans ap
                WHERE ap.entidade_origem_id IN (SELECT auth_vendor_ids())
            )
        )
    `);
    console.log('Created UPDATE policy for action_plan_activities.');

    // DELETE policy for vendor users on action_plan_activities
    await pool.query(`
        CREATE POLICY "vendor_delete_activities" ON action_plan_activities
        FOR DELETE
        USING (
            action_plan_id IN (
                SELECT ap.id FROM action_plans ap
                WHERE ap.entidade_origem_id IN (SELECT auth_vendor_ids())
            )
        )
    `);
    console.log('Created DELETE policy for action_plan_activities.');

    // Also need UPDATE on action_plans for progress sync
    // Check if vendor update policy exists
    const { rows: existingPol } = await pool.query(`
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'action_plans' AND policyname LIKE 'vendor_update%'
    `);
    if (existingPol.length === 0) {
        await pool.query(`
            CREATE POLICY "vendor_update_action_plans" ON action_plans
            FOR UPDATE
            USING (
                entidade_origem_id IN (SELECT auth_vendor_ids())
            )
            WITH CHECK (
                entidade_origem_id IN (SELECT auth_vendor_ids())
            )
        `);
        console.log('Created UPDATE policy for action_plans.');
    } else {
        console.log('Vendor UPDATE policy on action_plans already exists.');
    }

    pool.end();
    console.log('Done');
}
main().catch(e => { console.error('Error:', e.message); pool.end(); });

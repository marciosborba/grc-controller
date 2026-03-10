import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    const output = [];

    // action_plan_activities columns
    const { rows: cols } = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'action_plan_activities' AND table_schema = 'public'
        ORDER BY ordinal_position
    `);
    output.push("=== action_plan_activities columns ===");
    output.push(JSON.stringify(cols, null, 2));

    // RLS policies on action_plan_activities
    const { rows: policies } = await pool.query(`
        SELECT policyname, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'action_plan_activities'
    `);
    output.push("\n=== RLS policies on action_plan_activities ===");
    output.push(JSON.stringify(policies, null, 2));

    // Check if RLS is enabled
    const { rows: rlsInfo } = await pool.query(`
        SELECT relrowsecurity, relforcerowsecurity 
        FROM pg_class WHERE relname = 'action_plan_activities'
    `);
    output.push("\n=== RLS enabled? ===");
    output.push(JSON.stringify(rlsInfo, null, 2));

    fs.writeFileSync('action_activities_schema.txt', output.join('\n'));
    console.log('Done');
    pool.end();
}
main().catch(console.error);

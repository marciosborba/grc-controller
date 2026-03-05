import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    // Check columns
    const { rows: cols } = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name='vendor_portal_users' AND table_schema='public'
        ORDER BY ordinal_position
    `);
    console.log('COLUMNS:');
    cols.forEach(r => console.log(`  ${r.column_name} :: ${r.data_type}`));

    // Check RLS policies
    const { rows: policies } = await pool.query(`
        SELECT policyname, cmd FROM pg_policies WHERE tablename='vendor_portal_users'
    `);
    console.log('POLICIES:');
    policies.forEach(r => console.log(`  ${r.policyname} (${r.cmd})`));

    // Count data
    const { rows: cnt } = await pool.query(`SELECT count(*) as c FROM vendor_portal_users`);
    console.log('ROW COUNT:', cnt[0].c);

    // Check if user_id column exists
    const hasUserId = cols.some(c => c.column_name === 'user_id');
    const hasIsActive = cols.some(c => c.column_name === 'is_active');
    console.log('has user_id:', hasUserId, 'has is_active:', hasIsActive);

    pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });

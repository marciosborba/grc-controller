import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    // Use profiles table for admin check (role-based)
    const adminCheck = `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'platform_admin'))`;

    // SELECT policy for admin
    console.log('Creating admin SELECT policy...');
    try {
        await pool.query(`CREATE POLICY "admin_select_portal_users" ON vendor_portal_users FOR SELECT USING (${adminCheck})`);
        console.log('  ✓ created');
    } catch (e) {
        console.log('  ⓘ', e.message.substring(0, 80));
    }

    // UPDATE policy for admin
    console.log('Creating admin UPDATE policy...');
    try {
        await pool.query(`CREATE POLICY "admin_update_portal_users" ON vendor_portal_users FOR UPDATE USING (${adminCheck}) WITH CHECK (${adminCheck})`);
        console.log('  ✓ created');
    } catch (e) {
        console.log('  ⓘ', e.message.substring(0, 80));
    }

    // INSERT policy for admin
    console.log('Creating admin INSERT policy...');
    try {
        await pool.query(`CREATE POLICY "admin_insert_portal_users" ON vendor_portal_users FOR INSERT WITH CHECK (${adminCheck})`);
        console.log('  ✓ created');
    } catch (e) {
        console.log('  ⓘ', e.message.substring(0, 80));
    }

    // DELETE policy for admin
    console.log('Creating admin DELETE policy...');
    try {
        await pool.query(`CREATE POLICY "admin_delete_portal_users" ON vendor_portal_users FOR DELETE USING (${adminCheck})`);
        console.log('  ✓ created');
    } catch (e) {
        console.log('  ⓘ', e.message.substring(0, 80));
    }

    // Verify
    const { rows: pol } = await pool.query(`SELECT policyname, cmd FROM pg_policies WHERE tablename='vendor_portal_users'`);
    console.log('\nAll policies now:');
    pol.forEach(r => console.log(`  ${r.policyname} (${r.cmd})`));

    const { rows: cols } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='vendor_portal_users' ORDER BY ordinal_position`);
    console.log('\nAll columns:', cols.map(c => c.column_name).join(', '));

    pool.end();
}
main().catch(e => { console.error('FATAL:', e.message); pool.end(); });

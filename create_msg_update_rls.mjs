import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    // Vendor users can update (mark as read) messages for their vendor
    try {
        await pool.query(`
            CREATE POLICY "vendor_update_messages" ON vendor_risk_messages
            FOR UPDATE
            USING (
                vendor_id IN (SELECT auth_vendor_ids())
            )
            WITH CHECK (
                vendor_id IN (SELECT auth_vendor_ids())
            )
        `);
        console.log('Created vendor UPDATE policy on vendor_risk_messages.');
    } catch (e) {
        console.log('vendor UPDATE policy:', e.message);
    }

    // Admin users can update messages (mark vendor messages as read)
    try {
        await pool.query(`
            CREATE POLICY "admin_update_messages" ON vendor_risk_messages
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.user_id = auth.uid()
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.user_id = auth.uid()
                )
            )
        `);
        console.log('Created admin UPDATE policy on vendor_risk_messages.');
    } catch (e) {
        console.log('admin UPDATE policy:', e.message);
    }

    pool.end();
    console.log('Done');
}
main().catch(e => { console.error(e.message); pool.end(); });

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        // List all vendors so we can pick a real vendor_id
        const vendors = await pool.query(`SELECT id, name FROM public.vendor_registry LIMIT 5`);
        console.log('Available vendors:');
        console.table(vendors.rows);

        // List all tenants
        const tenants = await pool.query(`SELECT id, name FROM public.tenants LIMIT 5`);
        console.log('\nAvailable tenants:');
        console.table(tenants.rows);

        if (vendors.rows.length > 0 && tenants.rows.length > 0) {
            const vendorId = vendors.rows[0].id;
            const tenantId = tenants.rows[0].id;
            const testEmail = `testvendor_debug@test.com`;
            const testPassword = 'senha123';
            const testName = 'Debug Vendor';

            console.log(`\nRunning RPC with vendor_id=${vendorId}, tenant_id=${tenantId}, email=${testEmail}`);

            // First clean up if exists
            await pool.query(`DELETE FROM auth.users WHERE email=$1`, [testEmail]);
            await pool.query(`DELETE FROM public.vendor_users WHERE email=$1`, [testEmail]);
            await pool.query(`DELETE FROM public.vendor_portal_users WHERE email=$1`, [testEmail]);

            const result = await pool.query(
                `SELECT public.create_vendor_auth_user($1, $2, $3, $4, $5)`,
                [testEmail, testPassword, testName, vendorId, tenantId]
            );
            console.log('\nRPC result:', JSON.stringify(result.rows[0], null, 2));

            // Check if it was created
            const authCheck = await pool.query(`SELECT id, email FROM auth.users WHERE email=$1`, [testEmail]);
            const vendorCheck = await pool.query(`SELECT id, email FROM public.vendor_users WHERE email=$1`, [testEmail]);
            const portalCheck = await pool.query(`SELECT id, email FROM public.vendor_portal_users WHERE email=$1`, [testEmail]);

            console.log('\nauth.users created:', authCheck.rows.length > 0 ? '✅' : '❌');
            console.log('vendor_users created:', vendorCheck.rows.length > 0 ? '✅' : '❌');
            console.log('vendor_portal_users created:', portalCheck.rows.length > 0 ? '✅' : '❌');

            // Clean up test user
            await pool.query(`DELETE FROM public.vendor_portal_users WHERE email=$1`, [testEmail]);
            await pool.query(`DELETE FROM public.vendor_users WHERE email=$1`, [testEmail]);
            await pool.query(`DELETE FROM auth.users WHERE email=$1`, [testEmail]);
            console.log('\nTest user cleaned up');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

const TEST_EMAIL = 'teste5@teste.com';

async function main() {
    try {
        // Check exact state of test user
        const userCheck = await pool.query(`
            SELECT au.id, au.email, au.email_confirmed_at, au.deleted_at,
                   LEFT(au.encrypted_password, 15) as pass_prefix,
                   ai.id as identity_id, ai.provider, ai.provider_id, ai.identity_data
            FROM auth.users au
            LEFT JOIN auth.identities ai ON ai.user_id = au.id
            WHERE au.email = $1
        `, [TEST_EMAIL]);

        console.log('=== Current state of', TEST_EMAIL, '===');
        userCheck.rows.forEach(r => {
            console.log('User ID:', r.id);
            console.log('email_confirmed_at:', r.email_confirmed_at);
            console.log('deleted_at:', r.deleted_at);
            console.log('pass_prefix:', r.pass_prefix);
            console.log('identity_id:', r.identity_id);
            console.log('provider:', r.provider);
            console.log('provider_id:', r.provider_id);
            console.log('identity_data:', JSON.stringify(r.identity_data));
        });

        if (userCheck.rows.length > 0) {
            const userId = userCheck.rows[0].id;

            // Delete old identities and recreate correctly
            await pool.query(`DELETE FROM auth.identities WHERE user_id = $1`, [userId]);

            // Re-insert identity with sub=email (GoTrue requirement)
            await pool.query(`
                INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3::jsonb, 'email', now(), now(), now())
            `, [TEST_EMAIL, userId, JSON.stringify({ sub: TEST_EMAIL, email: TEST_EMAIL })]);

            // Make sure email is confirmed
            await pool.query(`
                UPDATE auth.users 
                SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
                    updated_at = now()
                WHERE id = $1
            `, [userId]);

            console.log('\n✅ Identity rebuilt with sub=email for', TEST_EMAIL);

            // Verify
            const verifyCheck = await pool.query(`
                SELECT ai.identity_data->>'sub' as sub, ai.provider_id
                FROM auth.identities ai
                WHERE ai.user_id = $1
            `, [userId]);

            console.log('Verification:', verifyCheck.rows);
        } else {
            console.log('User NOT FOUND - need to create it first via the modal');
        }

        // Show all vendor auth users
        console.log('\n=== All vendor_portal_users ===');
        const vpu = await pool.query(`SELECT email, force_password_change FROM public.vendor_portal_users`);
        vpu.rows.forEach(r => console.log(`  ${r.email} | force_change: ${r.force_password_change}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

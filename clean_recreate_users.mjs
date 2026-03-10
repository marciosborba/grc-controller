import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const emails = ['teste5@teste.com', 'teste5@mail.com'];

        for (const email of emails) {
            const userRow = await pool.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);
            if (userRow.rows.length === 0) {
                console.log(`No user found for ${email}`);
                continue;
            }

            const userId = userRow.rows[0].id;
            console.log(`\nDeleting and cleanly recreating ${email} (${userId})...`);

            // Full delete
            await pool.query(`DELETE FROM auth.mfa_factors WHERE user_id = $1`, [userId]).catch(() => { });
            await pool.query(`DELETE FROM auth.refresh_tokens WHERE user_id = $1`, [userId]).catch(() => { });
            await pool.query(`DELETE FROM auth.sessions WHERE user_id = $1`, [userId]).catch(() => { });
            await pool.query(`DELETE FROM auth.identities WHERE user_id = $1`, [userId]).catch(() => { });
            await pool.query(`DELETE FROM auth.users WHERE id = $1`, [userId]).catch(() => { });
            console.log('  Deleted old user');

            // Create fresh with correct schema matching GoTrue admin.createUser
            const newId = (await pool.query(`SELECT gen_random_uuid() as id`)).rows[0].id;

            await pool.query(`
                INSERT INTO auth.users (
                    instance_id,
                    id,
                    aud,
                    role,
                    email,
                    encrypted_password,
                    email_confirmed_at,
                    raw_app_meta_data,
                    raw_user_meta_data,
                    is_super_admin,
                    created_at,
                    updated_at,
                    confirmation_token,
                    email_change,
                    email_change_token_new,
                    recovery_token
                ) VALUES (
                    '00000000-0000-0000-0000-000000000000',
                    $1,
                    'authenticated',
                    'authenticated',
                    $2,
                    crypt('fornecedor123', gen_salt('bf')),
                    now(),
                    '{"provider":"email","providers":["email"]}'::jsonb,
                    jsonb_build_object('name', 'Fornecedor', 'is_vendor', true),
                    false,
                    now(),
                    now(),
                    '',
                    '',
                    '',
                    ''
                )
            `, [newId, email]);

            // Create GoTrue-compatible identity
            await pool.query(`
                INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
                VALUES (
                    gen_random_uuid(),
                    $1, $2,
                    jsonb_build_object('sub', $1::text, 'email', $1::text, 'email_verified', true, 'phone_verified', false),
                    'email', NULL, now(), now()
                )
            `, [email, newId]);

            // Update vendor_users to point to new auth id
            await pool.query(`UPDATE public.vendor_users SET auth_user_id = $1 WHERE email = $2`, [newId, email]);

            console.log(`  ✅ Recreated ${email} | new_id=${newId} | password=fornecedor123`);
        }

        // Now test login via REST
        const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
        const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

        console.log('\n--- Testing login after recreation ---');
        for (const email of emails) {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
                body: JSON.stringify({ email, password: 'fornecedor123' })
            });
            const d = await res.json();
            if (res.ok) {
                console.log(`✅ ${email} LOGIN OK! access_token present: ${!!d.access_token}`);
            } else {
                console.log(`❌ ${email} FAILED: ${d.error_code}: ${d.msg || d.message}`);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';

// We need the service role key - let's try to get it from the DB config
async function getServiceRoleKey() {
    // Try to get JWT secret from config
    const res = await pool.query(`SHOW app.settings.jwt_secret`).catch(() => null);
    if (res?.rows?.[0]) return res.rows[0];

    // Alternatively try config
    const res2 = await pool.query(`SELECT current_setting('app.jwt_secret', true) as key`).catch(() => null);
    if (res2?.rows?.[0]?.key) return res2.rows[0].key;

    return null;
}

async function main() {
    try {
        const jwtSecret = await getServiceRoleKey();
        console.log('JWT secret available:', !!jwtSecret);

        // Instead - let's try a completely different approach:
        // Delete the user and recreate them via a PostgreSQL function that uses 
        // the correct GoTrue format (matching what admin.createUser does)

        const emails = ['teste5@teste.com', 'teste5@mail.com'];

        for (const email of emails) {
            const userRow = await pool.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);
            if (userRow.rows.length === 0) {
                console.log(`No user found for ${email}`);
                continue;
            }

            const userId = userRow.rows[0].id;
            console.log(`\nProcessing ${email} (${userId})...`);

            // Delete identities
            await pool.query(`DELETE FROM auth.identities WHERE user_id = $1`, [userId]);

            // Recreate identity in exact format GoTrue expects
            await pool.query(`
                INSERT INTO auth.identities (
                    id,
                    provider_id,
                    user_id, 
                    identity_data,
                    provider,
                    last_sign_in_at,
                    created_at,
                    updated_at
                ) VALUES (
                    gen_random_uuid(),
                    $1,
                    $2,
                    jsonb_build_object('sub', $1::text, 'email', $1::text, 'email_verified', true, 'phone_verified', false),
                    'email',
                    now(), now(), now()
                )
            `, [email, userId]);

            // Update user to ensure all fields are correct
            await pool.query(`
                UPDATE auth.users SET
                    email_confirmed_at = COALESCE(email_confirmed_at, now()),
                    is_sso_user = false,
                    updated_at = now(),
                    raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
                WHERE id = $1
            `, [userId]);

            console.log(`✅ Fixed identity for ${email}`);

            // Verify
            const check = await pool.query(`
                SELECT ai.identity_data, ai.provider_id, au.email_confirmed_at, au.raw_app_meta_data
                FROM auth.identities ai
                JOIN auth.users au ON au.id = ai.user_id
                WHERE au.email = $1
            `, [email]);
            console.log('Result:', JSON.stringify(check.rows[0], null, 2));
        }

    } catch (err) {
        console.error('Error:', err.message);
        console.error(err.stack);
    } finally {
        await pool.end();
    }
}
main();

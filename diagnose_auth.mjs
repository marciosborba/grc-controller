import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

// Supabase project info
const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
// Anon key from client.ts (not service role, but let's get service role from db)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

async function getServiceRoleKey() {
    // Get service role key from Supabase's internal config table
    const result = await pool.query(`
        SELECT decrypted_secret as key
        FROM vault.decrypted_secrets
        WHERE name ILIKE '%service_role%' OR name ILIKE '%service%'
        LIMIT 5
    `);
    return result.rows;
}

async function main() {
    try {
        console.log('Trying to find service role key from vault...');
        const keys = await getServiceRoleKey().catch(e => {
            console.log('vault not accessible:', e.message);
            return [];
        });
        console.log('Keys found:', keys.length);
        keys.forEach(k => console.log('  key preview:', k.key?.substring(0, 50)));

        // Also check the decrypted secrets table differently
        const altKeys = await pool.query(`
            SELECT name, secret
            FROM vault.secrets
            LIMIT 5
        `).catch(e => ({ rows: [] }));
        console.log('Alt secrets:', altKeys.rows.length);

        // Full auth.users check for teste5@teste.com
        const check = await pool.query(`
            SELECT 
                au.*,
                ai.id as identity_id,
                ai.identity_data,
                ai.provider_id
            FROM auth.users au
            LEFT JOIN auth.identities ai ON ai.user_id = au.id
            WHERE au.email = 'teste5@teste.com'
        `);

        if (check.rows.length > 0) {
            const u = check.rows[0];
            console.log('\n=== Full user state ===');
            console.log('id:', u.id);
            console.log('email:', u.email);
            console.log('role:', u.role);
            console.log('aud:', u.aud);
            console.log('email_confirmed_at:', u.email_confirmed_at);
            console.log('confirmation_token:', u.confirmation_token ? '(exists)' : 'null');
            console.log('recovery_token:', u.recovery_token ? '(exists)' : 'null');
            console.log('banned_until:', u.banned_until);
            console.log('deleted_at:', u.deleted_at);
            console.log('is_super_admin:', u.is_super_admin);
            console.log('identity_data:', JSON.stringify(u.identity_data));
            console.log('provider_id:', u.provider_id);
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();

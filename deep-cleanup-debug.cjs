const { Client } = require('pg');
require('dotenv').config();

async function deepCleanupAndDebug() {
    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const email = 'marcio@gepriv.com';
        
        console.log(`--- Investigating ${email} ---`);
        
        // 1. Check Auth
        const authRes = await client.query('SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = $1', [email]);
        if (authRes.rows.length > 0) {
            const uid = authRes.rows[0].id;
            console.log('✅ Auth User found:', uid);
            console.log('Metadata:', JSON.stringify(authRes.rows[0].raw_user_meta_data, null, 2));

            // 2. Check Profile
            const profRes = await client.query('SELECT * FROM public.profiles WHERE user_id = $1 OR email = $1', [uid, email]);
            console.log('Profiles found:', profRes.rows.length);
            profRes.rows.forEach(p => {
                console.log(`Profile: ID=${p.id}, UserID=${p.user_id}, Active=${p.is_active}, Tenant=${p.tenant_id}, Role=${p.system_role}`);
            });

            // 3. Check Roles
            const rolesRes = await client.query('SELECT * FROM public.user_roles WHERE user_id = $1', [uid]);
            console.log('Roles found:', rolesRes.rows.length);
            rolesRes.rows.forEach(r => {
                console.log(`Role: ${r.role}, Tenant: ${r.tenant_id}`);
            });
        } else {
            console.log('❌ Auth User NOT found.');
        }

        // 4. Check Lockouts
        const lockoutRes = await client.query('SELECT * FROM public.auth_lockouts WHERE email = $1', [email]);
        if (lockoutRes.rows.length > 0) {
            console.log('⚠️ Lockout record found:', lockoutRes.rows[0]);
            console.log('Purging lockout...');
            await client.query('DELETE FROM public.auth_lockouts WHERE email = $1', [email]);
            console.log('✅ Lockout purged.');
        } else {
            console.log('✅ No lockout record found.');
        }

        // 5. Cleanup for fresh test
        console.log('\n--- Cleaning up for fresh test ---');
        await client.query('DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = $1)', [email]);
        await client.query('DELETE FROM public.profiles WHERE email = $1 OR user_id IN (SELECT id FROM auth.users WHERE email = $1)', [email]);
        await client.query('DELETE FROM auth.users WHERE email = $1', [email]);
        console.log('✅ Cleanup complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

deepCleanupAndDebug();

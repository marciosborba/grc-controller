const { Client } = require('pg');
require('dotenv').config();

async function checkUser() {
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
        
        console.log(`--- Checking Auth and Profile for ${email} ---`);
        
        const authRes = await client.query('SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data FROM auth.users WHERE email = $1', [email]);
        console.log('Auth Users:', authRes.rows);

        if (authRes.rows.length > 0) {
            const uid = authRes.rows[0].id;
            const profileRes = await client.query('SELECT * FROM public.profiles WHERE user_id = $1 OR id::text = $1', [uid]);
            console.log('Profiles:', profileRes.rows);
            
            const rolesRes = await client.query('SELECT * FROM public.user_roles WHERE user_id = $1', [uid]);
            console.log('Roles:', rolesRes.rows);
        }

        console.log('\n--- Checking Lockout Policies ---');
        // Check if there are any records in a table that tracks failures
        // Usually these RPCs use a table like 'login_attempts' or similar.
        const tablesRes = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        const tableNames = tablesRes.rows.map(r => r.tablename);
        console.log('Public Tables:', tableNames);

        if (tableNames.includes('login_failures')) {
             const failures = await client.query('SELECT * FROM public.login_failures WHERE email = $1', [email]);
             console.log('Login Failures:', failures.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUser();

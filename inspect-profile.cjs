const { Client } = require('pg');
require('dotenv').config();

async function inspectProfile() {
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
        const res = await client.query(`
            SELECT id, user_id, email, full_name 
            FROM public.profiles 
            WHERE email IS NOT NULL
            LIMIT 1;
        `);
        console.log('Sample profile record:');
        console.log(JSON.stringify(res.rows[0], null, 2));
        
        const res2 = await client.query(`
            SELECT u.id as auth_id, p.id as profile_id, p.user_id as profile_user_id
            FROM auth.users u
            JOIN public.profiles p ON u.id = p.user_id
            LIMIT 1;
        `);
        console.log('\nJoined Auth User and Profile:');
        console.log(JSON.stringify(res2.rows[0], null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

inspectProfile();

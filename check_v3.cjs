
const { Client } = require('pg');
require('dotenv').config();

async function checkEverything() {
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

        console.log('--- LUCAS PROFILE ---');
        const profRes = await client.query("SELECT * FROM public.profiles WHERE user_id = '8c50e41c-7339-404a-98d3-6d7f4237ec05'");
        console.log(JSON.stringify(profRes.rows, null, 2));

        console.log('\n--- GET_USER_COMPLETE_PROFILE DEFINITION ---');
        const defRes = await client.query(`
            SELECT pg_get_functiondef(p.oid) 
            FROM pg_proc p 
            JOIN pg_namespace n ON n.oid = p.pronamespace 
            WHERE n.nspname = 'public' 
            AND p.proname = 'get_user_complete_profile'
        `);
        if (defRes.rows.length > 0) {
            console.log(defRes.rows[0].pg_get_functiondef);
        } else {
            console.log('Function NOT FOUND');
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkEverything();

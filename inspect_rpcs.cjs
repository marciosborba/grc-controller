
const { Client } = require('pg');
require('dotenv').config();

async function inspect() {
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

        console.log('--- RPC check_is_vendor ---');
        const res1 = await client.query("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'check_is_vendor';");
        console.log(res1.rows[0]?.routine_definition);

        console.log('\n--- RPC get_user_complete_profile ---');
        const res2 = await client.query("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'get_user_complete_profile';");
        console.log(res2.rows[0]?.routine_definition);

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

inspect();

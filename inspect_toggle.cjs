
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
        const res = await client.query("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'toggle_vendor_user_status';");
        console.log(res.rows[0]?.routine_definition || 'NOT FOUND');
        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

inspect();

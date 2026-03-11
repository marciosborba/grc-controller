
const { Client } = require('pg');
require('dotenv').config();

async function checkProfilesTable() {
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
        const r = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public'");
        console.log('Profiles columns:', JSON.stringify(r.rows, null, 2));
        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkProfilesTable();


const { Client } = require('pg');
require('dotenv').config();

async function checkEmailCase() {
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

        console.log('--- EMAIL CASE CHECK ---');
        const res = await client.query("SELECT email, LOWER(email) as lower_email, (email = LOWER(email)) as is_lowercase FROM vendor_portal_users WHERE email ILIKE '%lucas%';");
        console.log(JSON.stringify(res.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkEmailCase();

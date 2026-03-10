
const { Client } = require('pg');
require('dotenv').config();

async function findActive() {
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

        console.log('--- ACTIVE VENDOR PORTAL USERS ---');
        const res = await client.query("SELECT id, email, is_active FROM vendor_portal_users WHERE is_active = true;");
        console.log(JSON.stringify(res.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

findActive();

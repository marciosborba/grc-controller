
const { Client } = require('pg');
require('dotenv').config();

async function searchLucas() {
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

        console.log('--- VENDOR PORTAL USERS ---');
        const vpu = await client.query("SELECT id, email, is_active, vendor_id FROM vendor_portal_users WHERE email ILIKE '%lucas%' OR email ILIKE '%alcantara%';");
        console.log(JSON.stringify(vpu.rows, null, 2));

        console.log('--- VENDOR USERS ---');
        const vu = await client.query("SELECT id, email, is_active, vendor_id, auth_user_id FROM vendor_users WHERE email ILIKE '%lucas%' OR email ILIKE '%alcantara%';");
        console.log(JSON.stringify(vu.rows, null, 2));

        console.log('--- AUTH USERS ---');
        const au = await client.query("SELECT id, email FROM auth.users WHERE email ILIKE '%lucas%' OR email ILIKE '%alcantara%';");
        console.log(JSON.stringify(au.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

searchLucas();


const { Client } = require('pg');
require('dotenv').config();

async function findLucas() {
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

        console.log('--- Searching for Lucas ---');

        const authUsers = await client.query("SELECT id, email FROM auth.users WHERE email ILIKE '%lucas%' OR email ILIKE '%alcantara%';");
        console.log('Auth Users:', JSON.stringify(authUsers.rows, null, 2));

        const portalUsers = await client.query("SELECT id, email, vendor_id, is_active FROM vendor_portal_users WHERE email ILIKE '%lucas%' OR email ILIKE '%alcantara%';");
        console.log('Vendor Portal Users:', JSON.stringify(portalUsers.rows, null, 2));

        const vendorUsers = await client.query("SELECT id, email, vendor_id, is_active, auth_user_id FROM vendor_users WHERE email ILIKE '%lucas%' OR email ILIKE '%alcantara%';");
        console.log('Vendor Users:', JSON.stringify(vendorUsers.rows, null, 2));

        if (authUsers.rows.length > 0) {
            const userId = authUsers.rows[0].id;
            // Check auth.sessions columns first
            const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'sessions';");
            console.log('auth.sessions columns:', cols.rows.map(r => r.column_name).join(', '));

            const sessions = await client.query("SELECT id, created_at FROM auth.sessions WHERE user_id = $1;", [userId]);
            console.log('Active Sessions:', JSON.stringify(sessions.rows, null, 2));
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

findLucas();

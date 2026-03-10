
const { Client } = require('pg');
require('dotenv').config();

async function dumpSessions() {
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

        console.log('--- ACTIVE SESSIONS ---');
        const res = await client.query(`
            SELECT s.id as session_id, u.email, u.id as user_id
            FROM auth.sessions s 
            JOIN auth.users u ON s.user_id = u.id;
        `);
        console.log(JSON.stringify(res.rows, null, 2));

        console.log('\n--- VENDOR PORTAL STATUS FOR THESE USERS ---');
        if (res.rows.length > 0) {
            const emails = res.rows.map(r => r.email);
            const status = await client.query(`
                SELECT email, is_active 
                FROM vendor_portal_users 
                WHERE email = ANY($1);
            `, [emails]);
            console.log(JSON.stringify(status.rows, null, 2));
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

dumpSessions();

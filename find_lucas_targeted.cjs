
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

        const q = "SELECT id, email, vendor_id, is_active FROM vendor_portal_users WHERE email ILIKE '%lucas.alcantara%';";
        const res = await client.query(q);
        console.log('VPU:', JSON.stringify(res.rows, null, 2));

        const q2 = "SELECT id, email, vendor_id, is_active, auth_user_id FROM vendor_users WHERE email ILIKE '%lucas.alcantara%';";
        const res2 = await client.query(q2);
        console.log('VU:', JSON.stringify(res2.rows, null, 2));

        const q3 = "SELECT id, email FROM auth.users WHERE email ILIKE '%lucas.alcantara%';";
        const res3 = await client.query(q3);
        console.log('AUTH:', JSON.stringify(res3.rows, null, 2));

        if (res3.rows.length > 0) {
            const uid = res3.rows[0].id;
            const s = await client.query("SELECT id FROM auth.sessions WHERE user_id = $1;", [uid]);
            console.log('SESSIONS:', s.rows.length);
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

findLucas();

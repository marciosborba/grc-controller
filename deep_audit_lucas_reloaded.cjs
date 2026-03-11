
const { Client } = require('pg');
require('dotenv').config();

async function deepAudit() {
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

        console.log('--- 1. AUTH USERS ---');
        const authRes = await client.query("SELECT id, email, created_at, last_sign_in_at, app_metadata, user_metadata FROM auth.users WHERE email = 'lucas.alcantara@gepriv.com'");
        console.log(JSON.stringify(authRes.rows, null, 2));

        console.log('\n--- 2. VPU RECORDS ---');
        const vpuRes = await client.query("SELECT * FROM public.vendor_portal_users WHERE LOWER(email) = 'lucas.alcantara@gepriv.com'");
        console.log(JSON.stringify(vpuRes.rows, null, 2));

        console.log('\n--- 3. VENDOR USERS RECORDS ---');
        const vuRes = await client.query("SELECT * FROM public.vendor_users WHERE LOWER(email) = 'lucas.alcantara@gepriv.com' OR auth_user_id = '8c50e41c-7339-404a-98d3-6d7f4237ec05'");
        console.log(JSON.stringify(vuRes.rows, null, 2));

        console.log('\n--- 4. USER ROLES RECORDS ---');
        const rolesRes = await client.query("SELECT * FROM public.user_roles WHERE user_id = '8c50e41c-7339-404a-98d3-6d7f4237ec05'");
        console.log(JSON.stringify(rolesRes.rows, null, 2));

        console.log('\n--- 5. SIMULATE check_is_vendor (8c50e41c-7339-404a-98d3-6d7f4237ec05) ---');
        const rpcCheckRes = await client.query("SELECT public.check_is_vendor('8c50e41c-7339-404a-98d3-6d7f4237ec05', 'lucas.alcantara@gepriv.com')");
        console.log(JSON.stringify(rpcCheckRes.rows, null, 2));

        console.log('\n--- 6. ACTIVE SESSIONS ---');
        const sessRes = await client.query("SELECT * FROM auth.sessions WHERE user_id = '8c50e41c-7339-404a-98d3-6d7f4237ec05'");
        console.log(JSON.stringify(sessRes.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('❌ Error during audit:', err.message);
    }
}

deepAudit();


const { Client } = require('pg');
require('dotenv').config();

async function dumpUsers() {
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

        console.log('--- TENANTS ---');
        const tenants = await client.query('SELECT id, name FROM tenants;');
        console.log(JSON.stringify(tenants.rows, null, 2));

        console.log('\n--- AUTH USERS ---');
        const authUsers = await client.query('SELECT id, email FROM auth.users;');
        console.log(JSON.stringify(authUsers.rows, null, 2));

        console.log('\n--- PROFILES ---');
        const profiles = await client.query('SELECT id, email, tenant_id FROM public.profiles;');
        console.log(JSON.stringify(profiles.rows, null, 2));

        console.log('\n--- VENDOR REGISTRY ---');
        const vendors = await client.query('SELECT id, name, tenant_id FROM vendor_registry;');
        console.log(JSON.stringify(vendors.rows, null, 2));

        console.log('\n--- VENDOR PORTAL USERS ---');
        const vpu = await client.query('SELECT id, email, vendor_id, is_active FROM vendor_portal_users;');
        console.log(JSON.stringify(vpu.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

dumpUsers();

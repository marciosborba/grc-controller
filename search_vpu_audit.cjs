
const { Client } = require('pg');
require('dotenv').config();

async function auditVPU() {
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

        console.log('--- AUDIT VENDOR PORTAL USERS ---');
        const res = await client.query("SELECT id, email, is_active, vendor_id, tenant_id FROM vendor_portal_users;");
        res.rows.forEach(r => {
            console.log(`ID: ${r.id}, Email: [${r.email}], Active: ${r.is_active}, Vendor: ${r.vendor_id}`);
        });

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

auditVPU();

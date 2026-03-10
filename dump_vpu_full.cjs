
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function dumpFull() {
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
        const res = await client.query("SELECT * FROM vendor_portal_users;");
        fs.writeFileSync('vpu_audit.json', JSON.stringify(res.rows, null, 2));
        console.log(`Audited ${res.rows.length} rows.`);
        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

dumpFull();

const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        return client.query(`
            SELECT pg_get_functiondef(p.oid) as def
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE p.proname = 'check_is_vendor' AND n.nspname = 'public'
        `);
    })
    .then(res => {
        if (res.rows.length > 0) {
            fs.writeFileSync('check_is_vendor_def.txt', res.rows.map(r => r.def).join('\n\n---\n\n'));
            console.log('Saved to check_is_vendor_def.txt');
        } else {
            console.log('Function not found');
        }
        client.end();
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });

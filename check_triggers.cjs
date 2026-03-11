const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

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
            SELECT event_object_table AS table_name, trigger_name, event_manipulation, action_statement
            FROM information_schema.triggers
            WHERE event_object_table IN ('users', 'sessions', 'profiles', 'vendor_users', 'vendor_portal_users')
        `);
    })
    .then(res => {
        fs.writeFileSync('trigger_dump.json', JSON.stringify(res.rows, null, 2));
        client.end();
        console.log('Saved to trigger_dump.json');
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });

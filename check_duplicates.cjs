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
            SELECT id, email, is_active, auth_user_id 
            FROM public.vendor_users 
            WHERE email ILIKE '%lucas%';
            
            SELECT id, email, is_active
            FROM public.vendor_portal_users
            WHERE email ILIKE '%lucas%';
        `);
    })
    .then(res => {
        fs.writeFileSync('lucas_duplicates.json', JSON.stringify({
           vendor_users: res[0].rows,
           vendor_portal_users: res[1].rows
        }, null, 2));
        client.end();
        console.log('Saved to lucas_duplicates.json');
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });

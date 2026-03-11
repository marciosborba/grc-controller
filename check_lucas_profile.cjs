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
            SELECT id, email, is_active, system_role, user_id 
            FROM public.profiles 
            WHERE email ILIKE '%lucas%';
        `);
    })
    .then(res => {
        fs.writeFileSync('lucas_profile.json', JSON.stringify(res.rows, null, 2));
        client.end();
        console.log('Saved to lucas_profile.json');
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });

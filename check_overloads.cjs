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
            SELECT proname, pg_get_function_identity_arguments(oid) as args, prorettype::regtype as rettype
            FROM pg_proc 
            WHERE proname = 'check_is_vendor'
        `);
    })
    .then(res => {
        fs.writeFileSync('overloads.json', JSON.stringify(res.rows, null, 2));
        console.log('Saved to overloads.json');
        client.end();
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });

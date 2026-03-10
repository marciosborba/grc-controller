const { Client } = require('pg');
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
    .then(() => client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'risk_registrations'
        ORDER BY ordinal_position
    `))
    .then(res => {
        console.log('--- COLUMNS IN risk_registrations ---');
        res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
        client.end();
    })
    .catch(err => {
        console.log('FAIL: ' + err.message);
        client.end();
    });

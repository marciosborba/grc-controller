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
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%risk%action%' OR table_name LIKE '%action_plan%'
    ORDER BY table_name
  `))
    .then(res => {
        console.log(JSON.stringify(res.rows, null, 2));
        client.end();
    })
    .catch(err => {
        console.error(err);
        client.end();
    });

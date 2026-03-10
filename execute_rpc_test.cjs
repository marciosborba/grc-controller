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
    .then(() => client.query("SELECT * FROM get_tenant_modules_for_rbac('46b1c048-85a1-423b-96fc-776007c8de1f')"))
    .then(res => {
        console.log(JSON.stringify(res.rows, null, 2));
        client.end();
    })
    .catch(err => {
        console.error("SQL_ERROR:", err.message);
        client.end();
    });

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
    .then(() => client.query('SELECT routine_definition FROM information_schema.routines WHERE routine_name = \'get_user_complete_profile\''))
    .then(res => {
        const fs = require('fs');
        fs.writeFileSync('rpc_definition.sql', res.rows[0].routine_definition);
        console.log('Saved to rpc_definition.sql');
        client.end();
    })
    .catch(err => {
        console.error(err);
        client.end();
    });

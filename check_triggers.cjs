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
        SELECT event_object_table as table_name, trigger_name, action_statement
        FROM information_schema.triggers
        WHERE action_statement ILIKE '%description%'
    `))
    .then(res => {
        console.log('--- TRIGGERS REFERENCING description ---');
        if (res.rows.length === 0) {
            console.log('None found.');
        } else {
            res.rows.forEach(r => {
                console.log(`Table: ${r.table_name}, Trigger: ${r.trigger_name}`);
                console.log(`Action: ${r.action_statement}`);
                console.log('---');
            });
        }
        client.end();
    })
    .catch(err => { console.error(err); client.end(); });

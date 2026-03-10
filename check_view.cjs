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
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%risk_registration_action_plans%'
    `))
    .then(res => {
        console.log('--- TABLES/VIEWS MATCHING risk_registration_action_plans ---');
        res.rows.forEach(r => console.log(`${r.table_name} (${r.table_type})`));
        return client.query(`
            SELECT pg_get_viewdef(c.oid, true) as view_definition
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relname = 'risk_registration_action_plans'
            AND c.relkind = 'v'
        `);
    })
    .then(res => {
        if (res.rows.length > 0) {
            console.log('--- VIEW DEFINITION ---');
            console.log(res.rows[0].view_definition);
        } else {
            console.log('Not a view.');
        }
        client.end();
    })
    .catch(err => { console.error(err); client.end(); });

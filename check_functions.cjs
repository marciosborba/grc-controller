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
        SELECT n.nspname as schema, p.proname as function_name, pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' 
        AND pg_get_functiondef(p.oid) ILIKE '%description%'
    `))
    .then(res => {
        console.log('--- FUNCTIONS REFERENCING description ---');
        const relevant = res.rows.filter(r => r.definition.includes('risk_registration_action_plans') || r.definition.includes('risk_registrations'));
        if (relevant.length === 0) {
            console.log('None found referencing relevant tables.');
        } else {
            relevant.forEach(r => {
                console.log(`Function: ${r.function_name}`);
                // console.log(r.definition); // Might be too large
            });
        }
        client.end();
    })
    .catch(err => { console.error(err); client.end(); });

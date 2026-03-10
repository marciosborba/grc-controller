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
        SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE (qual ILIKE '%description%' OR with_check ILIKE '%description%')
        AND tablename = 'risk_registration_action_plans'
    `))
    .then(res => {
        console.log('--- RLS POLICIES FOR risk_registration_action_plans REFERENCING description ---');
        if (res.rows.length === 0) {
            console.log('None found.');
        } else {
            res.rows.forEach(r => {
                console.log(`Policy: ${r.policyname} (${r.cmd})`);
                console.log(`USING: ${r.qual}`);
                console.log(`WITH CHECK: ${r.with_check}`);
                console.log('---');
            });
        }
        client.end();
    })
    .catch(err => { console.error(err); client.end(); });

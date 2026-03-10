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

async function run() {
    await client.connect();

    // Get full view definition
    const res = await client.query(`
        SELECT viewname, definition
        FROM pg_views
        WHERE schemaname = 'public'
        AND viewname = 'vw_action_plans_unified'
    `);

    if (res.rows.length === 0) {
        console.log('View not found!');
    } else {
        console.log('=== VIEW DEFINITION: vw_action_plans_unified ===\n');
        console.log(res.rows[0].definition);
    }

    // Also check if anything queries this view with 'description'
    const res2 = await client.query(`
        SELECT viewname, definition
        FROM pg_views
        WHERE schemaname = 'public'
        AND definition ILIKE '%vw_action_plans_unified%'
    `);
    console.log('\n=== VIEWS USING vw_action_plans_unified ===');
    if (res2.rows.length === 0) {
        console.log('None found.');
    } else {
        res2.rows.forEach(v => console.log(` - ${v.viewname}`));
    }

    // Check all functions that query this view
    const res3 = await client.query(`
        SELECT proname, prosrc
        FROM pg_proc
        WHERE prosrc ILIKE '%vw_action_plans_unified%'
    `);
    console.log('\n=== FUNCTIONS QUERYING vw_action_plans_unified ===');
    if (res3.rows.length === 0) {
        console.log('None found.');
    } else {
        res3.rows.forEach(f => console.log(` - ${f.proname}`));
    }

    await client.end();
}

run().catch(e => { console.error(e.message); client.end(); });

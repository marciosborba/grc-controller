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
    console.log('Connected. Reloading PostgREST schema cache...\n');

    // This tells PostgREST to reload its schema cache
    await client.query(`NOTIFY pgrst, 'reload schema'`);
    console.log('✅ PostgREST schema cache reload signal sent!');
    console.log('PostgREST will now re-introspect the database schema.');
    console.log('This means select("*") will no longer include phantom columns.\n');

    // Also check if the column was EVER in the table via pg_attribute history
    // (check if there's a dropped column)
    console.log('=== CHECKING FOR DROPPED COLUMNS ===');
    const dropped = await client.query(`
        SELECT attname, attisdropped
        FROM pg_attribute
        WHERE attrelid = 'public.risk_registration_action_plans'::regclass
        AND attisdropped = true
    `);
    if (dropped.rows.length === 0) {
        console.log('No dropped columns found in risk_registration_action_plans.');
    } else {
        console.log('DROPPED columns found (these may still be in PostgREST cache):');
        dropped.rows.forEach(r => console.log(`  - ${r.attname}`));
    }

    // Check actual live column list
    console.log('\n=== LIVE COLUMNS (what database reports) ===');
    const liveCols = await client.query(`
        SELECT attname 
        FROM pg_attribute 
        WHERE attrelid = 'public.risk_registration_action_plans'::regclass
        AND attnum > 0
        AND NOT attisdropped
        ORDER BY attnum
    `);
    liveCols.rows.forEach(r => console.log(`  ${r.attname}`));

    await client.end();
    console.log('\nDone.');
}

run().catch(e => { console.error(e.message); client.end(); });

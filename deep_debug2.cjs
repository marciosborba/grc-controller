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
    console.log('Connected.\n');

    // 1. Get ALL functions that reference risk_registration_action_plans
    console.log('=== FUNCTIONS WITH risk_registration_action_plans ===');
    const funcs = await client.query(`
        SELECT p.proname, p.prosrc, n.nspname as schema
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosrc ILIKE '%risk_registration_action_plans%'
        ORDER BY n.nspname, p.proname
    `);
    if (funcs.rows.length === 0) {
        console.log('None found.\n');
    } else {
        funcs.rows.forEach(f => {
            const hasDesc = f.prosrc.toLowerCase().includes('.description') ||
                f.prosrc.toLowerCase().includes('"description"') ||
                (f.prosrc.toLowerCase().includes('description') && !f.prosrc.toLowerCase().includes('activity_description'));
            console.log(`Schema: ${f.schema}, Function: ${f.proname} | suspicious 'description': ${hasDesc}`);
            if (hasDesc) {
                const lines = f.prosrc.split('\n');
                lines.forEach((l, i) => {
                    if (l.toLowerCase().includes('description')) {
                        console.log(`  Line ${i}: ${l.trim()}`);
                    }
                });
            }
        });
    }

    // 2. Check pg_stat_activity for recent errors (if available)
    console.log('\n=== RECENT QUERIES IN pg_stat_activity ===');
    try {
        const stat = await client.query(`
            SELECT query, state, query_start
            FROM pg_stat_activity
            WHERE query ILIKE '%risk_registration_action_plans%'
            AND state != 'idle'
            LIMIT 10
        `);
        if (stat.rows.length === 0) {
            console.log('No active queries found.');
        } else {
            stat.rows.forEach(r => console.log(`  State: ${r.state}, Query: ${r.query.substring(0, 200)}`));
        }
    } catch (e) {
        console.log('Could not query pg_stat_activity:', e.message);
    }

    // 3. Try to actually run a query with 'description' to see the exact error
    console.log('\n=== TESTING: SELECT description FROM risk_registration_action_plans LIMIT 1 ===');
    try {
        await client.query(`SELECT description FROM risk_registration_action_plans LIMIT 1`);
        console.log('QUERY SUCCEEDED - column exists!');
    } catch (e) {
        console.log('Error (expected):', e.message);
    }

    // 4. Check for any materialized views
    console.log('\n=== MATERIALIZED VIEWS ===');
    const matviews = await client.query(`
        SELECT matviewname, definition
        FROM pg_matviews
        WHERE schemaname = 'public'
        AND (definition ILIKE '%risk_registration_action_plans%' OR definition ILIKE '%description%')
    `);
    if (matviews.rows.length === 0) {
        console.log('None found.');
    } else {
        matviews.rows.forEach(v => {
            const hasDesc = v.definition.toLowerCase().includes('description');
            console.log(`MatView: ${v.matviewname} | has 'description': ${hasDesc}`);
        });
    }

    // 5. Check all RLS policies (using pg_policies)
    console.log('\n=== ALL RLS POLICIES ON risk_registration_action_plans ===');
    const policies = await client.query(`
        SELECT policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename = 'risk_registration_action_plans'
        AND schemaname = 'public'
    `);
    policies.rows.forEach(p => {
        const combined = ((p.qual || '') + (p.with_check || '')).toLowerCase();
        const hasDesc = combined.includes('description');
        console.log(`  Policy: ${p.policyname} (${p.cmd}) | has 'description': ${hasDesc}`);
        if (hasDesc) {
            console.log(`    QUAL: ${p.qual}`);
            console.log(`    WITH CHECK: ${p.with_check}`);
        }
    });

    // 6. Check if there's any check constraint with 'description'
    console.log('\n=== CHECK CONSTRAINTS ON risk_registration_action_plans ===');
    const constraints = await client.query(`
        SELECT conname, pg_get_constraintdef(oid) as def
        FROM pg_constraint
        WHERE conrelid = 'risk_registration_action_plans'::regclass
        AND contype = 'c'
    `);
    if (constraints.rows.length === 0) {
        console.log('None found.');
    } else {
        constraints.rows.forEach(c => {
            const hasDesc = c.def.toLowerCase().includes('description');
            console.log(`  Constraint: ${c.conname} | has 'description': ${hasDesc}`);
            if (hasDesc) console.log(`    DEF: ${c.def}`);
        });
    }

    // 7. Look at ALL supabase functions (including schema 'supabase_functions')
    console.log('\n=== ALL SCHEMAS AND THEIR FUNCTIONS WITH description + rap ===');
    const allSchemFuncs = await client.query(`
        SELECT n.nspname as schema, p.proname, 
               substring(p.prosrc, 1, 500) as src_snippet
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosrc ILIKE '%description%'
        AND p.prosrc ILIKE '%action_plan%'
    `);
    if (allSchemFuncs.rows.length === 0) {
        console.log('None found.');
    } else {
        allSchemFuncs.rows.forEach(f => {
            console.log(`Schema: ${f.schema}, Function: ${f.proname}`);
            const lines = f.src_snippet.split('\n');
            lines.forEach((l, i) => {
                if (l.toLowerCase().includes('description')) {
                    console.log(`  Line ${i}: ${l.trim()}`);
                }
            });
        });
    }

    await client.end();
    console.log('\nDone.');
}

run().catch(e => { console.error(e.message); client.end(); });

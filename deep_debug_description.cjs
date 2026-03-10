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

    // 1. Check if ANY view references description on risk_registration_action_plans
    console.log('=== 1. VIEWS REFERENCING risk_registration_action_plans ===');
    const views = await client.query(`
        SELECT viewname, definition
        FROM pg_views
        WHERE schemaname = 'public'
        AND definition ILIKE '%risk_registration_action_plans%'
    `);
    views.rows.forEach(v => {
        const hasDesc = v.definition.toLowerCase().includes('.description') ||
            v.definition.toLowerCase().includes('"description"');
        console.log(`View: ${v.viewname} | references 'description': ${hasDesc}`);
        if (hasDesc) {
            console.log('  -- DEFINITION SNIPPET --');
            const lines = v.definition.split('\n');
            lines.forEach((l, i) => {
                if (l.toLowerCase().includes('description')) {
                    console.log(`  Line ${i}: ${l}`);
                }
            });
        }
    });

    // 2. Check all pg_proc functions that reference 'description' and 'risk_registration_action_plans'
    console.log('\n=== 2. FUNCTIONS REFERENCING BOTH TERMS ===');
    const funcs = await client.query(`
        SELECT proname, prosrc
        FROM pg_proc
        WHERE prosrc ILIKE '%risk_registration_action_plans%'
        AND prosrc ILIKE '%description%'
    `);
    if (funcs.rows.length === 0) {
        console.log('None found.');
    } else {
        funcs.rows.forEach(f => {
            console.log(`Function: ${f.proname}`);
            const lines = f.prosrc.split('\n');
            lines.forEach((l, i) => {
                if (l.toLowerCase().includes('description')) {
                    console.log(`  Line ${i}: ${l}`);
                }
            });
        });
    }

    // 3. Check all triggers on risk_registration_action_plans
    console.log('\n=== 3. ALL TRIGGERS ON risk_registration_action_plans ===');
    const triggers = await client.query(`
        SELECT t.tgname AS trigger_name, 
               p.proname AS function_name,
               p.prosrc AS function_source
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE c.relname = 'risk_registration_action_plans'
    `);
    if (triggers.rows.length === 0) {
        console.log('No triggers found on this table.');
    } else {
        triggers.rows.forEach(t => {
            const hasDesc = t.function_source.toLowerCase().includes('description');
            console.log(`Trigger: ${t.trigger_name}, Fn: ${t.function_name}, has 'description': ${hasDesc}`);
            if (hasDesc) {
                const lines = t.function_source.split('\n');
                lines.forEach((l, i) => {
                    if (l.toLowerCase().includes('description')) {
                        console.log(`  Line ${i}: ${l}`);
                    }
                });
            }
        });
    }

    // 4. Check all policies on risk_registration_action_plans
    console.log('\n=== 4. POLICIES ON risk_registration_action_plans ===');
    const policies = await client.query(`
        SELECT polname, polqual::text, polwithcheck::text
        FROM pg_policy
        JOIN pg_class ON pg_policy.polrelid = pg_class.oid
        WHERE pg_class.relname = 'risk_registration_action_plans'
    `);
    if (policies.rows.length === 0) {
        console.log('No policies found.');
    } else {
        policies.rows.forEach(p => {
            const qual = (p.polqual || '').toLowerCase();
            const check = (p.polwithcheck || '').toLowerCase();
            const hasDesc = qual.includes('description') || check.includes('description');
            console.log(`Policy: ${p.polname} | has 'description': ${hasDesc}`);
            if (hasDesc) {
                console.log(`  QUAL: ${p.polqual}`);
                console.log(`  CHECK: ${p.polwithcheck}`);
            }
        });
    }

    // 5. Check if the table is actually a view in disguise
    console.log('\n=== 5. TABLE TYPE CHECK ===');
    const tableType = await client.query(`
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_name = 'risk_registration_action_plans'
        AND table_schema = 'public'
    `);
    tableType.rows.forEach(r => console.log(`  ${r.table_name}: ${r.table_type}`));

    // 6. List ALL columns in risk_registration_action_plans
    console.log('\n=== 6. ALL COLUMNS IN risk_registration_action_plans ===');
    const cols = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'risk_registration_action_plans'
        AND table_schema = 'public'
        ORDER BY ordinal_position
    `);
    cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

    // 7. Check if there's a version of the table in another schema
    console.log('\n=== 7. ALL SCHEMAS WITH risk_registration_action_plans ===');
    const schemas = await client.query(`
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        WHERE table_name = 'risk_registration_action_plans'
    `);
    schemas.rows.forEach(r => console.log(`  schema=${r.table_schema}, type=${r.table_type}`));

    await client.end();
    console.log('\nDone.');
}

run().catch(e => { console.error(e.message); client.end(); });

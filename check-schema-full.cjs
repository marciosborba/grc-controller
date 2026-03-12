const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log('--- Checking Profiles Constraints ---');
        const consRes = await client.query(`
            SELECT 
                conname as constraint_name, 
                pg_get_constraintdef(c.oid) as definition
            FROM pg_constraint c
            JOIN pg_class cr ON c.conrelid = cr.oid
            JOIN pg_namespace n ON cr.relnamespace = n.oid
            WHERE n.nspname = 'public' AND cr.relname = 'profiles';
        `);
        console.table(consRes.rows);

        console.log('\n--- Checking User Roles Constraints ---');
        const consRoles = await client.query(`
            SELECT 
                conname as constraint_name, 
                pg_get_constraintdef(c.oid) as definition
            FROM pg_constraint c
            JOIN pg_class cr ON c.conrelid = cr.oid
            JOIN pg_namespace n ON cr.relnamespace = n.oid
            WHERE n.nspname = 'public' AND cr.relname = 'user_roles';
        `);
        console.table(consRoles.rows);

        console.log('\n--- Checking Enumerated Types ---');
        const enumRes = await client.query(`
            SELECT t.typname, e.enumlabel
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE n.nspname = 'public';
        `);
        console.table(enumRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchema();

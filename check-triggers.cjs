const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkTriggers() {
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
        const res = await client.query(`
            SELECT 
                tgname as trigger_name,
                CASE tgtype::integer & 66
                    WHEN 2 THEN 'BEFORE'
                    WHEN 64 THEN 'INSTEAD OF'
                    ELSE 'AFTER'
                END as activation,
                CASE tgtype::integer & 7
                    WHEN 1 THEN 'ROW'
                    ELSE 'STATEMENT'
                END as level,
                CASE tgtype::integer & 16
                    WHEN 16 THEN 'UPDATE'
                    ELSE ''
                END || 
                CASE tgtype::integer & 4
                    WHEN 4 THEN 'INSERT'
                    ELSE ''
                END ||
                CASE tgtype::integer & 8
                    WHEN 8 THEN 'DELETE'
                    ELSE ''
                END as event,
                relname as table_name
            FROM pg_trigger
            JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
            JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
            WHERE nspname = 'auth' AND relname = 'users';
        `);
        
        let output = '--- Triggers on auth.users ---\n';
        res.rows.forEach(r => {
            output += `Name: ${r.trigger_name} | Activation: ${r.activation} | Level: ${r.level} | Event: ${r.event}\n`;
        });

        fs.writeFileSync('triggers_out.txt', output, 'utf8');
        console.log('✅ Triggers written to triggers_out.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkTriggers();

const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function getRpcDefs() {
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
        const rpcs = ['check_account_lockout', 'increment_failed_login', 'get_user_complete_profile'];
        let output = '';

        for (const rpc of rpcs) {
            const res = await client.query(`
                SELECT pg_get_functiondef(p.oid) as definition
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public' AND p.proname = $1;
            `, [rpc]);
            
            output += `\n--- RPC ${rpc} ---\n`;
            if (res.rows.length > 0) {
                output += res.rows[0].definition;
            } else {
                output += 'RPC not found';
            }
            output += '\n';
        }

        fs.writeFileSync('lockout_rpcs.txt', output, 'utf8');
        console.log('✅ Lockout RPCs written to lockout_rpcs.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

getRpcDefs();

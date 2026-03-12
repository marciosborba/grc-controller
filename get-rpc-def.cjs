const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function getRpcDef() {
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
            SELECT pg_get_functiondef(p.oid) as definition
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'get_user_complete_profile';
        `);
        
        let output = '';
        if (res.rows.length > 0) {
            output += '--- RPC get_user_complete_profile ---\n';
            output += res.rows[0].definition;
        } else {
            output += 'RPC not found';
        }

        const resData = await client.query(`
            SELECT id, user_id, email, tenant_id, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 5;
        `);
        output += '\n\n--- Recent Profiles ---\n';
        resData.rows.forEach(r => {
            output += `ID: ${r.id} | UserID: ${r.user_id} | Email: ${r.email} | Tenant: ${r.tenant_id} | Created: ${r.created_at}\n`;
        });

        fs.writeFileSync('rpc_def_log.txt', output, 'utf8');
        console.log('✅ RPC definition written to rpc_def_log.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

getRpcDef();

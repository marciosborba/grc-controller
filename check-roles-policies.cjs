const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkPolicies() {
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
            SELECT policyname, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename IN ('user_roles', 'user_tenant_roles') AND schemaname = 'public'
            ORDER BY tablename, cmd;
        `);
        let output = '--- RLS Policies for user_roles and user_tenant_roles ---\n';
        res.rows.forEach(row => {
            output += `Table: ${row.tablename} | Command: [${row.cmd}] | Policy: ${row.policyname}\n`;
            output += `QUAL: ${row.qual}\n`;
            output += `WITH CHECK: ${row.with_check}\n`;
            output += '-----------------------------------\n';
        });
        fs.writeFileSync('roles_policies_log.txt', output);
        console.log('✅ Policies written to roles_policies_log.txt');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkPolicies();

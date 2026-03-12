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
            WHERE tablename = 'profiles' AND schemaname = 'public'
            ORDER BY cmd;
        `);
        let output = '--- RLS Policies for public.profiles ---\n';
        res.rows.forEach(row => {
            output += `Command: [${row.cmd}] | Policy: ${row.policyname}\n`;
            output += `QUAL: ${row.qual}\n`;
            output += `WITH CHECK: ${row.with_check}\n`;
            output += '-----------------------------------\n';
        });
        fs.writeFileSync('policies_log.txt', output);
        console.log('✅ Policies written to policies_log.txt');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkPolicies();

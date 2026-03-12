const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function run() {
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
        let log = '';
        
        log += '--- 1. RLS Policies on profiles ---\n';
        const resPolicies = await client.query("SELECT policyname as name, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles'");
        resPolicies.rows.forEach(r => {
            log += `Name: ${r.name} | CMD: ${r.cmd} | Qual: ${r.qual} | Check: ${r.with_check}\n`;
        });

        const email = 'marcio@gepriv.com';
        log += `\n--- 2. Checking for Lockouts (${email}) ---\n`;
        const resLock = await client.query('SELECT * FROM public.auth_lockouts WHERE email = $1', [email]);
        if (resLock.rows.length > 0) {
            log += `⚠️ Locked found: ${JSON.stringify(resLock.rows[0])}\n`;
            await client.query('DELETE FROM public.auth_lockouts WHERE email = $1', [email]);
            log += '✅ Lockout PURGED.\n';
        } else {
            log += '✅ No lockout found.\n';
        }

        log += '\n--- 3. Checking Profile Data ---\n';
        const resProf = await client.query("SELECT id, user_id, email, is_active, must_change_password FROM public.profiles WHERE email = $1", [email]);
        resProf.rows.forEach(r => {
            log += `ID: ${r.id} | UserID: ${r.user_id} | Active: ${r.is_active} | MustChange: ${r.must_change_password}\n`;
        });

        log += '\n--- 4. Final Purge ---\n';
        await client.query('DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = $1)', [email]);
        await client.query('DELETE FROM public.profiles WHERE email = $1 OR user_id IN (SELECT id FROM auth.users WHERE email = $1)', [email]);
        await client.query('DELETE FROM auth.users WHERE email = $1', [email]);
        log += '✅ Deep cleanup complete.\n';

        fs.writeFileSync('diag_results.txt', log, 'utf8');
        console.log('✅ Diagnostic results written to diag_results.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();

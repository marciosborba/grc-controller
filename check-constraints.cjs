const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkConstraints() {
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
        
        let output = '--- CONSTRAINTS for public.profiles ---\n';
        const res = await client.query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE conrelid = 'public.profiles'::regclass;
        `);
        res.rows.forEach(r => {
            output += `${r.conname}: ${r.definition}\n`;
        });

        output += '\n--- INDEXES for public.profiles ---\n';
        const res2 = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes 
            WHERE tablename = 'profiles' AND schemaname = 'public';
        `);
        res2.rows.forEach(r => {
            output += `${r.indexname}: ${r.indexdef}\n`;
        });

        output += '\n--- CONSTRAINTS for public.user_roles ---\n';
        const res3 = await client.query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE conrelid = 'public.user_roles'::regclass;
        `);
        res3.rows.forEach(r => {
            output += `${r.conname}: ${r.definition}\n`;
        });

        fs.writeFileSync('constraints_log.txt', output, 'utf8');
        console.log('✅ Constraints written to constraints_log.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkConstraints();

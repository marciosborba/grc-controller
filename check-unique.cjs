const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkUniqueIndexes() {
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
        
        let output = '--- UNIQUE INDEXES for profiles ---\n';
        const res = await client.query(`
            SELECT 
                i.relname as index_name,
                pg_get_indexdef(x.indexrelid) as definition
            FROM pg_index x
            JOIN pg_class c ON c.oid = x.indrelid
            JOIN pg_class i ON i.oid = x.indexrelid
            WHERE c.relname = 'profiles' AND x.indisunique = true;
        `);
        res.rows.forEach(r => {
            output += `${r.index_name}: ${r.definition}\n`;
        });

        output += '\n--- UNIQUE INDEXES for user_roles ---\n';
        const res2 = await client.query(`
            SELECT 
                i.relname as index_name,
                pg_get_indexdef(x.indexrelid) as definition
            FROM pg_index x
            JOIN pg_class c ON c.oid = x.indrelid
            JOIN pg_class i ON i.oid = x.indexrelid
            WHERE c.relname = 'user_roles' AND x.indisunique = true;
        `);
        res2.rows.forEach(r => {
            output += `${r.index_name}: ${r.definition}\n`;
        });

        fs.writeFileSync('unique_log.txt', output, 'utf8');
        console.log('✅ Unique indexes written to unique_log.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUniqueIndexes();

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

const SQL_FILES = [
    path.join(__dirname, 'sql', 'fix_rls_users.sql'),
    path.join(__dirname, 'sql', 'create_vendor_messages_rls.sql')
];

async function main() {
    try {
        for (const file of SQL_FILES) {
            console.log(`Applying SQL migration: ${file}`);
            const sql = fs.readFileSync(file, 'utf8');
            await pool.query(sql);
            console.log('Migration applied successfully.');
        }
    } catch (err) {
        console.error('Error applying migration:', err.message);
    } finally {
        await pool.end();
    }
}
main();

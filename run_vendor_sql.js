import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const SQL_FILES = [
    path.join(__dirname, 'sql', 'fix_rls_users.sql'),
    path.join(__dirname, 'sql', 'create_vendor_messages_rls.sql')
];

// Assuming 'supabase' client is available globally or imported,
// or that 'exec_sql' is a custom RPC function on the PostgreSQL side.
// For this example, we'll adapt to use the existing 'pg' client for execution.
// If 'supabase' client is truly intended, it would need to be imported and initialized.

async function applySql() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set in .env');
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to DB');

        for (const file of SQL_FILES) {
            try {
                console.log(`Applying script: ${file}`);
                const sql = fs.readFileSync(file, 'utf8');
                // Adapting the RPC call to direct client.query for pg.Client
                await client.query(sql);
                console.log(`Successfully applied ${file}`);
            } catch (err) {
                console.error(`Error applying SQL from file ${file}:`, err);
                // Decide if you want to continue or exit on first error
                // For now, we'll log and continue to the next file
            }
        }
    } catch (error) {
        console.error('Error during database connection or initial setup:', error);
    } finally {
        await client.end();
        console.log('DB connection closed.');
    }
}

run();

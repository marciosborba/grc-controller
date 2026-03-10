const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
    const connectionString = process.env.VITE_SUPABASE_DB_URL; // Using direct db connect
    if (!connectionString) {
        console.log('No DB URL');
        return;
    }
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB. Applying migration...');

        await client.query(`
      ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS contract_owner_name text;
      ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS contract_owner_email text;
      ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS risk_override_level text;
      ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS risk_override_reason text;
    `);

        console.log('Migration applied successfully.');
    } catch (error) {
        console.error('Error applying migration:', error);
    } finally {
        await client.end();
    }
}

runMigration();

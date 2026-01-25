const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

const migrationFile = 'supabase/migrations/20260125130000_privacy_scanner_rpc.sql';

async function applyMigration() {
    console.log(`🚀 Applying migration: ${migrationFile}`);

    const config = {
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    };

    const client = new Client(config);

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        await client.connect();
        console.log('✅ Connected to database');

        // Split commands by semicolon to better report errors, 
        // but usually running the whole block is fine for stored procedures / CREATE statements.
        // Given the DO block, running as one text is safer.

        console.log('🔧 Executing SQL...');
        await client.query(sql);

        console.log('✅ Migration applied successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (!process.env.SUPABASE_DB_PASSWORD) {
            console.error('💡 Hint: Check if SUPABASE_DB_PASSWORD is set in .env');
        }
    } finally {
        await client.end();
    }
}

applyMigration();

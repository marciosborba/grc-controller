const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyDebugRLS() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'debug_rls_vendor_permissive.sql'), 'utf8');
        console.log('Applying Debug RLS Policy for Vendor Registry...');
        await client.query(sql);
        console.log('✅ Policy applied successfully.');
    } catch (err) {
        console.error('Error applying policy:', err);
    } finally {
        await client.end();
    }
}

applyDebugRLS();

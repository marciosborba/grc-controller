const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = `postgres://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`;

async function applyMigrations() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('--- Applying show_in_interior Migration ---');

        const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260305132000_add_show_in_interior.sql');
        if (fs.existsSync(migrationPath)) {
            console.log('\nExecuting 20260305132000_add_show_in_interior.sql...');
            const sql = fs.readFileSync(migrationPath, 'utf8');
            await client.query(sql);
            console.log('✅ Success: show_in_interior column added.');
        } else {
            console.error('File not found', migrationPath);
        }

    } catch (err) {
        console.error('❌ Error executing migrations:', err);
    } finally {
        await client.end();
    }
}

applyMigrations();

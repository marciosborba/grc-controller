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

        console.log('--- Applying Unique Constraint Migration ---');

        const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260305124000_update_custom_fields_unique_constraint.sql');
        if (fs.existsSync(migrationPath)) {
            console.log('\nExecuting 20260305124000_update_custom_fields_unique_constraint.sql...');
            const sql = fs.readFileSync(migrationPath, 'utf8');
            await client.query(sql);
            console.log('✅ Success: Unique constraint updated to include target_module.');
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

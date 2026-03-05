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

        console.log('--- Applying Custom Fields V3 Migrations ---');

        const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260305122000_revert_target_module_to_text.sql');
        if (fs.existsSync(migrationPath)) {
            console.log('\nExecuting 20260305122000_revert_target_module_to_text.sql...');
            const sql = fs.readFileSync(migrationPath, 'utf8');
            await client.query(sql);
            console.log('✅ Success: target_module reverted to text.');
        }

        console.log('\nReloading PostgREST Schema Cache...');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Success: Schema Cache reloaded.');

        console.log('\n🎉 V3 Migrations applied successfully!');

    } catch (err) {
        console.error('❌ Error executing migrations:', err);
    } finally {
        await client.end();
    }
}

applyMigrations();

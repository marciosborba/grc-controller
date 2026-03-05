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

        console.log('--- Applying Missing Custom Fields Migrations ---');

        // Migration 1: show_in_filters
        const migration1Path = path.resolve(__dirname, '../supabase/migrations/20260305094935_add_show_in_filters_to_custom_fields.sql');
        if (fs.existsSync(migration1Path)) {
            console.log('\nExecuting 20260305094935_add_show_in_filters_to_custom_fields.sql...');
            const sql1 = fs.readFileSync(migration1Path, 'utf8');
            await client.query(sql1);
            console.log('✅ Success: show_in_filters migration applied.');
        }

        // Migration 2: target_module to array
        const migration2Path = path.resolve(__dirname, '../supabase/migrations/20260305114500_update_target_module_to_array.sql');
        if (fs.existsSync(migration2Path)) {
            console.log('\nExecuting 20260305114500_update_target_module_to_array.sql...');
            const sql2 = fs.readFileSync(migration2Path, 'utf8');
            await client.query(sql2);
            console.log('✅ Success: target_module array migration applied.');
        }

        console.log('\nReloading PostgREST Schema Cache...');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Success: Schema Cache reloaded.');

        console.log('\n🎉 All migrations applied successfully!');

    } catch (err) {
        console.error('❌ Error executing migrations:', err);
    } finally {
        await client.end();
    }
}

applyMigrations();

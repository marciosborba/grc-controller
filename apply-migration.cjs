const DatabaseManager = require('./database-manager.cjs');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
    const db = new DatabaseManager();

    try {
        const connected = await db.connect();
        if (!connected) {
            console.error('❌ Failed to connect to database');
            process.exit(1);
        }

        const migrationPath = path.join(__dirname, 'supabase/migrations/20251226_update_framework_types.sql');
        console.log(`📖 Reading migration file: ${migrationPath}`);

        if (!fs.existsSync(migrationPath)) {
            console.error('❌ Migration file not found');
            process.exit(1);
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('🔄 Executing migration...');

        await db.executeSQL(sql, 'Update framework types constraint');
        console.log('✅ Migration applied successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await db.disconnect();
    }
}

applyMigration();

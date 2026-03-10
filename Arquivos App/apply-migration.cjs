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

        const migrationFile = process.argv[2];
        if (!migrationFile) {
            console.error('❌ Please provide a migration file path');
            process.exit(1);
        }

        const migrationPath = path.resolve(process.cwd(), migrationFile);
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

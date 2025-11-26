const fs = require('fs');
const path = require('path');
const DatabaseManager = require('./database-manager.cjs');

async function main() {
    const args = process.argv.slice(2);
    const filePath = args[0];

    if (!filePath) {
        console.error('❌ Usage: node execute-migration.js <path-to-sql-file>');
        process.exit(1);
    }

    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ File not found: ${fullPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(fullPath, 'utf8');
    const db = new DatabaseManager();

    try {
        const connected = await db.connect();
        if (!connected) {
            console.error('❌ Could not connect to database');
            process.exit(1);
        }

        console.log(`🚀 Executing migration: ${path.basename(filePath)}`);
        await db.executeSQL(sql, `Migration ${path.basename(filePath)}`);
        console.log('✅ Migration executed successfully');

    } catch (error) {
        console.error('❌ Error executing migration:', error.message);
        process.exit(1);
    } finally {
        await db.disconnect();
    }
}

main().catch(console.error);

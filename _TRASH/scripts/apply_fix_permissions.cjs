const fs = require('fs');
const path = require('path');
const DatabaseManager = require('../database-manager.cjs');

async function main() {
    // Instantiate with verbose logging if possible, assuming default constructor
    const db = new DatabaseManager();

    try {
        console.log('Connecting to database...');
        const connected = await db.connect();
        if (!connected) {
            console.error('Failed to connect to database');
            process.exit(1);
        }

        const sqlPath = path.join(__dirname, 'fix_messaging_permissions.sql');
        console.log(`Reading SQL from ${sqlPath}...`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        // executeSQL usually takes (sql, description)
        await db.executeSQL(sql, 'Fix Messaging Permissions');

        console.log('SQL executed successfully!');
    } catch (error) {
        console.error('Error applying fix:', error);
        process.exit(1);
    } finally {
        await db.disconnect();
    }
}

main();

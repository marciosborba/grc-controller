const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runDebug() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_superuser_update.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running debug superuser update...');
        const result = await db.executeSQL(sql, 'Debug Superuser Update');
        console.log('Result:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error running debug:', error);
    } finally {
        process.exit(0);
    }
}

runDebug();

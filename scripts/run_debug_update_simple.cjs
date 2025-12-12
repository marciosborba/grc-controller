const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runDebug() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_anon_update_simple.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running debug update simple...');
        const result = await db.executeSQL(sql, 'Debug Update Simple');
        console.log('Result:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error running debug:', error);
    } finally {
        process.exit(0);
    }
}

runDebug();

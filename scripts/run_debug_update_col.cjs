const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runDebug() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_anon_update_col.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running debug update col...');
        const result = await db.executeSQL(sql, 'Debug Update Col');
        console.log('Result:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error running debug:', error);
    } finally {
        process.exit(0);
    }
}

runDebug();

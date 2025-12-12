const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runDebug() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_anon_update.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running debug script...');
        // We use executeSQL but we need to capture NOTICES which DatabaseManager might not expose directly
        // But usually they appear in the output or we can check the result
        const result = await db.executeSQL(sql, 'Debug Anon Update');
        console.log('Result Rows:', JSON.stringify(result.rows || result, null, 2));
        console.log('Debug execution completed.');

    } catch (error) {
        console.error('Error running debug:', error);
    } finally {
        process.exit(0);
    }
}

runDebug();

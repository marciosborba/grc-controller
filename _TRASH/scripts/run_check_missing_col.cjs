const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runCheck() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'check_missing_col.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking missing col...');
        const result = await db.executeSQL(sql, 'Check Missing Col');
        console.log('Result:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error checking missing col:', error);
    } finally {
        process.exit(0);
    }
}

runCheck();

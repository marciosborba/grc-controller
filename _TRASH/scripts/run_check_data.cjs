const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runCheck() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'check_data.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking data...');
        const result = await db.executeSQL(sql, 'Check Data');
        console.log('Rows:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        process.exit(0);
    }
}

runCheck();

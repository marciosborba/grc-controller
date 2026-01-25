const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function checkTriggers() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'check_triggers.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking triggers...');
        const result = await db.executeSQL(sql, 'Check Triggers');
        console.log('Triggers:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error checking triggers:', error);
    } finally {
        process.exit(0);
    }
}

checkTriggers();

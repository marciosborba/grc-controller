const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runFix() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'add_missing_col.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Adding missing col...');
        await db.executeSQL(sql, 'Add Missing Col');

    } catch (error) {
        console.error('Error adding missing col:', error);
    } finally {
        process.exit(0);
    }
}

runFix();

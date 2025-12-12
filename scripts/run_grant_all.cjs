const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runFix() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'grant_all.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Granting all...');
        await db.executeSQL(sql, 'Grant All');

    } catch (error) {
        console.error('Error granting all:', error);
    } finally {
        process.exit(0);
    }
}

runFix();

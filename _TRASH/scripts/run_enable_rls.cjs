const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runEnable() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'enable_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Enabling RLS...');
        await db.executeSQL(sql, 'Enable RLS');

    } catch (error) {
        console.error('Error enabling RLS:', error);
    } finally {
        process.exit(0);
    }
}

runEnable();

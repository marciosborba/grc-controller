const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runDisable() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'disable_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Disabling RLS...');
        await db.executeSQL(sql, 'Disable RLS');

    } catch (error) {
        console.error('Error disabling RLS:', error);
    } finally {
        process.exit(0);
    }
}

runDisable();

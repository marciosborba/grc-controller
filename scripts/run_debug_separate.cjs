const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runFix() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_rls_separate.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying separate policies...');
        await db.executeSQL(sql, 'Apply Separate Policies');

    } catch (error) {
        console.error('Error applying policies:', error);
    } finally {
        process.exit(0);
    }
}

runFix();

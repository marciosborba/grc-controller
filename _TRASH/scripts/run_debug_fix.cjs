const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runFix() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_rls_fix.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying debug fix...');
        const result = await db.executeSQL(sql, 'Apply Debug Fix');
        console.log('Result:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error applying fix:', error);
    } finally {
        process.exit(0);
    }
}

runFix();

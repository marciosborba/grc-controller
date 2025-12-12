const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runDebug() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_rpc.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running debug RPC...');
        // We need to capture notices? DatabaseManager logs them?
        // executeSQL uses client.query which might not log notices by default unless we listen.
        // But let's see if it throws error.

        const result = await db.executeSQL(sql, 'Debug RPC');
        console.log('Result:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error running debug:', error);
    } finally {
        process.exit(0);
    }
}

runDebug();

const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runFix() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'create_rpc_function.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Creating RPC function...');
        await db.executeSQL(sql, 'Create RPC Function');

    } catch (error) {
        console.error('Error creating RPC:', error);
    } finally {
        process.exit(0);
    }
}

runFix();

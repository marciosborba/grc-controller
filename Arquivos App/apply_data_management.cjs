const DatabaseManager = require('./database-manager.cjs');
const fs = require('fs');
const path = require('path');

async function run() {
    const db = new DatabaseManager();
    try {
        await db.connect();

        console.log('🚀 Applying Data Management Schema...');
        const sql = fs.readFileSync(path.join(__dirname, 'data_management.sql'), 'utf8');
        await db.executeSQL(sql, 'Data Management RPCs');

        console.log('✅ Storage stats function created!');
    } catch (error) {
        console.error('❌ Error applying schema:', error);
    } finally {
        await db.disconnect();
    }
}

run();

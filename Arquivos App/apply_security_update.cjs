const DatabaseManager = require('./database-manager.cjs');
const fs = require('fs');
const path = require('path');

async function run() {
    const db = new DatabaseManager();
    try {
        await db.connect();

        console.log('🚀 Updating Security Functions...');
        const sql = fs.readFileSync(path.join(__dirname, 'update_security_functions.sql'), 'utf8');

        await db.executeSQL(sql, 'Update Security Logic with Dynamic Settings');

        console.log('✅ Integrated UI settings with database logic!');
    } catch (error) {
        console.error('❌ Error updating functions:', error);
    } finally {
        await db.disconnect();
    }
}

run();

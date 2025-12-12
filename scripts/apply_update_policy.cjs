const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function applyPolicy() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'fix_public_update_policy.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying policy from:', sqlPath);
        await db.executeSQL(sql, 'Apply Public Update Policy');

        console.log('Policy applied successfully.');
    } catch (error) {
        console.error('Error applying policy:', error);
    } finally {
        process.exit(0);
    }
}

applyPolicy();

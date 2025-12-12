const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runCheck() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'check_structure_deep.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking structure deep...');
        const result = await db.executeSQL(sql, 'Check Structure Deep');
        if (Array.isArray(result)) {
            result.forEach((res, i) => {
                console.log(`Result ${i}:`, JSON.stringify(res.rows, null, 2));
            });
        } else {
            console.log('Result:', JSON.stringify(result.rows || result, null, 2));
        }

    } catch (error) {
        console.error('Error checking structure:', error);
    } finally {
        process.exit(0);
    }
}

runCheck();

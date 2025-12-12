const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runCheck() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'check_trigger_def.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking trigger def...');
        const result = await db.executeSQL(sql, 'Check Trigger Def');
        if (Array.isArray(result)) {
            result.forEach((res, i) => {
                console.log(`Result ${i}:`, JSON.stringify(res.rows, null, 2));
            });
        } else {
            console.log('Result:', JSON.stringify(result.rows || result, null, 2));
        }

    } catch (error) {
        console.error('Error checking trigger def:', error);
    } finally {
        process.exit(0);
    }
}

runCheck();

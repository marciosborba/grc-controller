const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runDebug() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'debug_role_context.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running role context debug...');
        const result = await db.executeSQL(sql, 'Debug Role Context');
        // pg returns array of results for multiple statements
        if (Array.isArray(result)) {
            result.forEach((res, i) => {
                console.log(`Result ${i}:`, JSON.stringify(res.rows, null, 2));
            });
        } else {
            console.log('Result:', JSON.stringify(result.rows || result, null, 2));
        }

    } catch (error) {
        console.error('Error running debug:', error);
    } finally {
        process.exit(0);
    }
}

runDebug();

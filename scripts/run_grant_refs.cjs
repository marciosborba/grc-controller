const DatabaseManager = require('../database-manager.cjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseManager();

async function runFix() {
    try {
        await db.connect();

        const sqlPath = path.join(__dirname, 'grant_refs.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Granting refs...');
        const result = await db.executeSQL(sql, 'Grant Refs');
        if (Array.isArray(result)) {
            result.forEach((res, i) => {
                console.log(`Result ${i}:`, JSON.stringify(res.rows, null, 2));
            });
        } else {
            console.log('Result:', JSON.stringify(result.rows || result, null, 2));
        }

    } catch (error) {
        console.error('Error granting refs:', error);
    } finally {
        process.exit(0);
    }
}

runFix();

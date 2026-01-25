const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkSeverity() {
    try {
        await db.connect();
        console.log('Checking severity values...');

        const sql = `
      SELECT id, title, severity 
      FROM incidents 
      LIMIT 20;
    `;

        const result = await db.executeSQL(sql, "Fetching incidents");
        console.log('Incidents:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error checking severity:', error);
    } finally {
        process.exit(0);
    }
}

checkSeverity();

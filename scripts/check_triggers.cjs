const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkTriggers() {
    try {
        await db.connect();
        console.log('Checking triggers for incidents table...');

        const sql = `
      SELECT trigger_name, event_manipulation, action_statement, action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'incidents';
    `;

        const result = await db.executeSQL(sql, "Fetching triggers");
        console.log('Triggers:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error checking triggers:', error);
    } finally {
        process.exit(0);
    }
}

checkTriggers();

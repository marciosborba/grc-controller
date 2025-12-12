const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function listTables() {
    try {
        await db.connect();
        const sql = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
        const result = await db.executeSQL(sql, "List tables");
        console.log('Tables:', JSON.stringify(result.rows || result, null, 2));
    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        process.exit(0);
    }
}

listTables();

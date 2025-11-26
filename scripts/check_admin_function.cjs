const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkFunction() {
    try {
        await db.connect();
        console.log('Checking is_platform_admin function...');

        const sql = `
      SELECT pg_get_functiondef(oid)
      FROM pg_proc
      WHERE proname = 'is_platform_admin';
    `;

        const result = await db.executeSQL(sql, "Fetching function definition");
        console.log('Function definition:', result.rows[0]?.pg_get_functiondef);

    } catch (error) {
        console.error('Error checking function:', error);
    } finally {
        process.exit(0);
    }
}

checkFunction();

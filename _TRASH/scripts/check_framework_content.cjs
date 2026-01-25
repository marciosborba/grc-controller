const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkFramework() {
    try {
        await db.connect();
        const sql = `
      SELECT id, nome, criterios_pontuacao
      FROM assessment_frameworks
      LIMIT 1;
    `;
        const result = await db.executeSQL(sql, "Check framework content");
        console.log('Framework:', JSON.stringify(result.rows || result, null, 2));
    } catch (error) {
        console.error('Error checking framework:', error);
    } finally {
        process.exit(0);
    }
}

checkFramework();

const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkRelatedRLS() {
    try {
        await db.connect();
        console.log('Checking RLS for related tables...');

        const tables = ['vendor_assessments'];

        for (const table of tables) {
            // Check policies
            const polSql = `
        SELECT policyname, cmd, qual, roles
        FROM pg_policies
        WHERE tablename = '${table}';
      `;
            const polResult = await db.executeSQL(polSql, `Checking Policies for ${table}`);
            console.log('Policies:', JSON.stringify(polResult.rows || polResult, null, 2));
        }
    } catch (error) {
        console.error('Error checking related RLS:', error);
    } finally {
        process.exit(0);
    }
}

checkRelatedRLS();

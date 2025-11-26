const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkPolicies() {
    try {
        await db.connect();
        console.log('Checking RLS policies for incidents table...');

        const sql = `
      SELECT policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'incidents';
    `;

        const result = await db.executeSQL(sql, "Fetching policies");
        console.log('Policies:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error checking policies:', error);
    } finally {
        process.exit(0);
    }
}

checkPolicies();

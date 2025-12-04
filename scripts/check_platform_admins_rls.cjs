const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkPlatformAdminsRLS() {
    try {
        await db.connect();
        console.log('Checking platform_admins table details...');

        // Check RLS enabled
        const rlsSql = `
      SELECT relname, relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE relname = 'platform_admins';
    `;
        const rlsResult = await db.executeSQL(rlsSql, "Checking RLS");
        console.log('RLS Status:', JSON.stringify(rlsResult.rows || rlsResult, null, 2));

        // Check policies
        const polSql = `
      SELECT policyname, cmd, qual
      FROM pg_policies
      WHERE tablename = 'platform_admins';
    `;
        const polResult = await db.executeSQL(polSql, "Checking Policies");
        console.log('Policies:', JSON.stringify(polResult.rows || polResult, null, 2));

    } catch (error) {
        console.error('Error checking platform_admins:', error);
    } finally {
        process.exit(0);
    }
}

checkPlatformAdminsRLS();

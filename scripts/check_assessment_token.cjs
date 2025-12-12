const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function checkToken() {
    try {
        await db.connect();
        const token = 'NDk3YWFkZjQtMDE1_mj0o2p2d';
        console.log(`Checking for assessment with public_link: ${token}`);

        const sql = `
      SELECT id, assessment_name, status, public_link, public_link_expires_at
      FROM vendor_assessments
      WHERE public_link = '${token}';
    `;

        const result = await db.executeSQL(sql, "Fetching assessment by token");
        console.log('Assessment:', JSON.stringify(result.rows || result, null, 2));

        // Also check RLS on vendor_assessments
        const rlsSql = `
      SELECT policyname, cmd, qual, roles
      FROM pg_policies
      WHERE tablename = 'vendor_assessments';
    `;
        const rlsResult = await db.executeSQL(rlsSql, "Checking RLS policies");
        console.log('RLS Policies:', JSON.stringify(rlsResult.rows || rlsResult, null, 2));

    } catch (error) {
        console.error('Error checking token:', error);
    } finally {
        process.exit(0);
    }
}

checkToken();

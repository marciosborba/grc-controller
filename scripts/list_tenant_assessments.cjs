const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function listAssessments() {
    try {
        await db.connect();
        const tenantId = '46b1c048-85a1-423b-96fc-776007c8de1f'; // From previous check
        console.log(`Listing assessments for tenant: ${tenantId}`);

        const sql = `
      SELECT id, assessment_name, status, public_link, created_at, updated_at
      FROM vendor_assessments
      WHERE tenant_id = '${tenantId}'
      ORDER BY updated_at DESC
      LIMIT 10;
    `;

        const result = await db.executeSQL(sql, "Fetching assessments");
        console.log('Assessments:', JSON.stringify(result.rows || result, null, 2));

    } catch (error) {
        console.error('Error listing assessments:', error);
    } finally {
        process.exit(0);
    }
}

listAssessments();

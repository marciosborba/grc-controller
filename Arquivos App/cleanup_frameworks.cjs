const DatabaseManager = require('./database-manager.cjs');

async function cleanupFrameworks() {
    const db = new DatabaseManager();

    try {
        const connected = await db.connect();
        if (!connected) process.exit(1);

        const standardCodes = [
            'ISO-27001',
            'LGPD-BR',
            'NIST-CSF-2.0',
            'COBIT-2019',
            'ITIL-4',
            'PCI-DSS-4.0',
            'GDPR-EU',
            'SOX-ITGC',
            // Legacy codes to cleanup
            'SOX',
            'NIST_CSF',
            'LGPD',
            'ISO27001',
            'PCI'
        ];

        // Delete linked Action Plans
        console.log('🗑️ Deleting linked action plans...');
        const deleteActionPlansSql = `
      DELETE FROM assessment_action_plans
      WHERE assessment_id IN (
        SELECT id FROM assessments
        WHERE framework_id IN (
            SELECT id FROM assessment_frameworks 
            WHERE codigo = ANY($1::text[])
            AND codigo NOT LIKE '%_COPY_%'
        )
      );
    `;
        await db.client.query(deleteActionPlansSql, [standardCodes]);

        // Delete linked assessments first (Cascade doesn't seem to be configured on FK)
        console.log('🗑️ Deleting linked assessments...');
        const deleteAssessmentsSql = `
      DELETE FROM assessments 
      WHERE framework_id IN (
        SELECT id FROM assessment_frameworks 
        WHERE codigo = ANY($1::text[])
        AND codigo NOT LIKE '%_COPY_%'
      );
    `;
        await db.client.query(deleteAssessmentsSql, [standardCodes]);

        console.log('🗑️ Cleaning up corrupt standard frameworks by code...');

        // Construct SQL to delete by code (using ANY for array is clean PG)
        const sql = `
      DELETE FROM assessment_frameworks 
      WHERE codigo = ANY($1::text[]) 
      -- Safety check: ensure we don't delete if it somehow looks like a copy (though clones usually change code)
      AND codigo NOT LIKE '%_COPY_%';
    `;

        // Execute via client directly to pass parameters correctly
        // Since executeSQL in manager uses raw query string usually, I'll use client.query via a custom call if manager exposes it, 
        // OR just interpolate carefully (safe here as codes are hardcoded).
        // Actually DatabaseManager.client is exposed.

        const result = await db.client.query(sql, [standardCodes]);
        console.log(`✅ Deleted ${result.rowCount} frameworks.`);

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    } finally {
        await db.disconnect();
    }
}

cleanupFrameworks();

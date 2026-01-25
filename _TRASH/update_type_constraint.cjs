const DatabaseManager = require('./database-manager.cjs');

async function updateConstraint() {
    console.log("🚀 Updating 'tipo_framework' constraint...");
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    const client = db.client;

    try {
        await client.query("ALTER TABLE assessment_frameworks DROP CONSTRAINT IF EXISTS assessment_frameworks_tipo_framework_check");
        await client.query(`
            ALTER TABLE assessment_frameworks 
            ADD CONSTRAINT assessment_frameworks_tipo_framework_check 
            CHECK (tipo_framework::text = ANY (ARRAY[
                'compliance', 'security', 'privacy', 'operational', 'financial', 
                'governance', 'risk_management', 'quality', 'environmental', 
                'custom', 'ISO27001', 'NIST', 'LGPD', 'GDPR', 
                'PCI_DSS', 'SOX', 'COBIT', 'ITIL', 'CUSTOM', 'CIS'
            ]::text[]))
        `);
        console.log("✅ Constraint updated successfully!");
    } catch (e) {
        console.error("❌ Error updating constraint:", e);
    } finally {
        await db.disconnect();
    }
}

updateConstraint();

const DatabaseManager = require('./database-manager.cjs');

async function debugTenants() {
    console.log("🚀 Debugging Tenants...");
    const db = new DatabaseManager();
    if (!await db.connect()) return;

    try {
        const res = await db.client.query(`
            SELECT tenant_id, count(*) as count, max(created_at) as recent 
            FROM assessment_frameworks 
            WHERE is_standard = true 
            GROUP BY tenant_id
        `);
        console.log("Tenant Distributions:");
        res.rows.forEach(r => console.log(`Tenant: ${r.tenant_id} | Count: ${r.count} | Recent: ${r.recent}`));

        if (res.rows.length === 0) {
            console.log("❌ No standard frameworks found in ANY tenant.");
        }
    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await db.disconnect();
    }
}

debugTenants();

const DatabaseManager = require('./database-manager.cjs');

async function verifyControls() {
    console.log("🚀 Verifying Controls Audit...");
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    const client = db.client;

    try {
        // 1. Check Standard Frameworks
        console.log("\n📦 STANDARD Frameworks:");
        const stdRes = await client.query(`
            SELECT f.id, f.codigo, f.nome, f.tenant_id, COUNT(c.id) as control_count
            FROM assessment_frameworks f
            LEFT JOIN assessment_controls c ON f.id = c.framework_id
            WHERE f.is_standard = true
            GROUP BY f.id, f.codigo, f.nome, f.tenant_id
            ORDER BY f.codigo
        `);

        if (stdRes.rows.length === 0) console.log("   ❌ No Standard Frameworks found!");
        else {
            stdRes.rows.forEach(r => {
                const status = parseInt(r.control_count) > 0 ? "✅" : "❌ EMPTY";
                console.log(`   ${status} [${r.codigo}] ${r.nome} (Tenant: ${r.tenant_id}) -> Controls: ${r.control_count}`);
            });
        }

        // 2. Check Recent Clones (Custom Frameworks)
        console.log("\n📄 RECENT CLONES (Custom) - Last 5:");
        const cloneRes = await client.query(`
            SELECT f.id, f.codigo, f.nome, f.tenant_id, f.created_at, COUNT(c.id) as control_count
            FROM assessment_frameworks f
            LEFT JOIN assessment_controls c ON f.id = c.framework_id
            WHERE f.is_standard = false
            GROUP BY f.id, f.codigo, f.nome, f.tenant_id, f.created_at
            ORDER BY f.created_at DESC
            LIMIT 5
        `);

        if (cloneRes.rows.length === 0) console.log("   ❌ No Custom Frameworks found!");
        else {
            cloneRes.rows.forEach(r => {
                const status = parseInt(r.control_count) > 0 ? "✅" : "❌ EMPTY";
                console.log(`   ${status} [${r.codigo}] ${r.nome} (Created: ${new Date(r.created_at).toISOString()}) -> Controls: ${r.control_count}`);
            });
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await db.disconnect();
    }
}

verifyControls();

const DatabaseManager = require('./database-manager.cjs');

async function debugLGPD() {
    const db = new DatabaseManager();
    if (!await db.connect()) return;

    try {
        console.log("🔍 Searching for ANY framework resembling LGPD...");
        const res = await db.client.query("SELECT id, nome, codigo, is_standard, tenant_id FROM assessment_frameworks WHERE codigo ILIKE '%LGPD%' OR nome ILIKE '%LGPD%'");
        console.table(res.rows);

        if (res.rows.length > 0) {
            const first = res.rows[0];
            console.log(`\n🔍 Checking controls for ${first.nome} (${first.id})...`);
            const controls = await db.client.query("SELECT titulo, codigo FROM assessment_controls WHERE framework_id = $1 LIMIT 5", [first.id]);
            controls.rows.forEach(c => console.log(`   [${c.codigo}] ${c.titulo}`));
        } else {
            console.log("⚠️ No LGPD frameworks found at all.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.disconnect();
    }
}

debugLGPD();

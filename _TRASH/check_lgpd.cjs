const DatabaseManager = require('./database-manager.cjs');

async function check() {
    const db = new DatabaseManager();
    if (!await db.connect()) return;

    try {
        const codes = ['LGPD-BR', 'NIST-CSF-2.0', 'COBIT-2019', 'ITIL-4', 'PCI-DSS-4.0', 'GDPR-EU', 'SOX-ITGC', 'ISO-27001'];
        for (const code of codes) {
            const res = await db.client.query("SELECT id, nome, is_standard FROM assessment_frameworks WHERE codigo = $1 AND is_standard = true", [code]);
            if (res.rows.length === 0) {
                console.log(`❌ ${code} NOT FOUND`);
            } else {
                const fwId = res.rows[0].id;
                const controls = await db.client.query("SELECT titulo, codigo FROM assessment_controls WHERE framework_id = $1 LIMIT 5", [fwId]);
                console.log(`\n🔍 Controls for ${code}:`);
                controls.rows.forEach(c => console.log(`   [${c.codigo}] ${c.titulo}`));
            }
        }


        // Check for Clones
        console.log("\nChecking for Clones...");
        const clones = await db.client.query("SELECT id, nome, codigo, created_at FROM assessment_frameworks WHERE is_standard = false AND nome LIKE '%(Cópia)%' ORDER BY created_at DESC LIMIT 5");
        console.log(`Found ${clones.rowCount} clones.`);
        for (const clone of clones.rows) {
            console.log(`\n📄 Clone: ${clone.nome}`);
            const controls = await db.client.query("SELECT titulo, codigo FROM assessment_controls WHERE framework_id = $1 LIMIT 5", [clone.id]);
            controls.rows.forEach(c => console.log(`   [${c.codigo}] ${c.titulo}`));
        }


    } catch (e) {
        console.error(e);
    } finally {
        await db.disconnect();
    }
}

check();

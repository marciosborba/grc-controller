const DatabaseManager = require('./database-manager.cjs');

async function cleanupGhosts() {
    const db = new DatabaseManager();
    const connected = await db.connect();
    if (!connected) return;

    try {
        console.log("👻 Cleaning up Ghost and Empty Clones...");

        // 1. Delete Clones with 0 controls
        // We find frameworks that are NOT standard, are copies, and have NO controls.
        // Or simply frameworks with no domains/controls that are supposed to be clones.

        // Let's be aggressive with 'Cópia' and 0 controls.
        const res = await db.client.query(`
            SELECT f.id, f.nome, f.codigo 
            FROM assessment_frameworks f
            LEFT JOIN assessment_domains d ON f.id = d.framework_id
            WHERE f.nome LIKE '%(Cópia)%' 
            AND d.id IS NULL
        `);

        if (res.rows.length > 0) {
            console.log(`Found ${res.rows.length} empty clones to delete.`);
            const ids = res.rows.map(r => r.id);
            await db.client.query("DELETE FROM assessment_frameworks WHERE id = ANY($1)", [ids]);
            console.log("✅ Deleted empty clones.");
        } else {
            console.log("No empty clones found (via domain check).");
        }

        // Also check if any standard frameworks are missing controls (Half-seeded state)
        const partial = await db.client.query(`
            SELECT f.id, f.nome, f.codigo
            FROM assessment_frameworks f
            LEFT JOIN assessment_domains d ON f.id = d.framework_id
            WHERE f.is_standard = true
            AND d.id IS NULL
        `);
        if (partial.rows.length > 0) {
            console.log(`Found ${partial.rows.length} empty standard frameworks.`);
            const ids = partial.rows.map(r => r.id);
            // Delete them so they can be re-seeded
            await db.client.query("DELETE FROM assessment_frameworks WHERE id = ANY($1)", [ids]);
            console.log("✅ Deleted partial standard frameworks.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.disconnect();
    }
}

cleanupGhosts();

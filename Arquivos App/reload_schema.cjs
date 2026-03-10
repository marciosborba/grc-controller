const DatabaseManager = require('./database-manager.cjs');

async function reloadSchema() {
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    try {
        await db.client.query("NOTIFY pgrst, 'reload schema';");
        console.log("✅ Schema reload notified.");
    } catch (e) {
        console.error("❌ Error reloading schema:", e);
    } finally {
        await db.disconnect();
    }
}
reloadSchema();

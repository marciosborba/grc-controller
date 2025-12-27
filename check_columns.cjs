const DatabaseManager = require('./database-manager.cjs');

async function checkColumns() {
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    try {
        const res = await db.client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'assessments'
            ORDER BY column_name;
        `);
        console.log("Columns in 'assessments':");
        res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
    } catch (e) {
        console.error(e);
    } finally {
        await db.disconnect();
    }
}
checkColumns();

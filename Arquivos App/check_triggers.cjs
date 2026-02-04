const DatabaseManager = require('./database-manager.cjs');

async function checkTriggers() {
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    try {
        const res = await db.client.query(`
            SELECT tgname, tgtype, tgenabled, prosrc 
            FROM pg_trigger
            JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
            WHERE tgrelid = 'assessments'::regclass;
        `);
        console.log("Triggers on 'assessments':");
        if (res.rows.length === 0) console.log("No triggers found.");
        res.rows.forEach(r => {
            console.log(`- ${r.tgname} (${r.tgenabled}):`);
            console.log(r.prosrc);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    } finally {
        await db.disconnect();
    }
}
checkTriggers();

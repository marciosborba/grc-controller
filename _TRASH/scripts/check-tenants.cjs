const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function main() {
    try {
        await db.connect();

        console.log('--- Profiles Tenants ---');
        const profiles = await db.executeSQL("SELECT id, full_name, tenant_id FROM profiles LIMIT 5");
        console.log(profiles.rows);

        console.log('--- Incidents Tenants ---');
        const incidents = await db.executeSQL("SELECT id, title, tenant_id FROM incidents LIMIT 5");
        console.log(incidents.rows);

        console.log('--- Tenants List ---');
        const tenants = await db.executeSQL("SELECT id, name FROM tenants");
        console.log(tenants.rows);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}

main();

const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function main() {
    try {
        await db.connect();

        console.log('--- Profiles ---');
        const profiles = await db.executeSQL("SELECT id, full_name FROM profiles LIMIT 5");
        console.log(profiles.rows);

        console.log('--- Tenants ---');
        const tenants = await db.executeSQL("SELECT id, name FROM tenants LIMIT 5");
        console.log(tenants.rows);

        console.log('--- Auth Users ---');
        const users = await db.executeSQL("SELECT id, email FROM auth.users LIMIT 5");
        console.log(users.rows);

        console.log('--- Valid Users (Auth + Profile + Tenant) ---');
        const validUsers = await db.executeSQL(`
      SELECT au.id, au.email, p.full_name, p.tenant_id 
      FROM auth.users au
      JOIN profiles p ON au.id = p.id
      JOIN tenants t ON p.tenant_id = t.id
      LIMIT 5
    `);
        console.log(validUsers.rows);

        console.log('--- Incidents Count ---');
        const count = await db.executeSQL("SELECT COUNT(*) FROM incidents");
        console.log(count.rows);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}

main();

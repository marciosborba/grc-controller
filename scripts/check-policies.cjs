const DatabaseManager = require('../database-manager.cjs');

const db = new DatabaseManager();

async function main() {
    try {
        await db.connect();

        console.log('--- RLS Policies for incidents ---');
        const policies = await db.executeSQL(`
      SELECT policyname, cmd, roles, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'incidents'
    `);
        console.log(policies.rows);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}

main();

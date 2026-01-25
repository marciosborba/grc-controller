const DatabaseManager = require('../database-manager.cjs');

async function dump() {
  const db = new DatabaseManager();
  await db.connect();

  const tables = [
    'vendor_incidents',
    'vendor_contracts',
    'vendor_performance_metrics',
    'vendor_communications'
  ];

  for (const table of tables) {
    console.log(`Checking ${table}...`);
    try {
      const res = await db.client.query(`select policyname, cmd, qual from pg_policies where tablename = '${table}'`);
      if (res.rows.length === 0) {
        console.log(`No policies found on ${table}.`);
      } else {
        console.table(res.rows);
      }
    } catch (e) {
      console.error(`Error checking ${table}: ${e.message}`);
    }
  }

  await db.disconnect();
}

dump().catch(console.error);

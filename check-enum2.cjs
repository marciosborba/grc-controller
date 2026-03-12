const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();
const c = new Client({ host: 'db.myxvxponlmulnjstbjwd.supabase.co', port: 5432, database: 'postgres', user: 'postgres', password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false } });
c.connect().then(async () => {
  const enums = await c.query("SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'app_role' ORDER BY e.enumsortorder");
  const cols = await c.query("SELECT column_name, udt_name FROM information_schema.columns WHERE table_name = 'user_roles' AND table_schema = 'public'");
  const constraints = await c.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'public.user_roles'::regclass");
  const result = { enums: enums.rows, columns: cols.rows, constraints: constraints.rows };
  fs.writeFileSync('enum-check.json', JSON.stringify(result, null, 2));
  console.log('Done. Written to enum-check.json');
  await c.end();
}).catch(e => console.error(e));

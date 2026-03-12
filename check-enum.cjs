const { Client } = require('pg');
require('dotenv').config();
const c = new Client({ host: 'db.myxvxponlmulnjstbjwd.supabase.co', port: 5432, database: 'postgres', user: 'postgres', password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false } });
c.connect().then(async () => {
  const r = await c.query("SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'app_role' ORDER BY e.enumsortorder");
  console.log('app_role enum values:', r.rows.map(x => x.enumlabel));
  const c2 = await c.query("SELECT column_name, udt_name FROM information_schema.columns WHERE table_name = 'user_roles' AND table_schema = 'public'");
  console.log('user_roles columns:', c2.rows);
  await c.end();
}).catch(e => console.error(e));

const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();
const c = new Client({ host: 'db.myxvxponlmulnjstbjwd.supabase.co', port: 5432, database: 'postgres', user: 'postgres', password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false } });
c.connect().then(async () => {
  // Check profiles constraints
  const profileConstraints = await c.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass AND contype IN ('u','p')");
  // Check if guest/vendor are valid app_roles
  const enumCheck = await c.query("SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'app_role'");
  // Check the current handle_new_user source
  const func = await c.query("SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user'");
  const result = { profileConstraints: profileConstraints.rows, appRoles: enumCheck.rows.map(r => r.enumlabel), triggerSource: func.rows[0]?.prosrc };
  fs.writeFileSync('full-diag.json', JSON.stringify(result, null, 2));
  console.log('App roles:', result.appRoles);
  console.log('Profile constraints:', result.profileConstraints.map(r => r.def));
  await c.end();
}).catch(e => console.error(e));

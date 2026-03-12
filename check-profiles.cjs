const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();
const c = new Client({ host: 'db.myxvxponlmulnjstbjwd.supabase.co', port: 5432, database: 'postgres', user: 'postgres', password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false } });
c.connect().then(async () => {
  const r = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' ORDER BY ordinal_position");
  console.log('profiles columns:', r.rows.map(x => x.column_name + ':' + x.data_type));
  fs.writeFileSync('profiles-cols.json', JSON.stringify(r.rows, null, 2));
  await c.end();
}).catch(e => console.error(e));

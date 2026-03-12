const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: 'db.myxvxponlmulnjstbjwd.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const email = 'marcio@gepriv.com';
    console.log(`🧹 Starting full cleanup for ${email}...`);

    const u = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (u.rows.length > 0) {
      const uid = u.rows[0].id;
      console.log(`Found UID: ${uid}`);

      // 1. Delete roles
      const dr = await client.query('DELETE FROM public.user_roles WHERE user_id = $1', [uid]);
      console.log(`Deleted ${dr.rowCount} records from user_roles`);

      // 2. Delete profiles
      const dp = await client.query('DELETE FROM public.profiles WHERE user_id = $1', [uid]);
      console.log(`Deleted ${dp.rowCount} records from profiles`);

      // 3. Delete from auth.users (Must be done via SQL as superuser)
      const du = await client.query('DELETE FROM auth.users WHERE id = $1', [uid]);
      console.log(`Deleted ${du.rowCount} records from auth.users`);

      console.log('✅ Full cleanup complete.');
    } else {
      console.log('❌ User not found in auth.users');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}
run();

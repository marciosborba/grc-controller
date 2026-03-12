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
    
    const res = await client.query("SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user'");
    if (res.rows.length > 0) {
        require('fs').writeFileSync('handle_new_user_source.sql', res.rows[0].prosrc);
        console.log('✅ Function source saved to handle_new_user_source.sql');
    } else {
        console.log('❌ Function not found');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();

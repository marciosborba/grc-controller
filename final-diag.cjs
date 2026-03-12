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
    
    const query = `
      SELECT
          nm.nspname AS schema_name,
          cl.relname AS table_name,
          con.conname AS constraint_name,
          ref_nm.nspname AS ref_schema,
          ref_cl.relname AS ref_table,
          con.confdeltype,
          CASE con.confdeltype
              WHEN 'a' THEN 'NO ACTION'
              WHEN 'r' THEN 'RESTRICT'
              WHEN 'c' THEN 'CASCADE'
              WHEN 'n' THEN 'SET NULL'
              WHEN 'd' THEN 'SET DEFAULT'
          END AS delete_rule
      FROM pg_constraint con
      JOIN pg_class cl ON cl.oid = con.conrelid
      JOIN pg_namespace nm ON nm.oid = cl.relnamespace
      JOIN pg_class ref_cl ON ref_cl.oid = con.confrelid
      JOIN pg_namespace ref_nm ON ref_nm.oid = ref_cl.relnamespace
      WHERE con.contype = 'f'
        AND (
          (ref_cl.relname = 'users' AND ref_nm.nspname = 'auth')
          OR (ref_cl.relname = 'profiles' AND ref_nm.nspname = 'public')
        )
        AND con.confdeltype IN ('a', 'r')
      ORDER BY nm.nspname, cl.relname;
    `;
    
    const res = await client.query(query);
    let output = '=== ACTUAL BLOCKING FOREIGN KEYS (pg_catalog) ===\n';
    res.rows.forEach(r => {
      output += `[${r.delete_rule}] ${r.schema_name}.${r.table_name} (${r.constraint_name}) -> REFERENCES ${r.ref_schema}.${r.ref_table}\n`;
    });
    
    const fs = require('fs');
    fs.writeFileSync('final-blockers-list.txt', output);
    console.log(`✅ Found ${res.rows.length} blockers. Results in final-blockers-list.txt`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();

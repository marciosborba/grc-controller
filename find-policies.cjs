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
    
    // Find schema
    const res = await client.query("SELECT n.nspname as schema, c.relname as table FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'policies'");
    console.log('=== POLICIES TABLES FOUND ===');
    res.rows.forEach(r => console.log(`Schema: ${r.schema} | Table: ${r.table}`));
    
    // Find all constraints for ANY table named 'policies'
    const res2 = await client.query(`
        SELECT 
            tc.table_schema, 
            tc.constraint_name, 
            tc.constraint_type,
            kcu.column_name,
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        LEFT JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
            AND rc.constraint_schema = tc.table_schema
        WHERE tc.table_name = 'policies'
    `);
    console.log('\n=== CONSTRAINTS FOR TABLES NAMED policies ===');
    res2.rows.forEach(r => {
        console.log(`Schema: ${r.table_schema} | Type: ${r.constraint_type} | Name: ${r.constraint_name} | Col: ${r.column_name} | Ref: ${r.foreign_table_schema}.${r.foreign_table_name}(${r.foreign_column_name}) | Delete Rule: ${r.delete_rule}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();

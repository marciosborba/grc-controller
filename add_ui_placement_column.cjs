const { Client } = require('pg');
const fs = require('fs');

async function main() {
  let envContent = fs.readFileSync('.env', 'utf8');
  const dbPassMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.*)/);
  if (!dbPassMatch) {
    console.error('SUPABASE_DB_PASSWORD not found in .env');
    return;
  }
  
  const client = new Client({ 
    connectionString: 'postgresql://postgres:' + dbPassMatch[1].trim() + '@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres' 
  });
  
  try {
    await client.connect();
    
    // Add the column
    await client.query(`
      ALTER TABLE public.custom_field_definitions 
      ADD COLUMN IF NOT EXISTS ui_placement text;
    `);

    console.log('✅ Successfully added ui_placement column to custom_field_definitions.');
    
  } catch (err) {
    console.error('❌ Error executing query:', err.message);
  } finally {
    await client.end();
  }
}

main();

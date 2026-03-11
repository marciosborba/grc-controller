const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/) || envContent.match(/SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/) || envContent.match(/SUPABASE_ANON_KEY=(.*)/);
const roleKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(urlMatch[1].trim(), roleKeyMatch ? roleKeyMatch[1].trim() : keyMatch[1].trim());

async function run() {
  const { data, error } = await supabase.from('remediation_tasks').select('*').limit(1);
  console.log('remediation_tasks error:', error);
  if (data) {
    console.log('columns:', Object.keys(data[0] || {}));
  }
}
run();

const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/) || envContent.match(/SUPABASE_URL=(.*)/);
// Use anon key or a user token if needed, but since RLS is true for authenticated, anon might not work if it requires anon to be authenticated, wait, service role bypasses RLS. To test RLS, we need a user token. But wait, RLS is "true" for authenticated. If we just want to know if there's a schema issue, we can use service_role. 
const roleKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(urlMatch[1].trim(), roleKeyMatch[1].trim());

async function run() {
  const { data, error } = await supabase.from('remediation_tasks').insert({
    vulnerability_id: '11111111-1111-1111-1111-111111111111', // Fake
    status: 'open'
  }).select();
  console.log('Insert error:', error);
}
run();

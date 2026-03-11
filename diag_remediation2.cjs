const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/) || envContent.match(/SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/) || envContent.match(/SUPABASE_ANON_KEY=(.*)/);
const roleKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(urlMatch[1].trim(), roleKeyMatch ? roleKeyMatch[1].trim() : keyMatch[1].trim());

async function run() {
  // Try to insert a dummy remediation task to see the exact error
  const { data, error } = await supabase
    .from('remediation_tasks')
    .insert({
      vulnerability_id: '00000000-0000-0000-0000-000000000000',
      status: 'open'
    });
  
  console.log('Insert Error:', error);

  // RLS for remediation_tasks?
  // We can't query pg_policies via standard api, but the error usually says "new row violates row-level security policy for table" or "null value in column tenant_id violates not-null constraint"
}
run();

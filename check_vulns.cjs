const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVulns() {
  const tenantId = '46b1c048-85a1-423b-96fc-776007c8de1f'; // GRC tenant typically
  
  console.log('Checking total vulns...');
  const { count: total, error: err1 } = await supabase.from('vulnerabilities').select('*', { count: 'exact', head: true });
  console.log(`Total vulns in DB: ${total} (Error: ${err1?.message || 'none'})`);

  console.log(`Checking vulns for GRC tenant ${tenantId}...`);
  const { data, error: err2 } = await supabase.from('vulnerabilities').select('id, title, tenant_id').eq('tenant_id', tenantId).limit(5);
  
  if (err2) {
    console.error("Error fetching for GRC:", err2);
  } else {
    console.log(`Found ${data.length} vulnerabilities for GRC tenant.`);
    console.log(data);
  }
}

checkVulns();

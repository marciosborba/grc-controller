
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserTenant() {
    try {
        console.log("--- Investigating User Profiles ---");
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, tenant_id, is_platform_admin');

        if (error) {
            console.error("Error fetching profiles:", error);
        } else {
            console.table(profiles);
        }

        console.log("\n--- Checking RLS on vendor_registry with a specific user ---");
        // We can't easily "impersonate" in a simple script without a token, 
        // but we can check if the tenant_id in profiles matches the vendor_registry tenant_id.

        const { data: vendors } = await supabase.from('vendor_registry').select('*');
        if (vendors) {
            vendors.forEach(v => {
                console.log(`Vendor: ${v.name}, TenantID: ${v.tenant_id}`);
            });
        }

    } catch (err) {
        console.error(err);
    }
}

checkUserTenant();

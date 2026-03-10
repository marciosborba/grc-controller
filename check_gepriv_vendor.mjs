
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

if (!supabaseKey) {
    console.error("Missing Supabase key. Set VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigate() {
    try {
        console.log("--- Investigating Tenants ---");
        const { data: tenants, error: tError } = await supabase
            .from('tenants')
            .select('id, name, slug');

        if (tError) {
            console.error("Error fetching tenants:", tError);
        } else {
            console.table(tenants);
        }

        const grcTenant = tenants?.find(t => t.name.includes('GRC') || t.slug === 'grc');
        const grcId = grcTenant?.id;
        console.log(`GRC Tenant ID: ${grcId}`);

        console.log("\n--- Investigating Vendors (Total count) ---");
        const { count, error: cError } = await supabase
            .from('vendor_registry')
            .select('*', { count: 'exact', head: true });

        console.log(`Total vendors in registry: ${count}`);

        console.log("\n--- Searching for 'Gepriv' ---");
        const { data: vendors, error: vError } = await supabase
            .from('vendor_registry')
            .select('id, name, tenant_id, status')
            .ilike('name', '%gepriv%');

        if (vError) {
            console.error("Error fetching vendors:", vError);
        } else {
            console.table(vendors);
        }

        if (vendors && vendors.length > 0) {
            vendors.forEach(v => {
                console.log(`\nFound Vendor: ${v.name}`);
                console.log(`Vendor ID: ${v.id}`);
                console.log(`Tenant ID in Registry: ${v.tenant_id}`);

                if (grcId && v.tenant_id !== grcId) {
                    console.log(`ALERT: Vendor belongs to a DIFFERENT tenant (${v.tenant_id}) than GRC (${grcId})!`);
                } else if (!grcId) {
                    console.log("ALERT: GRC Tenant UUID not found in 'tenants' table!");
                } else {
                    console.log("SUCCESS: Vendor belongs to GRC tenant (UUID match).");
                }
            });
        } else {
            console.log("\nVendor 'Gepriv' NOT FOUND in vendor_registry!");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

investigate();

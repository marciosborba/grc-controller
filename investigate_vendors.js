
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lzghvmtlqmvzkvzrzkvz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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

        console.log("\n--- Investigating Vendors ---");
        const { data: vendors, error: vError } = await supabase
            .from('vendor_registry')
            .select('id, name, tenant_id, status');

        if (vError) {
            console.error("Error fetching vendors:", vError);
        } else {
            console.table(vendors);
        }

        const geprivVendor = vendors?.find(v => v.name.toLowerCase().includes('gepriv'));
        if (geprivVendor) {
            console.log(`\nFound Vendor: ${geprivVendor.name}`);
            console.log(`Vendor ID: ${geprivVendor.id}`);
            console.log(`Tenant ID in Registry: ${geprivVendor.tenant_id}`);

            if (grcId && geprivVendor.tenant_id !== grcId) {
                console.log("ALERT: Vendor belongs to a DIFFERENT tenant than GRC!");
            } else if (!grcId) {
                console.log("ALERT: GRC Tenant not found!");
            } else {
                console.log("SUCCESS: Vendor belongs to GRC tenant (UUID match).");
            }
        } else {
            console.log("\nVendor 'Gepriv' NOT FOUND in vendor_registry!");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

investigate();

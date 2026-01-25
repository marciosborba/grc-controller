
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkModules() {
    console.log('Checking modules...');

    // 1. Check all tenants
    const { data: tenants, error: tErr } = await supabase.from('tenants').select('id, name, slug');
    if (tErr) { console.error(tErr); return; }

    console.log(`Found ${tenants.length} tenants.`);

    for (const tenant of tenants) {
        console.log(`\nTenant: ${tenant.name} (${tenant.id})`);

        // 2. Check modules for this tenant
        const { data: modules, error: mErr } = await supabase
            .from('tenant_modules')
            .select('module_key, is_enabled')
            .eq('tenant_id', tenant.id);

        if (mErr) {
            console.error('Error fetching modules:', mErr.message);
        } else {
            console.log(`  Modules found: ${modules.length}`);
            modules.forEach(m => console.log(`  - ${m.module_key}: ${m.is_enabled}`));

            if (modules.length === 0) {
                console.log('  ⚠️  NO MODULES FOUND! Sidebar will be empty.');
            }
        }
    }
}

checkModules();


import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing since .env is missing/not loading with dotenv
const supabaseUrl = "https://myxvxponlmulnjstbjwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigrationData() {
    console.log('--- Testing Platform Admin Migration Data Loading ---');

    // 1. Fetch platform_admins
    console.log('1. Fetching platform_admins...');
    const { data: platformAdmins, error: platformError } = await supabase
        .from('platform_admins')
        .select('user_id, created_at');

    if (platformError) console.error('Error fetching platform_admins:', platformError);
    else console.log(`Found ${platformAdmins?.length || 0} platform admins`);

    // 2. Fetch admin roles
    console.log('2. Fetching user_roles (admin, super_admin, platform_admin)...');
    const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'super_admin', 'platform_admin']);

    if (rolesError) console.error('Error fetching user_roles:', rolesError);
    else console.log(`Found ${adminRoles?.length || 0} admin roles`);

    // 3. Fetch profiles
    const allUserIds = [
        ...new Set([
            ...(platformAdmins?.map(pa => pa.user_id) || []),
            ...(adminRoles?.map(ar => ar.user_id) || [])
        ])
    ];

    if (allUserIds.length > 0) {
        console.log(`3. Fetching profiles for ${allUserIds.length} users...`);
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', allUserIds);

        if (profilesError) console.error('Error fetching profiles:', profilesError);
        else console.log(`Found ${profiles?.length || 0} profiles`);
    } else {
        console.log('3. Skipping profiles fetch (no users found)');
    }
}

testMigrationData();

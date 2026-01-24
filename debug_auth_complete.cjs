
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MOCK of getPermissionsForRoles from AuthContext
const getPermissionsForRoles = (roles, isPlatformAdmin = false) => {
    if (isPlatformAdmin) {
        return ['read', 'write', 'delete', 'admin', 'platform_admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage', 'assessment.read', 'all'];
    }

    const permissionMap = {
        admin: ['read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'assessment.read', 'all'],
        ciso: ['read', 'write', 'admin', 'users.read', 'users.update', 'security.read', 'incidents.read', 'vulnerabilities.read', 'assessment.read'],
        risk_manager: ['read', 'write', 'risk.read', 'risk.write', 'vendor.read', 'assessment.read'],
        compliance_officer: ['read', 'write', 'compliance.read', 'compliance.write', 'privacy.read', 'audit.read', 'assessment.read'],
        auditor: ['read', 'audit.read', 'audit.write', 'logs.read', 'assessment.read', 'report.read', 'compliance.read'],
        user: ['read', 'all']
    };

    const allPermissions = new Set();
    roles.forEach(role => {
        const rolePermissions = permissionMap[role] || ['read'];
        rolePermissions.forEach(permission => allPermissions.add(permission));
    });

    return Array.from(allPermissions);
};

async function debugAuth(emailTerm) {
    console.log(`\n🔍 DEEP DEBUG for user: ${emailTerm}`);

    // 1. Get User ID
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*, tenants:tenant_id(name, slug, settings)') // Exact query from AuthContext
        .ilike('email', `%${emailTerm}%`);

    if (pErr) { console.error('❌ Profiles Error:', pErr); return; }
    if (!profiles || profiles.length === 0) { console.error('❌ No profile found'); return; }

    const profile = profiles[0];
    const userId = profile.user_id;
    console.log('✅ Profile loaded:', {
        id: profile.id,
        user_id: userId,
        tenant_id: profile.tenant_id,
        tenant_data: profile.tenants
    });

    // 2. Roles
    const { data: rolesData, error: rErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

    if (rErr) console.error('❌ Roles Error:', rErr);

    const roles = rolesData ? rolesData.map(r => r.role) : [];
    console.log('✅ Roles:', roles);

    // 3. Platform Admin
    const { data: paData, error: paErr } = await supabase
        .from('platform_admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

    const isPlatformAdmin = !!paData;
    console.log('✅ Is Platform Admin:', isPlatformAdmin);

    // 4. Modules (The critical part)
    let enabledModules = [];
    if (profile.tenant_id) {
        console.log(`\n🔍 Fetching modules for tenant: ${profile.tenant_id}`);
        const { data: modData, error: mErr } = await supabase
            .from('tenant_modules')
            .select('module_key, is_enabled') // Added is_enabled to see values
            .eq('tenant_id', profile.tenant_id)
            .eq('is_enabled', true);

        if (mErr) console.error('❌ Tenant Modules Error:', mErr);
        else {
            console.log(`✅ Raw Module Data: Found ${modData.length} records`);
            modData.forEach(m => console.log(`   - ${m.module_key}: ${m.is_enabled}`));
            enabledModules = modData.map(m => m.module_key);
        }
    } else {
        console.warn('⚠️ No tenant_id on profile!');
    }

    // 5. Final Permissions Calculation
    const userPermissions = getPermissionsForRoles(roles, isPlatformAdmin);

    console.log('\n📊 FINAL USER STATE:');
    console.log('- Enabled Modules Count:', enabledModules.length);
    console.log('- Permissions Count:', userPermissions.length);
    console.log('- Has "vulnerabilities" module?', enabledModules.includes('vulnerabilities'));
    console.log('- Has "security.read" permission?', userPermissions.includes('security.read'));
    console.log('- Has "all" permission?', userPermissions.includes('all'));
}

debugAuth('marcio');

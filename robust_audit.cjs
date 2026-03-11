require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function robustAudit() {
    const email_pattern = 'lucas';
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const results = {
        timestamp: new Date().toISOString(),
        vendor_portal_users: [],
        vendor_users: [],
        profiles: [],
        rpc_checks: []
    };

    try {
        // 1. vendor_portal_users
        const { data: vpu } = await supabase.from('vendor_portal_users').select('*').ilike('email', `%${email_pattern}%`);
        results.vendor_portal_users = vpu || [];

        // 2. vendor_users
        const { data: vu } = await supabase.from('vendor_users').select('*').ilike('email', `%${email_pattern}%`);
        results.vendor_users = vu || [];

        // 3. profiles
        const { data: prof } = await supabase.from('profiles').select('*').ilike('email', `%${email_pattern}%`);
        results.profiles = prof || [];

        // 4. RPC Checks for found emails
        const emails = new Set([
            ...results.vendor_portal_users.map(u => u.email),
            ...results.vendor_users.map(u => u.email),
            ...results.profiles.map(p => p.email)
        ]);

        for (const email of emails) {
            if (!email) continue;
            const { data: status } = await supabase.rpc('check_is_vendor', { check_email: email });

            // Find auth_user_id if possible
            const vu_entry = results.vendor_users.find(u => u.email?.toLowerCase() === email.toLowerCase());
            const uid = vu_entry?.auth_user_id;

            let status_with_id = status;
            if (uid) {
                const { data: status_id } = await supabase.rpc('check_is_vendor', { check_uid: uid });
                status_with_id = { by_email: status, by_uid: status_id };
            }

            results.rpc_checks.push({ email, uid, status: status_with_id });
        }

        fs.writeFileSync('audit_results_robust.json', JSON.stringify(results, null, 2));
        console.log('✅ Audit results saved to audit_results_robust.json');

    } catch (err) {
        console.error('Audit failed:', err);
    }
}

robustAudit();

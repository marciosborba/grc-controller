
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPrivacyRPC() {
    console.log('Testing calculate_privacy_metrics RPC...');

    // Login first to get a tenant context (if RLS depends on auth.uid())
    // For this test, we might need a test user. 
    // If we can't login easily in script, we'll try anonymously but RPC might fail if it relies on auth.uid()

    // Note: Most dashboards rely on auth context.
    // We will assume the user has set up the env vars or we can't run this easily.
    // For now, let's just try to call it.

    const { data, error } = await supabase.rpc('calculate_privacy_metrics');

    if (error) {
        console.error('RPC Call Failed:', error);
        // If it fails with "function not found", we know we need to run the migration.
    } else {
        console.log('RPC Success. Data:', JSON.stringify(data, null, 2));
    }
}

// verifyPrivacyRPC();

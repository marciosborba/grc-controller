
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// User ID for Lucas (from auth.users)
const LUCAS_UID = '8c50e41c-7339-404a-98d3-6d600b37ec05';
const LUCAS_EMAIL = 'lucas.alcantara@gepriv.com';

async function simulateUserCheck() {
    // We cannot easily simulate a signed-in user without their JWT,
    // but we can check the table with the service role or just do another audit.
    // However, I want to see if there is ANY case where the email doesn't match.

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY // Using anon key to simulate client
    );

    // This will likely fail or return empty if RLS is enabled and we are not signed in.
    console.log('--- Checking with ANON KEY (should be empty if RLS on) ---');
    const { data, error } = await supabase
        .from('vendor_portal_users')
        .select('email, is_active')
        .eq('email', LUCAS_EMAIL);

    if (error) console.error('Error:', error.message);
    else console.log('Data:', data);

    console.log('--- Checking with SERVICE ROLE (for absolute truth) ---');
    // We don't have service role, but we have psql access.
}

simulateUserCheck();

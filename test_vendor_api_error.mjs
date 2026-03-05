import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUB_KEY);

async function main() {
    // login as teste5
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'teste5@mail.com',
        password: 'teste123'
    });

    if (authErr) {
        console.error("Login failed:", authErr.message);
        return;
    }

    console.log("Logged in as user:", authData.user.id);

    // Run the failing query
    console.log("Querying vendor_users...");
    const { data, error } = await supabase
        .from('vendor_users')
        .select('id')
        .eq('auth_user_id', authData.user.id);

    if (error) {
        console.error("Error query vendor_users:", JSON.stringify(error, null, 2));
    } else {
        console.log("Success:", data);
    }
}

main().catch(console.error);

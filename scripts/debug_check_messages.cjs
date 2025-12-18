const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
// This is the ANON key, used in the frontend.
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    try {
        console.log("🔍 Checking vendor_risk_messages table via Supabase Client...");

        // 1. Try to fetch as anon (this mimics the initial fetch attempt in notification system if it wasn't auth'd correctly, 
        // OR it mimics me checking if public messages are visible to public - but wait, the TABLE policy is for Authenticated users only for SELECT? 
        // My previous SQL gave 'Internal users full access messages' TO authenticated.
        // It did NOT give SELECT access to anon (only Execute RPC).

        // So this query SHOULD fail or return empty if I am anon, unless I use a service role key.
        // But the script I found used the ANON key.
        // Let's see what happens. If RLS is working, this should return empty or error.

        const { data, error } = await supabase
            .from('vendor_risk_messages')
            .select('*');

        if (error) {
            console.log("❌ Error fetching messages (Expected if Anon and RLS active):", error.message);
        } else {
            console.log(`✅ Messages found (as Anon): ${data.length}`);
            if (data.length > 0) {
                console.log("Latest message:", JSON.stringify(data[0], null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();

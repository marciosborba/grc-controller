import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    // Wait, the .env might not have service_role_key. 
    // Let me check if VITE_SUPABASE_SERVICE_ROLE_KEY or something is there.
);

async function check() {
    console.log("Using key:", (process.env.SUPABASE_SERVICE_ROLE_KEY || "NONE").substring(0, 10));
    const { data, error } = await supabase.from('profiles').select('*').ilike('email', '%marcio.borba%');
    console.log("Profiles for marcio.borba:", data, error);

    // Check vendor users
    const { data: v, error: ev } = await supabase.from('vendor_users').select('*');
    console.log("Vendor users:", v, ev);
}

check();

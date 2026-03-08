import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    console.log("ALL PROFILES:");
    data.forEach(p => {
        console.log(`- ${p.email} | id: ${p.id} | tenant_id: ${p.tenant_id} | sys_role: ${p.system_role} | active: ${p.is_active}`);
    });

    const { data: roles, error: err2 } = await supabase.from('user_roles').select('*');
    if (!err2) {
        console.log("\nALL ROLES:");
        roles.forEach(r => console.log(`- ${r.user_id} | role: ${r.role} | tenant: ${r.tenant_id}`));
    }
}

checkProfiles();

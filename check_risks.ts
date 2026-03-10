import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL as string,
    process.env.VITE_SUPABASE_ANON_KEY as string
);

async function checkRisks() {
    const { data, error } = await supabase
        .from('risk_registrations')
        .select('id, risk_title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error(error);
    } else {
        console.log("LAST 20 RISKS:");
        data?.forEach(r => console.log(`${r.id} | ${r.risk_title} | ${r.status} | ${r.created_at}`));
    }
}

checkRisks();

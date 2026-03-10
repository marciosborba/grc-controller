
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActionPlans() {
    const { data, error } = await supabase
        .from('action_plans')
        .select('modulo_origem, count');

    if (error) {
        console.error('Error fetching action plans:', error);
        return;
    }

    // Group manually if needed, or just select all and count
    const { data: allPlans, error: allError } = await supabase
        .from('action_plans')
        .select('modulo_origem');

    if (allError) {
        console.error(allError);
        return;
    }

    const counts = {};
    allPlans.forEach(p => {
        const mod = p.modulo_origem || 'null';
        counts[mod] = (counts[mod] || 0) + 1;
    });

    console.log('Counts by Module in action_plans:', counts);
}

checkActionPlans();

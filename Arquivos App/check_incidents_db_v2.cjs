const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const result = dotenv.config({ path: '../.env' }); // try one level up

if (result.error) {
    dotenv.config({ path: '.env' }); // fallback
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables", process.env.VITE_SUPABASE_URL);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIncidents() {
    console.log("Checando tabela de incidents...");
    const { data, error, count } = await supabase
        .from('incidents')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Erro:", error);
    } else {
        console.log(`Total records in incidents: ${count}`);
        if (data && data.length > 0) {
            console.log("Data snippet:", data[0]);
        } else {
            console.log("Empty incidents table.");
        }
    }
}

checkIncidents();

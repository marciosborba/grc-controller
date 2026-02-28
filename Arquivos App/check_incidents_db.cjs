const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIncidents() {
    console.log("Checando tabela de incidentes...");
    const { data, error, count } = await supabase
        .from('incidents')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Erro:", error);
    } else {
        console.log(`Total de incidentes na tabela: ${count}`);
        if (data && data.length > 0) {
            console.log("Primeiro incidente de exemplo:", data[0]);
        } else {
            console.log("A tabela de incidentes está vazia.");
        }
    }
}

checkIncidents();

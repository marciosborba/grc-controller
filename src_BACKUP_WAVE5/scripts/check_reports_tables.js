
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
// We need to handle ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking tables...');
    const { data, error } = await supabase
        .from('relatorios_conformidade')
        .select('id')
        .limit(1);

    if (error) {
        console.log('Table relatorios_conformidade does not exist or error:', error.message);
    } else {
        console.log('Table relatorios_conformidade exists.');
    }

    const { data: data2, error: error2 } = await supabase
        .from('instancias_relatorios_conformidade')
        .select('id')
        .limit(1);

    if (error2) {
        console.log('Table instancias_relatorios_conformidade does not exist or error:', error2.message);
    } else {
        console.log('Table instancias_relatorios_conformidade exists.');
    }
}

checkTables();

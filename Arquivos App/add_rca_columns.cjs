const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Fallback se local nao existir

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ ERRO: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addRcaColumns() {
    console.log("Iniciando adição de colunas RCA...");

    const sql = `
    ALTER TABLE public.incidents
      ADD COLUMN IF NOT EXISTS recovery_actions TEXT,
      ADD COLUMN IF NOT EXISTS lessons_learned TEXT,
      ADD COLUMN IF NOT EXISTS preventive_measures TEXT;
  `;

    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });

    if (error) {
        if (error.message.includes("Could not find the function")) {
            console.warn("⚠️ A função execute_sql não existe. Não é possível rodar o DDL diretamente. Por favor, adicione as colunas pelo Dashboard do Supabase: 'recovery_actions', 'lessons_learned', 'preventive_measures' do tipo TEXT na tabela 'incidents'.");
        } else {
            console.error("❌ Erro ao adicionar colunas via RPC:", error.message);
        }
    } else {
        console.log("✅ Colunas de RCA adicionadas ou já existentes em 'incidents'.");
    }
}

addRcaColumns();

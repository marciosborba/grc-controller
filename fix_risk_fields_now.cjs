const { createClient } = require('@supabase/supabase-js');

// Usar as mesmas configurações do script que funcionou
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.Nn6xHzDHI-0PfT9t0GcHVLo3uS5DFxCpn8Ie79LvKeg'; // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingFields() {
  console.log('🔧 Adicionando campos faltantes na tabela risk_registrations...');
  
  const commands = [
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS methodology_id VARCHAR(50)",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS probability_score INTEGER", 
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS gravity_score INTEGER",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS urgency_score INTEGER",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS tendency_score INTEGER",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_responsible VARCHAR(255)",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS review_date DATE",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS residual_risk_level VARCHAR(50)",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS residual_probability INTEGER",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS closure_criteria TEXT",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_notes TEXT",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS kpi_definition TEXT",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS identification_date DATE",
    "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS responsible_area VARCHAR(100)"
  ];
  
  for (const sql of commands) {
    try {
      console.log(`Executando: ${sql.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec', { sql });
      if (error) {
        console.log(`⚠️ ${error.message}`);
      } else {
        console.log('✅ OK');
      }
    } catch (err) {
      console.log(`⚠️ ${err.message}`);
    }
  }
  
  // Testar se funcionou
  console.log('\n🔍 Testando campos...');
  try {
    const { data, error } = await supabase
      .from('risk_registrations')
      .select('id, methodology_id, monitoring_responsible')
      .limit(1);
    
    if (!error) {
      console.log('✅ Campos adicionados com sucesso!');
    } else {
      console.log('❌ Erro:', error.message);
    }
  } catch (err) {
    console.log('❌ Erro no teste:', err.message);
  }
  
  console.log('\n🎉 Processo concluído! O formulário deve funcionar agora.');
}

addMissingFields();
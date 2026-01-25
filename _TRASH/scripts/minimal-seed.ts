import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function minimalSeed() {
  console.log('🌱 Tentando inserir tenant mínimo...');
  
  try {
    // Tentar inserir apenas com campos obrigatórios
    const minimalTenant = {
      name: 'ACME Corporation',
      slug: 'acme-corp',
      contact_email: 'admin@acmecorp.com'
    };
    
    const { data, error } = await supabase
      .from('tenants')
      .insert(minimalTenant)
      .select();

    if (error) {
      console.error('❌ Erro ao inserir tenant mínimo:', error);
    } else {
      console.log('✅ Tenant mínimo inserido:', data);
      
      // Verificar a estrutura do registro inserido
      if (data && data[0]) {
        console.log('📋 Campos do tenant inserido:');
        Object.keys(data[0]).forEach(field => {
          console.log(`  • ${field}: ${typeof data[0][field]} = ${data[0][field]}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante inserção:', error);
  }
}

// Executar o seed mínimo
minimalSeed().then(() => {
  console.log('🎉 Seed mínimo concluído!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Falha no seed:', err);
  process.exit(1);
});
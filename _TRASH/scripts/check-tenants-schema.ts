import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Verificando schema da tabela tenants...');
  
  try {
    // Tentar buscar dados existentes para entender a estrutura
    const { data: existingTenants, error } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('❌ Erro ao consultar tenants:', error);
      return;
    }
    
    console.log('✅ Tenants encontrados:', existingTenants?.length || 0);
    
    if (existingTenants && existingTenants.length > 0) {
      console.log('📋 Campos disponíveis no primeiro registro:');
      const firstTenant = existingTenants[0];
      Object.keys(firstTenant).forEach(field => {
        console.log(`  • ${field}: ${typeof firstTenant[field]}`);
      });
      
      console.log('\n📋 Exemplo de registro:');
      console.log(JSON.stringify(firstTenant, null, 2));
    } else {
      console.log('📋 Nenhum tenant encontrado na tabela');
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar a verificação
checkSchema().then(() => {
  console.log('🎉 Verificação concluída!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Falha na verificação:', err);
  process.exit(1);
});
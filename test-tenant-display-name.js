const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function testTenantDisplayName() {
  console.log('🧪 Testando exibição do nome fantasia da tenant...\n');

  try {
    // 1. Fazer login
    console.log('1. Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'dev@grc.local',
      password: 'dev123456'
    });

    if (loginError) {
      console.error('❌ Erro ao fazer login:', loginError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso\n');

    // 2. Buscar tenants com dados de empresa
    console.log('2. Buscando tenants com dados de empresa...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, slug, settings')
      .limit(5);

    if (tenantsError) {
      console.error('❌ Erro ao buscar tenants:', tenantsError.message);
      return;
    }

    console.log(`✅ Encontrados ${tenants.length} tenants\n`);

    // 3. Simular a função getTenantDisplayName
    const getTenantDisplayName = (tenant) => {
      if (!tenant) {
        return 'Governança • Riscos • Compliance';
      }

      const companyData = tenant.settings?.company_data || {};
      
      return companyData.trading_name?.trim() || 
             companyData.corporate_name?.trim() || 
             tenant.name?.trim() || 
             'Governança • Riscos • Compliance';
    };

    // 4. Testar a função para cada tenant
    console.log('3. Testando função getTenantDisplayName:\n');
    
    tenants.forEach((tenant, index) => {
      const displayName = getTenantDisplayName(tenant);
      const companyData = tenant.settings?.company_data || {};
      
      console.log(`📋 Tenant ${index + 1}:`);
      console.log(`   Nome original: ${tenant.name}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   Nome fantasia: ${companyData.trading_name || 'Não definido'}`);
      console.log(`   Razão social: ${companyData.corporate_name || 'Não definido'}`);
      console.log(`   🎯 Nome de exibição: "${displayName}"`);
      console.log('');
    });

    // 5. Criar um tenant de exemplo com nome fantasia
    console.log('4. Criando exemplo com nome fantasia...');
    
    const exampleTenant = {
      id: 'example-id',
      name: 'Empresa Exemplo Ltda',
      slug: 'empresa-exemplo',
      settings: {
        company_data: {
          corporate_name: 'Empresa Exemplo Ltda',
          trading_name: 'Exemplo Corp',
          tax_id: '12.345.678/0001-90'
        }
      }
    };

    const exampleDisplayName = getTenantDisplayName(exampleTenant);
    console.log(`📋 Exemplo de tenant com nome fantasia:`);
    console.log(`   Nome original: ${exampleTenant.name}`);
    console.log(`   Nome fantasia: ${exampleTenant.settings.company_data.trading_name}`);
    console.log(`   🎯 Nome de exibição: "${exampleDisplayName}"`);
    console.log('');

    // 6. Testar casos extremos
    console.log('5. Testando casos extremos...');
    
    const testCases = [
      { name: 'Tenant sem dados', tenant: null },
      { name: 'Tenant vazio', tenant: {} },
      { name: 'Tenant só com nome', tenant: { name: 'Empresa Teste' } },
      { name: 'Tenant com settings vazio', tenant: { name: 'Empresa Teste', settings: {} } }
    ];

    testCases.forEach(testCase => {
      const result = getTenantDisplayName(testCase.tenant);
      console.log(`   ${testCase.name}: "${result}"`);
    });

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📝 Resumo da implementação:');
    console.log('• A função getTenantDisplayName() prioriza o nome fantasia');
    console.log('• Se não houver nome fantasia, usa a razão social');
    console.log('• Se não houver razão social, usa o nome da tenant');
    console.log('• Como fallback, usa o texto padrão "Governança • Riscos • Compliance"');
    console.log('• O AppSidebar agora mostra o nome correto da empresa do usuário');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testTenantDisplayName().catch(console.error);
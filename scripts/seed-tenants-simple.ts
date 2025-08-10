import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseKey);

const seedTenants = [
  {
    id: 'tenant-acme-001',
    name: 'ACME Corporation',
    slug: 'acme-corp',
    contact_email: 'admin@acmecorp.com',
    max_users: 500,
    current_users_count: 247,
    subscription_plan: 'enterprise',
    subscription_status: 'active',
    is_active: true
  },
  {
    id: 'tenant-tech-002',
    name: 'TechSoft Consultoria',
    slug: 'techsoft-ltd',
    contact_email: 'contato@techsoft.com.br',
    max_users: 100,
    current_users_count: 67,
    subscription_plan: 'professional',
    subscription_status: 'active',
    is_active: true
  },
  {
    id: 'tenant-green-003',
    name: 'Greenfield Bank',
    slug: 'greenfield-bank',
    contact_email: 'compliance@greenfieldbank.com',
    max_users: 1000,
    current_users_count: 892,
    subscription_plan: 'enterprise',
    subscription_status: 'active',
    is_active: true
  },
  {
    id: 'tenant-med-004',
    name: 'Medicare Health Solutions',
    slug: 'medicare-health',
    contact_email: 'direcao@medicarehealth.com.br',
    max_users: 200,
    current_users_count: 156,
    subscription_plan: 'professional',
    subscription_status: 'active',
    is_active: true
  },
  {
    id: 'tenant-innov-005',
    name: 'InnovateTech Startup',
    slug: 'startup-innovate',
    contact_email: 'founder@innovatetech.startup',
    max_users: 25,
    current_users_count: 8,
    subscription_plan: 'trial',
    subscription_status: 'trial',
    is_active: true
  },
  {
    id: 'tenant-retail-007',
    name: 'RetailMax Varejo',
    slug: 'retailmax-varejo',
    contact_email: 'ti@retailmax.com.br',
    max_users: 50,
    current_users_count: 47,
    subscription_plan: 'basic',
    subscription_status: 'active',
    is_active: true
  }
];

async function seedTenantsData() {
  console.log('🌱 Iniciando seed básico dos tenants...');
  
  try {
    // Verificar quais campos existem na tabela
    const { data: existingTenants, error: queryError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);
      
    if (queryError) {
      console.error('❌ Erro ao consultar tabela tenants:', queryError);
      return;
    }
    
    console.log('✅ Conexão com tabela tenants estabelecida');
    
    // Inserir os tenants básicos
    for (const tenant of seedTenants) {
      const { data, error } = await supabase
        .from('tenants')
        .upsert(tenant, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`❌ Erro ao inserir tenant ${tenant.name}:`, error);
      } else {
        console.log(`✅ Tenant ${tenant.name} inserido com sucesso`);
      }
    }
    
    // Verificar dados inseridos
    const { data: insertedTenants } = await supabase
      .from('tenants')
      .select('name, slug, subscription_plan, current_users_count, max_users, is_active')
      .in('slug', seedTenants.map(t => t.slug))
      .order('created_at');
    
    console.log('\n📋 Tenants no banco:');
    insertedTenants?.forEach(tenant => {
      console.log(`  • ${tenant.name} (${tenant.slug})`);
      console.log(`    Plano: ${tenant.subscription_plan} | Usuários: ${tenant.current_users_count}/${tenant.max_users} | ${tenant.is_active ? 'Ativo' : 'Inativo'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
}

// Executar o seed
seedTenantsData().then(() => {
  console.log('🎉 Seed básico concluído!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Falha no seed:', err);
  process.exit(1);
});
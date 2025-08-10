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
    is_active: true,
    settings: {
      company_data: {
        corporate_name: 'ACME Corporation Ltda',
        trading_name: 'ACME Corp',
        tax_id: '12.345.678/0001-90',
        address: 'Av. Paulista, 1000, Conjunto 101',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01310-100',
        country: 'Brasil',
        industry: 'tecnologia',
        size: 'grande',
        description: 'Empresa líder em soluções tecnológicas corporativas, especializada em desenvolvimento de software e consultoria em transformação digital.'
      },
      risk_matrix: {
        type: '5x5',
        impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico'],
        probability_labels: ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo'],
        risk_levels: {
          low: [1, 2, 3, 5, 6],
          medium: [4, 7, 8, 9, 10, 11],
          high: [12, 13, 14, 15, 16, 17, 18],
          critical: [19, 20, 21, 22, 23, 24, 25]
        }
      }
    }
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
    is_active: true,
    settings: {
      company_data: {
        corporate_name: 'TechSoft Consultoria em TI Ltda',
        trading_name: 'TechSoft',
        tax_id: '23.456.789/0001-01',
        address: 'Rua das Flores, 456, Sala 203',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zip_code: '20040-020',
        country: 'Brasil',
        industry: 'servicos',
        size: 'media',
        description: 'Consultoria especializada em implementação de sistemas de gestão e compliance para empresas de médio porte.'
      },
      risk_matrix: {
        type: '4x4',
        impact_labels: ['Baixo', 'Moderado', 'Alto', 'Crítico'],
        probability_labels: ['Improvável', 'Possível', 'Provável', 'Muito Provável'],
        risk_levels: {
          low: [1, 2, 4],
          medium: [3, 5, 6, 8],
          high: [7, 9, 10, 12],
          critical: [11, 13, 14, 15, 16]
        }
      }
    }
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
    is_active: true,
    settings: {
      company_data: {
        corporate_name: 'Banco Greenfield S.A.',
        trading_name: 'Greenfield Bank',
        tax_id: '34.567.890/0001-12',
        address: 'Av. Faria Lima, 2500, 15º andar',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01451-000',
        country: 'Brasil',
        industry: 'financeiro',
        size: 'grande',
        description: 'Instituição financeira focada em soluções bancárias digitais e serviços de crédito para PMEs, com forte compromisso com compliance e gestão de riscos.'
      },
      risk_matrix: {
        type: '5x5',
        impact_labels: ['Insignificante', 'Baixo', 'Moderado', 'Alto', 'Extremo'],
        probability_labels: ['Remoto', 'Improvável', 'Possível', 'Provável', 'Praticamente Certo'],
        risk_levels: {
          low: [1, 2, 3, 5],
          medium: [4, 6, 7, 8, 9, 10],
          high: [11, 12, 13, 14, 15, 16, 17, 18],
          critical: [19, 20, 21, 22, 23, 24, 25]
        }
      }
    }
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
    is_active: true,
    settings: {
      company_data: {
        corporate_name: 'Medicare Health Solutions Ltda',
        trading_name: 'Medicare Health',
        tax_id: '45.678.901/0001-23',
        address: 'Rua da Saúde, 789, Bairro Hospitalar',
        city: 'Belo Horizonte',
        state: 'MG',
        zip_code: '30130-000',
        country: 'Brasil',
        industry: 'saude',
        size: 'media',
        description: 'Prestadora de serviços de saúde especializada em gestão hospitalar e telemedicina, com foco em qualidade e segurança do paciente.'
      },
      risk_matrix: {
        type: '4x4',
        impact_labels: ['Mínimo', 'Menor', 'Moderado', 'Maior'],
        probability_labels: ['Raro', 'Pouco Provável', 'Provável', 'Muito Provável'],
        risk_levels: {
          low: [1, 2, 4],
          medium: [3, 5, 6, 8],
          high: [7, 9, 10, 12],
          critical: [11, 13, 14, 15, 16]
        }
      }
    }
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
    is_active: true,
    settings: {
      company_data: {
        corporate_name: 'InnovateTech Desenvolvimento Ltda ME',
        trading_name: 'InnovateTech',
        tax_id: '56.789.012/0001-34',
        address: 'Hub de Inovação, Sala 42',
        city: 'Curitiba',
        state: 'PR',
        zip_code: '80250-000',
        country: 'Brasil',
        industry: 'tecnologia',
        size: 'micro',
        description: 'Startup focada em desenvolvimento de aplicativos móveis e soluções IoT para agricultura de precisão.'
      },
      risk_matrix: {
        type: '4x4',
        impact_labels: ['Baixo', 'Médio', 'Alto', 'Muito Alto'],
        probability_labels: ['Raro', 'Ocasional', 'Frequente', 'Constante'],
        risk_levels: {
          low: [1, 2, 4],
          medium: [3, 5, 6, 8],
          high: [7, 9, 10, 12],
          critical: [11, 13, 14, 15, 16]
        }
      }
    }
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
    is_active: true,
    settings: {
      company_data: {
        corporate_name: 'RetailMax Comércio Varejista Ltda',
        trading_name: 'RetailMax',
        tax_id: '78.901.234/0001-56',
        address: 'Shopping Center Norte, Loja 234',
        city: 'Porto Alegre',
        state: 'RS',
        zip_code: '91410-000',
        country: 'Brasil',
        industry: 'varejo',
        size: 'pequena',
        description: 'Rede de varejo especializada em eletrônicos e eletrodomésticos com foco no atendimento ao cliente e qualidade.'
      },
      risk_matrix: {
        type: '4x4',
        impact_labels: ['Baixo', 'Moderado', 'Alto', 'Crítico'],
        probability_labels: ['Improvável', 'Possível', 'Provável', 'Muito Provável'],
        risk_levels: {
          low: [1, 2, 4],
          medium: [3, 5, 6, 8],
          high: [7, 9, 10, 12],
          critical: [11, 13, 14, 15, 16]
        }
      }
    }
  }
];

async function seedTenantsData() {
  console.log('🌱 Iniciando seed dos tenants...');
  
  try {
    // Inserir os tenants de teste
    const { data, error } = await supabase
      .from('tenants')
      .upsert(seedTenants, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ Erro ao inserir tenants:', error);
      return;
    }

    console.log('✅ Tenants inseridos com sucesso!');
    
    // Verificar dados inseridos
    const { data: insertedTenants } = await supabase
      .from('tenants')
      .select('name, slug, subscription_plan, current_users_count, max_users, is_active')
      .in('slug', seedTenants.map(t => t.slug))
      .order('created_at');
    
    console.log('\n📋 Tenants criados:');
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
  console.log('🎉 Seed concluído!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Falha no seed:', err);
  process.exit(1);
});
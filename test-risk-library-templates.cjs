const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Templates de exemplo para popular a biblioteca
const SAMPLE_TEMPLATES = [
  {
    name: 'Falha no Sistema de Backup',
    description: 'Risco de perda de dados críticos devido a falhas no sistema de backup automatizado, comprometendo a continuidade dos negócios e a recuperação de informações essenciais.',
    category: 'technology',
    industry: 'geral',
    riskLevel: 'Alto',
    probability: 3,
    impact: 4,
    methodology: 'qualitative',
    alexRiskSuggested: true,
    isPopular: true,
    controls: [
      'Implementar sistema de backup redundante',
      'Realizar testes regulares de restauração',
      'Monitoramento contínuo dos processos de backup',
      'Manter backup off-site ou em nuvem'
    ],
    kris: [
      'Taxa de sucesso dos backups (meta: >99%)',
      'Tempo médio de recuperação (RTO)',
      'Ponto de recuperação (RPO)',
      'Número de falhas de backup por mês'
    ],
    tags: ['backup', 'dados', 'continuidade', 'tecnologia']
  },
  {
    name: 'Saída de Funcionário Chave',
    description: 'Risco operacional relacionado à perda de conhecimento crítico e interrupção de atividades essenciais devido à saída não planejada de funcionários-chave da organização.',
    category: 'operational',
    industry: 'geral',
    riskLevel: 'Médio',
    probability: 3,
    impact: 3,
    methodology: 'qualitative',
    alexRiskSuggested: false,
    isPopular: true,
    controls: [
      'Documentação de processos críticos',
      'Programa de mentoria e transferência de conhecimento',
      'Plano de sucessão para cargos estratégicos',
      'Retenção de talentos através de benefícios'
    ],
    kris: [
      'Taxa de rotatividade em posições críticas',
      'Tempo para substituição de funcionários-chave',
      'Nível de documentação de processos críticos',
      'Score de satisfação dos funcionários'
    ],
    tags: ['rh', 'conhecimento', 'sucessão', 'operacional']
  },
  {
    name: 'Violação de Dados Pessoais (LGPD)',
    description: 'Risco de exposição não autorizada de dados pessoais, resultando em violações da LGPD, sanções regulatórias, danos reputacionais e perda de confiança dos titulares.',
    category: 'compliance',
    industry: 'geral',
    riskLevel: 'Muito Alto',
    probability: 2,
    impact: 5,
    methodology: 'qualitative',
    alexRiskSuggested: true,
    isPopular: true,
    controls: [
      'Implementar política de privacidade e proteção de dados',
      'Criptografia de dados sensíveis',
      'Controles de acesso baseados em funções',
      'Treinamento em LGPD para funcionários'
    ],
    kris: [
      'Número de incidentes de segurança da informação',
      'Tempo médio para detecção de violações',
      'Percentual de funcionários treinados em LGPD',
      'Score de conformidade com LGPD'
    ],
    tags: ['lgpd', 'dados', 'privacidade', 'compliance']
  },
  {
    name: 'Fraude Financeira',
    description: 'Risco de perdas financeiras decorrentes de atividades fraudulentas, incluindo manipulação de registros contábeis, desvios de recursos e transações não autorizadas.',
    category: 'financial',
    industry: 'geral',
    riskLevel: 'Alto',
    probability: 2,
    impact: 4,
    methodology: 'quantitative',
    alexRiskSuggested: false,
    isPopular: true,
    controls: [
      'Segregação de funções financeiras',
      'Aprovações multinível para transações',
      'Auditoria interna regular',
      'Sistema de detecção de anomalias'
    ],
    kris: [
      'Valor de perdas por fraude',
      'Número de tentativas de fraude detectadas',
      'Tempo médio para detecção de fraudes',
      'Efetividade dos controles antifraude'
    ],
    tags: ['fraude', 'financeiro', 'controles', 'auditoria']
  },
  {
    name: 'Ataque Cibernético (Ransomware)',
    description: 'Risco de interrupção das operações e perda de dados críticos devido a ataques de ransomware, comprometendo sistemas, exigindo resgates e afetando a reputação organizacional.',
    category: 'security',
    industry: 'geral',
    riskLevel: 'Muito Alto',
    probability: 3,
    impact: 5,
    methodology: 'qualitative',
    alexRiskSuggested: true,
    isPopular: true,
    controls: [
      'Firewall e sistemas de detecção de intrusão',
      'Backup offline e imutável',
      'Treinamento em segurança cibernética',
      'Plano de resposta a incidentes'
    ],
    kris: [
      'Número de tentativas de invasão bloqueadas',
      'Tempo médio para detecção de ameaças',
      'Percentual de sistemas com backup atualizado',
      'Score de maturidade em segurança'
    ],
    tags: ['segurança', 'ransomware', 'cibernético', 'backup']
  }
];

async function createSampleTemplates() {
  console.log('🧪 Criando templates de exemplo na biblioteca de riscos\n');
  
  try {
    // 1. Verificar se existem tenants
    console.log('1️⃣ Verificando tenants disponíveis...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(1);
    
    if (tenantsError || !tenants || tenants.length === 0) {
      console.error('❌ Erro ao buscar tenant:', tenantsError?.message || 'Nenhum tenant encontrado');
      return;
    }
    
    const testTenantId = tenants[0].id;
    console.log('✅ Tenant encontrado:', tenants[0].name);

    // 2. Buscar usuário para ser o criador
    console.log('\n2️⃣ Buscando usuário criador...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Erro ao buscar usuário:', usersError?.message || 'Nenhum usuário encontrado');
      return;
    }
    
    const creatorId = users[0].id;
    console.log('✅ Usuário criador:', users[0].full_name);

    // 3. Verificar se templates já existem
    console.log('\n3️⃣ Verificando templates existentes...');
    const { data: existingTemplates, error: checkError } = await supabase
      .from('risk_templates')
      .select('id, name')
      .limit(5);
    
    if (checkError) {
      console.error('❌ Erro ao verificar templates existentes:', checkError.message);
      return;
    }
    
    if (existingTemplates && existingTemplates.length > 0) {
      console.log('ℹ️  Templates já existem na biblioteca:');
      existingTemplates.forEach(template => {
        console.log(`   - ${template.name}`);
      });
      console.log('\n📚 A biblioteca já possui templates. Script finalizado.');
      return;
    }

    // 4. Criar templates de exemplo
    console.log('\n4️⃣ Criando templates de exemplo...');
    const createdTemplates = [];
    
    for (const template of SAMPLE_TEMPLATES) {
      const templateData = {
        name: template.name,
        description: template.description,
        category: template.category,
        industry: template.industry,
        risk_level: template.riskLevel,
        probability: template.probability,
        impact: template.impact,
        methodology: template.methodology,
        usage_count: Math.floor(Math.random() * 50) + 10, // 10-60 usos
        rating: 4.0 + Math.random(), // 4.0-5.0 rating
        alex_risk_suggested: template.alexRiskSuggested,
        is_popular: template.isPopular,
        created_by: creatorId,
        status: 'active',
        total_ratings: Math.floor(Math.random() * 20) + 5 // 5-25 avaliações
      };

      const { data: createdTemplate, error: createError } = await supabase
        .from('risk_templates')
        .insert([templateData])
        .select()
        .single();

      if (createError) {
        console.error(`❌ Erro ao criar template "${template.name}":`, createError.message);
        continue;
      }

      console.log(`✅ Template criado: ${template.name}`);
      createdTemplates.push(createdTemplate);

      // 5. Adicionar controles
      if (template.controls && template.controls.length > 0) {
        const controlsData = template.controls.map((control, index) => ({
          template_id: createdTemplate.id,
          control_description: control,
          control_order: index + 1
        }));

        const { error: controlsError } = await supabase
          .from('risk_template_controls')
          .insert(controlsData);

        if (controlsError) {
          console.error(`   ⚠️  Erro ao adicionar controles:`, controlsError.message);
        } else {
          console.log(`   📋 ${template.controls.length} controles adicionados`);
        }
      }

      // 6. Adicionar KRIs
      if (template.kris && template.kris.length > 0) {
        const krisData = template.kris.map((kri, index) => ({
          template_id: createdTemplate.id,
          kri_description: kri,
          kri_order: index + 1
        }));

        const { error: krisError } = await supabase
          .from('risk_template_kris')
          .insert(krisData);

        if (krisError) {
          console.error(`   ⚠️  Erro ao adicionar KRIs:`, krisError.message);
        } else {
          console.log(`   📊 ${template.kris.length} KRIs adicionados`);
        }
      }

      // 7. Adicionar tags
      if (template.tags && template.tags.length > 0) {
        const tagsData = template.tags.map(tag => ({
          template_id: createdTemplate.id,
          tag: tag
        }));

        const { error: tagsError } = await supabase
          .from('risk_template_tags')
          .insert(tagsData);

        if (tagsError) {
          console.error(`   ⚠️  Erro ao adicionar tags:`, tagsError.message);
        } else {
          console.log(`   🏷️  ${template.tags.length} tags adicionadas`);
        }
      }

      console.log('');
    }

    // 8. Resumo final
    console.log('\n📊 Resumo da criação:');
    console.log(`✅ ${createdTemplates.length} templates criados com sucesso`);
    console.log('📚 Biblioteca de riscos populada com templates de exemplo');
    console.log('\n🎉 Os usuários agora podem usar estes templates na Etapa 1 do wizard!');

    // 9. Listar templates criados
    console.log('\n📋 Templates disponíveis:');
    createdTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.category})`);
    });

  } catch (error) {
    console.error('❌ Erro geral no script:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar script
if (require.main === module) {
  createSampleTemplates()
    .then(() => {
      console.log('\n✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

module.exports = { createSampleTemplates };
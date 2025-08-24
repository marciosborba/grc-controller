#!/usr/bin/env tsx

/**
 * Script para popular o banco de dados com templates de governança corporativa
 * Baseado nas melhores práticas de mercado e frameworks internacionais
 * 
 * Uso: npm run populate-templates
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Templates adicionais para completar 30+
const additionalTemplates = [
  {
    title: 'Política de Gestão de Mudanças',
    description: 'Define processos para gestão controlada de mudanças organizacionais e tecnológicas.',
    category: 'Operacional',
    document_type: 'Política',
    priority: 'medium',
    framework: 'ITIL/Change Management',
    content: {
      objetivo: 'Garantir que mudanças sejam implementadas de forma controlada, minimizando riscos e impactos.',
      tipos_mudanca: [
        'Emergencial: correções críticas urgentes',
        'Normal: mudanças planejadas com análise completa',
        'Padrão: mudanças pré-aprovadas e de baixo risco'
      ],
      processo_mudanca: [
        'Solicitação formal de mudança (RFC)',
        'Avaliação de impacto e risco',
        'Aprovação pelo CAB (Change Advisory Board)',
        'Planejamento detalhado da implementação',
        'Execução controlada',
        'Revisão pós-implementação'
      ],
      responsabilidades: {
        'change_manager': 'Coordenação geral do processo de mudanças',
        'cab': 'Avaliação e aprovação de mudanças',
        'solicitante': 'Justificativa e especificação da mudança',
        'implementador': 'Execução técnica da mudança'
      }
    }
  },
  {
    title: 'Procedimento de Gestão de Ativos de TI',
    description: 'Define processos para inventário, controle e gestão do ciclo de vida de ativos tecnológicos.',
    category: 'Tecnologia da Informação',
    document_type: 'Procedimento',
    priority: 'medium',
    framework: 'ITIL Asset Management',
    content: {
      objetivo: 'Manter controle eficaz sobre ativos de TI, otimizando custos e garantindo compliance.',
      categorias_ativos: [
        'Hardware: servidores, computadores, dispositivos móveis',
        'Software: licenças, aplicações, sistemas operacionais',
        'Infraestrutura: redes, telecomunicações, data centers',
        'Dados: bases de dados, backups, arquivos'
      ],
      ciclo_vida: [
        'Planejamento: identificação de necessidades',
        'Aquisição: compra ou desenvolvimento',
        'Implementação: instalação e configuração',
        'Operação: uso produtivo',
        'Manutenção: suporte e atualizações',
        'Descarte: descomissionamento seguro'
      ],
      controles: [
        'Inventário atualizado em tempo real',
        'Etiquetação e identificação única',
        'Controle de localização física',
        'Gestão de licenças de software',
        'Monitoramento de utilização',
        'Avaliação periódica de valor'
      ]
    }
  },
  {
    title: 'Política de Retenção e Descarte de Documentos',
    description: 'Estabelece critérios para retenção, arquivamento e descarte seguro de documentos organizacionais.',
    category: 'Gestão Documental',
    document_type: 'Política',
    priority: 'high',
    framework: 'Records Management',
    content: {
      objetivo: 'Definir períodos de retenção e métodos de descarte para diferentes tipos de documentos.',
      categorias_documentos: {
        'financeiros': 'Demonstrações, contratos, notas fiscais - 10 anos',
        'trabalhistas': 'Folhas de pagamento, contratos de trabalho - 30 anos',
        'tributarios': 'Declarações, comprovantes de impostos - 5 anos',
        'juridicos': 'Contratos, processos, correspondências - 20 anos',
        'operacionais': 'Procedimentos, relatórios, atas - 5 anos'
      },
      metodos_descarte: [
        'Documentos físicos: trituração ou incineração certificada',
        'Mídias eletrônicas: formatação segura ou destruição física',
        'Dados em nuvem: exclusão certificada pelo provedor',
        'Certificação: comprovante de destruição segura'
      ],
      responsabilidades: [
        'Gestores: identificação de documentos para descarte',
        'Arquivo: execução dos procedimentos de descarte',
        'Jurídico: orientação sobre prazos legais',
        'TI: descarte seguro de mídias eletrônicas'
      ]
    }
  },
  {
    title: 'Manual de Gestão de Projetos',
    description: 'Guia abrangente para gestão eficaz de projetos organizacionais seguindo melhores práticas.',
    category: 'Operacional',
    document_type: 'Manual',
    priority: 'medium',
    framework: 'PMI/PMBOK',
    content: {
      objetivo: 'Padronizar metodologia de gestão de projetos para aumentar taxa de sucesso e eficiência.',
      fases_projeto: [
        'Iniciação: definição de escopo e objetivos',
        'Planejamento: detalhamento de atividades e recursos',
        'Execução: implementação do plano do projeto',
        'Monitoramento: acompanhamento de progresso',
        'Encerramento: finalização e lições aprendidas'
      ],
      areas_conhecimento: [
        'Integração: coordenação geral do projeto',
        'Escopo: definição e controle do que será entregue',
        'Cronograma: planejamento e controle de prazos',
        'Custos: orçamento e controle financeiro',
        'Qualidade: padrões e critérios de aceitação',
        'Recursos: equipe e materiais necessários',
        'Comunicação: plano de comunicação com stakeholders',
        'Riscos: identificação e mitigação de riscos',
        'Aquisições: contratação de fornecedores',
        'Stakeholders: gestão de partes interessadas'
      ],
      documentos_obrigatorios: [
        'Termo de Abertura do Projeto (TAP)',
        'Plano de Gerenciamento do Projeto',
        'Estrutura Analítica do Projeto (EAP)',
        'Cronograma detalhado',
        'Orçamento e controle de custos',
        'Registro de riscos',
        'Relatórios de status',
        'Termo de Encerramento'
      ]
    }
  },
  {
    title: 'Política de Diversidade e Inclusão',
    description: 'Estabelece compromisso organizacional com diversidade, equidade e inclusão no ambiente de trabalho.',
    category: 'Recursos Humanos',
    document_type: 'Política',
    priority: 'high',
    framework: 'D&I Best Practices',
    content: {
      objetivo: 'Promover ambiente diverso e inclusivo que valorize diferentes perspectivas e talentos.',
      dimensoes_diversidade: [
        'Gênero e identidade de gênero',
        'Raça, etnia e nacionalidade',
        'Orientação sexual',
        'Idade e geração',
        'Deficiência e neurodiversidade',
        'Religião e crenças',
        'Classe socioeconômica',
        'Experiências e perspectivas'
      ],
      compromissos: [
        'Recrutamento e seleção inclusivos',
        'Desenvolvimento equitativo de talentos',
        'Liderança representativa',
        'Cultura organizacional inclusiva',
        'Políticas e práticas equitativas',
        'Medição e transparência de resultados'
      ],
      acoes_afirmativas: [
        'Metas de representatividade em posições de liderança',
        'Programas de mentoria para grupos sub-representados',
        'Parcerias com organizações de diversidade',
        'Treinamentos de viés inconsciente',
        'Grupos de afinidade e redes de apoio',
        'Revisão de políticas para eliminar barreiras'
      ],
      metricas: [
        'Composição demográfica por nível hierárquico',
        'Taxa de retenção por grupos demográficos',
        'Satisfação e engajamento por diversidade',
        'Progressão de carreira equitativa',
        'Pay equity analysis',
        'Índice de inclusão organizacional'
      ]
    }
  },
  {
    title: 'Procedimento de Gestão de Incidentes Trabalhistas',
    description: 'Define processo para gestão de acidentes de trabalho, doenças ocupacionais e questões de segurança.',
    category: 'Segurança do Trabalho',
    document_type: 'Procedimento',
    priority: 'critical',
    framework: 'NR/OHSAS 18001',
    content: {
      objetivo: 'Estabelecer resposta rápida e eficaz a incidentes trabalhistas, protegendo colaboradores.',
      tipos_incidentes: [
        'Acidentes com lesão',
        'Acidentes sem lesão (near miss)',
        'Doenças ocupacionais',
        'Incidentes ambientais',
        'Violações de segurança',
        'Emergências médicas'
      ],
      resposta_imediata: [
        'Prestação de primeiros socorros',
        'Acionamento de serviços de emergência',
        'Isolamento da área se necessário',
        'Comunicação à liderança',
        'Preservação de evidências',
        'Documentação inicial'
      ],
      investigacao: [
        'Formação de equipe de investigação',
        'Coleta de evidências e depoimentos',
        'Análise de causa raiz',
        'Identificação de fatores contribuintes',
        'Elaboração de relatório detalhado',
        'Recomendações preventivas'
      ],
      comunicacao_legal: [
        'Comunicação de Acidente de Trabalho (CAT)',
        'Notificação ao Ministério do Trabalho',
        'Comunicação ao sindicato',
        'Relatório para seguradora',
        'Documentação para perícia',
        'Acompanhamento médico'
      ]
    }
  },
  {
    title: 'Política de Inovação e Propriedade Intelectual',
    description: 'Estabelece diretrizes para fomento à inovação e proteção da propriedade intelectual organizacional.',
    category: 'Inovação',
    document_type: 'Política',
    priority: 'medium',
    framework: 'Innovation Management',
    content: {
      objetivo: 'Promover cultura de inovação e proteger ativos intelectuais da organização.',
      tipos_propriedade: [
        'Patentes: invenções e processos inovadores',
        'Marcas: identidade visual e comercial',
        'Direitos autorais: obras criativas e software',
        'Segredos comerciais: know-how e informações confidenciais',
        'Desenhos industriais: aspectos estéticos de produtos'
      ],
      processo_inovacao: [
        'Geração de ideias: brainstorming e sugestões',
        'Avaliação: análise de viabilidade e potencial',
        'Desenvolvimento: prototipagem e testes',
        'Implementação: lançamento e comercialização',
        'Proteção: registro de propriedade intelectual',
        'Monetização: licenciamento e transferência'
      ],
      incentivos_inovacao: [
        'Programas de ideias com premiação',
        'Tempo dedicado para projetos inovadores',
        'Parcerias com universidades e startups',
        'Investimento em P&D',
        'Reconhecimento de inovadores',
        'Participação em resultados de inovação'
      ],
      protecao_ip: [
        'Identificação proativa de ativos intelectuais',
        'Registro tempestivo de propriedades',
        'Contratos de confidencialidade',
        'Monitoramento de violações',
        'Enforcement de direitos',
        'Gestão de portfólio de IP'
      ]
    }
  },
  {
    title: 'Manual de Relacionamento com Investidores',
    description: 'Guia para comunicação transparente e eficaz com investidores e mercado de capitais.',
    category: 'Financeiro',
    document_type: 'Manual',
    priority: 'high',
    framework: 'Investor Relations Best Practices',
    content: {
      objetivo: 'Estabelecer comunicação transparente, consistente e tempestiva com investidores e mercado.',
      principios_comunicacao: [
        'Transparência: informações claras e completas',
        'Consistência: mensagens alinhadas e coerentes',
        'Tempestividade: comunicação no momento adequado',
        'Equidade: acesso igual às informações',
        'Materialidade: foco em informações relevantes',
        'Compliance: aderência às regulamentações'
      ],
      publicos_alvo: [
        'Acionistas atuais',
        'Investidores potenciais',
        'Analistas de mercado',
        'Agências de rating',
        'Imprensa especializada',
        'Órgãos reguladores'
      ],
      canais_comunicacao: [
        'Relatórios trimestrais e anuais',
        'Conference calls de resultados',
        'Apresentações para investidores',
        'Site de relações com investidores',
        'Comunicados ao mercado',
        'Reuniões one-on-one'
      ],
      calendario_eventos: [
        'Divulgação de resultados trimestrais',
        'Assembleia geral de acionistas',
        'Conferências de investidores',
        'Roadshows e apresentações',
        'Guidance e projeções',
        'Eventos corporativos relevantes'
      ]
    }
  },
  {
    title: 'Política de Gestão de Dados e Analytics',
    description: 'Define diretrizes para governança, qualidade e uso estratégico de dados organizacionais.',
    category: 'Tecnologia da Informação',
    document_type: 'Política',
    priority: 'high',
    framework: 'Data Governance Framework',
    content: {
      objetivo: 'Estabelecer governança eficaz de dados para suportar decisões baseadas em evidências.',
      principios_dados: [
        'Qualidade: dados precisos, completos e atualizados',
        'Acessibilidade: disponibilidade para usuários autorizados',
        'Segurança: proteção contra acesso não autorizado',
        'Privacidade: respeito aos direitos dos titulares',
        'Integridade: consistência e confiabilidade',
        'Retenção: armazenamento pelo tempo necessário'
      ],
      governanca_dados: [
        'Comitê de Governança de Dados',
        'Data stewards por área de negócio',
        'Políticas e padrões de dados',
        'Processos de qualidade de dados',
        'Catálogo de dados corporativo',
        'Métricas de qualidade e uso'
      ],
      arquitetura_dados: [
        'Data lake para armazenamento escalável',
        'Data warehouse para análises estruturadas',
        'APIs para integração de sistemas',
        'Ferramentas de ETL/ELT',
        'Plataformas de analytics e BI',
        'Machine learning e AI'
      ],
      uso_etico: [
        'Transparência nos algoritmos',
        'Prevenção de viés e discriminação',
        'Consentimento informado',
        'Auditoria de modelos de IA',
        'Explicabilidade das decisões',
        'Responsabilidade algorítmica'
      ]
    }
  },
  {
    title: 'Procedimento de Due Diligence para M&A',
    description: 'Define processo estruturado para due diligence em operações de fusões e aquisições.',
    category: 'Estratégico',
    document_type: 'Procedimento',
    priority: 'high',
    framework: 'M&A Best Practices',
    content: {
      objetivo: 'Estabelecer processo rigoroso de due diligence para avaliar riscos e oportunidades em M&A.',
      areas_analise: [
        'Financeira: demonstrações, fluxo de caixa, endividamento',
        'Legal: contratos, litígios, compliance regulatório',
        'Operacional: processos, sistemas, capacidades',
        'Comercial: mercado, clientes, competitividade',
        'Tecnológica: sistemas, infraestrutura, inovação',
        'RH: talentos, cultura, benefícios',
        'ESG: sustentabilidade, governança, impactos sociais'
      ],
      fases_processo: [
        'Preparação: definição de escopo e equipe',
        'Solicitação de informações: data room virtual',
        'Análise documental: revisão de documentos',
        'Entrevistas: management presentations',
        'Verificações: confirmação de informações',
        'Relatório: síntese de achados e recomendações'
      ],
      equipe_due_diligence: [
        'Líder de transação: coordenação geral',
        'Financeiro: análise de números e projeções',
        'Jurídico: aspectos legais e contratuais',
        'Operacional: processos e sinergias',
        'TI: sistemas e infraestrutura',
        'RH: pessoas e cultura',
        'Consultores externos: expertise especializada'
      ],
      red_flags: [
        'Inconsistências nas informações financeiras',
        'Litígios significativos em andamento',
        'Dependência excessiva de poucos clientes',
        'Problemas de compliance regulatório',
        'Rotatividade alta de executivos',
        'Sistemas tecnológicos obsoletos',
        'Questões ambientais ou trabalhistas'
      ]
    }
  }
];

async function populateTemplates() {
  console.log('🚀 Iniciando população de templates de governança...\n');

  try {
    // Verificar conexão com Supabase
    const { data: testData, error: testError } = await supabase
      .from('policies')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erro de conexão com Supabase:', testError.message);
      return;
    }

    console.log('✅ Conexão com Supabase estabelecida\n');

    // Executar SQL de templates principais
    console.log('📄 Executando script SQL principal...');
    const sqlScript = readFileSync(join(__dirname, 'populate-governance-templates.sql'), 'utf-8');
    
    // Dividir o script em comandos individuais
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command.includes('INSERT INTO policies')) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command + ';' });
          if (error) {
            console.log('⚠️  Comando SQL ignorado (pode já existir):', error.message);
          }
        } catch (err) {
          console.log('⚠️  Erro ao executar comando SQL:', err);
        }
      }
    }

    // Inserir templates adicionais via API
    console.log('\n📋 Inserindo templates adicionais...');
    
    for (const template of additionalTemplates) {
      try {
        const { error } = await supabase
          .from('policies')
          .insert({
            title: template.title,
            description: template.description,
            category: template.category,
            document_type: template.document_type,
            status: 'published',
            version: '1.0',
            effective_date: new Date().toISOString(),
            review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            expiry_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            tenant_id: '00000000-0000-0000-0000-000000000000',
            created_by: '00000000-0000-0000-0000-000000000000',
            updated_by: '00000000-0000-0000-0000-000000000000',
            owner_id: '00000000-0000-0000-0000-000000000000',
            priority: template.priority,
            metadata: {
              isTemplate: true,
              framework: template.framework,
              content: template.content
            }
          });

        if (error) {
          console.log(`⚠️  Template "${template.title}" pode já existir:`, error.message);
        } else {
          console.log(`✅ Template "${template.title}" inserido com sucesso`);
        }
      } catch (err) {
        console.log(`❌ Erro ao inserir template "${template.title}":`, err);
      }
    }

    // Verificar total de templates inseridos
    const { data: templatesCount, error: countError } = await supabase
      .from('policies')
      .select('count')
      .eq('metadata->>isTemplate', 'true');

    if (!countError && templatesCount) {
      console.log(`\n🎉 População concluída! Total de templates disponíveis: ${templatesCount.length}`);
    }

    // Listar categorias criadas
    const { data: categories } = await supabase
      .from('policies')
      .select('category')
      .eq('metadata->>isTemplate', 'true');

    if (categories) {
      const uniqueCategories = [...new Set(categories.map(c => c.category))];
      console.log('\n📂 Categorias de templates criadas:');
      uniqueCategories.forEach(cat => console.log(`   • ${cat}`));
    }

    console.log('\n✨ Templates de governança populados com sucesso!');
    console.log('\n📋 Templates incluem:');
    console.log('   • Políticas de Segurança da Informação');
    console.log('   • Políticas de Privacidade e LGPD');
    console.log('   • Códigos de Ética e Conduta');
    console.log('   • Políticas Financeiras e Anticorrupção');
    console.log('   • Políticas de Gestão de Riscos');
    console.log('   • Procedimentos Operacionais');
    console.log('   • Manuais de Gestão');
    console.log('   • Normas e Diretrizes');
    console.log('   • E muito mais...');

  } catch (error) {
    console.error('❌ Erro durante a população:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  populateTemplates();
}

export { populateTemplates };
"
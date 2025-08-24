#!/usr/bin/env node

/**
 * Script para criar o prompt ALEX VENDOR no sistema de IA
 * Este prompt define a personalidade especializada em gestão de riscos de fornecedores
 */

import { createClient } from '@supabase/supabase-js';

// Configuração Supabase (usando anon key que é mais segura para este tipo de operação)
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ALEX_VENDOR_PROMPT = `
# ALEX VENDOR - Especialista em Gestão de Riscos de Fornecedores

## PERSONALIDADE E IDENTIDADE
Você é ALEX VENDOR, um especialista altamente qualificado em gestão de riscos de fornecedores com décadas de experiência em:
- Avaliação e monitoramento contínuo de fornecedores
- Frameworks de assessment (ISO 27001, SOC 2, NIST, LGPD, GDPR)
- Análise de risco de terceiros com inteligência artificial
- Due diligence automatizada e governança de fornecedores
- Gestão de contratos, SLAs e compliance
- Otimização de processos de procurement e vendor management

## TOM E ESTILO DE COMUNICAÇÃO
- **Profissional e Confiável**: Use linguagem técnica precisa mas acessível
- **Orientado a Resultados**: Sempre forneça recomendações práticas e acionáveis
- **Proativo**: Antecipe problemas e sugira soluções preventivas
- **Analítico**: Base suas recomendações em dados e métricas concretas
- **Didático**: Explique conceitos complexos de forma clara e estruturada

## CONHECIMENTO ESPECIALIZADO

### Frameworks e Metodologias
- ISO 27001, ISO 31000, NIST Cybersecurity Framework
- SOC 2, PCI DSS, GDPR, LGPD
- COSO, COBIT, ITIL para governança
- Metodologias ágeis para gestão de vendor onboarding
- Frameworks de continuous monitoring e threat intelligence

### Categorias de Risco de Fornecedores
1. **Operacional**: Continuidade, performance, SLA compliance
2. **Segurança**: Cibersegurança, proteção de dados, controles de acesso
3. **Compliance**: Regulamentações, certificações, auditoria
4. **Financeiro**: Estabilidade, concentração de fornecedores, custo-benefício
5. **Estratégico**: Alinhamento com objetivos, inovação, parceria de longo prazo
6. **Reputacional**: Impacto na marca, ESG, responsabilidade social

### Assessment e Scoring
- Modelos de pontuação ponderada por categoria de risco
- Matriz de criticidade vs impacto
- Benchmarking setorial e comparativo
- Análise de tendências e padrões
- Scorecards automatizados com IA

## CAPACIDADES DE ANÁLISE

### Análise de Dados
- Interpretação de métricas de performance de fornecedores
- Identificação de padrões de risco e anomalias
- Correlação entre indicadores e eventos de impacto
- Previsão de riscos emergentes usando machine learning
- ROI de investimentos em gestão de fornecedores

### Geração de Insights
- Recomendações personalizadas baseadas no perfil da empresa
- Identificação de oportunidades de otimização
- Alertas proativos sobre riscos emergentes
- Benchmarks e comparações setoriais
- Roadmaps de melhoria contínua

### Automação Inteligente
- Workflows automatizados de onboarding
- Monitoramento contínuo com alertas inteligentes
- Geração automática de relatórios executivos
- Integração com sistemas de procurement e ERP
- Dashboards dinâmicos e self-service analytics

## RESPONSABILIDADES NO SISTEMA

### Assessments Inteligentes
- Criar questionários adaptativos baseados no perfil do fornecedor
- Sugerir evidências necessárias por categoria de risco
- Automatizar scoring e classificação de risco
- Recomendar ações corretivas específicas
- Facilitar revisões e reassessments periódicos

### Gestão de Relacionamento
- Orientar comunicação efetiva com fornecedores
- Automatizar envio de assessments via links públicos
- Acompanhar progresso e prazos de entrega
- Facilitar colaboração entre equipes internas e fornecedores
- Gerenciar escalações e comunicações críticas

### Governança e Compliance
- Monitorar aderência a políticas e regulamentações
- Rastrear certificações e validade de documentos
- Automatizar auditorias e revisões de compliance
- Gerar relatórios regulatórios automáticos
- Manter histórico auditável de todas as interações

### Otimização Contínua
- Analisar eficiência de processos de vendor management
- Identificar gargalos e oportunidades de melhoria
- Sugerir automações e integrações
- Benchmarking com melhores práticas do mercado
- ROI tracking e métricas de value creation

## DIRETRIZES DE INTERAÇÃO

### Como Iniciar Conversas
"Olá! Sou ALEX VENDOR, seu especialista em gestão de riscos de fornecedores. Estou aqui para ajudar você a..."

### Tipos de Ajuda Oferecida
1. **Análise de Risco**: "Vou analisar o perfil de risco deste fornecedor considerando..."
2. **Recomendações**: "Com base nos dados disponíveis, recomendo que você..."
3. **Otimização**: "Identifiquei uma oportunidade de melhoria em..."
4. **Alertas**: "Detectei um risco potencial que requer sua atenção..."
5. **Educação**: "Deixe-me explicar como funciona..."

### Estrutura de Respostas
1. **Resumo Executivo** (3-5 linhas)
2. **Análise Detalhada** (dados e contexto)
3. **Recomendações Acionáveis** (próximos passos específicos)
4. **Impacto Esperado** (benefícios e ROI)
5. **Timeline** (prazos recomendados)

## EXEMPLOS DE INTERAÇÕES

### Cenário 1: Novo Fornecedor
"Identifiquei que este fornecedor de tecnologia requer assessment de segurança aprofundado devido ao acesso a dados sensíveis. Recomendo aplicar nosso framework ISO 27001 personalizado com ênfase em controles de acesso e proteção de dados. Estimativa: 2 semanas para conclusão com 85% de automação do processo."

### Cenário 2: Fornecedor de Alto Risco
"ALERTA: Este fornecedor apresenta 3 indicadores de risco crítico simultâneos: certificação SOC 2 vencida há 6 meses, 2 incidentes de segurança reportados no último trimestre e score financeiro em declínio. Ação imediata necessária: suspender novos projetos e iniciar plano de contingência."

### Cenário 3: Otimização de Processo
"Analisando seus dados de vendor management, identifiquei que 60% dos assessments de baixo risco podem ser automatizados, reduzindo o tempo de processamento de 5 dias para 2 horas. Isso liberaria 15 horas/semana da equipe para focar em fornecedores críticos."

## MÉTRICAS E KPIs FOCADOS
- Time-to-Onboard: Tempo médio para onboarding completo
- Risk Coverage: % de fornecedores com assessment atualizado
- SLA Compliance: Aderência a acordos de nível de serviço
- Incident Rate: Frequência de incidentes por fornecedor
- Cost Avoidance: Riscos mitigados convertidos em valor financeiro
- Automation Rate: % de processos automatizados
- Vendor Satisfaction: NPS dos fornecedores com o processo

## COMPLIANCE E REGULAMENTAÇÕES
- GDPR/LGPD: Proteção de dados pessoais
- SOX: Controles financeiros e auditoria
- ISO 27001: Gestão de segurança da informação
- PCI DSS: Segurança de dados de cartão
- NIST: Framework de cibersegurança
- Regulamentações setoriais (BACEN, ANVISA, ANATEL, etc.)

Lembre-se: Você é o guardião da confiança entre a organização e seus fornecedores, garantindo que cada parceria seja segura, compliance e geradora de valor.
`;

async function createAlexVendorPrompt() {
  console.log('🤖 ALEX VENDOR - Criando prompt especializado...\n');

  try {
    // Verificar se o prompt já existe
    const { data: existingPrompt, error: checkError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('id, name')
      .eq('name', 'ALEX VENDOR')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar prompt existente:', checkError);
      return false;
    }

    if (existingPrompt) {
      console.log('✅ Prompt ALEX VENDOR já existe:', existingPrompt.name);
      
      // Atualizar o prompt existente
      const { data: updatedPrompt, error: updateError } = await supabase
        .from('ai_grc_prompt_templates')
        .update({
          template_content: ALEX_VENDOR_PROMPT,
          title: 'ALEX VENDOR - Assistente Especialista Sênior em Vendor Risk Management',
          description: 'Assistente de IA especialista em gestão de riscos de fornecedores com expertise em assessment frameworks, due diligence, compliance monitoring e automação de processos.',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPrompt.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar prompt:', updateError);
        return false;
      }

      console.log('✅ Prompt ALEX VENDOR atualizado com sucesso!');
      return true;
    }

    // Criar novo prompt
    const promptData = {
      name: 'ALEX VENDOR - Especialista em Gestão de Riscos de Fornecedores',
      title: 'ALEX VENDOR - Assistente Especialista Sênior em Vendor Risk Management',
      description: 'Assistente de IA especialista em gestão de riscos de fornecedores com expertise em assessment frameworks, due diligence, compliance monitoring e automação de processos.',
      category: 'vendor-risk',
      use_case: 'Ideal para organizações que buscam implementar ou aprimorar sua gestão de riscos de fornecedores. Adequado para Procurement Managers, Vendor Risk Managers, CROs, auditores internos, consultores e lideranças executivas.',
      template_content: ALEX_VENDOR_PROMPT,
      variables: {
        vendor_name: 'Nome do fornecedor',
        assessment_type: 'Tipo de assessment',
        risk_category: 'Categoria de risco',
        compliance_frameworks: 'Frameworks aplicáveis',
        business_criticality: 'Criticidade para o negócio',
        contract_value: 'Valor do contrato',
        service_type: 'Tipo de serviço prestado',
        geography: 'Geografia de atuação',
        data_access_level: 'Nível de acesso a dados',
        timeline: 'Timeline do assessment'
      },
      applicable_frameworks: [
        'ISO 27001', 'SOC 2', 'NIST', 'PCI DSS',
        'GDPR', 'LGPD', 'COBIT', 'ITIL',
        'Custom Vendor Assessment', 'Third Party Risk'
      ],
      compliance_domains: [
        'Vendor Risk Management', 'Third Party Risk',
        'Supply Chain Security', 'Due Diligence',
        'Contract Management', 'SLA Monitoring',
        'Compliance Assessment', 'Security Assessment',
        'Performance Monitoring', 'Incident Management'
      ],
      risk_categories: [
        'Operacional', 'Segurança', 'Compliance',
        'Financeiro', 'Estratégico', 'Reputacional',
        'Tecnológico', 'Dados', 'Concentração',
        'Geográfico', 'Regulatório', 'ESG'
      ],
      maturity_levels: [
        'Básico/Manual',
        'Gerenciado/Estruturado', 
        'Definido/Padronizado',
        'Avançado/Automatizado',
        'Otimizado/Inteligente'
      ],
      recommended_model: 'claude-3-5-sonnet',
      min_context_window: 16000,
      recommended_temperature: 0.3,
      max_output_tokens: 4000,
      expected_output_format: 'structured_markdown',
      quality_score: 4.9,
      validation_criteria: {
        accuracy: 'Respostas técnicas precisas baseadas em melhores práticas de vendor risk management',
        practicality: 'Soluções implementáveis com templates e workflows prontos',
        completeness: 'Cobertura completa do ciclo de vida de gestão de fornecedores',
        automation: 'Orientação para automação e otimização de processos',
        compliance: 'Aderência a frameworks regulatórios e melhores práticas'
      },
      version: '1.0',
      changelog: 'Versão inicial especializada em gestão de riscos de fornecedores com foco em assessment inteligente, due diligence, compliance monitoring e automação.',
      is_active: true,
      is_public: true,
      requires_approval: false,
      is_global: true
    };

    const { data: newPrompt, error: createError } = await supabase
      .from('ai_grc_prompt_templates')
      .insert(promptData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar prompt:', createError);
      return false;
    }

    console.log('✅ Prompt ALEX VENDOR criado com sucesso!');
    console.log('📋 Detalhes:', {
      id: newPrompt.id,
      name: newPrompt.name,
      category: newPrompt.category,
      is_active: newPrompt.is_active
    });

    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 ALEX VENDOR - Setup de Personalidade IA');
  console.log('==========================================\n');

  const success = await createAlexVendorPrompt();

  if (success) {
    console.log('\n✅ ALEX VENDOR está pronto para uso!');
    console.log('🎯 O especialista em gestão de riscos de fornecedores foi configurado com sucesso.\n');
  } else {
    console.log('\n❌ Falha na configuração do ALEX VENDOR.');
    process.exit(1);
  }
}

// Executar script
main().catch(console.error);
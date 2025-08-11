import type { RiskAnalysisType, RiskAssessmentQuestion } from '@/types/risk-management';

// Questões de avaliação de risco por tipo
export const RISK_ASSESSMENT_QUESTIONS: Record<RiskAnalysisType, {
  probability: RiskAssessmentQuestion[];
  impact: RiskAssessmentQuestion[];
}> = {
  'Técnico': {
    probability: [
      { id: 'tech-prob-1', question: 'Qual a complexidade técnica do sistema/tecnologia envolvida?', category: 'probability' },
      { id: 'tech-prob-2', question: 'Com que frequência ocorrem falhas na tecnologia similar?', category: 'probability' },
      { id: 'tech-prob-3', question: 'Qual o nível de maturidade da tecnologia utilizada?', category: 'probability' },
      { id: 'tech-prob-4', question: 'A equipe possui experiência adequada com esta tecnologia?', category: 'probability' },
      { id: 'tech-prob-5', question: 'Existem dependências externas críticas?', category: 'probability' },
      { id: 'tech-prob-6', question: 'Qual a qualidade dos processos de teste e validação?', category: 'probability' },
      { id: 'tech-prob-7', question: 'Como está a documentação técnica do sistema?', category: 'probability' },
      { id: 'tech-prob-8', question: 'Há monitoramento adequado dos componentes críticos?', category: 'probability' }
    ],
    impact: [
      { id: 'tech-imp-1', question: 'Quantos usuários seriam afetados por uma falha técnica?', category: 'impact' },
      { id: 'tech-imp-2', question: 'Qual seria o tempo de inatividade esperado?', category: 'impact' },
      { id: 'tech-imp-3', question: 'Haveria perda ou corrupção de dados críticos?', category: 'impact' },
      { id: 'tech-imp-4', question: 'Qual seria o impacto financeiro direto?', category: 'impact' },
      { id: 'tech-imp-5', question: 'Como isso afetaria a reputação da organização?', category: 'impact' },
      { id: 'tech-imp-6', question: 'Haveria violação de compliance ou regulamentações?', category: 'impact' },
      { id: 'tech-imp-7', question: 'Qual seria o esforço necessário para recuperação?', category: 'impact' },
      { id: 'tech-imp-8', question: 'Haveria interrupção de processos de negócio críticos?', category: 'impact' }
    ]
  },
  'Fornecedor': {
    probability: [
      { id: 'vendor-prob-1', question: 'Qual a estabilidade financeira do fornecedor?', category: 'probability' },
      { id: 'vendor-prob-2', question: 'Histórico de cumprimento de prazos e qualidade?', category: 'probability' },
      { id: 'vendor-prob-3', question: 'Nível de dependência da organização em relação ao fornecedor?', category: 'probability' },
      { id: 'vendor-prob-4', question: 'Existem fornecedores alternativos disponíveis?', category: 'probability' },
      { id: 'vendor-prob-5', question: 'Qual a qualidade da comunicação com o fornecedor?', category: 'probability' },
      { id: 'vendor-prob-6', question: 'Como está a situação regulatória/legal do fornecedor?', category: 'probability' },
      { id: 'vendor-prob-7', question: 'O fornecedor possui certificações adequadas?', category: 'probability' },
      { id: 'vendor-prob-8', question: 'Qual a experiência do fornecedor no mercado?', category: 'probability' }
    ],
    impact: [
      { id: 'vendor-imp-1', question: 'Quantas operações seriam afetadas pela falta do fornecedor?', category: 'impact' },
      { id: 'vendor-imp-2', question: 'Qual seria o tempo para encontrar substituto adequado?', category: 'impact' },
      { id: 'vendor-imp-3', question: 'Qual seria o custo adicional para substituição?', category: 'impact' },
      { id: 'vendor-imp-4', question: 'Haveria comprometimento da qualidade dos produtos/serviços?', category: 'impact' },
      { id: 'vendor-imp-5', question: 'Como isso afetaria os prazos de entrega aos clientes?', category: 'impact' },
      { id: 'vendor-imp-6', question: 'Haveria exposição a riscos legais ou contratuais?', category: 'impact' },
      { id: 'vendor-imp-7', question: 'Qual seria o impacto na satisfação do cliente?', category: 'impact' },
      { id: 'vendor-imp-8', question: 'Haveria necessidade de reestruturação de processos?', category: 'impact' }
    ]
  },
  'Processo': {
    probability: [
      { id: 'process-prob-1', question: 'Qual o nível de complexidade do processo?', category: 'probability' },
      { id: 'process-prob-2', question: 'Com que frequência o processo é executado?', category: 'probability' },
      { id: 'process-prob-3', question: 'Qual o grau de automação do processo?', category: 'probability' },
      { id: 'process-prob-4', question: 'A equipe está adequadamente treinada?', category: 'probability' },
      { id: 'process-prob-5', question: 'Existem controles e verificações adequados?', category: 'probability' },
      { id: 'process-prob-6', question: 'Como está a documentação do processo?', category: 'probability' },
      { id: 'process-prob-7', question: 'Há dependências de sistemas ou recursos críticos?', category: 'probability' },
      { id: 'process-prob-8', question: 'Qual a taxa histórica de erros no processo?', category: 'probability' }
    ],
    impact: [
      { id: 'process-imp-1', question: 'Quantas áreas da organização seriam afetadas?', category: 'impact' },
      { id: 'process-imp-2', question: 'Qual seria o impacto financeiro de uma falha?', category: 'impact' },
      { id: 'process-imp-3', question: 'Haveria atraso em entregas críticas?', category: 'impact' },
      { id: 'process-imp-4', question: 'Como isso afetaria a qualidade dos produtos/serviços?', category: 'impact' },
      { id: 'process-imp-5', question: 'Haveria violação de requisitos regulatórios?', category: 'impact' },
      { id: 'process-imp-6', question: 'Qual seria o tempo necessário para correção?', category: 'impact' },
      { id: 'process-imp-7', question: 'Haveria impacto na experiência do cliente?', category: 'impact' },
      { id: 'process-imp-8', question: 'Como isso afetaria a reputação da organização?', category: 'impact' }
    ]
  },
  'Incidente': {
    probability: [
      { id: 'incident-prob-1', question: 'Com que frequência incidentes similares ocorreram?', category: 'probability' },
      { id: 'incident-prob-2', question: 'Existem fatores ambientais que aumentam a probabilidade?', category: 'probability' },
      { id: 'incident-prob-3', question: 'Qual a eficácia dos controles preventivos atuais?', category: 'probability' },
      { id: 'incident-prob-4', question: 'A equipe está preparada para identificar sinais precoces?', category: 'probability' },
      { id: 'incident-prob-5', question: 'Existem vulnerabilidades conhecidas não tratadas?', category: 'probability' },
      { id: 'incident-prob-6', question: 'Qual o nível de exposição a ameaças externas?', category: 'probability' },
      { id: 'incident-prob-7', question: 'Como está o monitoramento de indicadores de risco?', category: 'probability' },
      { id: 'incident-prob-8', question: 'Há pressões ou mudanças que aumentem a probabilidade?', category: 'probability' }
    ],
    impact: [
      { id: 'incident-imp-1', question: 'Quantas pessoas poderiam ser afetadas?', category: 'impact' },
      { id: 'incident-imp-2', question: 'Qual seria o impacto financeiro direto?', category: 'impact' },
      { id: 'incident-imp-3', question: 'Haveria danos à infraestrutura ou ativos?', category: 'impact' },
      { id: 'incident-imp-4', question: 'Como isso afetaria as operações do negócio?', category: 'impact' },
      { id: 'incident-imp-5', question: 'Haveria exposição legal ou regulatória?', category: 'impact' },
      { id: 'incident-imp-6', question: 'Qual seria o tempo de recuperação estimado?', category: 'impact' },
      { id: 'incident-imp-7', question: 'Como isso impactaria a confiança dos stakeholders?', category: 'impact' },
      { id: 'incident-imp-8', question: 'Haveria cobertura negativa da mídia?', category: 'impact' }
    ]
  },
  'Estratégico': {
    probability: [
      { id: 'strategic-prob-1', question: 'Qual a volatilidade do mercado em que a organização atua?', category: 'probability' },
      { id: 'strategic-prob-2', question: 'Como estão as mudanças regulatórias no setor?', category: 'probability' },
      { id: 'strategic-prob-3', question: 'Qual o nível de competição no mercado?', category: 'probability' },
      { id: 'strategic-prob-4', question: 'A estratégia atual está alinhada com tendências do mercado?', category: 'probability' },
      { id: 'strategic-prob-5', question: 'Existem mudanças tecnológicas disruptivas no horizonte?', category: 'probability' },
      { id: 'strategic-prob-6', question: 'Como está a estabilidade econômica do ambiente de negócios?', category: 'probability' },
      { id: 'strategic-prob-7', question: 'A organização tem flexibilidade para mudanças estratégicas?', category: 'probability' },
      { id: 'strategic-prob-8', question: 'Qual a qualidade da inteligência de mercado disponível?', category: 'probability' }
    ],
    impact: [
      { id: 'strategic-imp-1', question: 'Como isso afetaria a posição competitiva da organização?', category: 'impact' },
      { id: 'strategic-imp-2', question: 'Qual seria o impacto na receita de longo prazo?', category: 'impact' },
      { id: 'strategic-imp-3', question: 'Como isso afetaria o valor da marca/organização?', category: 'impact' },
      { id: 'strategic-imp-4', question: 'Haveria necessidade de reestruturação organizacional?', category: 'impact' },
      { id: 'strategic-imp-5', question: 'Qual seria o impacto nos relacionamentos com stakeholders?', category: 'impact' },
      { id: 'strategic-imp-6', question: 'Como isso afetaria a capacidade de inovação?', category: 'impact' },
      { id: 'strategic-imp-7', question: 'Haveria perda de market share significativa?', category: 'impact' },
      { id: 'strategic-imp-8', question: 'Qual seria o tempo necessário para recuperação estratégica?', category: 'impact' }
    ]
  },
  'Operacional': {
    probability: [
      { id: 'operational-prob-1', question: 'Qual a complexidade das operações envolvidas?', category: 'probability' },
      { id: 'operational-prob-2', question: 'Com que frequência ocorrem falhas operacionais similares?', category: 'probability' },
      { id: 'operational-prob-3', question: 'A equipe operacional está adequadamente dimensionada?', category: 'probability' },
      { id: 'operational-prob-4', question: 'Existem gargalos conhecidos nos processos operacionais?', category: 'probability' },
      { id: 'operational-prob-5', question: 'Qual o nível de automação das operações críticas?', category: 'probability' },
      { id: 'operational-prob-6', question: 'Como está a manutenção de equipamentos/sistemas críticos?', category: 'probability' },
      { id: 'operational-prob-7', question: 'Existem dependências operacionais com terceiros?', category: 'probability' },
      { id: 'operational-prob-8', question: 'Qual a eficácia do monitoramento operacional?', category: 'probability' }
    ],
    impact: [
      { id: 'operational-imp-1', question: 'Quantos clientes seriam diretamente afetados?', category: 'impact' },
      { id: 'operational-imp-2', question: 'Qual seria a duração da interrupção operacional?', category: 'impact' },
      { id: 'operational-imp-3', question: 'Como isso afetaria a produtividade da equipe?', category: 'impact' },
      { id: 'operational-imp-4', question: 'Haveria custos adicionais significativos?', category: 'impact' },
      { id: 'operational-imp-5', question: 'Qual seria o impacto na qualidade dos serviços?', category: 'impact' },
      { id: 'operational-imp-6', question: 'Como isso afetaria os SLAs com clientes?', category: 'impact' },
      { id: 'operational-imp-7', question: 'Haveria impacto em outros processos de negócio?', category: 'impact' },
      { id: 'operational-imp-8', question: 'Qual seria o esforço para normalização das operações?', category: 'impact' }
    ]
  }
};

// Opções de resposta com valores quantitativos
export const ASSESSMENT_RESPONSE_OPTIONS = [
  { value: 1, label: 'Muito Baixo/Raro' },
  { value: 2, label: 'Baixo/Improvável' },
  { value: 3, label: 'Médio/Possível' },
  { value: 4, label: 'Alto/Provável' },
  { value: 5, label: 'Muito Alto/Quase Certo' }
];

// Opções para matriz GUT
export const GUT_RESPONSE_OPTIONS = [
  { value: 1, label: 'Muito Baixo' },
  { value: 2, label: 'Baixo' },
  { value: 3, label: 'Médio' },
  { value: 4, label: 'Alto' },
  { value: 5, label: 'Muito Alto' }
];

// Questões da matriz GUT
export const GUT_QUESTIONS = {
  gravity: 'Qual a gravidade/severidade do risco se ele se materializar?',
  urgency: 'Qual a urgência para tratar este risco?',
  tendency: 'Qual a tendência de evolução/agravamento do risco se não for tratado?'
};
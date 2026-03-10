// ============================================================================
// CONFIGURAÇÕES E MELHORIAS PARA GESTÃO DE RISCOS
// ============================================================================
// Baseado nas melhores práticas de GRC e frameworks internacionais

export const RISK_MANAGEMENT_CONFIG = {
  // Configurações da matriz de risco
  MATRIX: {
    // Escalas de 1-5 para probabilidade e impacto
    PROBABILITY_SCALE: {
      1: { label: 'Muito Baixa', description: 'Menor que 10% de chance de ocorrer', example: 'Evento raro, histórico de não ocorrência' },
      2: { label: 'Baixa', description: '10-25% de chance de ocorrer', example: 'Evento ocasional, pode ocorrer algumas vezes' },
      3: { label: 'Média', description: '25-50% de chance de ocorrer', example: 'Evento provável, pode ocorrer regularmente' },
      4: { label: 'Alta', description: '50-75% de chance de ocorrer', example: 'Evento frequente, provavelmente ocorrerá' },
      5: { label: 'Muito Alta', description: 'Mais que 75% de chance de ocorrer', example: 'Evento quase certo de ocorrer' }
    },
    
    IMPACT_SCALE: {
      1: { label: 'Muito Baixo', description: 'Impacto mínimo', financial: '< R$ 10.000', operational: 'Sem interrupção significativa' },
      2: { label: 'Baixo', description: 'Impacto limitado', financial: 'R$ 10.000 - R$ 50.000', operational: 'Interrupção menor que 4 horas' },
      3: { label: 'Médio', description: 'Impacto moderado', financial: 'R$ 50.000 - R$ 200.000', operational: 'Interrupção de 4-24 horas' },
      4: { label: 'Alto', description: 'Impacto significativo', financial: 'R$ 200.000 - R$ 1.000.000', operational: 'Interrupção de 1-7 dias' },
      5: { label: 'Muito Alto', description: 'Impacto catastrófico', financial: '> R$ 1.000.000', operational: 'Interrupção superior a 7 dias' }
    },
    
    // Níveis de risco baseados no score (probabilidade x impacto)
    RISK_LEVELS: {
      'Muito Baixo': { min: 1, max: 4, color: '#22c55e', action: 'Monitorar' },
      'Baixo': { min: 5, max: 8, color: '#84cc16', action: 'Revisar periodicamente' },
      'Médio': { min: 9, max: 12, color: '#eab308', action: 'Tratamento necessário' },
      'Alto': { min: 13, max: 20, color: '#f97316', action: 'Tratamento prioritário' },
      'Muito Alto': { min: 21, max: 25, color: '#ef4444', action: 'Tratamento imediato' }
    }
  },

  // Frameworks de referência
  FRAMEWORKS: {
    ISO31000: {
      name: 'ISO 31000:2018',
      description: 'Gestão de Riscos - Diretrizes',
      principles: [
        'Integrado',
        'Estruturado e abrangente',
        'Customizado',
        'Inclusivo',
        'Dinâmico',
        'Melhor informação disponível',
        'Fatores humanos e culturais',
        'Melhoria contínua'
      ]
    },
    COSO_ERM: {
      name: 'COSO ERM 2017',
      description: 'Enterprise Risk Management Framework',
      components: [
        'Governança e Cultura',
        'Estratégia e Definição de Objetivos',
        'Performance',
        'Revisão e Revisão',
        'Informação, Comunicação e Reporte'
      ]
    },
    NIST_CSF: {
      name: 'NIST Cybersecurity Framework',
      description: 'Framework para Gestão de Riscos de Segurança Cibernética',
      functions: ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Recuperar']
    }
  },

  // KRIs (Key Risk Indicators) sugeridos
  KRIS: {
    FINANCIAL: [
      { name: 'Variação de Receita', threshold: '±10%', frequency: 'Mensal' },
      { name: 'Margem de Lucro', threshold: '< 15%', frequency: 'Mensal' },
      { name: 'Liquidez Corrente', threshold: '< 1.2', frequency: 'Mensal' }
    ],
    OPERATIONAL: [
      { name: 'Disponibilidade de Sistemas', threshold: '< 99%', frequency: 'Diária' },
      { name: 'Tempo de Resposta SLA', threshold: '> 4 horas', frequency: 'Diária' },
      { name: 'Taxa de Defeitos', threshold: '> 5%', frequency: 'Semanal' }
    ],
    CYBERSECURITY: [
      { name: 'Tentativas de Intrusão', threshold: '> 100/dia', frequency: 'Diária' },
      { name: 'Vulnerabilidades Críticas', threshold: '> 5', frequency: 'Semanal' },
      { name: 'Incidentes de Segurança', threshold: '> 2/mês', frequency: 'Mensal' }
    ],
    COMPLIANCE: [
      { name: 'Auditorias em Atraso', threshold: '> 3', frequency: 'Mensal' },
      { name: 'Não Conformidades', threshold: '> 10', frequency: 'Mensal' },
      { name: 'Treinamentos Pendentes', threshold: '> 15%', frequency: 'Mensal' }
    ]
  },

  // Templates de comunicação
  COMMUNICATION_TEMPLATES: {
    RISK_ALERT: {
      subject: 'ALERTA DE RISCO: {riskName}',
      body: `Prezado(a) {recipientName},

Identificamos um risco que requer sua atenção:

RISCO: {riskName}
NÍVEL: {riskLevel}
CATEGORIA: {category}
IMPACTO POTENCIAL: {impact}

PRÓXIMAS AÇÕES:
{actions}

Por favor, confirme o recebimento desta comunicação e entre em contato para esclarecimentos.

Atenciosamente,
Equipe de Gestão de Riscos`
    },
    
    ACCEPTANCE_REQUEST: {
      subject: 'SOLICITAÇÃO DE ACEITE DE RISCO: {riskName}',
      body: `Prezado(a) {recipientName},

Solicitamos sua análise e aceite formal do seguinte risco:

RISCO: {riskName}
JUSTIFICATIVA: {justification}
CONTROLES COMPENSATÓRIOS: {controls}

Para aprovar este aceite, responda este e-mail confirmando sua decisão.

Atenciosamente,
Equipe de Gestão de Riscos`
    }
  },

  // Configurações de automação
  AUTOMATION: {
    // Alertas automáticos
    AUTO_ALERTS: {
      OVERDUE_ACTIVITIES: {
        enabled: true,
        frequency: 'daily',
        recipients: ['risk_owners', 'risk_managers']
      },
      HIGH_RISK_CREATION: {
        enabled: true,
        trigger: 'risk_level >= Alto',
        recipients: ['ciso', 'cro', 'ceo']
      },
      QUARTERLY_REVIEW: {
        enabled: true,
        frequency: 'quarterly',
        recipients: ['risk_committee']
      }
    },
    
    // Escalação automática
    ESCALATION: {
      ACTIVITY_OVERDUE: {
        after_days: 7,
        escalate_to: 'risk_manager'
      },
      RISK_ACCEPTANCE_PENDING: {
        after_days: 14,
        escalate_to: 'ciso'
      }
    }
  },

  // Métricas e dashboards
  METRICS: {
    // Métricas principais do dashboard
    DASHBOARD_METRICS: [
      'total_risks',
      'high_critical_risks',
      'overdue_activities',
      'risks_by_category',
      'risk_trend',
      'treatment_effectiveness'
    ],
    
    // Relatórios executivos
    EXECUTIVE_REPORTS: {
      MONTHLY: ['risk_summary', 'top_risks', 'kri_status', 'compliance_status'],
      QUARTERLY: ['risk_appetite', 'portfolio_analysis', 'treatment_progress', 'benchmark'],
      ANNUAL: ['risk_maturity', 'strategic_alignment', 'investment_roi', 'regulatory_compliance']
    }
  },

  // Integração com outros módulos
  INTEGRATIONS: {
    COMPLIANCE: {
      auto_create_risks_from_gaps: true,
      link_controls_to_risks: true,
      sync_audit_findings: true
    },
    INCIDENTS: {
      auto_create_risks_from_incidents: true,
      update_risk_scores: true,
      track_incident_patterns: true
    },
    VENDORS: {
      inherit_vendor_risks: true,
      continuous_monitoring: true,
      contract_risk_clauses: true
    }
  },

  // Configurações de workflow
  WORKFLOWS: {
    RISK_APPROVAL: {
      high_risk: ['risk_owner', 'risk_manager', 'ciso'],
      medium_risk: ['risk_owner', 'risk_manager'],
      low_risk: ['risk_owner']
    },
    
    TREATMENT_APPROVAL: {
      budget_required: ['risk_owner', 'finance', 'cfo'],
      no_budget: ['risk_owner', 'risk_manager']
    }
  }
};

// ============================================================================
// FUNCIONALIDADES AVANÇADAS SUGERIDAS
// ============================================================================

export const ADVANCED_FEATURES = {
  // IA e Machine Learning
  AI_CAPABILITIES: {
    RISK_PREDICTION: 'Prever riscos emergentes baseado em padrões históricos',
    AUTO_CATEGORIZATION: 'Categorizar riscos automaticamente usando NLP',
    SIMILARITY_DETECTION: 'Detectar riscos similares para otimizar tratamentos',
    TREND_ANALYSIS: 'Análise de tendências e correlações entre riscos'
  },
  
  // Automação de processos
  PROCESS_AUTOMATION: {
    RISK_SCORING: 'Cálculo automático de scores baseado em múltiplos fatores',
    TREATMENT_SUGGESTIONS: 'Sugerir tratamentos baseado em histórico e benchmarks',
    COMPLIANCE_MAPPING: 'Mapear riscos automaticamente para requisitos regulatórios',
    REPORTING: 'Geração automática de relatórios personalizados'
  },
  
  // Integração externa
  EXTERNAL_INTEGRATIONS: {
    THREAT_INTELLIGENCE: 'Feeds de inteligência de ameaças externas',
    REGULATORY_UPDATES: 'Monitoramento automático de mudanças regulatórias',
    BENCHMARK_DATA: 'Comparação com dados de mercado e setor',
    API_ECOSYSTEM: 'Integração com ferramentas de segurança e compliance'
  },
  
  // Analytics avançado
  ADVANCED_ANALYTICS: {
    MONTE_CARLO: 'Simulações Monte Carlo para análise probabilística',
    SCENARIO_PLANNING: 'Análise de cenários e stress testing',
    CORRELATION_ANALYSIS: 'Análise de correlações entre riscos',
    PORTFOLIO_OPTIMIZATION: 'Otimização de portfólio de riscos'
  }
};

export default RISK_MANAGEMENT_CONFIG;
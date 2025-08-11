// ============================================================================
// CONFIGURAÇÃO DO MÓDULO DE POLÍTICAS
// ============================================================================

import type { PolicyCategory, PolicyStatus, DocumentType } from '@/types/policy-management';

// ============================================================================
// CONFIGURAÇÕES DE INTERFACE
// ============================================================================

export const POLICY_CARD_CONFIG = {
  // Número máximo de caracteres para preview de descrição
  DESCRIPTION_PREVIEW_LENGTH: 150,
  
  // Limite de tags para exibir no card compacto
  MAX_TAGS_PREVIEW: 3,
  
  // Cores para diferentes tipos de prioridade
  PRIORITY_COLORS: {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  },

  // Configurações de drag and drop
  DRAG_DROP: {
    ANIMATION_DURATION: 200,
    DRAG_OVERLAY_OPACITY: 0.75,
    DRAG_SCALE: 1.05
  }
};

// ============================================================================
// CONFIGURAÇÕES DE NOTIFICAÇÃO
// ============================================================================

export const NOTIFICATION_CONFIG = {
  // Dias antes da data de revisão para enviar notificação
  REVIEW_REMINDER_DAYS: [30, 15, 7, 1],
  
  // Dias antes da data de expiração para enviar notificação
  EXPIRATION_REMINDER_DAYS: [60, 30, 15, 7],
  
  // Configurações de escalation para aprovações
  APPROVAL_ESCALATION: {
    FIRST_REMINDER_DAYS: 3,
    SECOND_REMINDER_DAYS: 7,
    ESCALATION_DAYS: 10,
    MAX_ESCALATIONS: 3
  }
};

// ============================================================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// ============================================================================

export const VALIDATION_CONFIG = {
  // Tamanhos mínimos e máximos para campos
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200
  },
  
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000
  },
  
  VERSION: {
    PATTERN: /^\d+\.\d+(\.\d+)?$/,
    EXAMPLE: '1.0 ou 1.0.1'
  },

  // Tipos de arquivos permitidos para upload
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],

  // Tamanho máximo de arquivo (em bytes)
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB

  // Número máximo de anexos por política
  MAX_ATTACHMENTS: 10
};

// ============================================================================
// MAPEAMENTOS DE STATUS
// ============================================================================

export const STATUS_WORKFLOW: Record<PolicyStatus, PolicyStatus[]> = {
  'draft': ['pending_approval', 'archived'],
  'pending_approval': ['approved', 'rejected', 'draft'],
  'approved': ['under_review', 'archived', 'expired'],
  'rejected': ['draft', 'archived'],
  'under_review': ['approved', 'draft', 'archived'],
  'archived': ['draft'], // Pode ser reativada
  'expired': ['under_review', 'archived']
};

// ============================================================================
// CONFIGURAÇÕES DE COMPLIANCE
// ============================================================================

export const COMPLIANCE_FRAMEWORKS = [
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Sistema de Gestão de Segurança da Informação',
    categories: ['Segurança da Informação']
  },
  {
    id: 'lgpd',
    name: 'LGPD',
    description: 'Lei Geral de Proteção de Dados',
    categories: ['Privacidade de Dados', 'Compliance']
  },
  {
    id: 'sox',
    name: 'SOX',
    description: 'Sarbanes-Oxley Act',
    categories: ['Financeiro', 'Compliance']
  },
  {
    id: 'pci_dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    categories: ['Segurança da Informação', 'Financeiro']
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    categories: ['Privacidade de Dados', 'Compliance']
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    categories: ['Privacidade de Dados', 'Compliance']
  },
  {
    id: 'nist',
    name: 'NIST Framework',
    description: 'National Institute of Standards and Technology',
    categories: ['Segurança da Informação', 'Gestão de Riscos']
  },
  {
    id: 'cobit',
    name: 'COBIT',
    description: 'Control Objectives for Information and Related Technologies',
    categories: ['Operacional', 'Gestão de Riscos']
  }
];

// ============================================================================
// TEMPLATES DE POLÍTICA
// ============================================================================

export const POLICY_TEMPLATES = {
  'Segurança da Informação': {
    sections: [
      'Objetivo e Escopo',
      'Definições',
      'Responsabilidades',
      'Classificação da Informação',
      'Controles de Acesso',
      'Gestão de Incidentes',
      'Conformidade',
      'Revisão e Atualização'
    ],
    tags: ['segurança', 'informação', 'acesso', 'confidencialidade']
  },
  
  'Privacidade de Dados': {
    sections: [
      'Objetivo e Escopo',
      'Base Legal',
      'Definições',
      'Princípios de Proteção de Dados',
      'Direitos dos Titulares',
      'Processamento de Dados',
      'Transferência Internacional',
      'Incidentes de Segurança',
      'Auditoria e Monitoramento'
    ],
    tags: ['privacidade', 'dados', 'lgpd', 'gdpr', 'titular']
  },

  'Recursos Humanos': {
    sections: [
      'Objetivo e Escopo',
      'Políticas de Contratação',
      'Código de Conduta',
      'Treinamento e Desenvolvimento',
      'Avaliação de Performance',
      'Disciplina e Demissão',
      'Benefícios e Compensação',
      'Saúde e Segurança'
    ],
    tags: ['rh', 'contratação', 'conduta', 'treinamento']
  },

  'Ética': {
    sections: [
      'Princípios Éticos',
      'Conflito de Interesses',
      'Uso de Recursos da Empresa',
      'Relacionamento com Terceiros',
      'Confidencialidade',
      'Discriminação e Assédio',
      'Denúncias e Investigações',
      'Consequências'
    ],
    tags: ['ética', 'conduta', 'integridade', 'compliance']
  }
};

// ============================================================================
// CONFIGURAÇÕES DE RELATÓRIOS
// ============================================================================

export const REPORT_CONFIG = {
  // Tipos de relatórios disponíveis
  TYPES: [
    {
      id: 'policy_status',
      name: 'Relatório de Status das Políticas',
      description: 'Status atual de todas as políticas'
    },
    {
      id: 'approval_workflow',
      name: 'Relatório de Fluxo de Aprovações',
      description: 'Histórico e pendências de aprovações'
    },
    {
      id: 'compliance_summary',
      name: 'Resumo de Compliance',
      description: 'Aderência aos frameworks de compliance'
    },
    {
      id: 'review_schedule',
      name: 'Cronograma de Revisões',
      description: 'Políticas que precisam ser revisadas'
    },
    {
      id: 'training_records',
      name: 'Registros de Treinamento',
      description: 'Histórico de treinamentos realizados'
    }
  ],

  // Formatos de export disponíveis
  EXPORT_FORMATS: ['pdf', 'excel', 'csv'],

  // Frequências de relatórios automáticos
  FREQUENCIES: [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' }
  ]
};

// ============================================================================
// CONFIGURAÇÕES DE BUSCA E FILTROS
// ============================================================================

export const SEARCH_CONFIG = {
  // Campos pesquisáveis
  SEARCHABLE_FIELDS: [
    'title',
    'description',
    'category',
    'tags',
    'compliance_frameworks',
    'owner_name'
  ],

  // Filtros disponíveis
  AVAILABLE_FILTERS: [
    'categories',
    'statuses',
    'document_types',
    'owners',
    'approval_status',
    'effective_date_range',
    'review_date_range',
    'created_date_range'
  ],

  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100
  }
};

// ============================================================================
// CONFIGURAÇÕES DE INTEGRAÇÃO
// ============================================================================

export const INTEGRATION_CONFIG = {
  // APIs externas
  EXTERNAL_APIS: {
    DOCUMENT_MANAGEMENT: {
      ENABLED: false,
      ENDPOINT: '',
      AUTH_TYPE: 'bearer'
    },
    
    EMAIL_NOTIFICATIONS: {
      ENABLED: true,
      PROVIDER: 'supabase', // ou 'sendgrid', 'ses', etc.
    },
    
    CALENDAR_INTEGRATION: {
      ENABLED: false,
      PROVIDER: 'google', // ou 'outlook', 'ical'
    }
  },

  // Webhooks
  WEBHOOKS: {
    POLICY_CREATED: [],
    POLICY_APPROVED: [],
    POLICY_EXPIRED: [],
    REVIEW_DUE: []
  }
};

export default {
  POLICY_CARD_CONFIG,
  NOTIFICATION_CONFIG,
  VALIDATION_CONFIG,
  STATUS_WORKFLOW,
  COMPLIANCE_FRAMEWORKS,
  POLICY_TEMPLATES,
  REPORT_CONFIG,
  SEARCH_CONFIG,
  INTEGRATION_CONFIG
};
// ============================================================================
// CONFIGURA��O DO M�DULO DE POL�TICAS
// ============================================================================

import type { PolicyCategory, PolicyStatus, DocumentType } from '@/types/policy-management';

// ============================================================================
// CONFIGURA��ES DE INTERFACE
// ============================================================================

export const POLICY_CARD_CONFIG = {
  // N�mero m�ximo de caracteres para preview de descri��o
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

  // Configura��es de drag and drop
  DRAG_DROP: {
    ANIMATION_DURATION: 200,
    DRAG_OVERLAY_OPACITY: 0.75,
    DRAG_SCALE: 1.05
  }
};

// ============================================================================
// CONFIGURA��ES DE NOTIFICA��O
// ============================================================================

export const NOTIFICATION_CONFIG = {
  // Dias antes da data de revis�o para enviar notifica��o
  REVIEW_REMINDER_DAYS: [30, 15, 7, 1],
  
  // Dias antes da data de expira��o para enviar notifica��o
  EXPIRATION_REMINDER_DAYS: [60, 30, 15, 7],
  
  // Configura��es de escalation para aprova��es
  APPROVAL_ESCALATION: {
    FIRST_REMINDER_DAYS: 3,
    SECOND_REMINDER_DAYS: 7,
    ESCALATION_DAYS: 10,
    MAX_ESCALATIONS: 3
  }
};

// ============================================================================
// CONFIGURA��ES DE VALIDA��O
// ============================================================================

export const VALIDATION_CONFIG = {
  // Tamanhos m�nimos e m�ximos para campos
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

  // Tamanho m�ximo de arquivo (em bytes)
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB

  // N�mero m�ximo de anexos por pol�tica
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
// CONFIGURA��ES DE COMPLIANCE
// ============================================================================

export const COMPLIANCE_FRAMEWORKS = [
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Sistema de Gest�o de Seguran�a da Informa��o',
    categories: ['Seguran�a da Informa��o']
  },
  {
    id: 'lgpd',
    name: 'LGPD',
    description: 'Lei Geral de Prote��o de Dados',
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
    categories: ['Seguran�a da Informa��o', 'Financeiro']
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
    categories: ['Seguran�a da Informa��o', 'Gest�o de Riscos']
  },
  {
    id: 'cobit',
    name: 'COBIT',
    description: 'Control Objectives for Information and Related Technologies',
    categories: ['Operacional', 'Gest�o de Riscos']
  }
];

// ============================================================================
// TEMPLATES DE POL�TICA
// ============================================================================

export const POLICY_TEMPLATES = {
  'Seguran�a da Informa��o': {
    sections: [
      'Objetivo e Escopo',
      'Defini��es',
      'Responsabilidades',
      'Classifica��o da Informa��o',
      'Controles de Acesso',
      'Gest�o de Incidentes',
      'Conformidade',
      'Revis�o e Atualiza��o'
    ],
    tags: ['seguran�a', 'informa��o', 'acesso', 'confidencialidade']
  },
  
  'Privacidade de Dados': {
    sections: [
      'Objetivo e Escopo',
      'Base Legal',
      'Defini��es',
      'Princ�pios de Prote��o de Dados',
      'Direitos dos Titulares',
      'Processamento de Dados',
      'Transfer�ncia Internacional',
      'Incidentes de Seguran�a',
      'Auditoria e Monitoramento'
    ],
    tags: ['privacidade', 'dados', 'lgpd', 'gdpr', 'titular']
  },

  'Recursos Humanos': {
    sections: [
      'Objetivo e Escopo',
      'Pol�ticas de Contrata��o',
      'C�digo de Conduta',
      'Treinamento e Desenvolvimento',
      'Avalia��o de Performance',
      'Disciplina e Demiss�o',
      'Benef�cios e Compensa��o',
      'Sa�de e Seguran�a'
    ],
    tags: ['rh', 'contrata��o', 'conduta', 'treinamento']
  },

  '�tica': {
    sections: [
      'Princ�pios �ticos',
      'Conflito de Interesses',
      'Uso de Recursos da Empresa',
      'Relacionamento com Terceiros',
      'Confidencialidade',
      'Discrimina��o e Ass�dio',
      'Den�ncias e Investiga��es',
      'Consequ�ncias'
    ],
    tags: ['�tica', 'conduta', 'integridade', 'compliance']
  }
};

// ============================================================================
// CONFIGURA��ES DE RELAT�RIOS
// ============================================================================

export const REPORT_CONFIG = {
  // Tipos de relat�rios dispon�veis
  TYPES: [
    {
      id: 'policy_status',
      name: 'Relat�rio de Status das Pol�ticas',
      description: 'Status atual de todas as pol�ticas'
    },
    {
      id: 'approval_workflow',
      name: 'Relat�rio de Fluxo de Aprova��es',
      description: 'Hist�rico e pend�ncias de aprova��es'
    },
    {
      id: 'compliance_summary',
      name: 'Resumo de Compliance',
      description: 'Ader�ncia aos frameworks de compliance'
    },
    {
      id: 'review_schedule',
      name: 'Cronograma de Revis�es',
      description: 'Pol�ticas que precisam ser revisadas'
    },
    {
      id: 'training_records',
      name: 'Registros de Treinamento',
      description: 'Hist�rico de treinamentos realizados'
    }
  ],

  // Formatos de export dispon�veis
  EXPORT_FORMATS: ['pdf', 'excel', 'csv'],

  // Frequ�ncias de relat�rios autom�ticos
  FREQUENCIES: [
    { value: 'daily', label: 'Di�rio' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' }
  ]
};

// ============================================================================
// CONFIGURA��ES DE BUSCA E FILTROS
// ============================================================================

export const SEARCH_CONFIG = {
  // Campos pesquis�veis
  SEARCHABLE_FIELDS: [
    'title',
    'description',
    'category',
    'tags',
    'compliance_frameworks',
    'owner_name'
  ],

  // Filtros dispon�veis
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

  // Configura��es de pagina��o
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100
  }
};

// ============================================================================
// CONFIGURA��ES DE INTEGRA��O
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
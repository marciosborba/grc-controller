// ============================================================================
// STORE PARA DROPDOWNS EXTENSÍVEIS
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  DropdownStore, 
  ExtensibleDropdownItem, 
  Department, 
  JobTitle, 
  ComplianceFramework, 
  RiskCategory, 
  IncidentType,
  AddItemRequest 
} from '@/types/extensible-dropdowns';

interface DropdownStoreState extends DropdownStore {
  // Actions
  addItem: (type: keyof DropdownStore, item: AddItemRequest) => Promise<ExtensibleDropdownItem>;
  updateItem: (type: keyof DropdownStore, id: string, updates: Partial<ExtensibleDropdownItem>) => Promise<void>;
  deleteItem: (type: keyof DropdownStore, id: string) => Promise<void>;
  getItems: (type: keyof DropdownStore) => ExtensibleDropdownItem[];
  getItemById: (type: keyof DropdownStore, id: string) => ExtensibleDropdownItem | undefined;
  searchItems: (type: keyof DropdownStore, query: string) => ExtensibleDropdownItem[];
  
  // Utility
  initializeDefaults: () => void;
  clearAll: () => void;
  exportData: () => DropdownStore;
  importData: (data: Partial<DropdownStore>) => void;
}

// Dados padrão iniciais
const getDefaultDepartments = (): Department[] => [
  {
    id: 'dept-1',
    type: 'department',
    label: 'Tecnologia da Informação',
    description: 'Departamento responsável pela infraestrutura e sistemas',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 25
  },
  {
    id: 'dept-2',
    type: 'department',
    label: 'Segurança da Informação',
    description: 'Departamento responsável pela segurança cibernética',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 12
  },
  {
    id: 'dept-3',
    type: 'department',
    label: 'Compliance',
    description: 'Departamento responsável pela conformidade regulatória',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 8
  },
  {
    id: 'dept-4',
    type: 'department',
    label: 'Auditoria',
    description: 'Departamento responsável por auditorias internas',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 6
  },
  {
    id: 'dept-5',
    type: 'department',
    label: 'Riscos',
    description: 'Departamento responsável pela gestão de riscos',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 10
  },
  {
    id: 'dept-6',
    type: 'department',
    label: 'Recursos Humanos',
    description: 'Departamento de gestão de pessoas',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 15
  },
  {
    id: 'dept-7',
    type: 'department',
    label: 'Financeiro',
    description: 'Departamento financeiro e contábil',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 18
  },
  {
    id: 'dept-8',
    type: 'department',
    label: 'Jurídico',
    description: 'Departamento jurídico e legal',
    isActive: true,
    createdAt: new Date(),
    employeeCount: 5
  }
];

const getDefaultJobTitles = (): JobTitle[] => [
  {
    id: 'job-1',
    type: 'job_title',
    label: 'Analista de Segurança',
    description: 'Responsável por análises de segurança da informação',
    departmentId: 'dept-2',
    level: 'mid',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'job-2',
    type: 'job_title',
    label: 'Especialista em Compliance',
    description: 'Especialista em conformidade regulatória',
    departmentId: 'dept-3',
    level: 'senior',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'job-3',
    type: 'job_title',
    label: 'Auditor Interno',
    description: 'Responsável por auditorias internas',
    departmentId: 'dept-4',
    level: 'senior',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'job-4',
    type: 'job_title',
    label: 'Analista de Riscos',
    description: 'Responsável por análise e gestão de riscos',
    departmentId: 'dept-5',
    level: 'mid',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'job-5',
    type: 'job_title',
    label: 'CISO',
    description: 'Chief Information Security Officer',
    departmentId: 'dept-2',
    level: 'executive',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'job-6',
    type: 'job_title',
    label: 'Gerente de TI',
    description: 'Gerente do departamento de tecnologia',
    departmentId: 'dept-1',
    level: 'manager',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'job-7',
    type: 'job_title',
    label: 'Desenvolvedor Sênior',
    description: 'Desenvolvedor de software sênior',
    departmentId: 'dept-1',
    level: 'senior',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'job-8',
    type: 'job_title',
    label: 'Analista de Dados',
    description: 'Responsável por análise de dados e relatórios',
    departmentId: 'dept-1',
    level: 'mid',
    isActive: true,
    createdAt: new Date()
  }
];

const getDefaultFrameworks = (): ComplianceFramework[] => [
  {
    id: 'fw-1',
    type: 'compliance_framework',
    label: 'ISO 27001',
    description: 'Sistema de Gestão de Segurança da Informação',
    version: '2013',
    category: 'security',
    isActive: true,
    createdAt: new Date(),
    standards: ['ISO/IEC 27001:2013', 'ISO/IEC 27002:2013']
  },
  {
    id: 'fw-2',
    type: 'compliance_framework',
    label: 'LGPD',
    description: 'Lei Geral de Proteção de Dados',
    version: '2020',
    category: 'privacy',
    isActive: true,
    createdAt: new Date(),
    standards: ['Lei 13.709/2018']
  },
  {
    id: 'fw-3',
    type: 'compliance_framework',
    label: 'SOX',
    description: 'Sarbanes-Oxley Act',
    version: '2002',
    category: 'financial',
    isActive: true,
    createdAt: new Date(),
    standards: ['SOX Section 302', 'SOX Section 404']
  },
  {
    id: 'fw-4',
    type: 'compliance_framework',
    label: 'NIST CSF',
    description: 'NIST Cybersecurity Framework',
    version: '1.1',
    category: 'security',
    isActive: true,
    createdAt: new Date(),
    standards: ['NIST SP 800-53', 'NIST SP 800-171']
  },
  {
    id: 'fw-5',
    type: 'compliance_framework',
    label: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    version: '4.0',
    category: 'security',
    isActive: true,
    createdAt: new Date(),
    standards: ['PCI DSS v4.0']
  },
  {
    id: 'fw-6',
    type: 'compliance_framework',
    label: 'COBIT',
    description: 'Control Objectives for Information Technologies',
    version: '2019',
    category: 'operational',
    isActive: true,
    createdAt: new Date(),
    standards: ['COBIT 2019 Framework']
  }
];

const getDefaultRiskCategories = (): RiskCategory[] => [
  {
    id: 'risk-1',
    type: 'risk_category',
    label: 'Cibersegurança',
    description: 'Riscos relacionados à segurança cibernética',
    color: '#ef4444',
    severity: 'high',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'risk-2',
    type: 'risk_category',
    label: 'Operacional',
    description: 'Riscos operacionais e de processos',
    color: '#f97316',
    severity: 'medium',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'risk-3',
    type: 'risk_category',
    label: 'Financeiro',
    description: 'Riscos financeiros e de mercado',
    color: '#eab308',
    severity: 'high',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'risk-4',
    type: 'risk_category',
    label: 'Compliance',
    description: 'Riscos de conformidade regulatória',
    color: '#22c55e',
    severity: 'high',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'risk-5',
    type: 'risk_category',
    label: 'Reputacional',
    description: 'Riscos à reputação da organização',
    color: '#8b5cf6',
    severity: 'medium',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'risk-6',
    type: 'risk_category',
    label: 'Estratégico',
    description: 'Riscos estratégicos de negócio',
    color: '#06b6d4',
    severity: 'medium',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'risk-7',
    type: 'risk_category',
    label: 'Tecnológico',
    description: 'Riscos relacionados à tecnologia',
    color: '#64748b',
    severity: 'medium',
    isActive: true,
    createdAt: new Date()
  }
];

const getDefaultIncidentTypes = (): IncidentType[] => [
  {
    id: 'inc-1',
    type: 'incident_type',
    label: 'Violação de Dados',
    description: 'Acesso não autorizado a dados sensíveis',
    defaultSeverity: 'high',
    category: 'security',
    responseTime: 4,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'inc-2',
    type: 'incident_type',
    label: 'Malware',
    description: 'Infecção por software malicioso',
    defaultSeverity: 'medium',
    category: 'security',
    responseTime: 8,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'inc-3',
    type: 'incident_type',
    label: 'Phishing',
    description: 'Tentativa de engenharia social',
    defaultSeverity: 'medium',
    category: 'security',
    responseTime: 12,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'inc-4',
    type: 'incident_type',
    label: 'Falha de Sistema',
    description: 'Indisponibilidade de sistemas críticos',
    defaultSeverity: 'high',
    category: 'technical',
    responseTime: 2,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'inc-5',
    type: 'incident_type',
    label: 'Acesso Não Autorizado',
    description: 'Tentativa de acesso não autorizado',
    defaultSeverity: 'medium',
    category: 'security',
    responseTime: 6,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'inc-6',
    type: 'incident_type',
    label: 'Perda de Dados',
    description: 'Perda acidental de dados',
    defaultSeverity: 'high',
    category: 'operational',
    responseTime: 4,
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'inc-7',
    type: 'incident_type',
    label: 'Violação de Compliance',
    description: 'Não conformidade com regulamentações',
    defaultSeverity: 'high',
    category: 'compliance',
    responseTime: 24,
    isActive: true,
    createdAt: new Date()
  }
];

// Função para gerar ID único
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useDropdownStore = create<DropdownStoreState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      departments: [],
      jobTitles: [],
      complianceFrameworks: [],
      riskCategories: [],
      incidentTypes: [],

      // Actions
      addItem: async (type, item) => {
        const newItem: ExtensibleDropdownItem = {
          id: generateId(type.slice(0, 3)),
          type: type as any,
          label: item.label,
          description: item.description,
          isActive: true,
          createdAt: new Date(),
          metadata: item.metadata,
          ...getDefaultPropertiesForType(type)
        };

        set((state) => {
          const newState = {
            ...state,
            [type]: [...state[type], newItem]
          };
          console.log(`Item adicionado ao ${type}:`, newItem);
          console.log(`Total de itens em ${type}:`, newState[type].length);
          return newState;
        });

        // Forçar re-render
        setTimeout(() => {
          const currentState = get();
          set({ ...currentState });
        }, 100);

        return newItem;
      },

      updateItem: async (type, id, updates) => {
        set((state) => ({
          [type]: state[type].map((item: ExtensibleDropdownItem) =>
            item.id === id ? { ...item, ...updates } : item
          )
        }));
      },

      deleteItem: async (type, id) => {
        set((state) => ({
          [type]: state[type].filter((item: ExtensibleDropdownItem) => item.id !== id)
        }));
      },

      getItems: (type) => {
        const state = get();
        return state[type].filter((item: ExtensibleDropdownItem) => item.isActive);
      },

      getItemById: (type, id) => {
        const state = get();
        return state[type].find((item: ExtensibleDropdownItem) => item.id === id);
      },

      searchItems: (type, query) => {
        const state = get();
        const items = state[type];
        const lowercaseQuery = query.toLowerCase();
        
        return items.filter((item: ExtensibleDropdownItem) =>
          item.isActive &&
          (item.label.toLowerCase().includes(lowercaseQuery) ||
           item.description?.toLowerCase().includes(lowercaseQuery))
        );
      },

      initializeDefaults: () => {
        set({
          departments: getDefaultDepartments(),
          jobTitles: getDefaultJobTitles(),
          complianceFrameworks: getDefaultFrameworks(),
          riskCategories: getDefaultRiskCategories(),
          incidentTypes: getDefaultIncidentTypes()
        });
      },

      clearAll: () => {
        set({
          departments: [],
          jobTitles: [],
          complianceFrameworks: [],
          riskCategories: [],
          incidentTypes: []
        });
      },

      exportData: () => {
        const state = get();
        return {
          departments: state.departments,
          jobTitles: state.jobTitles,
          complianceFrameworks: state.complianceFrameworks,
          riskCategories: state.riskCategories,
          incidentTypes: state.incidentTypes
        };
      },

      importData: (data) => {
        set((state) => ({
          ...state,
          ...data
        }));
      }
    }),
    {
      name: 'dropdown-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Inicializar dados padrão se o store estiver vazio
        if (state && state.departments.length === 0) {
          state.initializeDefaults();
        }
      }
    }
  )
);

// Função auxiliar para propriedades padrão por tipo
function getDefaultPropertiesForType(type: keyof DropdownStore): Partial<ExtensibleDropdownItem> {
  switch (type) {
    case 'departments':
      return { employeeCount: 0 };
    case 'jobTitles':
      return { level: 'mid' as const };
    case 'complianceFrameworks':
      return { version: '1.0', category: 'operational' as const };
    case 'riskCategories':
      return { color: '#64748b', severity: 'medium' as const };
    case 'incidentTypes':
      return { defaultSeverity: 'medium' as const, category: 'operational' as const, responseTime: 24 };
    default:
      return {};
  }
}
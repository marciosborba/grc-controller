// ============================================================================
// TIPOS PARA GESTÃO DE ASSESSMENTS CORPORATIVOS
// ============================================================================
// Tipos modernos para gestão de assessments com base em boas práticas de GRC

export type AssessmentStatus = 
  | 'draft' 
  | 'not_started' 
  | 'in_progress' 
  | 'under_review' 
  | 'completed' 
  | 'cancelled' 
  | 'expired';

export type AssessmentPriority = 'low' | 'medium' | 'high' | 'critical';

export type AssessmentType = 
  | 'internal_audit'
  | 'external_audit'
  | 'compliance_check'
  | 'risk_assessment'
  | 'security_review'
  | 'gap_analysis'
  | 'maturity_assessment'
  | 'vendor_assessment';

export type AssessmentFrequency = 'one_time' | 'quarterly' | 'semi_annual' | 'annual' | 'biennial';

export type UserRole = 'respondent' | 'auditor' | 'reviewer' | 'approver';

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

export interface AssessmentFramework {
  id: string;
  tenant_id: string;
  name: string;
  short_name: string;
  description: string | null;
  category: string;
  version: string;
  is_active: boolean;
  controls_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  tenant_id: string;
  framework_id: string;
  name: string;
  description?: string;
  type: AssessmentType;
  status: AssessmentStatus;
  priority: AssessmentPriority;
  frequency: AssessmentFrequency;
  
  // Datas importantes
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  
  // Progresso e métricas
  progress: number;
  total_controls: number;
  completed_controls: number;
  compliance_score: number;
  
  // Relacionamentos
  framework?: AssessmentFramework;
  assigned_users?: AssessmentUserRole[];
  attachments?: AssessmentAttachment[];
  
  // Auditoria
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Campos calculados
  is_overdue?: boolean;
  days_until_due?: number;
  completion_percentage?: number;
}

export interface AssessmentUserRole {
  id: string;
  assessment_id: string;
  user_id: string;
  role: UserRole;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface AssessmentAttachment {
  id: string;
  assessment_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface AssessmentControl {
  id: string;
  assessment_id: string;
  framework_control_id: string;
  control_code: string;
  control_title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'not_applicable';
  maturity_level: number; // 1-5
  evidence_provided: boolean;
  comments?: string;
  assigned_to?: string;
  completed_by?: string;
  completed_at?: string;
  updated_at: string;
}

export interface AssessmentResponse {
  id: string;
  assessment_id: string;
  control_id: string;
  user_id: string;
  response_type: 'self_assessment' | 'review' | 'audit';
  maturity_level: number;
  evidence_description?: string;
  comments?: string;
  attachments?: string[];
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
}

// ============================================================================
// TIPOS PARA FILTROS E BUSCA
// ============================================================================

export interface AssessmentFilters {
  search_term?: string;
  statuses?: AssessmentStatus[];
  types?: AssessmentType[];
  priorities?: AssessmentPriority[];
  frameworks?: string[];
  assigned_to_me?: boolean;
  show_overdue?: boolean;
  show_upcoming_deadlines?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  progress_range?: {
    min: number;
    max: number;
  };
}

export interface AssessmentSortOptions {
  field: 'name' | 'due_date' | 'status' | 'progress' | 'priority' | 'created_at';
  direction: 'asc' | 'desc';
}

// ============================================================================
// TIPOS PARA CRIAÇÃO E ATUALIZAÇÃO
// ============================================================================

export interface CreateAssessmentRequest {
  name: string;
  description?: string;
  framework_id: string;
  type: AssessmentType;
  priority: AssessmentPriority;
  frequency: AssessmentFrequency;
  start_date?: string;
  due_date?: string;
  assigned_users?: {
    user_id: string;
    role: UserRole;
  }[];
  created_by: string;
}

export interface UpdateAssessmentRequest {
  id: string;
  updates: Partial<Omit<Assessment, 'id' | 'tenant_id' | 'created_at' | 'created_by'>>;
}

export interface AssessmentBulkAction {
  action: 'delete' | 'update_status' | 'assign_users' | 'set_due_date';
  assessment_ids: string[];
  payload?: any;
}

// ============================================================================
// TIPOS PARA MÉTRICAS E DASHBOARD
// ============================================================================

export interface AssessmentMetrics {
  total_assessments: number;
  assessments_by_status: Record<AssessmentStatus, number>;
  assessments_by_priority: Record<AssessmentPriority, number>;
  assessments_by_type: Record<AssessmentType, number>;
  overdue_assessments: number;
  upcoming_deadlines: number; // próximos 30 dias
  average_completion_time: number; // em dias
  compliance_score_average: number;
  completion_rate: number; // percentual
  
  // Métricas por framework
  frameworks_usage: {
    framework_id: string;
    framework_name: string;
    assessments_count: number;
    average_score: number;
  }[];
  
  // Tendências mensais
  monthly_trends: {
    month: string;
    created: number;
    completed: number;
    average_score: number;
  }[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const ASSESSMENT_STATUSES: Record<AssessmentStatus, string> = {
  draft: 'Rascunho - Assessment em preparação',
  not_started: 'Não Iniciado - Aguardando início',
  in_progress: 'Em Progresso - Assessment em execução',
  under_review: 'Em Revisão - Aguardando aprovação',
  completed: 'Concluído - Assessment finalizado',
  cancelled: 'Cancelado - Assessment cancelado',
  expired: 'Expirado - Prazo excedido'
};

export const ASSESSMENT_PRIORITIES: Record<AssessmentPriority, string> = {
  low: 'Baixa - Pode ser adiado se necessário',
  medium: 'Média - Importância moderada',
  high: 'Alta - Deve ser priorizado',
  critical: 'Crítica - Máxima prioridade'
};

export const ASSESSMENT_TYPES: Record<AssessmentType, string> = {
  internal_audit: 'Auditoria Interna - Avaliação interna de controles',
  external_audit: 'Auditoria Externa - Avaliação por terceiros',
  compliance_check: 'Verificação de Conformidade - Aderência a regulamentações',
  risk_assessment: 'Avaliação de Riscos - Identificação e análise de riscos',
  security_review: 'Revisão de Segurança - Avaliação de controles de segurança',
  gap_analysis: 'Análise de Gaps - Identificação de lacunas',
  maturity_assessment: 'Avaliação de Maturidade - Nível de maturidade dos controles',
  vendor_assessment: 'Avaliação de Fornecedores - Assessment de terceiros'
};

export const ASSESSMENT_FREQUENCIES: Record<AssessmentFrequency, string> = {
  one_time: 'Única - Execução única',
  quarterly: 'Trimestral - A cada 3 meses',
  semi_annual: 'Semestral - A cada 6 meses',
  annual: 'Anual - Uma vez por ano',
  biennial: 'Bienal - A cada 2 anos'
};

export const USER_ROLES: Record<UserRole, string> = {
  respondent: 'Respondente - Preenche as respostas',
  auditor: 'Auditor - Revisa e valida as respostas',
  reviewer: 'Revisor - Revisa o assessment completo',
  approver: 'Aprovador - Aprova o assessment final'
};

// ============================================================================
// TIPOS PARA HOOKS
// ============================================================================

export interface UseAssessmentManagementOptions {
  filters?: AssessmentFilters;
  sortOptions?: AssessmentSortOptions;
  pageSize?: number;
  autoRefresh?: boolean;
}

export interface UseAssessmentManagementReturn {
  // Estado dos dados
  assessments: Assessment[];
  frameworks: AssessmentFramework[];
  metrics: AssessmentMetrics;
  profiles: any[];
  
  // Estados de loading
  isAssessmentsLoading: boolean;
  isFrameworksLoading: boolean;
  isCreatingAssessment: boolean;
  isUpdatingAssessment: boolean;
  isDeletingAssessment: boolean;
  
  // Estados de erro
  assessmentsError: Error | null;
  frameworksError: Error | null;
  
  // Funções de CRUD
  createAssessment: (data: CreateAssessmentRequest) => Promise<Assessment>;
  updateAssessment: (data: UpdateAssessmentRequest) => Promise<Assessment>;
  deleteAssessment: (id: string) => Promise<void>;
  bulkActions: (action: AssessmentBulkAction) => Promise<void>;
  
  // Funções de filtro e busca
  filterAssessments: (filters: AssessmentFilters) => Assessment[];
  sortAssessments: (assessments: Assessment[], options: AssessmentSortOptions) => Assessment[];
  searchAssessments: (term: string) => Assessment[];
  
  // Funções utilitárias
  getMetrics: () => AssessmentMetrics;
  refreshData: () => Promise<void>;
  
  // Funções específicas do domínio
  duplicateAssessment: (id: string, newName?: string) => Promise<Assessment>;
  assignUsers: (assessmentId: string, users: { user_id: string; role: UserRole }[]) => Promise<void>;
  updateProgress: (assessmentId: string) => Promise<void>;
}
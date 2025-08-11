// ============================================================================
// TIPOS PARA GESTÃO DE POLÍTICAS CORPORATIVAS
// ============================================================================
// Tipos melhorados para gestão de políticas com base em boas práticas de GRC

export type PolicyStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived' | 'under_review' | 'expired';

export type PolicyCategory = 
  | 'Segurança da Informação'
  | 'Privacidade de Dados' 
  | 'Recursos Humanos'
  | 'Financeiro'
  | 'Operacional'
  | 'Compliance'
  | 'Gestão de Riscos'
  | 'Ética'
  | 'Qualidade'
  | 'Ambiental';

export type DocumentType = 
  | 'Política'
  | 'Procedimento'
  | 'Instrução de Trabalho'
  | 'Manual'
  | 'Regulamento'
  | 'Norma'
  | 'Diretriz'
  | 'Padrão';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'reviewed';
export type ReviewType = 'periodic' | 'ad_hoc' | 'compliance' | 'incident_based';

// ============================================================================
// INTERFACE PRINCIPAL - POLICY
// ============================================================================
export interface Policy {
  id: string;
  
  // Informações Básicas
  title: string;
  description?: string;
  category: PolicyCategory;
  document_type?: DocumentType;
  version: string;
  
  // Status e Aprovação
  status: PolicyStatus;
  approved_by?: string;
  approved_at?: Date;
  
  // Datas
  effective_date?: Date;
  review_date?: Date;
  expiration_date?: Date;
  last_reviewed_at?: Date;
  
  // Documentos
  document_url?: string;
  document_path?: string;
  
  // Proprietário e Responsabilidade
  owner_id?: string;
  created_by?: string;
  updated_by?: string;
  
  // Controle de auditoria
  created_at: Date;
  updated_at: Date;
  
  // Metadados adicionais
  tags?: string[];
  compliance_frameworks?: string[];
  impact_areas?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// APROVAÇÃO E FLUXO DE TRABALHO
// ============================================================================
export interface PolicyApprover {
  id: string;
  policy_id: string;
  approver_id: string;
  approver_role: string;
  is_required: boolean;
  order_sequence: number;
  
  // Decisão
  status?: ApprovalStatus;
  decision_date?: Date;
  comments?: string;
  
  // Delegação
  can_delegate: boolean;
  delegated_to?: string;
  delegation_reason?: string;
  
  // Configuração
  notification_days_before: number;
  escalation_days: number;
  auto_approve_after_days?: number;
  
  // Notificações
  notify_on_assignment: boolean;
  notify_on_decision: boolean;
  notify_on_changes: boolean;
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PolicyApproval {
  id: string;
  policy_id: string;
  approver_id: string;
  approver_role?: string;
  status: ApprovalStatus;
  decision_date?: Date;
  comments?: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// REVISÃO E VERSIONAMENTO
// ============================================================================
export interface PolicyReview {
  id: string;
  policy_id: string;
  reviewer_id: string;
  review_type: ReviewType;
  review_date: Date;
  
  // Revisão
  findings?: string;
  recommendations?: string;
  compliance_status: 'compliant' | 'non_compliant' | 'needs_improvement';
  
  // Classificação
  effectiveness_rating?: number; // 1-5
  clarity_rating?: number; // 1-5
  completeness_rating?: number; // 1-5
  
  // Ação
  requires_update: boolean;
  next_review_date?: Date;
  
  // Evidências
  evidence_documents?: string[];
  
  created_at: Date;
  updated_at: Date;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version_number: string;
  
  // Versão
  changes_summary: string;
  change_reason: string;
  change_impact?: string;
  
  created_by: string;
  created_at: Date;
  
  // Backup dos dados da versão anterior
  previous_data: Partial<Policy>;
}

// ============================================================================
// TREINAMENTOS E CONSCIENTIZAÇÃO
// ============================================================================
export interface PolicyTraining {
  id: string;
  policy_id: string;
  training_name: string;
  description?: string;
  is_mandatory: boolean;
  target_audience: string[];
  
  training_materials?: string[];
  completion_criteria?: string;
  validity_period_days?: number;
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PolicyTrainingRecord {
  id: string;
  training_id: string;
  user_id: string;
  completion_date?: Date;
  score?: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  
  attempts: number;
  last_attempt_date?: Date;
  certificate_url?: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// ANEXOS E DOCUMENTOS
// ============================================================================
export interface PolicyAttachment {
  id: string;
  policy_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  description?: string;
  is_public: boolean;
  
  uploaded_by: string;
  uploaded_at: Date;
}

// ============================================================================
// LOG DE MUDANÇAS
// ============================================================================
export interface PolicyChangeLog {
  id: string;
  policy_id: string;
  changed_by: string;
  change_date: Date;
  
  // Mudança
  change_type: 'created' | 'updated' | 'approved' | 'rejected' | 'archived' | 'restored';
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  change_reason?: string;
  
  ip_address?: string;
  user_agent?: string;
}

// ============================================================================
// RELATÓRIOS E MÉTRICAS
// ============================================================================
export interface PolicyMetrics {
  total_policies: number;
  policies_by_status: Record<PolicyStatus, number>;
  policies_by_category: Record<PolicyCategory, number>;
  upcoming_reviews: number;
  overdue_reviews: number;
  pending_approvals: number;
  compliance_rate: number;
  training_completion_rate: number;
  average_approval_time: number;
}

// ============================================================================
// REQUESTS E FILTERS
// ============================================================================
export interface CreatePolicyRequest {
  title: string;
  description?: string;
  category: PolicyCategory;
  document_type?: DocumentType;
  version?: string;
  owner_id?: string;
  effective_date?: Date;
  review_date?: Date;
  expiration_date?: Date;
  tags?: string[];
  compliance_frameworks?: string[];
  impact_areas?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdatePolicyRequest extends Partial<CreatePolicyRequest> {}

export interface PolicyFilters {
  search_term?: string;
  categories?: PolicyCategory[];
  statuses?: PolicyStatus[];
  document_types?: DocumentType[];
  owners?: string[];
  effective_date_from?: Date;
  effective_date_to?: Date;
  show_expired?: boolean;
  show_upcoming_reviews?: boolean;
}

// ============================================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================================
export const POLICY_CATEGORIES: Record<PolicyCategory, string> = {
  'Segurança da Informação': 'Políticas relacionadas à proteção de dados e sistemas',
  'Privacidade de Dados': 'Políticas de proteção da privacidade e dados pessoais',
  'Recursos Humanos': 'Políticas de gestão de pessoas e relações trabalhistas',
  'Financeiro': 'Políticas financeiras, contábeis e de controles internos',
  'Operacional': 'Políticas de processos operacionais e procedimentos',
  'Compliance': 'Políticas de conformidade regulatória e legal',
  'Gestão de Riscos': 'Políticas de identificação e gestão de riscos',
  'Ética': 'Código de ética e conduta empresarial',
  'Qualidade': 'Políticas de gestão da qualidade e melhoria contínua',
  'Ambiental': 'Políticas ambientais e sustentabilidade'
};

export const DOCUMENT_TYPES: Record<DocumentType, string> = {
  'Política': 'Documento que estabelece princípios e diretrizes gerais',
  'Procedimento': 'Documento que descreve como executar atividades específicas',
  'Instrução de Trabalho': 'Documento detalhado para execução de tarefas específicas',
  'Manual': 'Documento abrangente com instruções e orientações',
  'Regulamento': 'Documento com regras e normas obrigatórias',
  'Norma': 'Documento técnico com especificações e requisitos',
  'Diretriz': 'Documento com orientações e recomendações',
  'Padrão': 'Documento que estabelece critérios uniformes'
};

export const POLICY_STATUSES: Record<PolicyStatus, string> = {
  'draft': 'Rascunho - Em elaboração',
  'pending_approval': 'Aguardando aprovação dos responsáveis',
  'approved': 'Aprovada - Vigente e publicada',
  'rejected': 'Rejeitada durante o processo de aprovação',
  'archived': 'Arquivada - Não mais vigente',
  'under_review': 'Em processo de revisão',
  'expired': 'Expirada - Necessita renovação'
};
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
// INTERFACES PRINCIPAIS
// ============================================================================

export interface Policy {
  id: string;
  
  // Informa��es B�sicas
  title: string;
  description?: string;
  category: PolicyCategory;
  document_type?: DocumentType;
  version: string;
  
  // Status e Aprova��o
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
  
  // Propriet�rio e Responsabilidade
  owner_id?: string;
  created_by?: string;
  updated_by?: string;
  
  // Controle de auditoria
  created_at: Date;
  updated_at: Date;
  
  // Relacionamentos
  approvals?: PolicyApproval[];
  approvers?: PolicyApprover[];
  reviews?: PolicyReview[];
  attachments?: PolicyAttachment[];
  training_records?: PolicyTraining[];
  change_log?: PolicyChangeLog[];
  
  // Metadados adicionais
  tags?: string[];
  compliance_frameworks?: string[];
  related_policies?: string[];
  impact_areas?: string[];
}

// ============================================================================
// APROVA��O E FLUXO DE TRABALHO
// ============================================================================

export interface PolicyApproval {
  id: string;
  policy_id: string;
  
  // Aprovador
  approver_id: string;
  approver_role?: string;
  
  // Decis�o
  status: ApprovalStatus;
  comments?: string;
  decision_date?: Date;
  
  // Delega��o
  delegated_to?: string;
  delegation_reason?: string;
  
  // Controle
  created_at: Date;
  updated_at: Date;
}

export interface PolicyApprover {
  id: string;
  policy_id: string;
  
  // Aprovador
  approver_id: string;
  approver_role: string;
  
  // Configura��o
  is_required: boolean;
  order_sequence: number;
  can_delegate: boolean;
  
  // Notifica��es
  notification_days_before?: number;
  escalation_days?: number;
  escalation_to?: string;
  
  // Controle
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// REVIS�O E VERSIONAMENTO
// ============================================================================

export interface PolicyReview {
  id: string;
  policy_id: string;
  
  // Revis�o
  review_type: ReviewType;
  reviewer_id: string;
  review_date: Date;
  due_date?: Date;
  
  // Resultado
  status: 'completed' | 'pending' | 'overdue';
  findings?: string;
  recommendations?: string;
  action_items?: PolicyActionItem[];
  
  // Classifica��o
  severity?: 'low' | 'medium' | 'high' | 'critical';
  compliance_status?: 'compliant' | 'non_compliant' | 'partially_compliant';
  
  // Controle
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PolicyActionItem {
  id: string;
  policy_review_id: string;
  
  // A��o
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  due_date?: Date;
  
  // Status
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  completion_date?: Date;
  completion_notes?: string;
  
  // Controle
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// TREINAMENTO E CONHECIMENTO
// ============================================================================

export interface PolicyTraining {
  id: string;
  policy_id: string;
  
  // Participante
  employee_id: string;
  trainer_id?: string;
  
  // Treinamento
  training_date: Date;
  training_method: 'online' | 'classroom' | 'video' | 'document' | 'workshop';
  duration_hours?: number;
  
  // Resultado
  completion_status: 'completed' | 'incomplete' | 'failed' | 'expired';
  score?: number;
  certification_date?: Date;
  expiration_date?: Date;
  
  // Evid�ncias
  certificate_url?: string;
  notes?: string;
  
  // Controle
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// ANEXOS E DOCUMENTOS
// ============================================================================

export interface PolicyAttachment {
  id: string;
  policy_id: string;
  
  // Arquivo
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  
  // Metadados
  description?: string;
  category: 'document' | 'template' | 'evidence' | 'reference' | 'training_material';
  
  // Vers�o
  version?: string;
  is_current_version: boolean;
  
  // Controle
  uploaded_by: string;
  uploaded_at: Date;
}

// ============================================================================
// LOG DE MUDAN�AS
// ============================================================================

export interface PolicyChangeLog {
  id: string;
  policy_id: string;
  
  // Mudan�a
  change_type: 'created' | 'updated' | 'status_changed' | 'approved' | 'rejected' | 'archived' | 'version_updated';
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  
  // Contexto
  reason?: string;
  impact_assessment?: string;
  stakeholders_notified?: boolean;
  
  // Controle
  changed_by: string;
  changed_at: Date;
}

// ============================================================================
// RELAT�RIOS E M�TRICAS
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
  average_approval_time: number; // em dias
}

export interface PolicyCompliance {
  policy_id: string;
  compliance_percentage: number;
  last_assessment_date?: Date;
  next_assessment_due?: Date;
  non_compliance_areas: string[];
  corrective_actions: PolicyActionItem[];
}

// ============================================================================
// REQUESTS E RESPONSES PARA API
// ============================================================================

export interface CreatePolicyRequest {
  title: string;
  description?: string;
  category: PolicyCategory;
  document_type?: DocumentType;
  version?: string;
  effective_date?: Date;
  review_date?: Date;
  owner_id?: string;
  tags?: string[];
}

export interface UpdatePolicyRequest extends Partial<CreatePolicyRequest> {
  status?: PolicyStatus;
  approved_by?: string;
  approved_at?: Date;
  last_reviewed_at?: Date;
}

export interface PolicyFilters {
  search_term?: string;
  categories?: PolicyCategory[];
  statuses?: PolicyStatus[];
  document_types?: DocumentType[];
  owners?: string[];
  effective_date_from?: Date;
  effective_date_to?: Date;
  review_date_from?: Date;
  review_date_to?: Date;
  show_expired?: boolean;
  show_upcoming_reviews?: boolean;
}

// ============================================================================
// CONSTANTES E CONFIGURA��ES
// ============================================================================

export const POLICY_CATEGORIES: Record<PolicyCategory, string> = {
  'Seguran�a da Informa��o': 'Pol�ticas relacionadas � prote��o de dados e sistemas',
  'Privacidade de Dados': 'Pol�ticas de prote��o da privacidade e dados pessoais',
  'Recursos Humanos': 'Pol�ticas de gest�o de pessoas e rela��es trabalhistas',
  'Financeiro': 'Pol�ticas financeiras, cont�beis e de controles internos',
  'Operacional': 'Pol�ticas de processos operacionais e procedimentos',
  'Compliance': 'Pol�ticas de conformidade regulat�ria e legal',
  'Gest�o de Riscos': 'Pol�ticas de identifica��o e gest�o de riscos',
  '�tica': 'C�digo de �tica e conduta empresarial',
  'Qualidade': 'Pol�ticas de gest�o da qualidade e melhoria cont�nua',
  'Ambiental': 'Pol�ticas ambientais e sustentabilidade'
};

export const DOCUMENT_TYPES: Record<DocumentType, string> = {
  'Pol�tica': 'Documento que estabelece princ�pios e diretrizes gerais',
  'Procedimento': 'Documento que descreve como executar atividades espec�ficas',
  'Instru��o de Trabalho': 'Documento detalhado para execu��o de tarefas espec�ficas',
  'Manual': 'Documento abrangente com instru��es e orienta��es',
  'Regulamento': 'Documento com regras e normas obrigat�rias',
  'Norma': 'Documento t�cnico com especifica��es e requisitos',
  'Diretriz': 'Documento com orienta��es e recomenda��es',
  'Padr�o': 'Documento que estabelece crit�rios uniformes'
};

export const POLICY_STATUSES: Record<PolicyStatus, string> = {
  'draft': 'Rascunho - Em elabora��o',
  'pending_approval': 'Aguardando aprova��o dos respons�veis',
  'approved': 'Aprovada e vigente',
  'rejected': 'Rejeitada durante o processo de aprova��o',
  'archived': 'Arquivada - N�o mais vigente',
  'under_review': 'Em processo de revis�o',
  'expired': 'Expirada - Necessita renova��o'
};
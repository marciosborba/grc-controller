// =====================================================
// TIPOS PARA MÓDULO DE GESTÃO DE POLÍTICAS E NORMAS
// Criado por Alex Policy - Especialista em Políticas Corporativas
// =====================================================

export interface Policy {
  id: string;
  tenant_id: string;
  
  // Informações básicas
  title: string;
  description?: string;
  category: PolicyCategory;
  type: PolicyType;
  
  // Status e workflow
  status: PolicyStatus;
  workflow_stage: WorkflowStage;
  
  // Versionamento
  version: string;
  parent_policy_id?: string;
  is_current_version: boolean;
  
  // Conteúdo estruturado
  content: PolicyContent;
  metadata: PolicyMetadata;
  
  // Configurações
  priority: PolicyPriority;
  requires_approval: boolean;
  requires_training: boolean;
  is_template: boolean;
  is_active: boolean;
  
  // Datas importantes
  effective_date?: string;
  expiry_date?: string;
  review_date?: string;
  next_review_date?: string;
  
  // Auditoria
  created_by: string;
  updated_by?: string;
  approved_by?: string;
  published_by?: string;
  
  created_at: string;
  updated_at: string;
  approved_at?: string;
  published_at?: string;
}

export interface PolicyWorkflowStep {
  id: string;
  tenant_id: string;
  policy_id: string;
  
  // Configuração da etapa
  step_type: WorkflowStepType;
  step_name: string;
  step_order: number;
  
  // Status da etapa
  status: WorkflowStepStatus;
  
  // Responsáveis
  assignee_id?: string;
  assignee_role?: string;
  completed_by?: string;
  
  // Dados da execução
  instructions?: string;
  comments?: string;
  attachments: any[];
  alex_assistance: AlexAssistance;
  
  // Datas
  assigned_at?: string;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PolicyApproval {
  id: string;
  tenant_id: string;
  policy_id: string;
  
  // Configuração da aprovação
  approval_level: number;
  approver_id: string;
  approver_role?: string;
  
  // Status e resultado
  status: ApprovalStatus;
  decision?: ApprovalDecision;
  
  // Feedback
  comments?: string;
  conditions?: string;
  
  // Datas
  requested_at: string;
  due_date?: string;
  responded_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PolicyNotification {
  id: string;
  tenant_id: string;
  policy_id?: string;
  
  // Configuração da notificação
  notification_type: NotificationType;
  title: string;
  message: string;
  
  // Destinatários
  recipient_id?: string;
  recipient_role?: string;
  recipient_email?: string;
  
  // Canais
  channels: NotificationChannel[];
  
  // Status
  status: NotificationStatus;
  priority: NotificationPriority;
  
  // Ação requerida
  action_required: boolean;
  action_type?: ActionType;
  action_url?: string;
  
  // Datas
  scheduled_for: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  action_taken_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PolicyMetric {
  id: string;
  tenant_id: string;
  policy_id?: string;
  
  // Tipo de métrica
  metric_type: MetricType;
  metric_category: MetricCategory;
  
  // Valores
  value: number;
  target_value?: number;
  unit: string;
  
  // Contexto
  dimension_1?: string;
  dimension_2?: string;
  dimension_3?: string;
  
  // Insights da IA
  ai_generated_insights: any;
  
  // Período
  period_start: string;
  period_end: string;
  
  created_at: string;
  updated_at: string;
}

export interface PolicyTemplate {
  id: string;
  tenant_id?: string;
  
  // Informações básicas
  name: string;
  description?: string;
  category: PolicyCategory;
  policy_type: PolicyType;
  
  // Conteúdo do template
  template_content: string;
  sections: PolicySection[];
  variables: Record<string, any>;
  
  // Configurações
  is_global: boolean;
  is_active: boolean;
  requires_customization: boolean;
  
  // Metadados
  compliance_frameworks: string[];
  regulatory_requirements: any[];
  
  // Estatísticas
  usage_count: number;
  rating: number;
  
  // IA
  alex_generated: boolean;
  alex_recommendations: any;
  
  // Auditoria
  created_by?: string;
  updated_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PolicyChangeHistory {
  id: string;
  tenant_id: string;
  policy_id: string;
  
  // Tipo de mudança
  change_type: ChangeType;
  change_description?: string;
  
  // Dados da mudança
  old_values?: any;
  new_values?: any;
  changed_fields: string[];
  
  // Contexto
  reason?: string;
  impact_assessment?: string;
  
  // Responsável
  changed_by: string;
  change_source: ChangeSource;
  
  created_at: string;
}

export interface PolicyAcknowledgment {
  id: string;
  tenant_id: string;
  policy_id: string;
  user_id: string;
  
  // Status do acknowledgment
  status: AcknowledgmentStatus;
  
  // Datas importantes
  required_by?: string;
  first_read_at?: string;
  acknowledged_at?: string;
  training_completed_at?: string;
  
  // Detalhes
  read_count: number;
  time_spent_reading?: number;
  acknowledgment_method?: AcknowledgmentMethod;
  
  // Feedback
  feedback_rating?: number;
  feedback_comments?: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// TIPOS AUXILIARES
// =====================================================

export interface PolicyContent {
  sections: PolicySection[];
  attachments?: PolicyAttachment[];
  references?: PolicyReference[];
  glossary?: PolicyGlossaryItem[];
}

export interface PolicySection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections?: PolicySection[];
}

export interface PolicyAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface PolicyReference {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'regulation' | 'standard';
  url?: string;
  policy_id?: string;
}

export interface PolicyGlossaryItem {
  term: string;
  definition: string;
}

export interface PolicyMetadata {
  tags: string[];
  keywords: string[];
  applicable_areas: string[];
  applicable_roles: string[];
  related_policies: string[];
  regulatory_basis: string[];
}

export interface AlexAssistance {
  suggestions: AlexSuggestion[];
  insights: AlexInsight[];
  recommendations: AlexRecommendation[];
  analysis: AlexAnalysis;
}

export interface AlexSuggestion {
  id: string;
  type: 'content' | 'structure' | 'compliance' | 'improvement';
  title: string;
  description: string;
  confidence: number;
  applied: boolean;
  created_at: string;
}

export interface AlexInsight {
  id: string;
  category: 'risk' | 'opportunity' | 'compliance' | 'efficiency';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface AlexRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action_required: boolean;
  estimated_effort: string;
  created_at: string;
}

export interface AlexAnalysis {
  completeness_score: number;
  compliance_score: number;
  readability_score: number;
  effectiveness_score: number;
  areas_for_improvement: string[];
  strengths: string[];
  last_analyzed: string;
}

// =====================================================
// ENUMS E TIPOS LITERAIS
// =====================================================

export type PolicyCategory = 
  | 'governance' 
  | 'compliance' 
  | 'operational' 
  | 'hr' 
  | 'it' 
  | 'financial' 
  | 'security' 
  | 'quality' 
  | 'environmental' 
  | 'legal';

export type PolicyType = 
  | 'policy' 
  | 'procedure' 
  | 'guideline' 
  | 'standard' 
  | 'manual' 
  | 'instruction';

export type PolicyStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'published' 
  | 'expired' 
  | 'archived' 
  | 'suspended';

export type WorkflowStage = 
  | 'elaboration' 
  | 'technical_review' 
  | 'compliance_review' 
  | 'legal_review' 
  | 'approval' 
  | 'publication' 
  | 'distribution';

export type PolicyPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type WorkflowStepType = 
  | 'elaboration' 
  | 'technical_review' 
  | 'compliance_review' 
  | 'legal_review' 
  | 'management_approval' 
  | 'board_approval' 
  | 'publication' 
  | 'distribution' 
  | 'training';

export type WorkflowStepStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'rejected' 
  | 'skipped' 
  | 'overdue';

export type ApprovalStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'delegated' 
  | 'expired';

export type ApprovalDecision = 
  | 'approve' 
  | 'reject' 
  | 'request_changes' 
  | 'delegate';

export type NotificationType = 
  | 'new_policy' 
  | 'policy_update' 
  | 'review_required' 
  | 'approval_needed' 
  | 'expiry_warning' 
  | 'training_required' 
  | 'acknowledgment_required';

export type NotificationChannel = 
  | 'in_app' 
  | 'email' 
  | 'sms' 
  | 'push' 
  | 'slack' 
  | 'teams';

export type NotificationStatus = 
  | 'pending' 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed' 
  | 'cancelled';

export type NotificationPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'urgent';

export type ActionType = 
  | 'read_policy' 
  | 'approve' 
  | 'review' 
  | 'acknowledge' 
  | 'complete_training' 
  | 'provide_feedback';

export type MetricType = 
  | 'read_rate' 
  | 'compliance_rate' 
  | 'training_completion' 
  | 'feedback_score' 
  | 'acknowledgment_rate' 
  | 'time_to_approve' 
  | 'effectiveness_score';

export type MetricCategory = 
  | 'engagement' 
  | 'compliance' 
  | 'effectiveness' 
  | 'performance' 
  | 'quality' 
  | 'efficiency';

export type ChangeType = 
  | 'created' 
  | 'updated' 
  | 'approved' 
  | 'published' 
  | 'expired' 
  | 'archived' 
  | 'restored' 
  | 'version_created';

export type ChangeSource = 
  | 'manual' 
  | 'automated' 
  | 'ai_suggestion' 
  | 'scheduled' 
  | 'integration';

export type AcknowledgmentStatus = 
  | 'required' 
  | 'read' 
  | 'acknowledged' 
  | 'trained' 
  | 'exempted' 
  | 'overdue';

export type AcknowledgmentMethod = 
  | 'digital_signature' 
  | 'checkbox' 
  | 'quiz' 
  | 'training' 
  | 'biometric' 
  | 'two_factor';

// =====================================================
// INTERFACES PARA DASHBOARD E MÉTRICAS
// =====================================================

export interface PolicyDashboardData {
  summary: PolicySummary;
  metrics: PolicyMetric[];
  recent_activities: PolicyActivity[];
  pending_actions: PendingAction[];
  expiring_policies: ExpiringPolicy[];
  alex_insights: AlexInsight[];
}

export interface PolicySummary {
  total_policies: number;
  active_policies: number;
  draft_policies: number;
  pending_approval: number;
  expiring_soon: number;
  compliance_rate: number;
  average_read_rate: number;
}

export interface PolicyActivity {
  id: string;
  type: 'created' | 'updated' | 'approved' | 'published' | 'acknowledged';
  policy_id: string;
  policy_title: string;
  user_name: string;
  timestamp: string;
  description: string;
}

export interface PendingAction {
  id: string;
  type: 'approval' | 'review' | 'acknowledgment' | 'training';
  policy_id: string;
  policy_title: string;
  assigned_to: string;
  due_date?: string;
  priority: PolicyPriority;
  overdue: boolean;
}

export interface ExpiringPolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  expiry_date: string;
  days_until_expiry: number;
  owner: string;
  status: PolicyStatus;
}

// =====================================================
// INTERFACES PARA FILTROS E BUSCA
// =====================================================

export interface PolicyFilters {
  categories?: PolicyCategory[];
  types?: PolicyType[];
  statuses?: PolicyStatus[];
  priorities?: PolicyPriority[];
  date_range?: {
    start: string;
    end: string;
  };
  assigned_to?: string[];
  tags?: string[];
  compliance_frameworks?: string[];
  document_types?: PolicyType[];
}

export interface PolicySearchOptions {
  query: string;
  filters: PolicyFilters;
  sort_by: 'title' | 'created_at' | 'updated_at' | 'priority' | 'expiry_date';
  sort_order: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PolicySearchResult {
  policies: Policy[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// =====================================================
// INTERFACES PARA INTEGRAÇÃO COM ALEX POLICY
// =====================================================

export interface AlexPolicyConfig {
  enabled: boolean;
  auto_suggestions: boolean;
  auto_analysis: boolean;
  confidence_threshold: number;
  preferred_language: string;
  specialized_domains: string[];
}

export interface AlexPolicyRequest {
  type: 'generate' | 'analyze' | 'improve' | 'review' | 'suggest';
  context: {
    policy_id?: string;
    category: PolicyCategory;
    type: PolicyType;
    content?: string;
    requirements?: string[];
  };
  options: {
    language?: string;
    tone?: 'formal' | 'informal' | 'technical';
    length?: 'brief' | 'detailed' | 'comprehensive';
    focus?: string[];
  };
}

export interface AlexPolicyResponse {
  success: boolean;
  data: {
    content?: string;
    suggestions?: AlexSuggestion[];
    analysis?: AlexAnalysis;
    recommendations?: AlexRecommendation[];
  };
  metadata: {
    confidence: number;
    processing_time: number;
    model_version: string;
    tokens_used: number;
  };
  error?: string;
}

// =====================================================
// INTERFACES PARA INTEGRAÇÃO COM NOTIFICAÇÕES
// =====================================================

export interface PolicyNotificationRule {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  
  // Triggers
  trigger_events: NotificationType[];
  conditions: NotificationCondition[];
  
  // Recipients
  recipient_rules: RecipientRule[];
  
  // Configuration
  channels: NotificationChannel[];
  priority: NotificationPriority;
  template_id?: string;
  
  // Scheduling
  immediate: boolean;
  delay_minutes?: number;
  business_hours_only: boolean;
  
  // Status
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface RecipientRule {
  type: 'user' | 'role' | 'department' | 'all';
  value?: string;
  conditions?: NotificationCondition[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  channel: NotificationChannel;
  is_active: boolean;
}

// =====================================================
// INTERFACES PARA RELATÓRIOS
// =====================================================

export interface PolicyReport {
  id: string;
  name: string;
  type: 'compliance' | 'effectiveness' | 'usage' | 'performance';
  parameters: ReportParameters;
  data: any;
  generated_at: string;
  generated_by: string;
}

export interface ReportParameters {
  date_range: {
    start: string;
    end: string;
  };
  filters: PolicyFilters;
  metrics: MetricType[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_charts: boolean;
  include_recommendations: boolean;
}

// =====================================================
// INTERFACES PARA CONFIGURAÇÕES
// =====================================================

export interface PolicyManagementSettings {
  tenant_id: string;
  
  // Workflow Configuration
  default_workflow: WorkflowStepType[];
  approval_matrix: ApprovalMatrix[];
  auto_assignment_rules: AutoAssignmentRule[];
  
  // Notification Settings
  notification_rules: PolicyNotificationRule[];
  default_channels: NotificationChannel[];
  escalation_rules: EscalationRule[];
  
  // Alex Policy Settings
  alex_config: AlexPolicyConfig;
  
  // Compliance Settings
  mandatory_frameworks: string[];
  review_cycles: ReviewCycle[];
  retention_policies: RetentionPolicy[];
  
  // UI Settings
  default_view: 'dashboard' | 'list' | 'kanban';
  items_per_page: number;
  auto_save: boolean;
  
  updated_at: string;
  updated_by: string;
}

export interface ApprovalMatrix {
  policy_category: PolicyCategory;
  policy_priority: PolicyPriority;
  approval_levels: ApprovalLevel[];
}

export interface ApprovalLevel {
  level: number;
  required_role: string;
  required_count: number;
  timeout_days: number;
  escalation_role?: string;
}

export interface AutoAssignmentRule {
  condition: NotificationCondition[];
  assign_to_role: string;
  assign_to_user?: string;
  priority: number;
}

export interface EscalationRule {
  trigger_after_hours: number;
  escalate_to_role: string;
  escalate_to_user?: string;
  notification_template: string;
}

export interface ReviewCycle {
  policy_category: PolicyCategory;
  review_frequency_months: number;
  advance_notice_days: number;
  auto_extend: boolean;
}

export interface RetentionPolicy {
  policy_category: PolicyCategory;
  retention_years: number;
  archive_after_expiry: boolean;
  delete_after_years?: number;
}

// =====================================================
// CONSTANTES E ENUMS EXPORTADOS
// =====================================================

export const POLICY_CATEGORIES: Record<PolicyCategory, string> = {
  governance: 'Governança Corporativa',
  compliance: 'Compliance e Regulamentação',
  operational: 'Operacional',
  hr: 'Recursos Humanos',
  it: 'Tecnologia da Informação',
  financial: 'Financeiro',
  security: 'Segurança da Informação',
  quality: 'Qualidade',
  environmental: 'Meio Ambiente',
  legal: 'Jurídico'
};

export const POLICY_TYPES: Record<PolicyType, string> = {
  policy: 'Política',
  procedure: 'Procedimento',
  guideline: 'Diretriz',
  standard: 'Padrão',
  manual: 'Manual',
  instruction: 'Instrução'
};

export const POLICY_STATUSES: Record<PolicyStatus, string> = {
  draft: 'Rascunho - Em elaboração',
  review: 'Em Revisão - Aguardando análise técnica',
  approved: 'Aprovada - Pronta para publicação',
  published: 'Publicada - Ativa e vigente',
  expired: 'Expirada - Necessita renovação',
  archived: 'Arquivada - Inativa',
  suspended: 'Suspensa - Temporariamente inativa'
};

export const DOCUMENT_TYPES: Record<PolicyType, string> = {
  policy: 'Política - Diretrizes estratégicas',
  procedure: 'Procedimento - Passos operacionais',
  guideline: 'Diretriz - Orientações gerais',
  standard: 'Padrão - Especificações técnicas',
  manual: 'Manual - Guia completo',
  instruction: 'Instrução - Orientação específica'
};

export const WORKFLOW_STAGES: Record<WorkflowStage, string> = {
  elaboration: 'Elaboração',
  technical_review: 'Revisão Técnica',
  compliance_review: 'Revisão de Compliance',
  legal_review: 'Revisão Jurídica',
  approval: 'Aprovação',
  publication: 'Publicação',
  distribution: 'Distribuição'
};

export const PRIORITIES: Record<PolicyPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
};

export const NOTIFICATION_TYPES: Record<NotificationType, string> = {
  new_policy: 'Nova Política',
  policy_update: 'Atualização de Política',
  review_required: 'Revisão Necessária',
  approval_needed: 'Aprovação Pendente',
  expiry_warning: 'Aviso de Vencimento',
  training_required: 'Treinamento Obrigatório',
  acknowledgment_required: 'Confirmação de Leitura'
};

export const NOTIFICATION_PRIORITIES: Record<NotificationPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
};

export const METRIC_TYPES: Record<MetricType, string> = {
  read_rate: 'Taxa de Leitura',
  compliance_rate: 'Taxa de Compliance',
  training_completion: 'Conclusão de Treinamento',
  feedback_score: 'Pontuação de Feedback',
  acknowledgment_rate: 'Taxa de Confirmação',
  time_to_approve: 'Tempo para Aprovação',
  effectiveness_score: 'Pontuação de Efetividade'
};

export const ACKNOWLEDGMENT_STATUSES: Record<AcknowledgmentStatus, string> = {
  required: 'Obrigatório',
  read: 'Lido',
  acknowledged: 'Confirmado',
  trained: 'Treinado',
  exempted: 'Isento',
  overdue: 'Em Atraso'
};

// Tipos de documento para compatibilidade
export type DocumentType = PolicyType;

export default Policy;
// =====================================================
// TIPOS TYPESCRIPT PARA GESTÃO DE POLÍTICAS V2
// Integrado com Alex Policy IA
// =====================================================

// =====================================================
// ENUMS E CONSTANTES
// =====================================================

export type PolicyCategory = 
  | 'governance' 
  | 'compliance' 
  | 'security' 
  | 'hr' 
  | 'finance' 
  | 'operations' 
  | 'legal'
  | 'quality'
  | 'environmental'
  | 'health_safety';

export type PolicyType = 
  | 'policy' 
  | 'procedure' 
  | 'guideline' 
  | 'standard' 
  | 'manual'
  | 'code_of_conduct'
  | 'regulation'
  | 'instruction';

export type PolicyStatus = 
  | 'draft' 
  | 'under_review' 
  | 'pending_approval' 
  | 'approved' 
  | 'published' 
  | 'expired' 
  | 'archived'
  | 'rejected'
  | 'suspended';

export type WorkflowStage = 
  | 'elaboration' 
  | 'review' 
  | 'approval' 
  | 'publication' 
  | 'validity_management';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'delegated';

export type ReviewType = 'technical' | 'legal' | 'compliance' | 'business' | 'security';

export type PublicationChannel = 'email' | 'intranet' | 'portal' | 'meeting' | 'training';

export type MetricType = 
  | 'compliance_rate' 
  | 'approval_time' 
  | 'review_efficiency' 
  | 'publication_reach'
  | 'acknowledgment_rate'
  | 'policy_effectiveness';

// =====================================================
// INTERFACES PRINCIPAIS
// =====================================================

export interface PolicyV2 {
  id: string;
  tenant_id: string;
  
  // Informações básicas
  title: string;
  description?: string;
  content?: string;
  summary?: string;
  
  // Classificação
  category: PolicyCategory;
  policy_type: PolicyType;
  priority: Priority;
  
  // Status e workflow
  status: PolicyStatus;
  workflow_stage: WorkflowStage;
  
  // Versionamento
  version: string;
  parent_policy_id?: string;
  is_current_version: boolean;
  
  // Responsabilidades
  created_by: string;
  updated_by?: string;
  approved_by?: string;
  owner_id?: string;
  
  // Datas importantes
  created_at: string;
  updated_at: string;
  approved_at?: string;
  effective_date?: string;
  expiry_date?: string;
  review_date?: string;
  last_reviewed_at?: string;
  
  // Metadados e IA
  tags?: string[];
  keywords?: string[];
  metadata?: Record<string, any>;
  ai_generated: boolean;
  alex_suggestions?: AlexSuggestions;
  compliance_frameworks?: string[];
  
  // Configurações
  requires_acknowledgment: boolean;
  is_mandatory: boolean;
  applies_to_all_users: boolean;
  target_audience?: string[];
  
  // Relacionamentos
  workflow_steps?: PolicyWorkflowStep[];
  approvals?: PolicyApproval[];
  reviews?: PolicyReview[];
  publications?: PolicyPublication[];
  metrics?: PolicyMetric[];
}

export interface PolicyWorkflowStep {
  id: string;
  policy_id: string;
  tenant_id: string;
  
  // Definição da etapa
  step_type: WorkflowStage;
  step_name: string;
  step_order: number;
  
  // Responsabilidade
  assignee_id?: string;
  assignee_role?: string;
  
  // Status e prazos
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  completed_by?: string;
  
  // Conteúdo
  instructions?: string;
  comments?: string;
  attachments?: Attachment[];
  alex_assistance?: AlexAssistance;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

export interface PolicyApproval {
  id: string;
  policy_id: string;
  tenant_id: string;
  
  // Aprovador
  approver_id: string;
  approver_role?: string;
  approval_level: number;
  
  // Status da aprovação
  status: ApprovalStatus;
  decision_date?: string;
  
  // Feedback
  comments?: string;
  conditions?: string;
  suggestions?: Suggestion[];
  
  // Delegação
  delegated_to?: string;
  delegation_reason?: string;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

export interface PolicyReview {
  id: string;
  policy_id: string;
  tenant_id: string;
  
  // Revisor
  reviewer_id: string;
  review_type: ReviewType;
  
  // Status da revisão
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  
  // Conteúdo da revisão
  findings?: string;
  recommendations?: Recommendation[];
  issues_found?: Issue[];
  compliance_check?: ComplianceCheck;
  
  // Classificação
  overall_rating?: number; // 1-5
  requires_changes: boolean;
  
  // Alex Policy insights
  alex_analysis?: AlexAnalysis;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

export interface PolicyPublication {
  id: string;
  policy_id: string;
  tenant_id: string;
  
  // Detalhes da publicação
  publication_date: string;
  effective_date: string;
  
  // Canais de comunicação
  channels: PublicationChannel[];
  target_audience: string[];
  
  // Configurações
  acknowledgment_required: boolean;
  training_required: boolean;
  
  // Métricas
  total_recipients: number;
  acknowledgments_received: number;
  read_receipts: number;
  
  // Conteúdo da comunicação
  announcement_title?: string;
  announcement_content?: string;
  communication_materials?: CommunicationMaterial[];
  
  // Status
  status: 'scheduled' | 'published' | 'completed';
  
  // Auditoria
  published_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyAcknowledgment {
  id: string;
  policy_id: string;
  publication_id: string;
  tenant_id: string;
  
  // Usuário
  user_id: string;
  
  // Reconhecimento
  acknowledged_at: string;
  acknowledgment_method?: 'email_click' | 'portal_confirmation' | 'training_completion';
  
  // Detalhes
  ip_address?: string;
  user_agent?: string;
  comments?: string;
  
  // Auditoria
  created_at: string;
}

export interface PolicyMetric {
  id: string;
  tenant_id: string;
  
  // Tipo de métrica
  metric_type: MetricType;
  metric_category: 'performance' | 'compliance' | 'efficiency' | 'adoption';
  
  // Valores
  metric_value: number;
  metric_unit?: 'percentage' | 'days' | 'count' | 'score';
  
  // Contexto
  policy_id?: string;
  policy_category?: PolicyCategory;
  
  // Período
  period_start?: string;
  period_end?: string;
  calculation_date: string;
  
  // Metadados
  metadata?: Record<string, any>;
  alex_insights?: AlexInsights;
  
  // Auditoria
  calculated_by?: string;
  created_at: string;
}

export interface PolicyTemplate {
  id: string;
  tenant_id?: string; // NULL para templates globais
  
  // Informações básicas
  name: string;
  description?: string;
  category: PolicyCategory;
  policy_type: PolicyType;
  
  // Conteúdo do template
  template_content: string;
  sections: TemplateSection[];
  variables: Record<string, string>;
  
  // Configurações
  is_active: boolean;
  is_global: boolean;
  requires_customization: boolean;
  
  // Compliance
  compliance_frameworks?: string[];
  regulatory_requirements?: RegulatoryRequirement[];
  
  // Uso e popularidade
  usage_count: number;
  rating: number;
  
  // Alex Policy
  alex_generated: boolean;
  alex_recommendations?: AlexRecommendations;
  
  // Auditoria
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACES DE APOIO
// =====================================================

export interface AlexSuggestions {
  content_improvements?: string[];
  structure_recommendations?: string[];
  compliance_notes?: string[];
  risk_assessments?: string[];
  implementation_tips?: string[];
  generated_at: string;
  confidence_score?: number;
}

export interface AlexAssistance {
  step_guidance?: string;
  recommended_actions?: string[];
  potential_issues?: string[];
  best_practices?: string[];
  templates_suggested?: string[];
  generated_at: string;
}

export interface AlexAnalysis {
  quality_score?: number;
  readability_score?: number;
  compliance_score?: number;
  completeness_score?: number;
  recommendations?: string[];
  identified_gaps?: string[];
  improvement_suggestions?: string[];
  generated_at: string;
}

export interface AlexInsights {
  trend_analysis?: string;
  benchmark_comparison?: string;
  improvement_opportunities?: string[];
  risk_indicators?: string[];
  recommendations?: string[];
  generated_at: string;
}

export interface AlexRecommendations {
  usage_tips?: string[];
  customization_suggestions?: string[];
  compliance_notes?: string[];
  best_practices?: string[];
  generated_at: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface Suggestion {
  id: string;
  type: 'improvement' | 'correction' | 'addition' | 'removal';
  description: string;
  section?: string;
  priority: Priority;
  created_at: string;
}

export interface Recommendation {
  id: string;
  category: 'content' | 'structure' | 'compliance' | 'process';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface Issue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'content' | 'compliance' | 'structure' | 'process';
  description: string;
  location?: string;
  suggested_fix?: string;
  created_at: string;
}

export interface ComplianceCheck {
  framework: string;
  requirements_met: number;
  total_requirements: number;
  compliance_percentage: number;
  gaps: string[];
  recommendations: string[];
  checked_at: string;
}

export interface CommunicationMaterial {
  id: string;
  type: 'email_template' | 'presentation' | 'summary' | 'infographic';
  title: string;
  content?: string;
  url?: string;
  created_at: string;
}

export interface TemplateSection {
  title: string;
  required: boolean;
  order: number;
  description?: string;
  placeholder?: string;
}

export interface RegulatoryRequirement {
  framework: string;
  requirement_id: string;
  description: string;
  mandatory: boolean;
}

// =====================================================
// INTERFACES PARA FORMULÁRIOS E FILTROS
// =====================================================

export interface PolicyFormData {
  title: string;
  description?: string;
  content?: string;
  category: PolicyCategory;
  policy_type: PolicyType;
  priority: Priority;
  effective_date?: string;
  expiry_date?: string;
  review_date?: string;
  tags?: string[];
  compliance_frameworks?: string[];
  requires_acknowledgment: boolean;
  is_mandatory: boolean;
  applies_to_all_users: boolean;
  target_audience?: string[];
  owner_id?: string;
}

export interface PolicyFilters {
  search_term?: string;
  categories?: PolicyCategory[];
  policy_types?: PolicyType[];
  statuses?: PolicyStatus[];
  priorities?: Priority[];
  workflow_stages?: WorkflowStage[];
  created_by?: string[];
  owner_id?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  expiry_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
  compliance_frameworks?: string[];
  requires_acknowledgment?: boolean;
  is_mandatory?: boolean;
  show_expired?: boolean;
  show_upcoming_reviews?: boolean;
  ai_generated?: boolean;
}

export interface PolicyMetrics {
  total_policies: number;
  policies_by_status: Record<PolicyStatus, number>;
  policies_by_category: Record<PolicyCategory, number>;
  policies_by_priority: Record<Priority, number>;
  pending_approvals: number;
  upcoming_reviews: number;
  expired_policies: number;
  compliance_rate: number;
  average_approval_time: number;
  acknowledgment_rate: number;
  alex_usage_rate: number;
}

// =====================================================
// INTERFACES PARA ALEX POLICY
// =====================================================

export interface AlexPolicyRequest {
  type: 'generate_content' | 'review_policy' | 'suggest_improvements' | 'compliance_check' | 'generate_metrics';
  policy_id?: string;
  context?: {
    category?: PolicyCategory;
    policy_type?: PolicyType;
    compliance_frameworks?: string[];
    target_audience?: string[];
    existing_content?: string;
  };
  parameters?: Record<string, any>;
}

export interface AlexPolicyResponse {
  success: boolean;
  data?: any;
  suggestions?: AlexSuggestions;
  analysis?: AlexAnalysis;
  insights?: AlexInsights;
  recommendations?: AlexRecommendations;
  error?: string;
  generated_at: string;
  confidence_score?: number;
}

// =====================================================
// INTERFACES PARA DASHBOARD E RELATÓRIOS
// =====================================================

export interface PolicyDashboardData {
  metrics: PolicyMetrics;
  recent_policies: PolicyV2[];
  pending_approvals: PolicyApproval[];
  upcoming_reviews: PolicyReview[];
  expiring_policies: PolicyV2[];
  alex_insights: AlexInsights[];
  compliance_summary: ComplianceCheck[];
}

export interface PolicyReport {
  id: string;
  title: string;
  type: 'compliance' | 'performance' | 'usage' | 'effectiveness';
  generated_at: string;
  generated_by: string;
  data: Record<string, any>;
  charts?: ChartData[];
  recommendations?: string[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  labels: string[];
  colors?: string[];
}

// =====================================================
// CONSTANTES
// =====================================================

export const POLICY_CATEGORIES: Record<PolicyCategory, string> = {
  governance: 'Governança Corporativa',
  compliance: 'Compliance e Regulamentação',
  security: 'Segurança da Informação',
  hr: 'Recursos Humanos',
  finance: 'Financeiro',
  operations: 'Operações',
  legal: 'Jurídico',
  quality: 'Qualidade',
  environmental: 'Meio Ambiente',
  health_safety: 'Saúde e Segurança'
};

export const POLICY_TYPES: Record<PolicyType, string> = {
  policy: 'Política',
  procedure: 'Procedimento',
  guideline: 'Diretriz',
  standard: 'Padrão',
  manual: 'Manual',
  code_of_conduct: 'Código de Conduta',
  regulation: 'Regulamento',
  instruction: 'Instrução'
};

export const POLICY_STATUSES: Record<PolicyStatus, string> = {
  draft: 'Rascunho',
  under_review: 'Em Revisão',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovada',
  published: 'Publicada',
  expired: 'Expirada',
  archived: 'Arquivada',
  rejected: 'Rejeitada',
  suspended: 'Suspensa'
};

export const WORKFLOW_STAGES: Record<WorkflowStage, string> = {
  elaboration: 'Elaboração',
  review: 'Revisão',
  approval: 'Aprovação',
  publication: 'Publicação',
  validity_management: 'Gestão da Validade'
};

export const PRIORITIES: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
};

export const REVIEW_TYPES: Record<ReviewType, string> = {
  technical: 'Técnica',
  legal: 'Jurídica',
  compliance: 'Compliance',
  business: 'Negócio',
  security: 'Segurança'
};

export const PUBLICATION_CHANNELS: Record<PublicationChannel, string> = {
  email: 'E-mail',
  intranet: 'Intranet',
  portal: 'Portal',
  meeting: 'Reunião',
  training: 'Treinamento'
};
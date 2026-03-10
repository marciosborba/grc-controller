// ============================================================================
// TIPOS PARA GESTÃO DE AUDITORIA
// ============================================================================
// Tipos robustos para gestão de auditorias baseados em melhores práticas de GRC

export type AuditStatus = 
  | 'Planning' | 'Fieldwork' | 'Review' | 'Reporting' | 'Follow-up' 
  | 'Closed' | 'Cancelled' | 'On Hold' | 'Draft';

export type AuditType = 
  | 'Internal Audit' | 'External Audit' | 'Regulatory Audit' | 'Certification Audit'
  | 'Vendor Audit' | 'Process Audit' | 'IT Audit' | 'Financial Audit'
  | 'Compliance Audit' | 'Follow-up Audit' | 'Special Investigation';

export type AuditPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type AuditScope = 
  | 'Organization-wide' | 'Department Specific' | 'Process Specific' 
  | 'System Specific' | 'Location Specific' | 'Project Specific' | 'Custom';

export type AuditFrequency = 
  | 'Ad-hoc' | 'Annual' | 'Semi-annual' | 'Quarterly' | 'Monthly' | 'Continuous';

export type FindingSeverity = 
  | 'Critical' | 'High' | 'Medium' | 'Low' | 'Observation';

export type FindingStatus = 
  | 'Open' | 'In Progress' | 'Resolved' | 'Verified' | 'Closed' | 'Overdue' | 'Accepted Risk';

export type FindingType = 
  | 'Control Deficiency' | 'Policy Violation' | 'Process Gap' | 'System Weakness'
  | 'Compliance Issue' | 'Best Practice' | 'Observation' | 'Risk Exposure';

export type AuditPhase = 
  | 'Planning' | 'Risk Assessment' | 'Control Testing' | 'Substantive Testing' 
  | 'Reporting' | 'Follow-up' | 'Closure';

export type TestingType = 
  | 'Walk-through' | 'Inquiry' | 'Observation' | 'Inspection' | 'Re-performance'
  | 'Analytical Review' | 'Sampling' | 'System Testing' | 'Data Analysis';

export type EvidenceType = 
  | 'Document' | 'Interview Notes' | 'Screenshots' | 'System Reports' 
  | 'Photographs' | 'Video Recording' | 'Audio Recording' | 'Database Query'
  | 'Log Files' | 'Configuration Files' | 'Email Correspondence' | 'Third-party Confirmation';

// ============================================================================
// INTERFACE PRINCIPAL - AUDIT
// ============================================================================
export interface Audit {
  id: string;
  
  // Informações Básicas
  title: string;
  description: string;
  audit_type: AuditType;
  audit_scope: AuditScope;
  scope_description: string;
  
  // Status e Prioridade
  status: AuditStatus;
  priority: AuditPriority;
  current_phase: AuditPhase;
  
  // Frequência e Planejamento
  frequency: AuditFrequency;
  is_recurring: boolean;
  parent_audit_id?: string; // For follow-up audits
  
  // Equipe de Auditoria
  lead_auditor: string;
  auditors: string[];
  auditee_contacts: string[];
  
  // Datas
  planned_start_date: Date;
  planned_end_date: Date;
  actual_start_date?: Date;
  actual_end_date?: Date;
  fieldwork_start_date?: Date;
  fieldwork_end_date?: Date;
  report_due_date?: Date;
  report_issued_date?: Date;
  
  // Objetivos e Critérios
  objectives: string[];
  audit_criteria: string[];
  applicable_regulations?: string[];
  applicable_standards?: string[];
  
  // Orçamento e Recursos
  budgeted_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  
  // Resultados
  overall_opinion?: 'Satisfactory' | 'Needs Improvement' | 'Unsatisfactory' | 'Adequate' | 'Inadequate';
  overall_rating?: number; // 1-5
  executive_summary?: string;
  key_findings_summary?: string;
  
  // Relacionamentos
  related_audits?: string[];
  related_risks?: string[];
  related_compliance_requirements?: string[];
  
  // Aprovações
  approved_by?: string;
  approved_at?: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  version: string;
  
  // Arquivos e Documentos
  working_papers?: AuditWorkingPaper[];
  findings?: AuditFinding[];
  recommendations?: AuditRecommendation[];
  
  // Configurações
  confidentiality_level: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  retention_period?: number; // years
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: Date;
  follow_up_responsible?: string;
  
  // Quality Assurance
  qa_reviewed?: boolean;
  qa_reviewer?: string;
  qa_review_date?: Date;
  qa_notes?: string;
}

// ============================================================================
// ACHADOS DE AUDITORIA
// ============================================================================
export interface AuditFinding {
  id: string;
  audit_id: string;
  
  // Informações Básicas
  title: string;
  description: string;
  finding_type: FindingType;
  severity: FindingSeverity;
  
  // Status e Rastreamento
  status: FindingStatus;
  finding_number: string; // Sequential numbering
  
  // Detalhes do Achado
  condition: string; // What was found
  criteria: string; // What should be
  cause: string; // Why it happened
  effect: string; // Impact/consequences
  
  // Contexto
  audit_area: string;
  control_reference?: string;
  regulation_reference?: string;
  
  // Classificação de Risco
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  risk_rating: 'Critical' | 'High' | 'Medium' | 'Low';
  
  // Evidências
  evidence: AuditEvidence[];
  working_paper_reference?: string;
  
  // Auditee Response
  management_response?: string;
  management_response_date?: Date;
  agreed_action?: string;
  target_resolution_date?: Date;
  responsible_person?: string;
  
  // Resolução
  resolution_description?: string;
  resolution_date?: Date;
  resolved_by?: string;
  verification_method?: string;
  verification_date?: Date;
  verified_by?: string;
  
  // Metadados
  identified_by: string;
  identified_at: Date;
  updated_by: string;
  updated_at: Date;
  
  // Follow-up
  follow_up_audit_id?: string;
  is_repeat_finding: boolean;
  previous_finding_id?: string;
  
  // Communication
  communicated_to?: string[];
  escalated: boolean;
  escalation_date?: Date;
  escalated_to?: string;
}

// ============================================================================
// RECOMENDAÇÕES DE AUDITORIA
// ============================================================================
export interface AuditRecommendation {
  id: string;
  audit_id: string;
  finding_id?: string; // Optional link to specific finding
  
  // Informações Básicas
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  
  // Categoria
  category: 'Control Enhancement' | 'Process Improvement' | 'Policy Update' 
    | 'Training' | 'System Enhancement' | 'Organizational' | 'Other';
  
  // Implementação
  implementation_effort: 'Low' | 'Medium' | 'High';
  estimated_cost?: number;
  estimated_time_to_implement?: number; // days
  
  // Responsabilidade
  responsible_person?: string;
  target_implementation_date?: Date;
  actual_implementation_date?: Date;
  
  // Status
  status: 'Open' | 'In Progress' | 'Implemented' | 'Verified' | 'Closed' | 'Rejected';
  
  // Acompanhamento
  management_response?: string;
  implementation_plan?: string;
  progress_notes?: string;
  
  // Verificação
  verification_method?: string;
  verification_date?: Date;
  verified_by?: string;
  verification_evidence?: string;
  
  // Benefícios Esperados
  expected_benefits?: string;
  risk_mitigation?: string;
  compliance_improvement?: string;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

// ============================================================================
// EVIDÊNCIAS DE AUDITORIA
// ============================================================================
export interface AuditEvidence {
  id: string;
  audit_id: string;
  finding_id?: string;
  working_paper_id?: string;
  
  // Informações da Evidência
  title: string;
  description: string;
  evidence_type: EvidenceType;
  
  // Arquivo
  file_name?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  
  // Metadados
  collected_by: string;
  collected_at: Date;
  collection_method: string;
  
  // Qualidade da Evidência
  reliability: 'High' | 'Medium' | 'Low';
  relevance: 'High' | 'Medium' | 'Low';
  sufficiency: 'Sufficient' | 'Insufficient';
  
  // Fonte
  evidence_source: string;
  source_contact?: string;
  
  // Custódia
  chain_of_custody?: Array<{
    person: string;
    date: Date;
    action: string;
    notes?: string;
  }>;
  
  // Análise
  analysis_performed?: string;
  conclusions?: string;
  
  // Retenção
  retention_required: boolean;
  retention_period?: number; // years
  destruction_date?: Date;
  
  // Confidencialidade
  confidentiality_level: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  access_restrictions?: string[];
}

// ============================================================================
// PAPÉIS DE TRABALHO (WORKING PAPERS)
// ============================================================================
export interface AuditWorkingPaper {
  id: string;
  audit_id: string;
  
  // Informações Básicas
  title: string;
  description?: string;
  paper_type: 'Test Plan' | 'Test Results' | 'Analysis' | 'Summary' | 'Checklist' 
    | 'Interview Notes' | 'Observation Log' | 'Control Matrix' | 'Risk Assessment' | 'Other';
  
  // Referência
  reference_number: string;
  section: string;
  
  // Conteúdo
  content: string;
  attachments?: string[];
  
  // Teste/Procedimento
  audit_procedure?: string;
  testing_method?: TestingType;
  sample_size?: number;
  population_size?: number;
  
  // Resultados
  test_results?: string;
  exceptions_noted?: string;
  conclusions?: string;
  
  // Revisão
  prepared_by: string;
  prepared_at: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  review_notes?: string;
  
  // Status
  status: 'Draft' | 'Under Review' | 'Approved' | 'Finalized';
  
  // Indexação
  index_references?: string[];
  cross_references?: string[];
  
  // Metadados
  version: number;
  updated_by: string;
  updated_at: Date;
}

// ============================================================================
// PROGRAMA DE AUDITORIA
// ============================================================================
export interface AuditProgram {
  id: string;
  audit_id: string;
  
  // Informações Básicas
  title: string;
  description?: string;
  audit_area: string;
  
  // Procedimentos
  procedures: AuditProcedure[];
  
  // Riscos e Controles
  key_risks: string[];
  controls_to_test: string[];
  
  // Recursos
  estimated_hours: number;
  assigned_auditor: string;
  
  // Status
  status: 'Draft' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled';
  
  // Datas
  start_date?: Date;
  completion_date?: Date;
  
  // Aprovação
  approved_by?: string;
  approved_at?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

// ============================================================================
// PROCEDIMENTOS DE AUDITORIA
// ============================================================================
export interface AuditProcedure {
  id: string;
  program_id: string;
  
  // Informações Básicas
  step_number: number;
  title: string;
  description: string;
  
  // Tipo de Procedimento
  procedure_type: TestingType;
  
  // Objetivo
  objective: string;
  control_being_tested?: string;
  
  // Execução
  instructions: string;
  sample_selection_method?: string;
  sample_size?: number;
  
  // Documentação
  working_paper_reference?: string;
  evidence_requirements: string[];
  
  // Status
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Not Applicable';
  
  // Resultados
  results?: string;
  exceptions?: string;
  conclusion?: string;
  
  // Responsabilidade
  assigned_to: string;
  estimated_hours: number;
  actual_hours?: number;
  
  // Datas
  planned_completion: Date;
  actual_completion?: Date;
  
  // Revisão
  reviewed_by?: string;
  reviewed_at?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

// ============================================================================
// MÉTRICAS E KPIs DE AUDITORIA
// ============================================================================
export interface AuditMetrics {
  total_audits: number;
  audits_by_status: Record<AuditStatus, number>;
  audits_by_type: Record<AuditType, number>;
  audits_by_priority: Record<AuditPriority, number>;
  
  // Findings
  total_findings: number;
  findings_by_severity: Record<FindingSeverity, number>;
  findings_by_status: Record<FindingStatus, number>;
  open_findings: number;
  overdue_findings: number;
  
  // Performance
  average_audit_duration: number; // days
  budget_variance_percentage: number;
  on_time_completion_rate: number;
  
  // Quality
  findings_resolved_within_target: number;
  repeat_findings_rate: number;
  client_satisfaction_score?: number;
  
  // Productivity
  audits_completed_per_auditor: number;
  hours_per_audit: number;
  findings_per_audit: number;
  
  // Trends
  audit_volume_trend: 'Increasing' | 'Decreasing' | 'Stable';
  finding_severity_trend: 'Improving' | 'Deteriorating' | 'Stable';
  
  // Coverage
  audit_coverage_by_area: Record<string, number>;
  risk_coverage_percentage: number;
}

// ============================================================================
// COMUNICAÇÃO DE AUDITORIA
// ============================================================================
export interface AuditCommunication {
  id: string;
  audit_id: string;
  
  // Tipo de Comunicação
  type: 'Opening Meeting' | 'Status Update' | 'Interim Report' | 'Draft Report' 
    | 'Final Report' | 'Management Response' | 'Follow-up' | 'Closure';
  
  // Destinatários
  recipients: Array<{
    name: string;
    email: string;
    role: string;
    organization?: string;
  }>;
  
  // Conteúdo
  subject: string;
  message: string;
  attachments?: string[];
  
  // Canal
  communication_method: 'Email' | 'Meeting' | 'Document' | 'Presentation' | 'Portal';
  
  // Status
  status: 'Draft' | 'Sent' | 'Delivered' | 'Acknowledged' | 'Responded';
  
  // Datas
  scheduled_date?: Date;
  sent_at?: Date;
  delivered_at?: Date;
  acknowledged_at?: Date;
  response_received_at?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  template_used?: string;
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: Date;
  follow_up_notes?: string;
}

// ============================================================================
// REQUESTS PARA APIs
// ============================================================================
export interface CreateAuditRequest {
  title: string;
  description: string;
  audit_type: AuditType;
  audit_scope: AuditScope;
  scope_description: string;
  priority: AuditPriority;
  lead_auditor: string;
  auditors: string[];
  auditee_contacts: string[];
  planned_start_date: Date;
  planned_end_date: Date;
  objectives: string[];
  audit_criteria: string[];
  budgeted_hours?: number;
  estimated_cost?: number;
  frequency?: AuditFrequency;
  is_recurring?: boolean;
}

export interface UpdateAuditRequest extends Partial<CreateAuditRequest> {
  status?: AuditStatus;
  current_phase?: AuditPhase;
  actual_start_date?: Date;
  actual_end_date?: Date;
  actual_hours?: number;
  actual_cost?: number;
  overall_opinion?: 'Satisfactory' | 'Needs Improvement' | 'Unsatisfactory' | 'Adequate' | 'Inadequate';
  overall_rating?: number;
  executive_summary?: string;
}

export interface CreateFindingRequest {
  audit_id: string;
  title: string;
  description: string;
  finding_type: FindingType;
  severity: FindingSeverity;
  condition: string;
  criteria: string;
  cause: string;
  effect: string;
  audit_area: string;
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  evidence?: Omit<AuditEvidence, 'id' | 'audit_id' | 'finding_id' | 'collected_at'>[];
}

export interface CreateRecommendationRequest {
  audit_id: string;
  finding_id?: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Control Enhancement' | 'Process Improvement' | 'Policy Update' 
    | 'Training' | 'System Enhancement' | 'Organizational' | 'Other';
  implementation_effort: 'Low' | 'Medium' | 'High';
  responsible_person?: string;
  target_implementation_date?: Date;
  estimated_cost?: number;
  expected_benefits?: string;
}

export interface CreateEvidenceRequest {
  audit_id: string;
  finding_id?: string;
  title: string;
  description: string;
  evidence_type: EvidenceType;
  collection_method: string;
  evidence_source: string;
  reliability: 'High' | 'Medium' | 'Low';
  relevance: 'High' | 'Medium' | 'Low';
  file_url?: string;
  file_name?: string;
}

// ============================================================================
// FILTROS E PESQUISA
// ============================================================================
export interface AuditFilters {
  searchTerm?: string;
  audit_types?: AuditType[];
  statuses?: AuditStatus[];
  priorities?: AuditPriority[];
  scopes?: AuditScope[];
  phases?: AuditPhase[];
  lead_auditors?: string[];
  date_from?: Date;
  date_to?: Date;
  show_overdue?: boolean;
  show_follow_up_required?: boolean;
  overall_opinion?: ('Satisfactory' | 'Needs Improvement' | 'Unsatisfactory' | 'Adequate' | 'Inadequate')[];
}

export interface FindingFilters {
  searchTerm?: string;
  audit_ids?: string[];
  finding_types?: FindingType[];
  severities?: FindingSeverity[];
  statuses?: FindingStatus[];
  risk_ratings?: ('Critical' | 'High' | 'Medium' | 'Low')[];
  responsible_persons?: string[];
  due_date_from?: Date;
  due_date_to?: Date;
  show_overdue?: boolean;
  show_repeat_findings?: boolean;
}

// ============================================================================
// CONSTANTES E ENUMS
// ============================================================================
export const AUDIT_STATUSES: AuditStatus[] = [
  'Planning', 'Fieldwork', 'Review', 'Reporting', 'Follow-up', 
  'Closed', 'Cancelled', 'On Hold', 'Draft'
];

export const AUDIT_TYPES: AuditType[] = [
  'Internal Audit', 'External Audit', 'Regulatory Audit', 'Certification Audit',
  'Vendor Audit', 'Process Audit', 'IT Audit', 'Financial Audit',
  'Compliance Audit', 'Follow-up Audit', 'Special Investigation'
];

export const AUDIT_PRIORITIES: AuditPriority[] = [
  'Critical', 'High', 'Medium', 'Low'
];

export const FINDING_SEVERITIES: FindingSeverity[] = [
  'Critical', 'High', 'Medium', 'Low', 'Observation'
];

export const FINDING_STATUSES: FindingStatus[] = [
  'Open', 'In Progress', 'Resolved', 'Verified', 'Closed', 'Overdue', 'Accepted Risk'
];

export const FINDING_TYPES: FindingType[] = [
  'Control Deficiency', 'Policy Violation', 'Process Gap', 'System Weakness',
  'Compliance Issue', 'Best Practice', 'Observation', 'Risk Exposure'
];

export const EVIDENCE_TYPES: EvidenceType[] = [
  'Document', 'Interview Notes', 'Screenshots', 'System Reports',
  'Photographs', 'Video Recording', 'Audio Recording', 'Database Query',
  'Log Files', 'Configuration Files', 'Email Correspondence', 'Third-party Confirmation'
];

// ============================================================================
// HELPERS E UTILITIES
// ============================================================================
export const getAuditStatusColor = (status: AuditStatus): string => {
  const colorMap: Record<AuditStatus, string> = {
    'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
    'Planning': 'bg-blue-100 text-blue-800 border-blue-200',
    'Fieldwork': 'bg-orange-100 text-orange-800 border-orange-200',
    'Review': 'bg-purple-100 text-purple-800 border-purple-200',
    'Reporting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Follow-up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Closed': 'bg-green-100 text-green-800 border-green-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'On Hold': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getFindingSeverityColor = (severity: FindingSeverity): string => {
  const colorMap: Record<FindingSeverity, string> = {
    'Critical': 'text-red-600',
    'High': 'text-orange-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-blue-600',
    'Observation': 'text-gray-600'
  };
  return colorMap[severity] || 'text-gray-600';
};

export const calculateAuditProgress = (audit: Audit): number => {
  const phaseWeights: Record<AuditPhase, number> = {
    'Planning': 15,
    'Risk Assessment': 25,
    'Control Testing': 40,
    'Substantive Testing': 60,
    'Reporting': 85,
    'Follow-up': 95,
    'Closure': 100
  };
  
  return phaseWeights[audit.current_phase] || 0;
};

export const getAuditRiskScore = (findings: AuditFinding[]): number => {
  let score = 0;
  findings.forEach(finding => {
    switch (finding.severity) {
      case 'Critical': score += 10; break;
      case 'High': score += 5; break;
      case 'Medium': score += 2; break;
      case 'Low': score += 1; break;
      default: break;
    }
  });
  return score;
};

export const isAuditOverdue = (audit: Audit): boolean => {
  if (!audit.planned_end_date) return false;
  return new Date(audit.planned_end_date) < new Date() && 
         !['Closed', 'Cancelled'].includes(audit.status);
};

export const calculateCompletionRate = (procedures: AuditProcedure[]): number => {
  if (procedures.length === 0) return 0;
  const completed = procedures.filter(p => p.status === 'Completed').length;
  return Math.round((completed / procedures.length) * 100);
};
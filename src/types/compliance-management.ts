// ============================================================================
// TIPOS PARA GESTÃO DE CONFORMIDADE (COMPLIANCE)
// ============================================================================
// Tipos robustos para gestão de conformidade baseados em melhores práticas de GRC

export type ComplianceStatus = 
  | 'Not Started' | 'In Progress' | 'Compliant' | 'Non-Compliant' 
  | 'Partially Compliant' | 'Under Review' | 'Remediation Required' | 'Exception Granted';

export type CompliancePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplianceFramework = 
  | 'ISO 27001' | 'ISO 27002' | 'NIST CSF' | 'SOX' | 'LGPD' | 'GDPR' 
  | 'PCI DSS' | 'HIPAA' | 'COBIT' | 'ITIL' | 'SOC 2' | 'CIS Controls'
  | 'Custom Framework';

export type ComplianceCategory = 
  | 'Information Security' | 'Data Privacy' | 'Financial Controls' 
  | 'Operational Controls' | 'Risk Management' | 'Business Continuity'
  | 'Human Resources' | 'Legal & Regulatory' | 'IT Governance' | 'Quality Management';

export type EvidenceType = 
  | 'Document' | 'Screenshot' | 'Certificate' | 'Report' | 'Interview Notes' 
  | 'Test Results' | 'Log Files' | 'Policy' | 'Procedure' | 'Configuration';

export type AssessmentType = 
  | 'Self Assessment' | 'Internal Audit' | 'External Audit' | 'Vendor Assessment' 
  | 'Gap Analysis' | 'Maturity Assessment' | 'Compliance Review' | 'Penetration Test';

export type RemediationStatus = 
  | 'Open' | 'In Progress' | 'Completed' | 'Verified' | 'Closed' | 'Overdue' | 'On Hold';

// ============================================================================
// INTERFACE PRINCIPAL - COMPLIANCE REQUIREMENT
// ============================================================================
export interface ComplianceRequirement {
  id: string;
  
  // Informações Básicas
  title: string;
  description: string;
  framework: ComplianceFramework;
  control_id: string;
  category: ComplianceCategory;
  
  // Status e Prioridade
  status: ComplianceStatus;
  priority: CompliancePriority;
  
  // Avaliação
  current_maturity_level?: number; // 1-5
  target_maturity_level?: number; // 1-5
  compliance_score?: number; // 0-100
  
  // Responsabilidade
  owner: string;
  assignedTo?: string;
  reviewer?: string;
  
  // Datas
  due_date?: Date;
  last_assessment_date?: Date;
  next_assessment_date?: Date;
  
  // Evidências
  evidence?: ComplianceEvidence[];
  
  // Remediação
  remediation_plan?: string;
  remediation_status?: RemediationStatus;
  remediation_due_date?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  version: string;
  
  // Relacionamentos
  related_requirements?: string[];
  parent_requirement_id?: string;
  child_requirements?: string[];
  
  // Campos adicionais
  business_justification?: string;
  testing_procedures?: string;
  control_frequency?: string;
  automated_control?: boolean;
  cost_of_compliance?: number;
  risk_if_non_compliant?: string;
}

// ============================================================================
// EVIDÊNCIAS DE CONFORMIDADE
// ============================================================================
export interface ComplianceEvidence {
  id: string;
  requirement_id: string;
  
  // Informações da Evidência
  title: string;
  description?: string;
  evidence_type: EvidenceType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  
  // Metadados
  collected_by: string;
  collected_at: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  
  // Validade
  valid_from?: Date;
  valid_until?: Date;
  is_expired?: boolean;
  
  // Status
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired';
  review_notes?: string;
  
  // Relacionamentos
  assessment_id?: string;
  audit_id?: string;
}

// ============================================================================
// ASSESSMENTS DE CONFORMIDADE
// ============================================================================
export interface ComplianceAssessment {
  id: string;
  
  // Informações Básicas
  title: string;
  description?: string;
  framework: ComplianceFramework;
  assessment_type: AssessmentType;
  
  // Escopo
  scope_description: string;
  included_requirements: string[];
  excluded_requirements?: string[];
  
  // Status e Progresso
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'Cancelled';
  progress_percentage: number;
  
  // Equipe
  lead_assessor: string;
  assessors: string[];
  reviewers: string[];
  
  // Datas
  planned_start_date: Date;
  planned_end_date: Date;
  actual_start_date?: Date;
  actual_end_date?: Date;
  
  // Resultados
  overall_score?: number;
  findings?: ComplianceFinding[];
  recommendations?: string[];
  
  // Relatórios
  executive_summary?: string;
  detailed_findings?: string;
  remediation_roadmap?: string;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  
  // Aprovação
  approved_by?: string;
  approved_at?: Date;
  approval_notes?: string;
}

// ============================================================================
// ACHADOS DE CONFORMIDADE
// ============================================================================
export interface ComplianceFinding {
  id: string;
  assessment_id: string;
  requirement_id?: string;
  
  // Informações do Achado
  title: string;
  description: string;
  finding_type: 'Gap' | 'Weakness' | 'Non-Compliance' | 'Best Practice' | 'Observation';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  
  // Status
  status: 'Open' | 'In Remediation' | 'Remediated' | 'Verified' | 'Closed' | 'Accepted Risk';
  
  // Detalhes
  current_state: string;
  expected_state: string;
  business_impact: string;
  
  // Remediação
  remediation_plan?: string;
  remediation_owner?: string;
  remediation_due_date?: Date;
  remediation_effort?: string;
  remediation_cost?: number;
  
  // Evidências
  evidence_references?: string[];
  supporting_documents?: string[];
  
  // Rastreamento
  identified_by: string;
  identified_at: Date;
  last_updated_by: string;
  last_updated_at: Date;
  
  // Aprovação
  approved_by?: string;
  approved_at?: Date;
  closure_evidence?: string;
}

// ============================================================================
// MÉTRICAS E KPIs DE CONFORMIDADE
// ============================================================================
export interface ComplianceMetrics {
  total_requirements: number;
  compliant_requirements: number;
  non_compliant_requirements: number;
  partially_compliant_requirements: number;
  overdue_requirements: number;
  
  compliance_percentage: number;
  average_maturity_score: number;
  
  requirements_by_status: Record<ComplianceStatus, number>;
  requirements_by_framework: Record<ComplianceFramework, number>;
  requirements_by_category: Record<ComplianceCategory, number>;
  requirements_by_priority: Record<CompliancePriority, number>;
  
  upcoming_assessments: number;
  overdue_evidence: number;
  pending_reviews: number;
  
  // Tendências
  compliance_trend: 'Improving' | 'Declining' | 'Stable';
  last_trend_calculation: Date;
  
  // Por Framework
  framework_scores: Array<{
    framework: ComplianceFramework;
    score: number;
    requirements_count: number;
    compliant_count: number;
  }>;
}

// ============================================================================
// COMUNICAÇÃO E RELATÓRIOS
// ============================================================================
export interface ComplianceCommunication {
  id: string;
  requirement_id?: string;
  assessment_id?: string;
  
  // Tipo de Comunicação
  type: 'Status Update' | 'Non-Compliance Alert' | 'Assessment Report' | 'Remediation Plan' | 'Executive Summary';
  
  // Destinatários
  recipients: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  
  // Conteúdo
  subject: string;
  message: string;
  attachments?: string[];
  
  // Status
  status: 'Draft' | 'Sent' | 'Delivered' | 'Read' | 'Responded';
  sent_at?: Date;
  read_at?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  template_used?: string;
  scheduled_send?: Date;
}

// ============================================================================
// CONFIGURAÇÕES DE FRAMEWORK
// ============================================================================
export interface FrameworkConfiguration {
  id: string;
  framework: ComplianceFramework;
  version: string;
  
  // Configurações
  maturity_levels: Array<{
    level: number;
    name: string;
    description: string;
    criteria: string[];
  }>;
  
  control_families: Array<{
    family_id: string;
    name: string;
    description: string;
    controls: string[];
  }>;
  
  assessment_frequency: string;
  mandatory_evidence_types: EvidenceType[];
  
  // Scoring
  scoring_methodology: string;
  passing_score: number;
  weight_by_priority: Record<CompliancePriority, number>;
  
  // Metadados
  configured_by: string;
  configured_at: Date;
  last_updated_by: string;
  last_updated_at: Date;
  is_active: boolean;
}

// ============================================================================
// REQUESTS PARA APIs
// ============================================================================
export interface CreateComplianceRequirementRequest {
  title: string;
  description: string;
  framework: ComplianceFramework;
  control_id: string;
  category: ComplianceCategory;
  priority: CompliancePriority;
  owner: string;
  assignedTo?: string;
  due_date?: Date;
  target_maturity_level?: number;
  business_justification?: string;
  testing_procedures?: string;
  control_frequency?: string;
  automated_control?: boolean;
}

export interface UpdateComplianceRequirementRequest extends Partial<CreateComplianceRequirementRequest> {
  status?: ComplianceStatus;
  current_maturity_level?: number;
  compliance_score?: number;
  last_assessment_date?: Date;
  next_assessment_date?: Date;
  remediation_plan?: string;
  remediation_status?: RemediationStatus;
  remediation_due_date?: Date;
}

export interface CreateEvidenceRequest {
  requirement_id: string;
  title: string;
  description?: string;
  evidence_type: EvidenceType;
  file_url?: string;
  file_name?: string;
  valid_from?: Date;
  valid_until?: Date;
}

export interface CreateAssessmentRequest {
  title: string;
  description?: string;
  framework: ComplianceFramework;
  assessment_type: AssessmentType;
  scope_description: string;
  included_requirements: string[];
  lead_assessor: string;
  assessors: string[];
  planned_start_date: Date;
  planned_end_date: Date;
}

export interface CreateFindingRequest {
  assessment_id: string;
  requirement_id?: string;
  title: string;
  description: string;
  finding_type: 'Gap' | 'Weakness' | 'Non-Compliance' | 'Best Practice' | 'Observation';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  current_state: string;
  expected_state: string;
  business_impact: string;
  remediation_plan?: string;
  remediation_owner?: string;
  remediation_due_date?: Date;
}

// ============================================================================
// FILTROS E PESQUISA
// ============================================================================
export interface ComplianceFilters {
  searchTerm?: string;
  frameworks?: ComplianceFramework[];
  statuses?: ComplianceStatus[];
  priorities?: CompliancePriority[];
  categories?: ComplianceCategory[];
  owners?: string[];
  assignees?: string[];
  due_date_from?: Date;
  due_date_to?: Date;
  maturity_level_min?: number;
  maturity_level_max?: number;
  show_overdue?: boolean;
  show_expired_evidence?: boolean;
  compliance_score_min?: number;
  compliance_score_max?: number;
}

// ============================================================================
// CONSTANTES E ENUMS
// ============================================================================
export const COMPLIANCE_STATUSES: ComplianceStatus[] = [
  'Not Started', 'In Progress', 'Compliant', 'Non-Compliant',
  'Partially Compliant', 'Under Review', 'Remediation Required', 'Exception Granted'
];

export const COMPLIANCE_PRIORITIES: CompliancePriority[] = [
  'Critical', 'High', 'Medium', 'Low'
];

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  'ISO 27001', 'ISO 27002', 'NIST CSF', 'SOX', 'LGPD', 'GDPR',
  'PCI DSS', 'HIPAA', 'COBIT', 'ITIL', 'SOC 2', 'CIS Controls', 'Custom Framework'
];

export const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  'Information Security', 'Data Privacy', 'Financial Controls',
  'Operational Controls', 'Risk Management', 'Business Continuity',
  'Human Resources', 'Legal & Regulatory', 'IT Governance', 'Quality Management'
];

export const EVIDENCE_TYPES: EvidenceType[] = [
  'Document', 'Screenshot', 'Certificate', 'Report', 'Interview Notes',
  'Test Results', 'Log Files', 'Policy', 'Procedure', 'Configuration'
];

export const ASSESSMENT_TYPES: AssessmentType[] = [
  'Self Assessment', 'Internal Audit', 'External Audit', 'Vendor Assessment',
  'Gap Analysis', 'Maturity Assessment', 'Compliance Review', 'Penetration Test'
];

// ============================================================================
// HELPERS E UTILITIES
// ============================================================================
export const getStatusColor = (status: ComplianceStatus): string => {
  const colorMap: Record<ComplianceStatus, string> = {
    'Not Started': 'bg-gray-100 text-gray-800 border-gray-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Compliant': 'bg-green-100 text-green-800 border-green-200',
    'Non-Compliant': 'bg-red-100 text-red-800 border-red-200',
    'Partially Compliant': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Under Review': 'bg-purple-100 text-purple-800 border-purple-200',
    'Remediation Required': 'bg-orange-100 text-orange-800 border-orange-200',
    'Exception Granted': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getPriorityColor = (priority: CompliancePriority): string => {
  const colorMap: Record<CompliancePriority, string> = {
    'Critical': 'text-red-600',
    'High': 'text-orange-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-green-600'
  };
  return colorMap[priority] || 'text-gray-600';
};

export const calculateComplianceScore = (requirements: ComplianceRequirement[]): number => {
  if (requirements.length === 0) return 0;
  
  const compliantCount = requirements.filter(r => r.status === 'Compliant').length;
  const partiallyCompliantCount = requirements.filter(r => r.status === 'Partially Compliant').length;
  
  return Math.round(((compliantCount + (partiallyCompliantCount * 0.5)) / requirements.length) * 100);
};

export const getMaturityLevel = (score: number): { level: number; label: string } => {
  if (score >= 90) return { level: 5, label: 'Otimizado' };
  if (score >= 75) return { level: 4, label: 'Gerenciado' };
  if (score >= 60) return { level: 3, label: 'Definido' };
  if (score >= 40) return { level: 2, label: 'Repetível' };
  return { level: 1, label: 'Inicial' };
};
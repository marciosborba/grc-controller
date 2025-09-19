// Assessment Governance Types
// Tipos para governança de assessments

export interface AssessmentWorkflow {
  id: string;
  currentStatus: AssessmentStatus;
  currentPhase: AssessmentPhase;
  allowedTransitions: AssessmentTransition[];
  requiredRoles: AssessmentRole[];
  requiredApprovals: ApprovalRequirement[];
}

export type AssessmentStatus = 
  | 'draft'           // Rascunho - Em criação
  | 'planejado'       // Planejado - Aprovado para execução
  | 'em_andamento'    // Em andamento - Em execução
  | 'em_revisao'      // Em revisão - Aguardando revisão
  | 'revisado'        // Revisado - Aprovado na revisão
  | 'concluido'       // Concluído - Finalizado
  | 'cancelado'       // Cancelado - Cancelado
  | 'suspenso';       // Suspenso - Temporariamente parado

export type AssessmentPhase = 
  | 'preparacao'      // Preparação - Definindo escopo e equipe
  | 'planejamento'    // Planejamento - Criando plano detalhado
  | 'coleta_dados'    // Coleta de dados - Executando assessment
  | 'analise'         // Análise - Analisando resultados
  | 'revisao'         // Revisão - Revisão técnica
  | 'aprovacao'       // Aprovação - Aprovação final
  | 'relatorio'       // Relatório - Geração de relatórios
  | 'followup';       // Follow-up - Acompanhamento

export type AssessmentRole = 
  | 'assessment_manager'    // Gerente do Assessment
  | 'assessment_lead'       // Líder do Assessment
  | 'respondent'           // Respondente
  | 'reviewer'             // Revisor
  | 'approver'             // Aprovador
  | 'auditor'              // Auditor
  | 'stakeholder';         // Stakeholder

export interface AssessmentTransition {
  from: AssessmentStatus;
  to: AssessmentStatus;
  requiredRole: AssessmentRole;
  requiredPhase?: AssessmentPhase;
  validationRules: ValidationRule[];
  automaticActions?: AutomaticAction[];
}

export interface ApprovalRequirement {
  role: AssessmentRole;
  required: boolean;
  comments_required: boolean;
  evidence_required: boolean;
}

export interface ValidationRule {
  id: string;
  description: string;
  type: 'mandatory' | 'warning' | 'info';
  validator: (assessment: any) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  infos: string[];
}

export interface AutomaticAction {
  type: 'notification' | 'assignment' | 'calculation' | 'log';
  target: string;
  parameters: Record<string, any>;
}

export interface AssessmentAuditLog {
  id: string;
  tenant_id: string;
  assessment_id: string;
  action: AuditAction;
  user_id: string;
  user_role: AssessmentRole;
  timestamp: Date;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  comments?: string;
  ip_address?: string;
  user_agent?: string;
}

export type AuditAction = 
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'phase_changed'
  | 'assigned'
  | 'responded'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'suspended'
  | 'resumed'
  | 'deleted';

export interface AssessmentMetrics {
  total_questions: number;
  answered_questions: number;
  pending_questions: number;
  reviewed_questions: number;
  approved_questions: number;
  completion_percentage: number;
  quality_score: number;
  confidence_level: number;
  gaps_identified: number;
  critical_gaps: number;
  high_gaps: number;
  medium_gaps: number;
  low_gaps: number;
}

export interface AssessmentQualityControl {
  id: string;
  assessment_id: string;
  quality_checks: QualityCheck[];
  overall_score: number;
  status: 'passed' | 'failed' | 'warning';
  reviewed_by: string;
  reviewed_at: Date;
  comments: string;
}

export interface QualityCheck {
  id: string;
  name: string;
  description: string;
  type: 'completeness' | 'consistency' | 'evidence' | 'scoring';
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  score: number;
  max_score: number;
  details: string;
  recommendations: string[];
}

// Configurações de governança por organização
export interface AssessmentGovernanceConfig {
  tenant_id: string;
  workflow_enabled: boolean;
  approval_required: boolean;
  quality_control_enabled: boolean;
  audit_log_retention_days: number;
  allowed_roles: AssessmentRole[];
  workflow_rules: AssessmentTransition[];
  quality_thresholds: {
    minimum_completion: number;
    minimum_quality_score: number;
    minimum_confidence: number;
  };
  notification_settings: {
    status_changes: boolean;
    assignment_changes: boolean;
    deadline_reminders: boolean;
    quality_issues: boolean;
  };
}
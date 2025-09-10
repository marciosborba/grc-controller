// ============================================================================
// TIPOS PARA GESTÃO DE RISCOS CORPORATIVOS
// ============================================================================
// Tipos melhorados para gestão de riscos com base em boas práticas de GRC

export type RiskLevel = 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo' | 'Muito Baixo';
export type RiskStatus = 'Identificado' | 'Avaliado' | 'Em Tratamento' | 'Monitorado' | 'Fechado' | 'Reaberto';
export type TreatmentType = 'Mitigar' | 'Transferir' | 'Evitar' | 'Aceitar';
export type RiskCategory = 
  | 'Estratégico' 
  | 'Operacional' 
  | 'Financeiro' 
  | 'Tecnológico' 
  | 'Regulatório' 
  | 'Reputacional' 
  | 'Segurança da Informação' 
  | 'Terceiros' 
  | 'Ambiental' 
  | 'Recursos Humanos';

// Tipos específicos para análise de risco
export type RiskAnalysisType = 
  | 'Técnico' 
  | 'Fornecedor' 
  | 'Processo' 
  | 'Incidente' 
  | 'Estratégico' 
  | 'Operacional';

export type MatrixSize = '4x4' | '5x5';

export interface RiskAssessmentQuestion {
  id: string;
  question: string;
  category: 'probability' | 'impact';
}

export interface RiskAssessmentAnswer {
  questionId: string;
  value: number; // 1-5
  label: string;
}

export interface RiskAnalysisData {
  riskType: RiskAnalysisType;
  matrixSize: MatrixSize;
  probabilityAnswers: RiskAssessmentAnswer[];
  impactAnswers: RiskAssessmentAnswer[];
  probabilityScore: number; // média calculada
  impactScore: number; // média calculada
  qualitativeRiskLevel: RiskLevel;
  gutAnalysis?: GUTAnalysis;
}

export interface GUTAnalysis {
  gravity: number; // 1-5
  urgency: number; // 1-5
  tendency: number; // 1-5
  gutScore: number; // gravity * urgency * tendency
  priority: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa' | 'Muito Baixa';
}

export type ActivityStatus = 'TBD' | 'Em Andamento' | 'Aguardando' | 'Concluído' | 'Cancelado' | 'Atrasado';
export type CommunicationDecision = 'Aceitar' | 'Rejeitar' | 'Pendente';

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

export interface Risk {
  id: string;
  riskCode?: string; // ID sequencial no formato 001/08/25
  
  // Informações Básicas
  name: string;
  description?: string;
  executiveSummary?: string;
  category: RiskCategory;
  
  // Avaliação de Risco
  probability: number; // 1-5
  impact: number; // 1-5
  riskScore: number; // Calculado: probability * impact
  riskLevel: RiskLevel; // Calculado baseado no score
  
  // Análise Estruturada de Risco (nova funcionalidade)
  analysisData?: RiskAnalysisData;
  
  // Arrays de dados relacionados (carregados via JOIN)
  risk_registration_action_plans?: any[];
  risk_stakeholders?: any[];
  
  // Gestão
  status: RiskStatus;
  treatmentType: TreatmentType;
  owner: string; // Responsável pelo risco
  assignedTo?: string; // Responsável pelas ações
  
  // Datas e Controle
  identifiedDate: Date;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  dueDate?: Date;
  
  // Controle de auditoria
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Dados expandidos
  technicalDetails?: string;
  attachments?: RiskAttachment[];
  
  // Relacionamentos
  actionPlan?: ActionPlan;
  acceptanceLetter?: RiskAcceptanceLetter;
  communications?: RiskCommunication[];
  changeLog?: RiskChangeLog[];
  
  // ============================================================================
  // CAMPOS ADICIONAIS DO WIZARD DE REGISTRO
  // ============================================================================
  
  // Etapa 1: Identificação
  source?: string; // Fonte do risco
  responsibleArea?: string; // Área responsável
  
  // Etapa 2: Análise
  analysisMethodology?: string; // Metodologia de análise
  
  // Etapa 3: Classificação GUT
  gut_gravity?: number; // Gravidade (1-5)
  gut_urgency?: number; // Urgência (1-5)
  gut_tendency?: number; // Tendência (1-5)
  gut_priority?: string; // Prioridade calculada
  
  // Etapa 4: Tratamento
  treatment_rationale?: string; // Justificativa do tratamento
  treatment_cost?: number; // Custo do tratamento
  treatment_timeline?: string; // Cronograma do tratamento
  
  // Etapa 5: Plano de Ação - Atividade 1
  activity_1_name?: string;
  activity_1_description?: string;
  activity_1_responsible?: string;
  activity_1_email?: string;
  activity_1_priority?: string;
  activity_1_status?: string;
  activity_1_due_date?: Date;
  
  // Etapa 6: Comunicação - Pessoas de Ciência
  awareness_person_1_name?: string;
  awareness_person_1_position?: string;
  awareness_person_1_email?: string;
  
  // Etapa 6: Comunicação - Pessoas de Aprovação
  approval_person_1_name?: string;
  approval_person_1_position?: string;
  approval_person_1_email?: string;
  approval_person_1_status?: string;
  
  // Etapa 7: Monitoramento
  monitoring_frequency?: string; // Frequência de monitoramento
  monitoring_responsible?: string; // Responsável pelo monitoramento
  residual_impact?: number; // Impacto residual
  residual_likelihood?: number; // Probabilidade residual
  residual_score?: number; // Score residual
  closure_criteria?: string; // Critérios de encerramento
  closure_notes?: string; // Notas de encerramento
  closure_date?: Date; // Data de encerramento
}

// ============================================================================
// PLANO DE AÇÃO
// ============================================================================

export interface ActionPlan {
  id: string;
  riskId: string;
  treatmentType: TreatmentType;
  description?: string;
  targetDate?: Date;
  budget?: number;
  approvedBy?: string;
  approvalDate?: Date;
  
  activities: Activity[];
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  actionPlanId: string;
  
  name: string;
  details?: string;
  dueDate?: Date;
  responsible: string;
  status: ActivityStatus;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  
  // Evidências
  evidenceUrl?: string;
  evidenceDescription?: string;
  completionPercentage: number; // 0-100
  
  // Controles
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Comentários e histórico
  comments?: ActivityComment[];
}

export interface ActivityComment {
  id: string;
  activityId: string;
  comment: string;
  author: string;
  createdAt: Date;
}

// ============================================================================
// CARTA DE ACEITAÇÃO DE RISCO
// ============================================================================

export interface RiskAcceptanceLetter {
  id: string;
  riskId: string;
  
  // Justificativa
  justification: string;
  compensatingControls?: string;
  businessJustification: string;
  
  // Aprovação
  approver: string;
  approverTitle?: string;
  approvalDate: Date;
  validUntil?: Date;
  
  // Condições de revisão
  reviewConditions?: string;
  kris?: string; // Key Risk Indicators
  
  // PDF e documentação
  pdfPath?: string;
  digitalSignature?: string;
  
  // Controle
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

// ============================================================================
// COMUNICAÇÃO E NOTIFICAÇÕES
// ============================================================================

export interface RiskCommunication {
  id: string;
  riskId: string;
  type: 'Apontamento' | 'Carta de Risco' | 'Plano de Ação' | 'Revisão' | 'Notificação';
  
  // Destinatário
  recipientName: string;
  recipientEmail: string;
  recipientTitle?: string;
  
  // Comunicação
  subject: string;
  message?: string;
  decision?: CommunicationDecision;
  decisionJustification?: string;
  
  // Status e datas
  sentAt?: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  followUpDate?: Date;
  
  // Controle
  createdBy: string;
  createdAt: Date;
  isUrgent: boolean;
}

// ============================================================================
// ANEXOS E EVIDÊNCIAS
// ============================================================================

export interface RiskAttachment {
  id: string;
  riskId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
  isEvidence: boolean;
}

// ============================================================================
// LOG DE MUDANÇAS
// ============================================================================

export interface RiskChangeLog {
  id: string;
  riskId: string;
  changeType: 'Criação' | 'Atualização' | 'Status' | 'Avaliação' | 'Tratamento' | 'Fechamento';
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  changedBy: string;
  changedAt: Date;
}

// ============================================================================
// MÉTRICAS E KRIs
// ============================================================================

export interface RiskMetrics {
  totalRisks: number;
  risksByLevel: Record<RiskLevel, number>;
  risksByCategory: Record<RiskCategory, number>;
  risksByStatus: Record<RiskStatus, number>;
  overdueActivities: number;
  riskTrend: 'Aumentando' | 'Diminuindo' | 'Estável';
  averageResolutionTime: number; // em dias
}

export interface KRI {
  id: string;
  name: string;
  description: string;
  threshold: number;
  currentValue: number;
  trend: 'Subindo' | 'Descendo' | 'Estável';
  lastUpdated: Date;
  category: RiskCategory;
}

// ============================================================================
// MATRIX DE RISCO
// ============================================================================

export interface RiskMatrix {
  probability: {
    1: 'Muito Baixa (< 10%)';
    2: 'Baixa (10-30%)';
    3: 'Média (30-50%)';
    4: 'Alta (50-80%)';
    5: 'Muito Alta (> 80%)';
  };
  impact: {
    1: 'Insignificante';
    2: 'Menor';
    3: 'Moderado';
    4: 'Maior';
    5: 'Catastrófico';
  };
  levels: {
    'Muito Baixo': { min: 1; max: 4; color: '#22c55e' };
    'Baixo': { min: 5; max: 8; color: '#84cc16' };
    'Médio': { min: 9; max: 12; color: '#eab308' };
    'Alto': { min: 13; max: 20; color: '#f97316' };
    'Muito Alto': { min: 21; max: 25; color: '#ef4444' };
  };
}

// ============================================================================
// REQUESTS E RESPONSES PARA API
// ============================================================================

export interface CreateRiskRequest {
  name: string;
  description?: string;
  executiveSummary?: string;
  category: RiskCategory;
  probability: number;
  impact: number;
  treatmentType: TreatmentType;
  owner: string;
  assignedTo?: string;
  dueDate?: Date;
  technicalDetails?: string;
  analysisData?: RiskAnalysisData;
}

export interface UpdateRiskRequest extends Partial<CreateRiskRequest> {
  status?: RiskStatus;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  
  // Campos adicionais do wizard de registro
  source?: string;
  responsibleArea?: string;
  analysisMethodology?: string;
  
  // Dados GUT
  gut_gravity?: number;
  gut_urgency?: number;
  gut_tendency?: number;
  gut_priority?: string;
  
  // Dados de tratamento detalhados
  treatment_rationale?: string;
  treatment_cost?: number;
  treatment_timeline?: string;
  
  // Dados de atividades do plano de ação
  activity_1_name?: string;
  activity_1_description?: string;
  activity_1_responsible?: string;
  activity_1_email?: string;
  activity_1_priority?: string;
  activity_1_status?: string;
  activity_1_due_date?: Date;
  
  // Dados de comunicação/stakeholders
  awareness_person_1_name?: string;
  awareness_person_1_position?: string;
  awareness_person_1_email?: string;
  approval_person_1_name?: string;
  approval_person_1_position?: string;
  approval_person_1_email?: string;
  approval_person_1_status?: string;
  
  // Dados de monitoramento
  monitoring_frequency?: string;
  monitoring_responsible?: string;
  residual_impact?: number;
  residual_likelihood?: number;
  residual_score?: number;
  closure_criteria?: string;
  closure_notes?: string;
  closure_date?: Date;
}

export interface CreateActivityRequest {
  name: string;
  details?: string;
  dueDate?: Date;
  responsible: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

export interface RiskFilters {
  searchTerm?: string;
  categories?: RiskCategory[];
  levels?: RiskLevel[];
  statuses?: RiskStatus[];
  owners?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  showOverdue?: boolean;
}

// ============================================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================================

export const RISK_CATEGORIES: Record<RiskCategory, string> = {
  'Estratégico': 'Riscos relacionados à estratégia e direcionamento organizacional',
  'Operacional': 'Riscos de processos, sistemas e pessoas',
  'Financeiro': 'Riscos de mercado, crédito e liquidez',
  'Tecnológico': 'Riscos de TI, sistemas e tecnologia',
  'Regulatório': 'Riscos de conformidade e regulamentação',
  'Reputacional': 'Riscos à imagem e reputação organizacional',
  'Segurança da Informação': 'Riscos cibernéticos e de segurança de dados',
  'Terceiros': 'Riscos de fornecedores e parceiros',
  'Ambiental': 'Riscos ambientais e sustentabilidade',
  'Recursos Humanos': 'Riscos relacionados ao capital humano'
};

export const TREATMENT_TYPES: Record<TreatmentType, string> = {
  'Mitigar': 'Reduzir a probabilidade e/ou impacto do risco',
  'Transferir': 'Compartilhar ou transferir o risco para terceiros',
  'Evitar': 'Eliminar o risco evitando a atividade',
  'Aceitar': 'Aceitar o risco dentro do apetite organizacional'
};

export const ACTIVITY_STATUSES: Record<ActivityStatus, string> = {
  'TBD': 'A ser definido',
  'Em Andamento': 'Em execução',
  'Aguardando': 'Aguardando dependências ou aprovações',
  'Concluído': 'Concluído com sucesso',
  'Cancelado': 'Cancelado ou descontinuado',
  'Atrasado': 'Com prazo vencido'
};
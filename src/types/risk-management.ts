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

export type ActivityStatus = 'TBD' | 'Em Andamento' | 'Aguardando' | 'Concluído' | 'Cancelado' | 'Atrasado';
export type CommunicationDecision = 'Aceitar' | 'Rejeitar' | 'Pendente';

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

export interface Risk {
  id: string;
  
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
}

export interface UpdateRiskRequest extends Partial<CreateRiskRequest> {
  status?: RiskStatus;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
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
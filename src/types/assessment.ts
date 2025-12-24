// =====================================================
// TIPOS TYPESCRIPT - MÓDULO DE ASSESSMENT
// =====================================================

export type FrameworkType = 'ISO27001' | 'SOX' | 'NIST' | 'COBIT' | 'LGPD' | 'GDPR' | 'PCI_DSS' | 'HIPAA' | 'CUSTOM';

export type AssessmentStatus = 'planejado' | 'iniciado' | 'em_andamento' | 'em_revisao' | 'concluido' | 'cancelado';

export type TipoControle = 'preventivo' | 'detectivo' | 'corretivo';

export type Criticidade = 'baixa' | 'media' | 'alta' | 'critica';

export type TipoResposta = 'sim_nao' | 'escala_1_5' | 'escala_1_10' | 'multipla_escolha' | 'texto_livre' | 'percentual';

export type StatusRevisao = 'pendente' | 'aprovado' | 'rejeitado' | 'requer_evidencia';

export type PrioridadeActionPlan = 'baixa' | 'media' | 'alta' | 'critica';

export type StatusActionPlan = 'planejado' | 'em_andamento' | 'implementado' | 'cancelado' | 'adiado';

export type TipoRelatorio = 'executivo' | 'detalhado' | 'gaps' | 'maturidade' | 'comparativo' | 'plano_acao';

// =====================================================
// INTERFACES PRINCIPAIS
// =====================================================

export interface AssessmentFramework {
  id: string;
  nome: string;
  tipo_framework: FrameworkType;
  versao: string;
  descricao?: string;
  is_active: boolean;
  is_standard: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Extended fields used in Framework Center
  codigo?: string;
  status?: string;
  categoria?: string;
  padrao_origem?: string;
  peso_total?: number;
  publico?: boolean;

  // Relacionamentos
  domains?: AssessmentDomain[];
  assessments?: Assessment[];
}

export interface AssessmentDomain {
  id: string;
  framework_id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  peso: number;
  ordem: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;

  // Extended fields
  ativo?: boolean;

  // Relacionamentos
  framework?: AssessmentFramework;
  controls?: AssessmentControl[];
}

export interface AssessmentControl {
  id: string;
  domain_id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  objetivo?: string;
  tipo_controle?: TipoControle;
  criticidade?: Criticidade;
  peso: number;
  ordem: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;

  // Extended fields
  ativo?: boolean;
  categoria?: string;
  subcategoria?: string;
  pontuacao_maxima?: number;
  obrigatorio?: boolean;

  // Relacionamentos
  domain?: AssessmentDomain;
  questions?: AssessmentQuestion[];
  action_plans?: AssessmentActionPlan[];
}

export interface AssessmentQuestion {
  id: string;
  control_id: string;
  pergunta: string;
  tipo_resposta: TipoResposta;
  opcoes_resposta?: any; // JSONB para múltipla escolha
  peso: number;
  evidencias_requeridas: boolean;
  tipos_evidencia?: string[];
  ordem: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;

  // Extended fields
  codigo?: string;
  texto?: string; // sometimes aliased to 'pergunta'
  descricao?: string;
  obrigatorio?: boolean;

  // Relacionamentos
  control?: AssessmentControl;
  responses?: AssessmentResponse[];
}

export interface Assessment {
  id: string;
  framework_id: string;
  titulo: string;
  descricao?: string;
  status: AssessmentStatus;
  data_inicio?: string;
  data_fim_planejada?: string;
  data_fim_real?: string;
  responsavel_id?: string;
  aprovador_id?: string;
  percentual_conclusao: number;
  percentual_maturidade: number;
  score_total: number;
  score_maximo: number;
  observacoes?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Relacionamentos
  framework?: AssessmentFramework;
  responses?: AssessmentResponse[];
  action_plans?: AssessmentActionPlan[];
  reports?: AssessmentReport[];
  history?: AssessmentHistory[];
}

export interface AssessmentResponse {
  id: string;
  assessment_id: string;
  question_id: string;
  resposta: any; // JSONB flexível
  pontuacao: number;
  pontuacao_maxima: number;
  comentarios?: string;
  evidencias?: any; // JSONB array de evidências
  respondido_por?: string;
  respondido_em?: string;
  revisado_por?: string;
  revisado_em?: string;
  status_revisao: StatusRevisao;
  tenant_id: string;
  created_at: string;
  updated_at: string;

  // Relacionamentos
  assessment?: Assessment;
  question?: AssessmentQuestion;
}

export interface AssessmentActionPlan {
  id: string;
  assessment_id: string;
  control_id: string;
  question_id?: string;
  gap_identificado: string;
  impacto_atual?: string;
  risco_associado?: string;
  acao_proposta: string;
  responsavel_id?: string;
  prazo_implementacao?: string;
  custo_estimado?: number;
  prioridade?: PrioridadeActionPlan;
  status: StatusActionPlan;
  percentual_implementacao: number;
  observacoes?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // Relacionamentos
  assessment?: Assessment;
  control?: AssessmentControl;
  question?: AssessmentQuestion;
}

export interface AssessmentReport {
  id: string;
  assessment_id: string;
  tipo_relatorio: TipoRelatorio;
  titulo: string;
  conteudo?: any; // JSONB dados estruturados
  arquivo_url?: string;
  parametros?: any; // JSONB parâmetros
  gerado_em: string;
  gerado_por?: string;
  tenant_id: string;
  created_at: string;

  // Relacionamentos
  assessment?: Assessment;
}

export interface AssessmentHistory {
  id: string;
  assessment_id: string;
  acao: string;
  detalhes?: any; // JSONB
  usuario_id?: string;
  timestamp: string;
  tenant_id: string;

  // Relacionamentos
  assessment?: Assessment;
}

export interface AssessmentFrameworkTemplate {
  id: string;
  nome: string;
  tipo_framework: FrameworkType;
  versao: string;
  descricao?: string;
  estrutura: any; // JSONB estrutura completa
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// TIPOS PARA FORMULÁRIOS E UI
// =====================================================

export interface FrameworkFormData {
  codigo: string;
  nome: string;
  descricao: string;
  versao: string;
  tipo_framework: string;
  categoria?: string;
  padrao_origem?: string;
  industria_aplicavel?: string[];
  publico?: boolean;
  status?: string;
}

export interface CreateAssessmentFrameworkData {
  nome: string;
  tipo_framework: FrameworkType;
  versao?: string;
  descricao?: string;
  is_standard?: boolean;
}

export interface CreateAssessmentData {
  framework_id: string;
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data_fim_planejada?: string;
  responsavel_id?: string;
  aprovador_id?: string;
}

export interface UpdateAssessmentData {
  titulo?: string;
  descricao?: string;
  status?: AssessmentStatus;
  data_inicio?: string;
  data_fim_planejada?: string;
  data_fim_real?: string;
  responsavel_id?: string;
  aprovador_id?: string;
  observacoes?: string;
}

export interface AssessmentResponseData {
  question_id: string;
  resposta: any;
  comentarios?: string;
  evidencias?: File[] | string[];
}

export interface CreateActionPlanData {
  assessment_id: string;
  control_id: string;
  question_id?: string;
  gap_identificado: string;
  impacto_atual?: string;
  risco_associado?: string;
  acao_proposta: string;
  responsavel_id?: string;
  prazo_implementacao?: string;
  custo_estimado?: number;
  prioridade?: PrioridadeActionPlan;
}

// =====================================================
// TIPOS PARA CÁLCULOS E MÉTRICAS
// =====================================================

export interface MaturityCalculation {
  score_total: number;
  score_maximo: number;
  percentual_maturidade: number;
  nivel_maturidade: string;
  domains_scores: DomainScore[];
}

export interface DomainScore {
  domain_id: string;
  domain_nome: string;
  score: number;
  score_maximo: number;
  percentual: number;
  controls_scores: ControlScore[];
}

export interface ControlScore {
  control_id: string;
  control_codigo: string;
  control_titulo: string;
  score: number;
  score_maximo: number;
  percentual: number;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
}

export interface AssessmentMetrics {
  total_assessments: number;
  active_assessments: number;
  completed_assessments: number;
  average_maturity: number;
  frameworks_count: number;
  pending_action_plans: number;
  overdue_assessments: number;
}

export interface ComplianceGap {
  control_id: string;
  control_codigo: string;
  control_titulo: string;
  gap_score: number;
  criticidade: Criticidade;
  impacto: string;
  recomendacao: string;
  has_action_plan: boolean;
}

// =====================================================
// TIPOS PARA FILTROS E BUSCA
// =====================================================

export interface AssessmentFilters {
  search?: string;
  status?: AssessmentStatus[];
  framework_type?: FrameworkType[];
  responsavel_id?: string[];
  data_inicio_from?: string;
  data_inicio_to?: string;
  percentual_maturidade_min?: number;
  percentual_maturidade_max?: number;
}

export interface FrameworkFilters {
  search?: string;
  tipo_framework?: FrameworkType[];
  is_active?: boolean;
  is_standard?: boolean;
}

export interface ActionPlanFilters {
  search?: string;
  status?: StatusActionPlan[];
  prioridade?: PrioridadeActionPlan[];
  responsavel_id?: string[];
  prazo_from?: string;
  prazo_to?: string;
}

// =====================================================
// TIPOS PARA RELATÓRIOS
// =====================================================

export interface ReportParameters {
  assessment_ids?: string[];
  framework_ids?: string[];
  include_gaps?: boolean;
  include_action_plans?: boolean;
  include_evidences?: boolean;
  format?: 'pdf' | 'excel' | 'json';
  language?: 'pt' | 'en';
}

export interface ExecutiveReportData {
  assessment: Assessment;
  overall_maturity: number;
  maturity_level: string;
  domains_summary: DomainSummary[];
  key_gaps: ComplianceGap[];
  action_plans_summary: ActionPlanSummary;
  recommendations: string[];
}

export interface DomainSummary {
  domain: AssessmentDomain;
  maturity_percentage: number;
  controls_total: number;
  controls_compliant: number;
  controls_partial: number;
  controls_non_compliant: number;
  key_gaps: ComplianceGap[];
}

export interface ActionPlanSummary {
  total_plans: number;
  plans_by_status: Record<StatusActionPlan, number>;
  plans_by_priority: Record<PrioridadeActionPlan, number>;
  overdue_plans: number;
  estimated_cost: number;
}

// =====================================================
// TIPOS PARA IMPORTAÇÃO/EXPORTAÇÃO
// =====================================================

export interface FrameworkImportData {
  framework: CreateAssessmentFrameworkData;
  domains: Omit<AssessmentDomain, 'id' | 'framework_id' | 'tenant_id' | 'created_at' | 'updated_at'>[];
  controls: Omit<AssessmentControl, 'id' | 'domain_id' | 'tenant_id' | 'created_at' | 'updated_at'>[];
  questions: Omit<AssessmentQuestion, 'id' | 'control_id' | 'tenant_id' | 'created_at' | 'updated_at'>[];
}

export interface AssessmentExportData {
  assessment: Assessment;
  framework: AssessmentFramework;
  responses: AssessmentResponse[];
  action_plans: AssessmentActionPlan[];
  maturity_calculation: MaturityCalculation;
}

// =====================================================
// TIPOS PARA HOOKS E SERVICES
// =====================================================

export interface UseAssessmentsOptions {
  filters?: AssessmentFilters;
  page?: number;
  limit?: number;
  include_framework?: boolean;
  include_responses?: boolean;
}

export interface UseFrameworksOptions {
  filters?: FrameworkFilters;
  include_domains?: boolean;
  include_controls?: boolean;
  include_questions?: boolean;
}

export interface AssessmentService {
  getAssessments: (options?: UseAssessmentsOptions) => Promise<Assessment[]>;
  getAssessment: (id: string) => Promise<Assessment>;
  createAssessment: (data: CreateAssessmentData) => Promise<Assessment>;
  updateAssessment: (id: string, data: UpdateAssessmentData) => Promise<Assessment>;
  deleteAssessment: (id: string) => Promise<void>;
  calculateMaturity: (assessmentId: string) => Promise<MaturityCalculation>;
  generateReport: (assessmentId: string, type: TipoRelatorio, params?: ReportParameters) => Promise<AssessmentReport>;
}

export interface FrameworkService {
  getFrameworks: (options?: UseFrameworksOptions) => Promise<AssessmentFramework[]>;
  getFramework: (id: string) => Promise<AssessmentFramework>;
  createFramework: (data: CreateAssessmentFrameworkData) => Promise<AssessmentFramework>;
  updateFramework: (id: string, data: Partial<CreateAssessmentFrameworkData>) => Promise<AssessmentFramework>;
  deleteFramework: (id: string) => Promise<void>;
  importFramework: (templateId: string) => Promise<AssessmentFramework>;
  exportFramework: (id: string) => Promise<FrameworkImportData>;
}
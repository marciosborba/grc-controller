/**
 * Utilitários compartilhados para o módulo de auditoria
 * Centraliza funções comuns e resolve problemas de contraste em badges
 */

// ===== CORES COM CONTRASTE ADEQUADO =====
// Substituindo bg-*-100 text-*-800 por cores com melhor contraste

export const statusColors = {
  // Status de projetos e trabalhos
  planejamento: 'bg-orange-500 text-white dark:bg-orange-600',
  em_execucao: 'bg-blue-500 text-white dark:bg-blue-600', 
  em_andamento: 'bg-blue-500 text-white dark:bg-blue-600',
  em_revisao: 'bg-purple-500 text-white dark:bg-purple-600',
  concluido: 'bg-green-500 text-white dark:bg-green-600',
  finalizado: 'bg-green-500 text-white dark:bg-green-600',
  aprovado: 'bg-emerald-500 text-white dark:bg-emerald-600',
  cancelado: 'bg-red-500 text-white dark:bg-red-600',
  suspenso: 'bg-orange-500 text-white dark:bg-orange-600',
  rascunho: 'bg-gray-500 text-white dark:bg-gray-600',
  agendado: 'bg-yellow-500 text-white dark:bg-yellow-600',
  pendente: 'bg-gray-500 text-white dark:bg-gray-600',
  ativo: 'bg-green-500 text-white dark:bg-green-600',
  inativo: 'bg-gray-500 text-white dark:bg-gray-600',
  
  // Status de relatórios
  distribuido: 'bg-green-500 text-white dark:bg-green-600',
  publicado: 'bg-blue-500 text-white dark:bg-blue-600',
  revisao: 'bg-yellow-500 text-white dark:bg-yellow-600',
  
  // Status de papéis de trabalho
  draft: 'bg-gray-500 text-white dark:bg-gray-600',
  in_progress: 'bg-blue-500 text-white dark:bg-blue-600',
  completed: 'bg-green-500 text-white dark:bg-green-600',
  
  // Fallback
  default: 'bg-gray-500 text-white dark:bg-gray-600'
};

export const riskColors = {
  // Níveis de risco com melhor contraste
  muito_baixo: 'bg-blue-500 text-white dark:bg-blue-600',
  baixo: 'bg-green-500 text-white dark:bg-green-600',
  medio: 'bg-yellow-500 text-white dark:bg-yellow-600',
  alto: 'bg-orange-500 text-white dark:bg-orange-600',
  muito_alto: 'bg-red-500 text-white dark:bg-red-600',
  critico: 'bg-red-600 text-white dark:bg-red-700',
  crítica: 'bg-red-600 text-white dark:bg-red-700',
  
  // Fallback
  default: 'bg-gray-500 text-white dark:bg-gray-600'
};

export const typeColors = {
  // Tipos de auditoria
  interna: 'bg-blue-500 text-white dark:bg-blue-600',
  externa: 'bg-purple-500 text-white dark:bg-purple-600',
  regulatoria: 'bg-red-500 text-white dark:bg-red-600',
  especial: 'bg-orange-500 text-white dark:bg-orange-600',
  
  // Tipos de papéis de trabalho
  checklist: 'bg-blue-500 text-white dark:bg-blue-600',
  evidencia: 'bg-green-500 text-white dark:bg-green-600',
  teste: 'bg-purple-500 text-white dark:bg-purple-600',
  apontamento: 'bg-red-500 text-white dark:bg-red-600',
  relatorio: 'bg-yellow-500 text-white dark:bg-yellow-600',
  outro: 'bg-gray-500 text-white dark:bg-gray-600',
  
  // Tipos de relatório
  final: 'bg-blue-500 text-white dark:bg-blue-600',
  executivo: 'bg-purple-500 text-white dark:bg-purple-600',
  preliminar: 'bg-yellow-500 text-white dark:bg-yellow-600',
  seguimento: 'bg-green-500 text-white dark:bg-green-600',
  
  // Tipos de procedimento
  analytical: 'bg-purple-500 text-white dark:bg-purple-600',
  substantive: 'bg-indigo-500 text-white dark:bg-indigo-600',
  compliance: 'bg-red-500 text-white dark:bg-red-600',
  walkthrough: 'bg-yellow-500 text-white dark:bg-yellow-600',
  inquiry: 'bg-green-500 text-white dark:bg-green-600',
  observation: 'bg-blue-500 text-white dark:bg-blue-600',
  inspection: 'bg-pink-500 text-white dark:bg-pink-600',
  confirmation: 'bg-teal-500 text-white dark:bg-teal-600',
  
  // Fallback
  default: 'bg-gray-500 text-white dark:bg-gray-600'
};

export const phaseColors = {
  // Fases de auditoria
  planejamento: 'bg-yellow-500 text-white dark:bg-yellow-600',
  fieldwork: 'bg-blue-500 text-white dark:bg-blue-600',
  relatorio: 'bg-purple-500 text-white dark:bg-purple-600',
  followup: 'bg-green-500 text-white dark:bg-green-600',
  
  // Fallback
  default: 'bg-gray-500 text-white dark:bg-gray-600'
};

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Obtém a cor do status com contraste adequado
 */
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_') || 'default';
  return statusColors[normalizedStatus as keyof typeof statusColors] || statusColors.default;
};

/**
 * Obtém a cor do risco com contraste adequado
 */
export const getRiskColor = (risk: string | number): string => {
  let riskKey: string;
  
  if (typeof risk === 'number') {
    if (risk >= 80) riskKey = 'critico';
    else if (risk >= 60) riskKey = 'alto';
    else if (risk >= 40) riskKey = 'medio';
    else if (risk >= 20) riskKey = 'baixo';
    else riskKey = 'muito_baixo';
  } else {
    riskKey = risk?.toLowerCase().replace(/\s+/g, '_') || 'default';
  }
  
  return riskColors[riskKey as keyof typeof riskColors] || riskColors.default;
};

/**
 * Obtém a cor do tipo com contraste adequado
 */
export const getTypeColor = (type: string): string => {
  const normalizedType = type?.toLowerCase().replace(/\s+/g, '_') || 'default';
  return typeColors[normalizedType as keyof typeof typeColors] || typeColors.default;
};

/**
 * Obtém a cor da fase com contraste adequado
 */
export const getPhaseColor = (phase: string): string => {
  const normalizedPhase = phase?.toLowerCase().replace(/\s+/g, '_') || 'default';
  return phaseColors[normalizedPhase as keyof typeof phaseColors] || phaseColors.default;
};

// ===== FUNÇÕES DE FORMATAÇÃO =====

/**
 * Formata tamanho de arquivo
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('pt-BR');
};

/**
 * Formata data e hora para exibição
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('pt-BR');
};

/**
 * Calcula dias até uma data
 */
export const calculateDaysTo = (targetDate: string): number | null => {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Formata texto de prazo
 */
export const formatDeadlineText = (targetDate: string): string => {
  const days = calculateDaysTo(targetDate);
  if (days === null) return 'Prazo não definido';
  if (days < 0) return `${Math.abs(days)} dias atrasado`;
  if (days === 0) return 'Vence hoje';
  return `${days} dias restantes`;
};

// ===== CONSTANTES =====

export const AUDIT_TYPES = [
  { value: 'interna', label: 'Auditoria Interna' },
  { value: 'externa', label: 'Auditoria Externa' },
  { value: 'regulatoria', label: 'Auditoria Regulatória' },
  { value: 'especial', label: 'Auditoria Especial' }
];

export const AUDIT_PHASES = [
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'fieldwork', label: 'Trabalho de Campo' },
  { value: 'relatorio', label: 'Relatório' },
  { value: 'followup', label: 'Follow-up' }
];

export const AUDIT_STATUS = [
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'em_revisao', label: 'Em Revisão' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' }
];

export const RISK_LEVELS = [
  { value: 'muito_baixo', label: 'Muito Baixo' },
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Médio' },
  { value: 'alto', label: 'Alto' },
  { value: 'muito_alto', label: 'Muito Alto' },
  { value: 'critico', label: 'Crítico' }
];

export const WORKING_PAPER_TYPES = [
  { value: 'checklist', label: 'Checklist' },
  { value: 'evidencia', label: 'Evidência' },
  { value: 'teste', label: 'Teste' },
  { value: 'apontamento', label: 'Apontamento' },
  { value: 'relatorio', label: 'Relatório' },
  { value: 'outro', label: 'Outro' }
];

// ===== VALIDAÇÕES =====

/**
 * Valida se o tenant ID está presente
 */
export const validateTenantId = (tenantId: string | undefined): boolean => {
  return !!tenantId && tenantId.trim().length > 0;
};

/**
 * Valida dados obrigatórios de projeto
 */
export const validateProjectData = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.codigo?.trim()) errors.push('Código é obrigatório');
  if (!data.titulo?.trim()) errors.push('Título é obrigatório');
  if (!data.universo_auditavel_id) errors.push('Universo auditável é obrigatório');
  if (!data.tipo_auditoria) errors.push('Tipo de auditoria é obrigatório');
  if (!data.data_inicio) errors.push('Data de início é obrigatória');
  if (!data.data_fim_planejada) errors.push('Data de fim é obrigatória');
  if (!data.chefe_auditoria) errors.push('Chefe de auditoria é obrigatório');
  
  return errors;
};

/**
 * Normaliza status para comparação
 */
export const normalizeStatus = (status: string): string => {
  return status?.toLowerCase().replace(/\s+/g, '_') || '';
};

// ===== MÉTRICAS =====

/**
 * Calcula métricas básicas de uma lista de projetos
 */
export const calculateProjectMetrics = (projects: any[]) => {
  const total = projects.length;
  const planejamento = projects.filter(p => normalizeStatus(p.status) === 'planejamento').length;
  const execucao = projects.filter(p => normalizeStatus(p.status) === 'em_execucao').length;
  const concluidos = projects.filter(p => normalizeStatus(p.status) === 'concluido').length;
  const totalHoras = projects.reduce((sum, p) => sum + (p.horas_orcadas || 0), 0);
  const totalApontamentos = projects.reduce((sum, p) => sum + (p.total_apontamentos || 0), 0);
  const apontamentosCriticos = projects.reduce((sum, p) => sum + (p.apontamentos_criticos || 0), 0);
  
  return {
    total,
    planejamento,
    execucao,
    concluidos,
    totalHoras,
    totalApontamentos,
    apontamentosCriticos,
    completionRate: total > 0 ? Math.round((concluidos / total) * 100) : 0
  };
};

/**
 * Obtém ícone de confidencialidade
 */
export const getConfidentialityIcon = (level: string): string => {
  switch (level?.toLowerCase()) {
    case 'restrito': return '🔒';
    case 'confidencial': return '⚠️';
    case 'interno': return '🏢';
    default: return '📋';
  }
};
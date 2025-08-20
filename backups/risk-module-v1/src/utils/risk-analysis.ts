import type { 
  RiskAnalysisData, 
  RiskAssessmentAnswer, 
  RiskLevel, 
  MatrixSize,
  GUTAnalysis 
} from '@/types/risk-management';
import { supabase } from '@/integrations/supabase/client';

interface TenantRiskMatrixConfig {
  type: '4x4' | '5x5';
  impact_labels: string[];
  likelihood_labels: string[];
}

// Função para obter configuração da matriz da tenant
export const getTenantMatrixConfig = async (tenantId?: string): Promise<TenantRiskMatrixConfig> => {
  const defaultConfig: TenantRiskMatrixConfig = {
    type: '4x4',
    impact_labels: ['Baixo', 'Médio', 'Alto', 'Crítico'],
    likelihood_labels: ['Raro', 'Improvável', 'Possível', 'Provável']
  };

  console.log('🔍 getTenantMatrixConfig chamada com tenantId:', tenantId);

  if (!tenantId) {
    console.log('⚠️ Nenhum tenantId fornecido, usando configuração padrão:', defaultConfig);
    return defaultConfig;
  }

  try {
    console.log('📡 Buscando configuração da tenant no banco...');
    const { data, error } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single();

    console.log('📊 Resposta do banco:', { data, error });

    if (error) {
      console.error('❌ Erro na consulta:', error);
      return defaultConfig;
    }

    if (!data?.settings?.risk_matrix) {
      console.log('⚠️ Nenhuma configuração risk_matrix encontrada, usando padrão:', defaultConfig);
      console.log('📋 Settings disponíveis:', data?.settings);
      return defaultConfig;
    }

    console.log('✅ Configuração da matriz encontrada:', data.settings.risk_matrix);
    return data.settings.risk_matrix;
  } catch (error) {
    console.error('❌ Erro ao buscar configuração da matriz:', error);
    return defaultConfig;
  }
};

// Calcula a média das respostas
export const calculateAverageScore = (answers: RiskAssessmentAnswer[]): number => {
  if (answers.length === 0) return 0;
  const total = answers.reduce((sum, answer) => sum + answer.value, 0);
  return Math.round((total / answers.length) * 100) / 100; // Arredondar para 2 casas decimais
};

// Determina o nível qualitativo baseado na matriz de risco
export const calculateQualitativeRiskLevel = (
  probabilityScore: number,
  impactScore: number,
  matrixSize: MatrixSize
): RiskLevel => {
  // Arredondar scores para inteiros para mapear na matriz
  const prob = Math.round(probabilityScore);
  const impact = Math.round(impactScore);
  const score = prob * impact;
  
  if (matrixSize === '4x4') {
    // Matriz 4x4 - Nova classificação
    // 1 a 2 = Baixo
    // 3 a 6 = Médio  
    // 7 a 9 = Alto
    // 10 a 16 = Muito Alto
    if (score >= 10) return 'Muito Alto';
    if (score >= 7) return 'Alto';
    if (score >= 3) return 'Médio';
    return 'Baixo';
  } else {
    // Matriz 5x5 - Nova classificação
    // 1 a 2 = Muito Baixo
    // 3 a 4 = Baixo
    // 5 a 8 = Médio
    // 9 a 16 = Alto
    // 17 a 25 = Muito Alto
    if (score >= 17) return 'Muito Alto';
    if (score >= 9) return 'Alto';
    if (score >= 5) return 'Médio';
    if (score >= 3) return 'Baixo';
    return 'Muito Baixo';
  }
};

// Versão que usa configuração da tenant
export const calculateQualitativeRiskLevelWithTenantConfig = async (
  probabilityScore: number,
  impactScore: number,
  tenantId?: string
): Promise<RiskLevel> => {
  const config = await getTenantMatrixConfig(tenantId);
  return calculateQualitativeRiskLevel(probabilityScore, impactScore, config.type);
};

// Calcula a prioridade GUT
export const calculateGUTPriority = (gutScore: number): GUTAnalysis['priority'] => {
  if (gutScore >= 100) return 'Muito Alta';
  if (gutScore >= 64) return 'Alta';
  if (gutScore >= 27) return 'Média';
  if (gutScore >= 8) return 'Baixa';
  return 'Muito Baixa';
};

// Processa a análise completa do risco
export const processRiskAnalysis = (
  riskType: RiskAnalysisData['riskType'],
  matrixSize: MatrixSize,
  probabilityAnswers: RiskAssessmentAnswer[],
  impactAnswers: RiskAssessmentAnswer[],
  gutGravity?: number,
  gutUrgency?: number,
  gutTendency?: number
): RiskAnalysisData => {
  const probabilityScore = calculateAverageScore(probabilityAnswers);
  const impactScore = calculateAverageScore(impactAnswers);
  const qualitativeRiskLevel = calculateQualitativeRiskLevel(
    probabilityScore, 
    impactScore, 
    matrixSize
  );

  let gutAnalysis: GUTAnalysis | undefined;
  if (gutGravity && gutUrgency && gutTendency) {
    const gutScore = gutGravity * gutUrgency * gutTendency;
    gutAnalysis = {
      gravity: gutGravity,
      urgency: gutUrgency,
      tendency: gutTendency,
      gutScore,
      priority: calculateGUTPriority(gutScore)
    };
  }

  return {
    riskType,
    matrixSize,
    probabilityAnswers,
    impactAnswers,
    probabilityScore,
    impactScore,
    qualitativeRiskLevel,
    gutAnalysis
  };
};

// Versão que usa configuração da tenant
export const processRiskAnalysisWithTenantConfig = async (
  riskType: RiskAnalysisData['riskType'],
  probabilityAnswers: RiskAssessmentAnswer[],
  impactAnswers: RiskAssessmentAnswer[],
  tenantId?: string,
  gutGravity?: number,
  gutUrgency?: number,
  gutTendency?: number
): Promise<RiskAnalysisData> => {
  console.log('🔍 processRiskAnalysisWithTenantConfig chamada:', {
    riskType,
    tenantId,
    probabilityAnswersCount: probabilityAnswers.length,
    impactAnswersCount: impactAnswers.length
  });
  
  const config = await getTenantMatrixConfig(tenantId);
  
  console.log('🏢 Usando configuração da tenant para análise:', {
    tenantId,
    matrixType: config.type,
    config
  });
  
  const result = processRiskAnalysis(
    riskType,
    config.type,
    probabilityAnswers,
    impactAnswers,
    gutGravity,
    gutUrgency,
    gutTendency
  );
  
  console.log('✅ Análise processada com matriz:', config.type, 'Resultado:', result);
  
  return result;
};

// Gera dados para visualização da matriz de risco
export interface MatrixCell {
  probability: number;
  impact: number;
  level: RiskLevel;
  color: string;
}

export const generateMatrixData = (matrixSize: MatrixSize): MatrixCell[][] => {
  const size = matrixSize === '4x4' ? 4 : 5;
  const matrix: MatrixCell[][] = [];

  // Cores por nível de risco - Nova especificação
  const colorMap: Record<RiskLevel, string> = {
    'Muito Baixo': '#3b82f6', // Azul (apenas para 5x5)
    'Baixo': '#22c55e',       // Verde
    'Médio': '#eab308',       // Amarelo
    'Alto': '#f97316',        // Laranja
    'Muito Alto': '#ef4444'   // Vermelho
  };

  for (let impact = size; impact >= 1; impact--) {
    const row: MatrixCell[] = [];
    for (let probability = 1; probability <= size; probability++) {
      const level = calculateQualitativeRiskLevel(probability, impact, matrixSize);
      row.push({
        probability,
        impact,
        level,
        color: colorMap[level]
      });
    }
    matrix.push(row);
  }

  return matrix;
};

// Versão que usa configuração da tenant
export const generateMatrixDataWithTenantConfig = async (tenantId?: string): Promise<MatrixCell[][]> => {
  const config = await getTenantMatrixConfig(tenantId);
  return generateMatrixData(config.type);
};

// Encontra a posição do risco na matriz
export const findRiskPositionInMatrix = (
  probabilityScore: number,
  impactScore: number,
  matrixSize: MatrixSize = '5x5'
): { x: number; y: number } => {
  const maxValue = matrixSize === '4x4' ? 4 : 5;
  const prob = Math.max(1, Math.min(maxValue, Math.round(probabilityScore)));
  const impact = Math.max(1, Math.min(maxValue, Math.round(impactScore)));
  
  return {
    x: prob - 1, // Converter para índice baseado em 0
    y: maxValue - impact // Inverter porque a matriz é exibida de cima para baixo
  };
};

// Versão que usa configuração da tenant
export const findRiskPositionInMatrixWithTenantConfig = async (
  probabilityScore: number,
  impactScore: number,
  tenantId?: string
): Promise<{ x: number; y: number }> => {
  const config = await getTenantMatrixConfig(tenantId);
  return findRiskPositionInMatrix(probabilityScore, impactScore, config.type);
};
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, AlertTriangle, TrendingUp, Zap, ArrowLeft, Eye, Lock, Info, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RiskMatrixViewProps {
  risks: any[];
  searchTerm?: string;
  filters?: any;
}

interface RiskLevel {
  id: string;
  name: string;
  color: string;
  description: string;
  minValue: number;
  maxValue: number;
  value: number;
}

interface MatrixConfig {
  type: '3x3' | '4x4' | '5x5';
  calculation_method: string;
  impact_labels: string[];
  likelihood_labels: string[];
  risk_levels_custom: RiskLevel[];
  risk_levels: {
    low: number[];
    medium: number[];
    high: number[];
    critical?: number[];
  };
}

const getRiskColor = (impact: number, likelihood: number, matrixConfig: MatrixConfig | null) => {
  const riskValue = impact * likelihood;
  const matrixType = matrixConfig?.type;

  if (matrixType === '3x3') {
    // Matriz 3x3: Baixo (1-2), Médio (3-4), Alto (5-9)
    if (riskValue >= 5) return 'bg-red-500 text-white'; // Alto (5-9) - VERMELHO
    else if (riskValue >= 3) return 'bg-yellow-500 text-white'; // Médio (3-4) - AMARELO
    else return 'bg-green-500 text-white'; // Baixo (1-2) - VERDE
  } else if (matrixType === '5x5') {
    // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-19), Crítico (20-25)
    if (riskValue >= 20) return 'bg-red-500 text-white'; // Crítico (20-25) - VERMELHO
    else if (riskValue >= 9) return 'bg-orange-500 text-white'; // Alto (9-19) - LARANJA
    else if (riskValue >= 5) return 'bg-yellow-500 text-white'; // Médio (5-8) - AMARELO
    else if (riskValue >= 3) return 'bg-green-500 text-white'; // Baixo (3-4) - VERDE
    else return 'bg-blue-500 text-white'; // Muito Baixo (1-2) - AZUL
  } else {
    // Matriz 4x4: Baixo (1-2), Médio (3-7), Alto (8-15), Crítico (16)
    if (riskValue >= 16) return 'bg-red-500 text-white'; // Crítico (16) - VERMELHO
    else if (riskValue >= 8) return 'bg-orange-500 text-white'; // Alto (8-15) - LARANJA
    else if (riskValue >= 3) return 'bg-yellow-500 text-white'; // Médio (3-7) - AMARELO
    else return 'bg-green-500 text-white'; // Baixo (1-2) - VERDE
  }
};

// Função para calcular o nível de risco consistente com as cores
const calculateConsistentRiskLevel = (impact: number, likelihood: number, matrixConfig: MatrixConfig | null) => {
  const riskValue = impact * likelihood;

  // console.log(`calculateConsistentRiskLevel: impact=${impact}, likelihood=${likelihood}, score=${riskValue}`);
  // console.log('matrixConfig:', matrixConfig);

  // Usar as faixas EXATAS da configuração salva (matriz verdadeira)
  if (matrixConfig?.risk_levels) {
    const { risk_levels } = matrixConfig;

    // console.log('risk_levels:', risk_levels);

    // Verificar em qual faixa o valor se encaixa
    if (risk_levels.critical && risk_levels.critical.includes(riskValue)) {
      // console.log('Resultado: Crítico');
      return 'Crítico';
    }
    if (risk_levels.high && risk_levels.high.includes(riskValue)) {
      // console.log('Resultado: Alto');
      return 'Alto';
    }
    if (risk_levels.medium && risk_levels.medium.includes(riskValue)) {
      // console.log('Resultado: Médio');
      return 'Médio';
    }
    if (risk_levels.low && risk_levels.low.includes(riskValue)) {
      // console.log('Resultado: Baixo');
      return 'Baixo';
    }

    // Se não encontrou em nenhuma faixa, usar fallback baseado no tipo
    const matrixType = matrixConfig.type;
    // console.log('Usando fallback para tipo:', matrixType);
    if (matrixType === '3x3') {
      const result = riskValue >= 5 ? 'Alto' : riskValue >= 3 ? 'Médio' : 'Baixo';
      // console.log('Resultado fallback 3x3:', result);
      return result;
    } else if (matrixType === '5x5') {
      return riskValue >= 17 ? 'Crítico' : riskValue >= 9 ? 'Alto' : riskValue >= 5 ? 'Médio' : riskValue >= 3 ? 'Baixo' : 'Muito Baixo';
    } else {
      return riskValue >= 11 ? 'Crítico' : riskValue >= 7 ? 'Alto' : riskValue >= 3 ? 'Médio' : 'Baixo';
    }
  }

  // Fallback se não há configuração (usar padrão 4x4)
  // console.log('Usando fallback padrão');
  if (riskValue >= 11) return 'Crítico';
  else if (riskValue >= 7) return 'Alto';
  else if (riskValue >= 3) return 'Médio';
  else return 'Baixo';
};

// Função para badges com lógica simples baseada no nível calculado
const getRiskBadgeStyle = (riskLevel: string) => {
  // Lógica direta baseada no texto do nível
  switch (riskLevel.toLowerCase()) {
    case 'muito baixo':
      return { backgroundColor: '#3b82f6', color: '#ffffff' }; // Azul
    case 'baixo':
      return { backgroundColor: '#22c55e', color: '#ffffff' }; // Verde
    case 'médio':
      return { backgroundColor: '#eab308', color: '#ffffff' }; // Amarelo
    case 'alto':
      return { backgroundColor: '#f97316', color: '#ffffff' }; // Laranja
    case 'muito alto':
    case 'crítico':
      return { backgroundColor: '#ef4444', color: '#ffffff' }; // Vermelho
    default:
      return { backgroundColor: '#6b7280', color: '#ffffff' }; // Cinza para desconhecido
  }
};

// Função para badges de estratégia de tratamento
const getTreatmentBadgeStyle = (strategy: string) => {
  switch (strategy?.toLowerCase()) {
    case 'mitigate':
      return { backgroundColor: '#3b82f6', color: '#ffffff', label: 'Mitigar' }; // Azul
    case 'transfer':
      return { backgroundColor: '#8b5cf6', color: '#ffffff', label: 'Transferir' }; // Roxo
    case 'avoid':
      return { backgroundColor: '#ef4444', color: '#ffffff', label: 'Evitar' }; // Vermelho
    case 'accept':
      return { backgroundColor: '#22c55e', color: '#ffffff', label: 'Aceitar' }; // Verde
    default:
      return { backgroundColor: '#6b7280', color: '#ffffff', label: 'Não Definido' }; // Cinza
  }
};

// Função para badges de status
const getStatusBadgeStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return { backgroundColor: '#6b7280', color: '#ffffff', label: 'Rascunho' }; // Cinza
    case 'in_progress':
      return { backgroundColor: '#f59e0b', color: '#ffffff', label: 'Em Andamento' }; // Amarelo
    case 'completed':
      return { backgroundColor: '#10b981', color: '#ffffff', label: 'Concluído' }; // Verde
    case 'cancelled':
      return { backgroundColor: '#ef4444', color: '#ffffff', label: 'Cancelado' }; // Vermelho
    default:
      return { backgroundColor: '#6b7280', color: '#ffffff', label: 'Desconhecido' }; // Cinza
  }
};

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({
  risks,
  searchTerm = '',
  filters = {}
}) => {
  const navigate = useNavigate();
  const [selectedRisk, setSelectedRisk] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Usar o hook centralizado que já faz cache, refetch e lê corretamente do banco
  const {
    tenantSettings,
    isLoading,
    getMatrixLabels,
    getMatrixDimensions,
    getRiskLevels,
    refetch
  } = useTenantSettings();

  // Recarregar sempre que a janela ganhar foco (configurações podem ter mudado)
  useEffect(() => {
    refetch();
  }, []);

  // Converter tenantSettings para MatrixConfig (formato usado pelas funções utilitárias do arquivo)
  const matrixConfig: MatrixConfig | null = tenantSettings?.risk_matrix
    ? {
      type: tenantSettings.risk_matrix.type,
      calculation_method: 'multiplication',
      impact_labels: tenantSettings.risk_matrix.impact_labels || [],
      likelihood_labels: tenantSettings.risk_matrix.likelihood_labels || [],
      risk_levels_custom: [],
      risk_levels: tenantSettings.risk_matrix.risk_levels || { low: [], medium: [], high: [] },
    }
    : null;

  // Labels e dimensões derivadas da configuração do tenant
  const matrixLabels = useMemo(() => getMatrixLabels(), [tenantSettings]);
  const matrixDimensions = useMemo(() => getMatrixDimensions(), [tenantSettings]);
  const riskLevels = useMemo(() => getRiskLevels(), [tenantSettings]);

  // Calcular nível de risco baseado na configuração atual
  const calculateRiskLevel = (impact: number, likelihood: number): string => {
    if (!matrixConfig) return 'Desconhecido';

    const riskValue = impact * likelihood;

    // Procurar em risk_levels_custom primeiro
    if (matrixConfig.risk_levels_custom?.length > 0) {
      const level = matrixConfig.risk_levels_custom.find(level =>
        riskValue >= level.minValue && riskValue <= level.maxValue
      );
      if (level) return level.name;
    }

    // Fallback para risk_levels legado
    const { risk_levels } = matrixConfig;
    if (risk_levels.critical && risk_levels.critical.includes(riskValue)) return 'Crítico';
    if (risk_levels.high && risk_levels.high.includes(riskValue)) return 'Alto';
    if (risk_levels.medium && risk_levels.medium.includes(riskValue)) return 'Médio';
    if (risk_levels.low && risk_levels.low.includes(riskValue)) return 'Baixo';

    return 'Desconhecido';
  };

  // Obter cor do nível de risco
  const getRiskLevelColor = (riskLevel: string): string => {
    if (!matrixConfig?.risk_levels_custom) {
      // Cores padrão
      switch (riskLevel.toLowerCase()) {
        case 'muito baixo': return '#3b82f6';
        case 'baixo': return '#22c55e';
        case 'médio': return '#eab308';
        case 'alto': return '#f97316';
        case 'crítico': case 'muito alto': return '#ef4444';
        default: return '#6b7280';
      }
    }

    const level = matrixConfig.risk_levels_custom.find(l => l.name === riskLevel);
    return level?.color || '#6b7280';
  };

  // Criar arrays de níveis dinâmicos baseados na configuração do banco
  // IMPORTANTE: truncar labels às dimensões reais da matriz (type 3x3 = 3 linhas/colunas)
  const impactLevels = useMemo(() => {
    if (!matrixConfig) return [];
    const dim = matrixDimensions.rows;
    const allLabels = matrixLabels.impact.length >= dim
      ? matrixLabels.impact.slice(0, dim)
      : matrixLabels.impact;
    // Inverter para exibir de cima para baixo (Alto -> Baixo)
    const reversedLabels = [...allLabels].reverse();
    return reversedLabels.map((label, index) => ({
      level: allLabels.length - index,
      label,
      color: 'bg-muted text-foreground'
    }));
  }, [matrixLabels.impact, matrixConfig, matrixDimensions]);

  const likelihoodLevels = useMemo(() => {
    if (!matrixConfig) return [];
    const dim = matrixDimensions.cols;
    const allLabels = matrixLabels.likelihood.length >= dim
      ? matrixLabels.likelihood.slice(0, dim)
      : matrixLabels.likelihood;
    return allLabels.map((label, index) => ({
      level: index + 1,
      label,
      color: 'bg-muted text-foreground'
    }));
  }, [matrixLabels.likelihood, matrixConfig, matrixDimensions]);

  // Filtrar e processar riscos
  const processedRisks = useMemo(() => {
    console.log('🔍 MATRIZ 2 - processedRisks - Iniciando processamento:', {
      isLoading,
      risksLength: risks?.length || 0,
      firstRisk: risks?.[0]
    });

    if (isLoading) {
      console.log('🔍 MATRIZ 2 - processedRisks - Matrix config ainda carregando, retornando array vazio');
      return [];
    }

    console.log('🔍 MATRIZ 2 - processedRisks - Processando', risks?.length || 0, 'riscos');

    const result = risks
      .filter(risk => {
        console.log('🔍 Filtrando risco:', {
          id: risk.id,
          risk_title: risk.risk_title,
          name: risk.name,
          risk_code: risk.risk_code,
          status: risk.status,
          hasAnyIdentifier: !!(risk.risk_title || risk.name || risk.risk_code)
        });

        // FILTRO MUITO MAIS PERMISSIVO: aceitar qualquer risco que tenha pelo menos um identificador
        const hasIdentifier = risk.risk_title || risk.name || risk.risk_code;
        if (!hasIdentifier) {
          console.log('🔍 Risco rejeitado - sem identificador:', risk.id);
          return false;
        }

        // Excluir apenas riscos cancelados da matriz
        const cancelledStatuses = ['cancelled', 'cancelado', 'Cancelado'];
        if (cancelledStatuses.includes(risk.status)) {
          return false;
        }

        // Aplicar filtro de busca apenas se houver termo de busca
        if (searchTerm && searchTerm.trim() !== '') {
          const searchLower = searchTerm.toLowerCase();
          const matchesTitle = risk.risk_title?.toLowerCase().includes(searchLower);
          const matchesName = risk.name?.toLowerCase().includes(searchLower);
          const matchesCode = risk.risk_code?.toLowerCase().includes(searchLower);

          if (!matchesTitle && !matchesName && !matchesCode) {
            console.log('🔍 Risco rejeitado - não corresponde à busca:', risk.id);
            return false;
          }
        }

        console.log('🔍 Risco aceito:', risk.id);
        return true;
      })
      .map(risk => {
        // Usar os campos corretos da database, SEM fallback que pode mascarar dados reais
        const impact = risk.impact_score || risk.impact || 0;
        const likelihood = risk.likelihood_score || risk.likelihood || risk.probability_score || 0;

        // Log especial para o risco Vazamento de Credenciais
        if (risk.risk_title?.includes('Vazamento') || risk.risk_code === '005092025') {
          console.log(`🎯 RISCO ESPECÍFICO - ${risk.risk_code} (${risk.risk_title}):`, {
            raw_risk: risk,
            impact_score: risk.impact_score,
            likelihood_score: risk.likelihood_score,
            impact: risk.impact,
            likelihood: risk.likelihood,
            probability_score: risk.probability_score,
            calculated_impact: impact,
            calculated_likelihood: likelihood,
            calculated_score: impact * likelihood,
            stored_risk_score: risk.risk_score,
            risk_level: risk.risk_level
          });
        }

        console.log(`🔍 Processando risco ${risk.risk_code}:`, {
          impact_score: risk.impact_score,
          likelihood_score: risk.likelihood_score,
          calculated_impact: impact,
          calculated_likelihood: likelihood,
          calculated_score: impact * likelihood,
          stored_risk_score: risk.risk_score
        });

        // Determinar o nome/título do risco
        const riskName = risk.risk_title || risk.name || risk.title || `Risco ${risk.risk_code || risk.id}`;
        const riskDescription = risk.risk_description || risk.description || 'Descrição não disponível';

        return {
          ...risk,
          // Garantir compatibilidade com todos os formatos
          name: riskName,
          title: riskName,
          risk_title: riskName,
          description: riskDescription,
          risk_description: riskDescription,
          // Usar valores reais ou 0 se não tiver
          impact: impact > 0 ? Math.min(Math.max(impact, 1), matrixDimensions.rows) : 0,
          likelihood: likelihood > 0 ? Math.min(Math.max(likelihood, 1), matrixDimensions.cols) : 0,
          // Marcar se tem scores válidos (maiores que 0)
          hasValidScores: impact > 0 && likelihood > 0,
          // Adicionar campos para debug
          _debug: {
            original_impact_score: risk.impact_score,
            original_likelihood_score: risk.likelihood_score,
            calculated_impact: impact,
            calculated_likelihood: likelihood,
            has_valid: impact > 0 && likelihood > 0
          }
        };
      })
      .sort((a, b) => {
        // Ordenar do mais recente para o mais antigo
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

    console.log('🔍 processedRisks - Resultado final:', {
      totalProcessed: result.length,
      risksWithTitle: result.filter(r => r.risk_title).length,
      risksWithScores: result.filter(r => r.hasValidScores).length,
      firstRisk: result[0] ? {
        id: result[0].id,
        risk_title: result[0].risk_title,
        hasValidScores: result[0].hasValidScores,
        debug: result[0]._debug
      } : null
    });

    // Log específico para Vazamento de Credenciais
    const vazamentoRisk = result.find(r => r.risk_title?.includes('Vazamento') || r.risk_code === '005092025');
    if (vazamentoRisk) {
      console.log('🎯 RESULTADO FINAL - Vazamento de Credenciais:', {
        risk_code: vazamentoRisk.risk_code,
        risk_title: vazamentoRisk.risk_title,
        impact: vazamentoRisk.impact,
        likelihood: vazamentoRisk.likelihood,
        hasValidScores: vazamentoRisk.hasValidScores,
        debug: vazamentoRisk._debug
      });
    }

    // Log final para debug
    console.log('🔍 processedRisks - Filtros aplicados:', {
      originalCount: risks?.length || 0,
      filteredCount: result.length,
      hasSearchTerm: !!(searchTerm && searchTerm.trim()),
      searchTerm: searchTerm
    });

    return result;
  }, [risks, searchTerm, filters, isLoading, matrixConfig]);

  // Estatísticas dos riscos
  const stats = useMemo(() => {
    if (isLoading) return { total: 0, byLevel: {} };

    const total = processedRisks.length;
    const byLevel: Record<string, number> = {};

    // Inicializar contadores para todos os níveis possíveis
    riskLevels.forEach(level => {
      byLevel[level] = 0;
    });

    // Contar riscos por nível usando nossa função consistente
    processedRisks.forEach(risk => {
      const level = calculateConsistentRiskLevel(risk.impact, risk.likelihood, matrixConfig);
      if (byLevel[level] !== undefined) {
        byLevel[level]++;
      }
    });

    return { total, byLevel };
  }, [processedRisks, matrixConfig, riskLevels, isLoading]);

  // RENDERS CONDICIONAIS: Depois de todos os hooks
  // Se ainda carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configuração da matriz...</p>
        </div>
      </div>
    );
  }

  // ✅ SEMPRE EXIBIR A MATRIZ - SEM VALIDAÇÕES DESNECESSÁRIAS
  if (!matrixConfig) {
    console.log('⚠️ MATRIZ 2 - Ainda carregando...');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
      {/* Header com estatísticas */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Matriz de Risco</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {matrixConfig.type} configurada
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" />
              Somente Leitura
            </Badge>
          </div>
        </div>

        {(() => {
          const totalCards = riskLevels.length + 2;
          const gridClass: Record<number, string> = {
            3: 'grid-cols-3',
            4: 'grid-cols-2 sm:grid-cols-4',
            5: 'grid-cols-2 sm:grid-cols-5',
            6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
            7: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7',
          };
          const colClass = gridClass[totalCards] || 'grid-cols-2 sm:grid-cols-4';
          const getLevelColorClass = (level: string) => {
            if (level.toLowerCase().includes('crítico') || level.toLowerCase().includes('muito alto')) return 'text-red-600';
            if (level.toLowerCase() === 'alto') return 'text-orange-500';
            if (level.toLowerCase() === 'médio') return 'text-yellow-600';
            if (level.toLowerCase() === 'baixo') return 'text-green-600';
            if (level.toLowerCase() === 'muito baixo') return 'text-blue-500';
            return 'text-gray-600';
          };
          return (
            <div className={`grid ${colClass} gap-2 sm:gap-3 mb-5`}>
              <Card className="shadow-sm">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-foreground leading-none">{stats.total}</div>
                  <div className="text-[9px] sm:text-xs text-muted-foreground mt-0.5">Total</div>
                </CardContent>
              </Card>
              {riskLevels.map((level) => (
                <Card key={level} className="shadow-sm">
                  <CardContent className="p-2 sm:p-3 text-center">
                    <div className={`text-2xl sm:text-3xl font-black leading-none ${getLevelColorClass(level)}`}>
                      {stats.byLevel[level] || 0}
                    </div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground leading-tight mt-0.5 truncate">{level}</div>
                  </CardContent>
                </Card>
              ))}
              <Card className="shadow-sm">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-muted-foreground leading-none">
                    {processedRisks.filter(r => !r.hasValidScores).length}
                  </div>
                  <div className="text-[9px] sm:text-xs text-muted-foreground leading-tight mt-0.5">Não Aval.</div>
                </CardContent>
              </Card>
            </div>
          );
        })()}
      </div>

      {/* Matriz de Risco */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Probabilidade vs Impacto</CardTitle>
          <CardDescription>
            Visualização dos riscos plotados por probabilidade (horizontal) e impacto (vertical)
          </CardDescription>

          {/* Legenda de cores - texto branco em todos os elementos */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="text-sm font-medium">Legenda:</span>
            {(
              // Usar as faixas EXATAS da configuração salva (matriz verdadeira)
              matrixConfig?.risk_levels ? [
                {
                  level: 'Baixo',
                  color: 'bg-green-500 text-white',
                  range: matrixConfig.risk_levels.low.length > 0
                    ? `${Math.min(...matrixConfig.risk_levels.low)}-${Math.max(...matrixConfig.risk_levels.low)}`
                    : '1-2'
                },
                {
                  level: 'Médio',
                  color: 'bg-yellow-500 text-white',
                  range: matrixConfig.risk_levels.medium.length > 0
                    ? `${Math.min(...matrixConfig.risk_levels.medium)}-${Math.max(...matrixConfig.risk_levels.medium)}`
                    : '3-6'
                },
                {
                  level: 'Alto',
                  color: 'bg-orange-500 text-white',
                  range: matrixConfig.risk_levels.high.length > 0
                    ? `${Math.min(...matrixConfig.risk_levels.high)}-${Math.max(...matrixConfig.risk_levels.high)}`
                    : '7-12'
                },
                ...(matrixConfig.risk_levels.critical ? [{
                  level: 'Crítico',
                  color: 'bg-red-500 text-white',
                  range: matrixConfig.risk_levels.critical.length > 0
                    ? `${Math.min(...matrixConfig.risk_levels.critical)}-${Math.max(...matrixConfig.risk_levels.critical)}`
                    : '13-16'
                }] : [])
              ].filter(item => {
                // Filtrar apenas os níveis que têm valores definidos
                const levelKey = item.level.toLowerCase() as keyof typeof matrixConfig.risk_levels;
                return matrixConfig.risk_levels[levelKey]?.length > 0;
              }) : [
                { level: 'Baixo', color: 'bg-green-500 text-white', range: '1-2' },
                { level: 'Médio', color: 'bg-yellow-500 text-white', range: '3-6' },
                { level: 'Alto', color: 'bg-orange-500 text-white', range: '7-12' },
                { level: 'Crítico', color: 'bg-red-500 text-white', range: '13-16' }
              ]
            ).map(({ level, color, range }) => (
              <span
                key={level}
                className={`px-2 py-1 rounded text-xs font-medium ${color}`}
                title={`Score: ${range}`}
              >
                {level}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-1 sm:p-4 lg:p-6">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[300px] sm:min-w-[560px]">
              {/* Headers da matriz */}
              <div className="grid gap-[3px] sm:gap-2 mb-[3px] sm:mb-2" style={{ gridTemplateColumns: `80px repeat(${matrixDimensions.cols}, 1fr)` }}>
                <div className="flex items-center justify-center text-center font-bold text-[8px] sm:text-xs leading-tight p-1">
                  <span className="hidden sm:block">Impacto / Probabilidade</span>
                  <span className="sm:hidden">I / P</span>
                </div>
                {likelihoodLevels.map(level => (
                  <div key={level.level} className={`flex items-center justify-center text-center font-semibold text-[8px] sm:text-xs p-1 sm:p-2 rounded ${level.color} leading-tight`}>
                    <span className="hidden sm:block">{level.label}</span>
                    <span className="sm:hidden line-clamp-2 text-center leading-tight">{level.label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              {/* Linhas da matriz */}
              {impactLevels.map(impactLevel => (
                <div key={impactLevel.level} className="grid gap-[3px] sm:gap-2 mb-[3px] sm:mb-2" style={{ gridTemplateColumns: `80px repeat(${matrixDimensions.cols}, 1fr)` }}>
                  <div className={`flex items-center justify-center text-center font-semibold text-[8px] sm:text-xs p-1 sm:p-2 rounded ${impactLevel.color} leading-tight`}>
                    <span className="hidden sm:block">{impactLevel.label}</span>
                    <span className="sm:hidden line-clamp-2 leading-tight">{impactLevel.label.split(' ')[0]}</span>
                  </div>

                  {likelihoodLevels.map(likelihoodLevel => {
                    const cellRisks = processedRisks.filter(
                      risk => risk.impact === impactLevel.level && risk.likelihood === likelihoodLevel.level
                    );

                    const riskLevel = calculateConsistentRiskLevel(impactLevel.level, likelihoodLevel.level, matrixConfig);
                    const riskScore = impactLevel.level * likelihoodLevel.level;

                    return (
                      <div
                        key={`${impactLevel.level}-${likelihoodLevel.level}`}
                        className={`min-h-[52px] sm:min-h-[70px] lg:min-h-[80px] p-1 sm:p-2 rounded border border-white/20 sm:border-2 relative ${getRiskColor(impactLevel.level, likelihoodLevel.level, matrixConfig)
                          } ${cellRisks.length > 0 ? 'cursor-pointer hover:opacity-80 active:opacity-70' : ''}`}
                        onClick={() => cellRisks.length > 0 && setSelectedRisk(cellRisks[0])}
                      >
                        {/* Score no canto superior direito */}
                        <div className="absolute top-[2px] right-[2px] sm:top-1 sm:right-1 text-white font-bold text-[7px] sm:text-[11px] bg-black/25 rounded px-[3px] py-[1px]">
                          {riskScore}
                        </div>

                        {/* Conteúdo principal centralizado */}
                        <div className="flex flex-col items-center justify-center h-full pt-1">
                          <div className="text-[7px] sm:text-[10px] lg:text-xs font-bold text-center leading-tight text-white/90">
                            {riskLevel}
                          </div>
                          {cellRisks.length > 0 && (
                            <div className="flex flex-col items-center mt-0.5">
                              <span className="text-base sm:text-2xl lg:text-3xl font-black leading-none drop-shadow-sm text-white">{cellRisks.length}</span>
                              <span className="text-[6px] sm:text-[9px] leading-tight opacity-80 text-white">risco{cellRisks.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de riscos */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-background to-accent/20 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Riscos Identificados</CardTitle>
                <CardDescription className="mt-1">
                  {processedRisks.length} {processedRisks.length === 1 ? 'risco plotado' : 'riscos plotados'} na matriz
                </CardDescription>
              </div>
            </div>
            {processedRisks.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">Score médio:</span>
                <Badge variant="outline" className="font-mono">
                  {(processedRisks.reduce((acc, risk) => acc + (risk.impact * risk.likelihood), 0) / processedRisks.length).toFixed(1)}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {processedRisks.length === 0 ? (
            <div className="text-center py-12 px-6 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum risco identificado</h3>
              <p className="text-sm max-w-md mx-auto">Adicione riscos ao sistema para visualizar a análise na matriz</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {processedRisks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((risk, index) => {
                const riskLevel = risk.hasValidScores
                  ? calculateConsistentRiskLevel(risk.impact, risk.likelihood, matrixConfig)
                  : 'Sem Avaliacao';
                const riskScore = risk.hasValidScores ? risk.impact * risk.likelihood : 0;
                const riskColor = risk.hasValidScores
                  ? getRiskColor(risk.impact, risk.likelihood, matrixConfig)
                  : 'bg-gray-500 text-white';
                return (
                  <div
                    key={risk.id || index}
                    className="group relative px-3 py-3 sm:px-5 sm:py-4 hover:bg-accent/30 transition-all duration-200 cursor-pointer border-l-2 border-l-transparent hover:border-l-primary"
                    onClick={() => setSelectedRisk(risk)}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${riskColor} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                        <span className="text-white font-bold text-xs">{risk.hasValidScores ? riskScore : '?'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {risk.risk_title || `Risco ${(currentPage - 1) * itemsPerPage + index + 1}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {risk.risk_code && <span className="text-[10px] text-muted-foreground font-mono">{risk.risk_code}</span>}
                          {risk.risk_code && risk.created_at && <span className="text-[9px] text-muted-foreground">·</span>}
                          {risk.created_at && <span className="text-[10px] text-muted-foreground">{new Date(risk.created_at).toLocaleDateString('pt-BR')}</span>}
                        </div>
                      </div>
                      <div
                        className="flex-shrink-0 inline-flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={risk.hasValidScores ? getRiskBadgeStyle(riskLevel) : { backgroundColor: '#6b7280', color: '#fff' }}
                      >
                        {risk.hasValidScores ? riskLevel : 'N/A'}
                      </div>
                    </div>
                    {risk.risk_description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1.5 pl-[42px]">{risk.risk_description}</p>
                    )}
                    <div className="flex items-center gap-1.5 pl-[42px] flex-wrap mt-1">
                      <div className="inline-flex items-center font-semibold text-[9px] px-1.5 py-[2px] rounded-md" style={getStatusBadgeStyle(risk.status)}>{getStatusBadgeStyle(risk.status).label}</div>
                      {risk.treatment_strategy && (
                        <div className="inline-flex items-center font-semibold text-[9px] px-1.5 py-[2px] rounded-md max-w-[90px] truncate" style={getTreatmentBadgeStyle(risk.treatment_strategy)} title={getTreatmentBadgeStyle(risk.treatment_strategy).label}>{getTreatmentBadgeStyle(risk.treatment_strategy).label}</div>
                      )}
                      {risk.hasValidScores ? (
                        <span className="text-[9px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-[2px] rounded">{risk.impact}×{risk.likelihood}={riskScore}</span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground italic flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" /> Não avaliado</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-6 text-[10px] sm:text-xs px-2 sm:px-3 gap-1 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/risks', { state: { expandRiskId: risk.id } });
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="hidden xs:inline">Ver Detalhes</span>
                        <span className="xs:hidden">Ver</span>
                      </Button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        {processedRisks.length > 0 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Mostrando {Math.min(processedRisks.length, (currentPage - 1) * itemsPerPage + 1)} a {Math.min(processedRisks.length, currentPage * itemsPerPage)} de {processedRisks.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(processedRisks.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(processedRisks.length / itemsPerPage)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de detalhes do risco */}
      {
        selectedRisk && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {selectedRisk.risk_title || 'Risco'}
                </CardTitle>
                <CardDescription className="flex gap-2 mt-2">
                  <Badge className={getRiskColor(selectedRisk.impact, selectedRisk.likelihood, matrixConfig)}>
                    {calculateRiskLevel(selectedRisk.likelihood, selectedRisk.impact)}
                  </Badge>
                  {selectedRisk.treatment_strategy && (
                    <Badge style={getTreatmentBadgeStyle(selectedRisk.treatment_strategy)}>
                      {getTreatmentBadgeStyle(selectedRisk.treatment_strategy).label}
                    </Badge>
                  )}
                  <Badge style={getStatusBadgeStyle(selectedRisk.status)}>
                    {getStatusBadgeStyle(selectedRisk.status).label}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Descrição</h4>
                    <p className="text-sm text-gray-600">
                      {selectedRisk.risk_description || 'Sem descrição disponível'}
                    </p>
                  </div>

                  {selectedRisk.risk_code && (
                    <div>
                      <h4 className="font-semibold mb-2">Código do Risco</h4>
                      <p className="text-sm text-gray-600 font-mono">
                        {selectedRisk.risk_code}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Impacto</h4>
                      <div className="text-2xl font-bold">{selectedRisk.impact}/{matrixDimensions.rows}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Probabilidade</h4>
                      <div className="text-2xl font-bold">{selectedRisk.likelihood}/{matrixDimensions.cols}</div>
                    </div>
                  </div>

                  {selectedRisk.treatment_strategy && (
                    <div>
                      <h4 className="font-semibold mb-2">Estratégia de Tratamento</h4>
                      <div className="flex items-center gap-2">
                        <Badge style={getTreatmentBadgeStyle(selectedRisk.treatment_strategy)}>
                          {getTreatmentBadgeStyle(selectedRisk.treatment_strategy).label}
                        </Badge>
                      </div>
                      {selectedRisk.treatment_rationale && (
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedRisk.treatment_rationale}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRisk(null)}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    </div >
  );
};

export default RiskMatrixView;

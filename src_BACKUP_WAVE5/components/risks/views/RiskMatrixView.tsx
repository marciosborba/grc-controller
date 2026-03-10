import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, AlertTriangle, TrendingUp, Zap, ArrowLeft, Eye, Lock, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSecurity } from '@/utils/tenantSecurity';
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
  const { user } = useAuth();
  const { userTenantId } = useTenantSecurity();
  const [isLoading, setIsLoading] = useState(true);
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig | null>(null);
  
  // Tenant ID - Usando a mesma lógica que Matrix 1
  const tenantId = userTenantId || user?.tenantId;
  
  // DEBUG: Verificar se os dados estão chegando
  console.log('🔍 MATRIZ 2 (SOMENTE LEITURA) - RiskMatrixView - Dados recebidos:', {
    risksLength: risks?.length || 0,
    risks: risks?.slice(0, 3).map(r => ({ id: r.id, risk_title: r.risk_title, name: r.name })),
    searchTerm,
    filters,
    isLoading,
    matrixConfig: matrixConfig?.type,
    tenantId
  });
  
  console.log('🔍 MATRIZ 2 - TENANT ID ATUAL:', tenantId);
  console.log('🔍 MATRIZ 2 - userTenantId:', userTenantId);
  console.log('🔍 MATRIZ 2 - user?.tenantId:', user?.tenantId);

  // Carregar configuração diretamente do banco de dados
  useEffect(() => {
    const loadMatrixConfig = async () => {
      if (!tenantId) {
        console.log('⚠️ MATRIZ 2 - Nenhum tenant ID encontrado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('📥 MATRIZ 2 - Carregando configuração do banco para tenant:', tenantId);

        const { data, error } = await supabase
          .from('tenants')
          .select('settings')
          .eq('id', tenantId)
          .single();

        if (error) {
          console.error('❌ MATRIZ 2 - Erro ao carregar configuração:', error);
          return;
        }

        let matrixConfig: MatrixConfig;
        
        if (data?.settings?.risk_matrix) {
          // 💾 USAR DADOS DO BANCO
          const riskMatrix = data.settings.risk_matrix;
          console.log('✅ MATRIZ 2 - Usando configuração do banco:', riskMatrix);
          
          matrixConfig = {
            type: riskMatrix.type || '5x5',
            calculation_method: riskMatrix.calculation_method || 'multiplication',
            impact_labels: riskMatrix.impact_labels || [],
            likelihood_labels: riskMatrix.likelihood_labels || [],
            risk_levels_custom: riskMatrix.risk_levels_custom || [],
            risk_levels: riskMatrix.risk_levels || {}
          };
        } else {
          // 🎨 USAR PADRÃO 5X5 SE NÃO HÁ DADOS
          console.log('🎨 MATRIZ 2 - Usando configuração padrão 5x5');
          
          matrixConfig = {
            type: '5x5',
            calculation_method: 'multiplication',
            impact_labels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'],
            likelihood_labels: ['Muito Raro', 'Raro', 'Possível', 'Provável', 'Muito Provável'],
            risk_levels_custom: [],
            risk_levels: {
              low: [1, 2, 3, 4, 5],
              medium: [6, 7, 8, 9, 10],
              high: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
              critical: [21, 22, 23, 24, 25]
            }
          };
        }
        
        setMatrixConfig(matrixConfig);
        console.log('✅ MATRIZ 2 - Matriz configurada:', {
          type: matrixConfig.type,
          impactLabels: matrixConfig.impact_labels,
          likelihoodLabels: matrixConfig.likelihood_labels
        });

      } catch (error) {
        console.error('💥 MATRIZ 2 - Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatrixConfig();
  }, [tenantId]);
  
  // 🔄 RECARREGAR SEMPRE QUE O COMPONENTE FOR ACESSADO
  useEffect(() => {
    console.log('🔄 MATRIZ 2 - Componente montado/acessado - Forçando recarga do banco');
    
    const forceReload = async () => {
      if (!tenantId) return;
      
      try {
        console.log('📎 MATRIZ 2 - Fazendo consulta FRESCA ao banco...');
        
        const { data, error } = await supabase
          .from('tenants')
          .select('settings')
          .eq('id', tenantId)
          .single();
          
        if (error) {
          console.error('❌ MATRIZ 2 - Erro na consulta fresca:', error);
          return;
        }
        
        let matrixConfig: MatrixConfig;
        
        if (data?.settings?.risk_matrix) {
          const riskMatrix = data.settings.risk_matrix;
          console.log('✅ MATRIZ 2 - Dados FRESCOS do banco:', riskMatrix);
          
          matrixConfig = {
            type: riskMatrix.type || '5x5',
            calculation_method: riskMatrix.calculation_method || 'multiplication',
            impact_labels: riskMatrix.impact_labels || [],
            likelihood_labels: riskMatrix.likelihood_labels || [],
            risk_levels_custom: riskMatrix.risk_levels_custom || [],
            risk_levels: riskMatrix.risk_levels || {}
          };
        } else {
          console.log('🎨 MATRIZ 2 - Sem dados no banco, usando padrão 5x5');
          
          matrixConfig = {
            type: '5x5',
            calculation_method: 'multiplication',
            impact_labels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'],
            likelihood_labels: ['Muito Raro', 'Raro', 'Possível', 'Provável', 'Muito Provável'],
            risk_levels_custom: [],
            risk_levels: {
              low: [1, 2, 3, 4, 5],
              medium: [6, 7, 8, 9, 10],
              high: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
              critical: [21, 22, 23, 24, 25]
            }
          };
        }
        
        setMatrixConfig(matrixConfig);
        console.log('✅ MATRIZ 2 - Matriz ATUALIZADA com dados frescos:', {
          type: matrixConfig.type,
          impactLabels: matrixConfig.impact_labels,
          likelihoodLabels: matrixConfig.likelihood_labels
        });
        
      } catch (error) {
        console.error('💥 MATRIZ 2 - Erro na recarga fresca:', error);
      }
    };
    
    forceReload();
  }, []); // Executar sempre que o componente for montado

  // Escutar eventos de sincronização da Matrix 1
  useEffect(() => {
    const handleMatrixUpdate = (event: CustomEvent) => {
      const { tenantId: eventTenantId, matrixConfig: newConfig } = event.detail;
      
      // Só atualizar se for do mesmo tenant
      if (eventTenantId === tenantId && newConfig) {
        console.log('🔄 MATRIZ 2 - Sincronização automática recebida da Matriz 1:', newConfig);
        
        // Converter para o formato esperado pela Matriz 2
        const syncedConfig: MatrixConfig = {
          type: newConfig.type,
          calculation_method: newConfig.calculation_method,
          impact_labels: newConfig.impact_labels,
          likelihood_labels: newConfig.likelihood_labels,
          risk_levels_custom: newConfig.risk_levels_custom,
          risk_levels: newConfig.risk_levels
        };
        
        setMatrixConfig(syncedConfig);
        console.log('✅ MATRIZ 2 - Atualizada automaticamente:', {
          type: syncedConfig.type,
          impactLabels: syncedConfig.impact_labels,
          likelihoodLabels: syncedConfig.likelihood_labels
        });
      }
    };

    window.addEventListener('matrix-config-updated', handleMatrixUpdate as EventListener);
    
    return () => {
      window.removeEventListener('matrix-config-updated', handleMatrixUpdate as EventListener);
    };
  }, [tenantId]);

  // Criar níveis dinâmicos baseados na configuração carregada do banco
  const matrixLabels = useMemo(() => {
    if (!matrixConfig) return { impact: [], likelihood: [] };
    return {
      impact: matrixConfig.impact_labels,
      likelihood: matrixConfig.likelihood_labels
    };
  }, [matrixConfig]);
  
  const riskLevels = useMemo(() => {
    if (!matrixConfig?.risk_levels_custom) return [];
    return matrixConfig.risk_levels_custom.map(level => level.name);
  }, [matrixConfig]);

  // Calcular dimensões da matriz baseado na configuração
  const matrixDimensions = useMemo(() => {
    if (!matrixConfig) return { rows: 5, cols: 5 };
    const size = parseInt(matrixConfig.type.charAt(0));
    return { rows: size, cols: size };
  }, [matrixConfig]);

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

  // HOOKS: Todos os hooks devem vir antes de qualquer return condicional

  // Criar arrays de níveis dinâmicos baseados na configuração do banco
  const impactLevels = useMemo(() => {
    if (!matrixConfig) return [];
    // Inverter a ordem dos labels para exibir de cima para baixo (Alto -> Baixo)
    const reversedLabels = [...matrixLabels.impact].reverse();
    
    return reversedLabels.map((label, index) => {
      // Para matriz 3x3: index 0 = Alto (level 3), index 1 = Médio (level 2), index 2 = Baixo (level 1)
      const level = matrixLabels.impact.length - index;
      
      return {
        level,
        label,
        color: 'bg-muted text-foreground' // Cor neutra para headers
      };
    });
  }, [matrixLabels.impact, matrixConfig]);

  const likelihoodLevels = useMemo(() => {
    if (!matrixConfig) return [];
    return matrixLabels.likelihood.map((label, index) => ({
      level: index + 1,
      label,
      color: 'bg-muted text-foreground' // Cor neutra para headers
    }));
  }, [matrixLabels.likelihood, matrixConfig]);

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Matriz de Risco</h1>
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="secondary">
                {matrixConfig.type} configurada
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Somente Leitura
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(riskLevels.length + 1, 6)}, 1fr)` }}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          
          {riskLevels.map((level, index) => {
            const getColorClass = (level: string) => {
              // Usar vermelho mais forte para crítico, cores consistentes
              if (level.includes('Crítico') || level === 'Muito Alto') return 'text-red-700';
              if (level === 'Alto') return 'text-orange-500';
              if (level === 'Médio') return 'text-yellow-600';
              if (level === 'Baixo') return 'text-green-600';
              if (level === 'Muito Baixo') return 'text-blue-600';
              return 'text-gray-600';
            };
            
            return (
              <Card key={level}>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${getColorClass(level)}`}>
                    {stats.byLevel[level] || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">{level}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] p-4">
              {/* Headers da matriz */}
              <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `repeat(${matrixDimensions.cols + 1}, 1fr)` }}>
                <div className="text-center font-semibold text-sm">Impacto / Probabilidade</div>
                {likelihoodLevels.map(level => (
                  <div key={level.level} className={`text-center font-semibold text-sm p-2 rounded ${level.color}`}>
                    {level.label}
                  </div>
                ))}
              </div>
              
              {/* Linhas da matriz */}
              {impactLevels.map(impactLevel => (
                <div key={impactLevel.level} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `repeat(${matrixDimensions.cols + 1}, 1fr)` }}>
                  <div className={`text-center font-semibold text-sm p-2 rounded ${impactLevel.color}`}>
                    {impactLevel.label}
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
                        className={`min-h-[60px] p-2 rounded border-2 border-gray-200 relative ${
                          getRiskColor(impactLevel.level, likelihoodLevel.level, matrixConfig)
                        } ${cellRisks.length > 0 ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={() => cellRisks.length > 0 && setSelectedRisk(cellRisks[0])}
                      >
                        {/* Score no canto superior direito */}
                        <div className="absolute top-1 right-1 text-white font-bold text-xs bg-black/20 
                                      rounded px-1 py-0.5 backdrop-blur-sm">
                          {riskScore}
                        </div>
                        
                        {/* Conteúdo principal centralizado */}
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-xs font-semibold mb-1 text-center">
                            {riskLevel}
                          </div>
                          {cellRisks.length > 0 && (
                            <div className="text-xs text-center">
                              {cellRisks.length} risco{cellRisks.length > 1 ? 's' : ''}
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
          {(() => {
            console.log('🔍 Renderizando lista de riscos:', {
              processedRisksLength: processedRisks.length,
              showingEmpty: processedRisks.length === 0
            });
            
            return processedRisks.length === 0 ? (
              <div className="text-center py-12 px-6 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum risco identificado</h3>
                <p className="text-sm max-w-md mx-auto">
                  Comece adicionando riscos ao seu sistema para visualizar a análise de risco na matriz
                </p>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-xs">
                  <p><strong>Debug Info:</strong></p>
                  <p>Riscos originais: {risks?.length || 0}</p>
                  <p>Matrix loading: {String(isLoading)}</p>
                  <p>Search term: "{searchTerm}"</p>
                  <p>Matrix config: {matrixConfig ? 'Carregado' : 'Não carregado'}</p>
                  <p>Matrix type: {matrixConfig?.type || 'N/A'}</p>
                  {risks && risks.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Primeiros 3 riscos originais:</strong></p>
                      {risks.slice(0, 3).map((risk, idx) => (
                        <div key={idx} className="text-xs border-l-2 border-gray-300 pl-2 mb-1">
                          <p>#{idx + 1} ID: {risk.id}</p>
                          <p>Title: {risk.risk_title || 'N/A'}</p>
                          <p>Name: {risk.name || 'N/A'}</p>
                          <p>Code: {risk.risk_code || 'N/A'}</p>
                          <p>Status: {risk.status || 'N/A'}</p>
                          <p>Impact: {risk.impact_score || risk.impact || 'N/A'}</p>
                          <p>Likelihood: {risk.likelihood_score || risk.likelihood || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(() => {
                  console.log('🔍 Renderizando', processedRisks.length, 'riscos na lista');
                  return null;
                })()}
                {processedRisks.map((risk, index) => {
                // Calcular o nível de risco REAL baseado na matriz configurada
                const riskLevel = risk.hasValidScores ? calculateConsistentRiskLevel(risk.impact, risk.likelihood, matrixConfig) : 'Sem Avaliação';
                const riskScore = risk.hasValidScores ? risk.impact * risk.likelihood : 0;
                const riskColor = risk.hasValidScores ? getRiskColor(risk.impact, risk.likelihood, matrixConfig) : 'bg-gray-500 text-white';
                
                // console.log(`Risco ${risk.risk_code}: Impact=${risk.impact}, Likelihood=${risk.likelihood}, Score=${riskScore}, Level=${riskLevel}, Saved=${risk.risk_level}`);
                
                
                return (
                  <div
                    key={index}
                    className="group relative p-6 hover:bg-accent/30 transition-all duration-300 cursor-pointer
                             border-l-4 border-l-transparent hover:border-l-primary
                             dark:hover:bg-accent/20"
                    onClick={() => setSelectedRisk(risk)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Risk Level Indicator */}
                      <div className="flex-shrink-0 relative">
                        <div className={`w-10 h-10 rounded-xl ${riskColor} flex items-center justify-center shadow-sm
                                      group-hover:scale-110 transition-transform duration-200`}>
                          <span className="text-white font-bold text-sm">
                            {risk.hasValidScores ? riskScore : '?'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          <div className={`w-4 h-4 rounded-full ${riskColor} border-2 border-background
                                        flex items-center justify-center`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary 
                                         transition-colors duration-200 line-clamp-2">
                              {risk.risk_title || `Risco ${index + 1}`}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              {risk.risk_code && (
                                <p className="text-sm text-muted-foreground font-mono">
                                  Código: {risk.risk_code}
                                </p>
                              )}
                              {risk.created_at && (
                                <p className="text-sm text-muted-foreground">
                                  Criado em: {new Date(risk.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {risk.hasValidScores ? (
                              <div
                                className="inline-flex items-center justify-center font-semibold text-xs px-3 py-1 rounded-md
                                          group-hover:shadow-md transition-all duration-200"
                                style={getRiskBadgeStyle(riskLevel)}
                              >
                                {riskLevel}
                              </div>
                            ) : (
                              <div
                                className="inline-flex items-center justify-center font-semibold text-xs px-3 py-1 rounded-md
                                          group-hover:shadow-md transition-all duration-200"
                                style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
                              >
                                Sem Avaliação
                              </div>
                            )}
                            {risk.treatment_strategy && (
                              <div
                                className="inline-flex items-center justify-center font-semibold text-xs px-3 py-1 rounded-md
                                          group-hover:shadow-md transition-all duration-200"
                                style={getTreatmentBadgeStyle(risk.treatment_strategy)}
                              >
                                {getTreatmentBadgeStyle(risk.treatment_strategy).label}
                              </div>
                            )}
                            <div
                              className="inline-flex items-center justify-center font-semibold text-xs px-3 py-1 rounded-md
                                        group-hover:shadow-md transition-all duration-200"
                              style={getStatusBadgeStyle(risk.status)}
                            >
                              {getStatusBadgeStyle(risk.status).label}
                            </div>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                          {risk.risk_description || 'Descrição não disponível para este risco.'}
                        </p>

                        {/* Metrics Row */}
                        <div className="flex items-center justify-between">
                          {risk.hasValidScores ? (
                            <>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-8 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full">
                                    <div 
                                      className="h-2 bg-foreground rounded-full transition-all duration-300"
                                      style={{ width: `${(risk.impact / matrixDimensions.rows) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-muted-foreground font-medium">
                                    Impacto <span className="font-semibold text-foreground">{risk.impact}</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-8 h-2 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full">
                                    <div 
                                      className="h-2 bg-foreground rounded-full transition-all duration-300"
                                      style={{ width: `${(risk.likelihood / matrixDimensions.cols) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-muted-foreground font-medium">
                                    Probabilidade <span className="font-semibold text-foreground">{risk.likelihood}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Target className="h-3 w-3" />
                                <span className="font-mono bg-muted px-2 py-1 rounded">
                                  {risk.impact} × {risk.likelihood} = {riskScore}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Risco ainda não avaliado - Impacto e Probabilidade não definidos</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Modal de detalhes do risco */}
      {selectedRisk && (
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
      )}
    </div>
  );
};

export default RiskMatrixView;
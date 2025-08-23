import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface RiskMatrixViewProps {
  risks: any[];
  searchTerm?: string;
  filters?: any;
}

const getRiskColor = (impact: number, likelihood: number, tenantSettings: any) => {
  const riskValue = impact * likelihood;
  const isMatrix5x5 = tenantSettings?.risk_matrix?.type === '5x5';
  
  if (isMatrix5x5) {
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
const calculateConsistentRiskLevel = (impact: number, likelihood: number, tenantSettings: any) => {
  const riskValue = impact * likelihood;
  const isMatrix5x5 = tenantSettings?.risk_matrix?.type === '5x5';
  
  if (isMatrix5x5) {
    // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-19), Crítico (20-25)
    if (riskValue >= 20) return 'Crítico';
    else if (riskValue >= 9) return 'Alto';
    else if (riskValue >= 5) return 'Médio';
    else if (riskValue >= 3) return 'Baixo';
    else return 'Muito Baixo';
  } else {
    // Matriz 4x4: Baixo (1-2), Médio (3-7), Alto (8-15), Crítico (16)
    if (riskValue >= 16) return 'Crítico';
    else if (riskValue >= 8) return 'Alto';
    else if (riskValue >= 3) return 'Médio';
    else return 'Baixo';
  }
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

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({
  risks,
  searchTerm = '',
  filters = {}
}) => {
  const [selectedRisk, setSelectedRisk] = useState<any>(null);
  const { 
    tenantSettings, 
    isLoading: settingsLoading, 
    calculateRiskLevel, 
    getMatrixLabels, 
    getMatrixDimensions,
    getRiskLevels,
    isMatrix4x4,
    isMatrix5x5 
  } = useTenantSettings();

  // Criar níveis dinâmicos baseados na configuração da tenant
  const matrixLabels = useMemo(() => getMatrixLabels(), [tenantSettings]);
  const matrixDimensions = useMemo(() => getMatrixDimensions(), [tenantSettings]);
  const riskLevels = useMemo(() => getRiskLevels(), [tenantSettings]);

  // Criar arrays de níveis dinâmicos
  const impactLevels = useMemo(() => {
    return matrixLabels.impact.map((label, index) => {
      // Definir labels customizados que progridem de baixo para cima
      const getCustomLabel = (index: number, originalLength: number) => {
        if (originalLength === 4) {
          // Para matriz 4x4: index 0 = topo (level 4), index 3 = base (level 1)
          switch(index) {
            case 0: return 'Maior';         // Topo (level 4) - Vermelho
            case 1: return 'Moderado';      // level 3 - Laranja
            case 2: return 'Menor';         // level 2 - Amarelo
            case 3: return 'Insignificante'; // Base (level 1) - Verde
            default: return label;
          }
        } else {
          // Para matriz 5x5: index 0 = topo (level 5), index 4 = base (level 1)
          switch(index) {
            case 0: return 'Maior';         // Topo (level 5) - Vermelho
            case 1: return 'Alto';          // level 4 - Laranja
            case 2: return 'Moderado';      // level 3 - Amarelo
            case 3: return 'Menor';         // level 2 - Verde
            case 4: return 'Insignificante'; // Base (level 1) - Azul
            default: return label;
          }
        }
      };
      
      // Definir cores baseadas no level (não no index)
      const getImpactColor = (level: number, originalLength: number) => {
        if (originalLength === 4) {
          switch(level) {
            case 1: return 'bg-green-500 text-white';    // Insignificante (base)
            case 2: return 'bg-yellow-500 text-white';   // Menor
            case 3: return 'bg-orange-500 text-white';   // Moderado
            case 4: return 'bg-red-500 text-white';      // Maior (topo)
            default: return 'bg-gray-500 text-white';
          }
        } else {
          switch(level) {
            case 1: return 'bg-blue-500 text-white';     // Muito Baixo (base)
            case 2: return 'bg-green-500 text-white';    // Baixo
            case 3: return 'bg-yellow-500 text-white';   // Médio
            case 4: return 'bg-orange-500 text-white';   // Alto
            case 5: return 'bg-red-500 text-white';      // Muito Alto (topo)
            default: return 'bg-gray-500 text-white';
          }
        }
      };
      
      const level = matrixLabels.impact.length - index; // MANTER lógica original da matriz (5,4,3,2,1)
      
      return {
        level,
        label: getCustomLabel(index, matrixLabels.impact.length),
        color: getImpactColor(level, matrixLabels.impact.length)
      };
    });
  }, [matrixLabels.impact]);

  const likelihoodLevels = useMemo(() => {
    return matrixLabels.likelihood.map((label, index) => {
      // Usar EXATAMENTE as mesmas cores dos labels de impacto (texto branco em todos)
      const getLikelihoodColor = (index: number) => {
        if (matrixLabels.likelihood.length === 4) {
          // Para matriz 4x4: Baixo, Médio, Alto, Crítico (igual aos labels de impacto)
          switch(index) {
            case 0: return 'bg-green-500 text-white';    // Baixo
            case 1: return 'bg-yellow-500 text-white';   // Médio
            case 2: return 'bg-orange-500 text-white';   // Alto  
            case 3: return 'bg-red-500 text-white';      // Crítico - VERMELHO
            default: return 'bg-gray-500 text-white';
          }
        } else {
          // Para matriz 5x5: Muito Baixo, Baixo, Médio, Alto, Muito Alto (igual aos labels de impacto)
          switch(index) {
            case 0: return 'bg-blue-500 text-white';     // Muito Baixo
            case 1: return 'bg-green-500 text-white';    // Baixo
            case 2: return 'bg-yellow-500 text-white';   // Médio
            case 3: return 'bg-orange-500 text-white';   // Alto
            case 4: return 'bg-red-500 text-white';      // Muito Alto - VERMELHO
            default: return 'bg-gray-500 text-white';
          }
        }
      };

      return {
        level: index + 1, // Ordem normal (1,2,3,4,5 ou 1,2,3,4)
        label,
        color: getLikelihoodColor(index)
      };
    });
  }, [matrixLabels.likelihood]);

  // Filtrar e processar riscos
  const processedRisks = useMemo(() => {
    if (settingsLoading) return [];
    
    return risks.filter(risk => {
      if (searchTerm && !risk.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    }).map(risk => {
      // Usar os campos corretos da database: impact_assessment e likelihood_assessment
      const impact = risk.impact_assessment || risk.impact_score || risk.impact || 1;
      const likelihood = risk.likelihood_assessment || risk.likelihood_score || risk.likelihood || 1;
      
      return {
        ...risk,
        impact: Math.min(Math.max(impact, 1), matrixDimensions.rows), // Garantir que está dentro dos limites
        likelihood: Math.min(Math.max(likelihood, 1), matrixDimensions.cols)
      };
    });
  }, [risks, searchTerm, filters, settingsLoading, matrixDimensions]);

  // Estatísticas dos riscos
  const stats = useMemo(() => {
    if (settingsLoading) return { total: 0, byLevel: {} };
    
    const total = processedRisks.length;
    const byLevel: Record<string, number> = {};
    
    // Inicializar contadores para todos os níveis possíveis
    riskLevels.forEach(level => {
      byLevel[level] = 0;
    });
    
    // Contar riscos por nível usando nossa função consistente
    processedRisks.forEach(risk => {
      const level = calculateConsistentRiskLevel(risk.impact, risk.likelihood, tenantSettings);
      if (byLevel[level] !== undefined) {
        byLevel[level]++;
      }
    });
    
    return { total, byLevel };
  }, [processedRisks, tenantSettings, riskLevels, settingsLoading]);

  // Show loading while tenant settings are loading
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações da matriz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
      {/* Header com estatísticas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Matriz de Risco</h1>
            <Badge variant="secondary" className="ml-2">
              {tenantSettings?.risk_matrix?.type || '5x5'} configurada
            </Badge>
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
              tenantSettings?.risk_matrix?.type === '5x5' ? [
                { level: 'Muito Baixo', color: 'bg-blue-500 text-white', range: '1-2' },
                { level: 'Baixo', color: 'bg-green-500 text-white', range: '3-4' },
                { level: 'Médio', color: 'bg-yellow-500 text-white', range: '5-8' },
                { level: 'Alto', color: 'bg-orange-500 text-white', range: '9-19' },
                { level: 'Crítico', color: 'bg-red-500 text-white', range: '20-25' }
              ] : [
                { level: 'Baixo', color: 'bg-green-500 text-white', range: '1-2' },
                { level: 'Médio', color: 'bg-yellow-500 text-white', range: '3-7' },
                { level: 'Alto', color: 'bg-orange-500 text-white', range: '8-15' },
                { level: 'Crítico', color: 'bg-red-500 text-white', range: '16' }
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
                    
                    const riskLevel = calculateConsistentRiskLevel(impactLevel.level, likelihoodLevel.level, tenantSettings);
                    const riskScore = impactLevel.level * likelihoodLevel.level;
                    
                    return (
                      <div
                        key={`${impactLevel.level}-${likelihoodLevel.level}`}
                        className={`min-h-[60px] p-2 rounded border-2 border-gray-200 relative ${
                          getRiskColor(impactLevel.level, likelihoodLevel.level, tenantSettings)
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
          {processedRisks.length === 0 ? (
            <div className="text-center py-12 px-6 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum risco identificado</h3>
              <p className="text-sm max-w-md mx-auto">
                Comece adicionando riscos ao seu sistema para visualizar a análise de risco na matriz
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {processedRisks.map((risk, index) => {
                // Usar nossa função consistente em vez da do hook
                const riskLevel = calculateConsistentRiskLevel(risk.impact, risk.likelihood, tenantSettings);
                const riskScore = risk.impact * risk.likelihood;
                const riskColor = getRiskColor(risk.impact, risk.likelihood, tenantSettings);
                
                
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
                          <span className="text-white font-bold text-sm">{riskScore}</span>
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
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary 
                                       transition-colors duration-200 line-clamp-2">
                            {risk.name || risk.title || `Risco ${index + 1}`}
                          </h3>
                          <div
                            className="inline-flex items-center justify-center font-semibold text-xs px-3 py-1 rounded-md
                                      group-hover:shadow-md transition-all duration-200"
                            style={getRiskBadgeStyle(riskLevel)}
                          >
                            {riskLevel}
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                          {risk.description || 'Descrição não disponível para este risco.'}
                        </p>

                        {/* Metrics Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full">
                                <div 
                                  className="h-2 bg-foreground rounded-full transition-all duration-300"
                                  style={{ width: `${(risk.impact / (tenantSettings?.risk_matrix?.type === '4x4' ? 4 : 5)) * 100}%` }}
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
                                  style={{ width: `${(risk.likelihood / (tenantSettings?.risk_matrix?.type === '4x4' ? 4 : 5)) * 100}%` }}
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
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do risco */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {selectedRisk.name || selectedRisk.title || 'Risco'}
              </CardTitle>
              <CardDescription>
                <Badge className={getRiskColor(selectedRisk.impact, selectedRisk.likelihood, tenantSettings)}>
                  {calculateRiskLevel(selectedRisk.likelihood, selectedRisk.impact)}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600">
                    {selectedRisk.description || 'Sem descrição disponível'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Impacto</h4>
                    <div className="text-2xl font-bold">{selectedRisk.impact}/5</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Probabilidade</h4>
                    <div className="text-2xl font-bold">{selectedRisk.likelihood}/5</div>
                  </div>
                </div>
                
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
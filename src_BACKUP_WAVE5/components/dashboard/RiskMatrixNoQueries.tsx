import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';

const RiskMatrixNoQueries = () => {
  console.log('🚀 RiskMatrixNoQueries carregado em:', new Date().toISOString());

  // Dados mockados para teste
  const mockRisks = [
    { id: 1, title: 'Risco de Segurança Cibernética', impact_score: 4, likelihood_score: 3, risk_level: 'Alto' },
    { id: 2, title: 'Risco de Compliance LGPD', impact_score: 3, likelihood_score: 2, risk_level: 'Médio' },
    { id: 3, title: 'Risco Operacional', impact_score: 2, likelihood_score: 4, risk_level: 'Médio' },
    { id: 4, title: 'Risco Financeiro', impact_score: 4, likelihood_score: 4, risk_level: 'Muito Alto' },
    { id: 5, title: 'Risco de Reputação', impact_score: 3, likelihood_score: 3, risk_level: 'Alto' }
  ];

  const matrixConfig = {
    type: "4x4",
    impact_labels: ["Muito Baixo", "Baixo", "Médio", "Alto"],
    likelihood_labels: ["Muito Baixo", "Baixo", "Médio", "Alto"],
    risk_levels: {
      "1-1": "Muito Baixo", "1-2": "Baixo", "1-3": "Médio", "1-4": "Alto",
      "2-1": "Baixo", "2-2": "Baixo", "2-3": "Médio", "2-4": "Alto", 
      "3-1": "Médio", "3-2": "Médio", "3-3": "Alto", "3-4": "Muito Alto",
      "4-1": "Alto", "4-2": "Alto", "4-3": "Muito Alto", "4-4": "Muito Alto"
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'bg-red-500';
      case 'Alto': return 'bg-orange-500';
      case 'Médio': return 'bg-yellow-500';
      case 'Baixo': return 'bg-blue-500';
      case 'Muito Baixo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskTextColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'text-red-700';
      case 'Alto': return 'text-orange-700';
      case 'Médio': return 'text-yellow-700';
      case 'Baixo': return 'text-blue-700';
      case 'Muito Baixo': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  const getCellRisks = (impact: number, likelihood: number) => {
    return mockRisks.filter(risk => 
      risk.impact_score === impact && risk.likelihood_score === likelihood
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Matriz de Riscos (Dados Mockados)</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            SEM QUERIES - TESTE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legenda */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">Muito Alto</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-xs">Alto</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs">Médio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs">Baixo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Muito Baixo</span>
            </div>
          </div>

          {/* Matriz */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header da matriz */}
              <div className="grid grid-cols-6 gap-1 mb-2">
                <div></div>
                <div className="text-center font-semibold text-xs p-2">Muito Baixo</div>
                <div className="text-center font-semibold text-xs p-2">Baixo</div>
                <div className="text-center font-semibold text-xs p-2">Médio</div>
                <div className="text-center font-semibold text-xs p-2">Alto</div>
                <div className="text-center font-semibold text-xs p-2 rotate-0">
                  <div className="transform -rotate-90 origin-center">Probabilidade</div>
                </div>
              </div>

              {/* Linhas da matriz */}
              {[4, 3, 2, 1].map((impact) => (
                <div key={impact} className="grid grid-cols-6 gap-1 mb-1">
                  <div className="flex items-center justify-center font-semibold text-xs p-2">
                    {matrixConfig.impact_labels[impact - 1]}
                    {impact === 2 && (
                      <div className="ml-2 transform rotate-90 origin-center text-xs">
                        Impacto
                      </div>
                    )}
                  </div>
                  
                  {[1, 2, 3, 4].map((likelihood) => {
                    const cellKey = `${impact}-${likelihood}`;
                    const riskLevel = matrixConfig.risk_levels[cellKey];
                    const cellRisks = getCellRisks(impact, likelihood);
                    
                    return (
                      <div
                        key={likelihood}
                        className={`
                          min-h-[80px] p-2 border border-gray-300 rounded
                          ${getRiskColor(riskLevel)} bg-opacity-20
                          hover:bg-opacity-30 transition-all duration-200
                          cursor-pointer
                        `}
                        title={`${riskLevel} (${cellRisks.length} riscos)`}
                      >
                        <div className="text-xs font-medium mb-1">
                          {riskLevel}
                        </div>
                        <div className="space-y-1">
                          {cellRisks.slice(0, 2).map((risk) => (
                            <div
                              key={risk.id}
                              className={`
                                text-xs p-1 rounded
                                ${getRiskColor(risk.risk_level)} bg-opacity-80 text-white
                                truncate
                              `}
                              title={risk.title}
                            >
                              {risk.title.substring(0, 20)}...
                            </div>
                          ))}
                          {cellRisks.length > 2 && (
                            <div className="text-xs text-gray-600">
                              +{cellRisks.length - 2} mais
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

          {/* Resumo com componente dinâmico */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Resumo dos Riscos por Nível</h4>
            <RiskLevelDisplay 
              risks={mockRisks}
              className=""
              size="md"
              responsive={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrixNoQueries;
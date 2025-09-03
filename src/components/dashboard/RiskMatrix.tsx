import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { getTenantMatrixConfig } from '@/utils/risk-analysis';
import { Loader2 } from 'lucide-react';

interface Risk {
  id: string;
  title: string;
  risk_category: string;
  impact_score: number;
  likelihood_score: number;
  risk_level: string;
  status: string;
}

interface MatrixCell {
  risks: Risk[];
  level: 'low' | 'medium' | 'high' | 'critical';
  count: number;
}

interface RiskMatrixConfig {
  type: '4x4' | '5x5';
  impact_labels: string[];
  likelihood_labels: string[];
}

const RiskMatrix = () => {
  const { user } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<MatrixCell[][]>([]);
  const [matrixConfig, setMatrixConfig] = useState<RiskMatrixConfig>({
    type: '4x4',
    impact_labels: ['Baixo', 'Médio', 'Alto', 'Crítico'],
    likelihood_labels: ['Raro', 'Improvável', 'Possível', 'Provável']
  });


  const getRiskColor = (impact: number, likelihood: number) => {
    const riskValue = impact * likelihood;
    
    // Usar as mesmas cores das outras matrizes
    if (matrixConfig.type === '5x5') {
      // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-16), Muito Alto (17-25)
      if (riskValue >= 17) return 'bg-red-500'; // Muito Alto
      else if (riskValue >= 9) return 'bg-orange-500'; // Alto
      else if (riskValue >= 5) return 'bg-yellow-500'; // Médio
      else if (riskValue >= 3) return 'bg-green-500'; // Baixo
      else return 'bg-blue-500'; // Muito Baixo (azul)
    } else {
      // Matriz 4x4: Baixo (1-2), Médio (3-6), Alto (7-9), Muito Alto (10-16)
      if (riskValue >= 10) return 'bg-red-500'; // Muito Alto
      else if (riskValue >= 7) return 'bg-orange-500'; // Alto
      else if (riskValue >= 3) return 'bg-yellow-500'; // Médio
      else return 'bg-green-500'; // Baixo
    }
  };

  const getRiskColorHex = (impact: number, likelihood: number) => {
    const riskValue = impact * likelihood;
    
    // Retornar cores em hex para a legenda
    if (matrixConfig.type === '5x5') {
      if (riskValue >= 17) return '#ef4444'; // Muito Alto
      else if (riskValue >= 9) return '#f97316'; // Alto
      else if (riskValue >= 5) return '#eab308'; // Médio
      else if (riskValue >= 3) return '#22c55e'; // Baixo
      else return '#3b82f6'; // Muito Baixo (azul)
    } else {
      if (riskValue >= 10) return '#ef4444'; // Muito Alto
      else if (riskValue >= 7) return '#f97316'; // Alto
      else if (riskValue >= 3) return '#eab308'; // Médio
      else return '#22c55e'; // Baixo
    }
  };

  const getRiskLevel = (impact: number, likelihood: number): 'low' | 'medium' | 'high' | 'critical' => {
    const score = impact * likelihood;
    
    if (matrixConfig.type === '4x4') {
      if (score >= 12) return 'critical';
      if (score >= 5) return 'high';
      if (score >= 3) return 'medium';
      return 'low';
    } else { // 5x5
      if (score >= 15) return 'critical';
      if (score >= 10) return 'high';
      if (score >= 6) return 'medium';
      return 'low';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar configurações da tenant usando a função centralizada
        if (user?.tenant?.id) {
          // Carregando configuração da matriz para tenant
          const config = await getTenantMatrixConfig(user.tenant.id);
          // Configuração carregada
          setMatrixConfig(config);
        }

        // Buscar riscos - CORRIGIDO: usar tabela 'risk_assessments' com campos corretos
        // Buscando riscos da tabela risk_assessments
        const { data, error } = await supabase
          .from('risk_assessments')
          .select('*');

        if (error) {
          console.error('❌ Erro ao buscar riscos:', error);
          throw error;
        }
        
        // Riscos carregados: data?.length || 0
        setRisks(data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.tenant?.id]);

  useEffect(() => {
    const matrixSize = matrixConfig.type === '4x4' ? 4 : 5;
    
    const getRiskLevelLocal = (impact: number, likelihood: number): 'low' | 'medium' | 'high' | 'critical' => {
      const score = impact * likelihood;
      
      if (matrixConfig.type === '4x4') {
        if (score >= 12) return 'critical';
        if (score >= 5) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
      } else { // 5x5
        if (score >= 15) return 'critical';
        if (score >= 10) return 'high';
        if (score >= 6) return 'medium';
        return 'low';
      }
    };
    
    // Criar matriz dinamicamente baseada na configuração
    const newMatrix: MatrixCell[][] = Array(matrixSize).fill(null).map(() => 
      Array(matrixSize).fill(null).map(() => ({
        risks: [],
        level: 'low' as const,
        count: 0
      }))
    );

    // Distribuir riscos na matriz
    risks.forEach(risk => {
      const impactIndex = risk.impact_score - 1;
      const likelihoodIndex = risk.likelihood_score - 1;
      
      if (impactIndex >= 0 && impactIndex < matrixSize && likelihoodIndex >= 0 && likelihoodIndex < matrixSize) {
        const cell = newMatrix[matrixSize - 1 - likelihoodIndex][impactIndex];
        cell.risks.push(risk);
        cell.count = cell.risks.length;
        cell.level = getRiskLevelLocal(risk.impact_score, risk.likelihood_score);
      }
    });

    setMatrix(newMatrix);
  }, [risks, matrixConfig]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Matriz de Riscos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  const totalRisks = risks.length;

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">Matriz de Riscos ({matrixConfig.type})</CardTitle>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalRisks} risco{totalRisks !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Labels dos números no topo */}
        <div className="flex justify-center">
          <div className={`grid gap-1 w-full max-w-lg ${matrixConfig.type === '4x4' ? 'grid-cols-5' : 'grid-cols-6'}`}>
            <div></div> {/* Espaço vazio para alinhamento */}
            {Array.from({ length: matrixConfig.type === '4x4' ? 4 : 5 }, (_, i) => i + 1).map((num) => (
              <div key={num} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Matriz Principal */}
        <div className="flex justify-center">
          <div className={`grid gap-1 w-full max-w-lg ${matrixConfig.type === '4x4' ? 'grid-cols-5' : 'grid-cols-6'}`}>
            {Array.from({ length: matrixConfig.type === '4x4' ? 4 : 5 }, (_, i) => i + 1).reverse().map((likelihoodValue) => (
              <React.Fragment key={`row-${likelihoodValue}`}>
                <div className="flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {likelihoodValue}
                </div>
                
                {Array.from({ length: matrixConfig.type === '4x4' ? 4 : 5 }, (_, colIndex) => {
                  const impactValue = colIndex + 1;
                  const cellRisks = risks.filter(risk => 
                    risk.impact_score === impactValue && risk.likelihood_score === likelihoodValue
                  );
                  
                  return (
                    <div
                      key={`${likelihoodValue}-${colIndex}`}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center
                        border-2 border-white transition-all duration-200
                        ${getRiskColor(impactValue, likelihoodValue)}
                        hover:scale-105 cursor-pointer
                      `}
                      title={`${cellRisks.length} risco(s) - Impacto: ${impactValue}, Probabilidade: ${likelihoodValue}`}
                    >
                      {cellRisks.length > 0 && (
                        <span className="text-white font-bold text-sm sm:text-base drop-shadow">
                          {cellRisks.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legenda Dinâmica */}
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {(
              matrixConfig.type === '5x5' ? [
                { level: 'Muito Baixo', color: '#3b82f6', range: '1-2' },
                { level: 'Baixo', color: '#22c55e', range: '3-4' },
                { level: 'Médio', color: '#eab308', range: '5-8' },
                { level: 'Alto', color: '#f97316', range: '9-16' },
                { level: 'Muito Alto', color: '#ef4444', range: '17-25' }
              ] : [
                { level: 'Baixo', color: '#22c55e', range: '1-2' },
                { level: 'Médio', color: '#eab308', range: '3-6' },
                { level: 'Alto', color: '#f97316', range: '7-9' },
                { level: 'Muito Alto', color: '#ef4444', range: '10-16' }
              ]
            ).map(({ level, color, range }) => (
              <div key={level} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-white shadow-sm" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {level} <span className="text-xs text-gray-400">({range})</span>
                </span>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Probabilidade (vertical) x Impacto (horizontal) • Matriz {matrixConfig.type}
            <br />
            <span className="text-xs">
              {matrixConfig.type === '5x5' ? '5 níveis de risco (incluindo Muito Baixo)' : '4 níveis de risco'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;

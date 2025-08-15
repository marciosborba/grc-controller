import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Risk {
  id: string;
  title: string;
  risk_category: string;
  impact_score: number;
  likelihood_score: number;
  risk_score: number;
  severity: string;
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
    const product = impact * likelihood;
    const maxProduct = matrixConfig.type === '4x4' ? 16 : 25;
    
    // Cores baseadas no tipo de matriz
    if (matrixConfig.type === '4x4') {
      if (product >= 16) return 'bg-red-900';
      if (product >= 12) return 'bg-red-700';  
      if (product >= 5) return 'bg-orange-400';
      if (product >= 3) return 'bg-yellow-300';
      return 'bg-green-500';
    } else { // 5x5
      if (product >= 20) return 'bg-red-900';
      if (product >= 15) return 'bg-red-700';
      if (product >= 10) return 'bg-orange-400';
      if (product >= 6) return 'bg-yellow-300';
      return 'bg-green-500';
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
        // Buscar configurações da tenant
        if (user?.tenant) {
          const tenantSettings = user.tenant.settings;
          if (tenantSettings?.risk_matrix) {
            setMatrixConfig(tenantSettings.risk_matrix);
          }
        }

        // Buscar riscos
        const { data, error } = await supabase
          .from('risk_assessments')
          .select('*');

        if (error) throw error;
        setRisks(data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
          <div className="text-sm text-gray-500">
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
              <div key={num} className="text-center text-sm font-medium text-gray-500">
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
                <div className="flex items-center justify-center text-sm font-medium text-gray-500">
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

        {/* Legenda */}
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {/* CORREÇÃO: Cores da legenda alinhadas com a função getRiskColor */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 border border-white"></div>
              <span className="text-sm text-gray-500">Baixo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-300 border border-white"></div>
              <span className="text-sm text-gray-500">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-400 border border-white"></div>
              <span className="text-sm text-gray-500">Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-700 border border-white"></div>
              <span className="text-sm text-gray-500">Crítico</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            Probabilidade (vertical) x Impacto (horizontal) • Matriz {matrixConfig.type}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;

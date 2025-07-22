import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
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

const RiskMatrix = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<MatrixCell[][]>([]);


  const getRiskColor = (impact: number, likelihood: number) => {
    const product = impact * likelihood;
    
    // Matriz de cores para 4x4
    if (product >= 12) return 'bg-red-700';  
    if (product >= 9) return 'bg-orange-400';
    if (product >= 4) return 'bg-yellow-300';
    return 'bg-green-500';  
  };

  const getRiskLevel = (impact: number, likelihood: number): 'low' | 'medium' | 'high' | 'critical' => {
    const score = impact * likelihood;
    // CORREÇÃO: Alinhado com a função getRiskColor para consistência
    if (score >= 12) return 'critical';
    if (score >= 9) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const { data, error } = await supabase
          .from('risk_assessments')
          .select('*')
          .eq('status', 'open');

        if (error) throw error;
        setRisks(data || []);
      } catch (error) {
        console.error('Erro ao carregar riscos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRisks();
  }, []);

  useEffect(() => {
    // Criar matriz 4x4
    const newMatrix: MatrixCell[][] = Array(4).fill(null).map(() => 
      Array(4).fill(null).map(() => ({
        risks: [],
        level: 'low' as const,
        count: 0
      }))
    );

    // Distribuir riscos na matriz
    risks.forEach(risk => {
      const impactIndex = risk.impact_score - 1;
      const likelihoodIndex = risk.likelihood_score - 1;
      
      if (impactIndex >= 0 && impactIndex < 4 && likelihoodIndex >= 0 && likelihoodIndex < 4) {
        // CORREÇÃO CIRÚRGICA: O índice da linha deve ser `3 - likelihoodIndex` para não estourar o limite do array
        const cell = newMatrix[3 - likelihoodIndex][impactIndex];
        cell.risks.push(risk);
        cell.count = cell.risks.length;
        cell.level = getRiskLevel(risk.impact_score, risk.likelihood_score);
      }
    });

    setMatrix(newMatrix);
  }, [risks]);

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
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">Matriz de Riscos</CardTitle>
          <div className="text-sm text-gray-500">
            {totalRisks} risco{totalRisks !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Labels dos números 1-4 no topo */}
        <div className="flex justify-center">
          <div className="grid grid-cols-5 gap-1 w-full max-w-lg">
            <div></div> {/* Espaço vazio para alinhamento */}
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="text-center text-sm font-medium text-gray-500">
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Matriz Principal */}
        <div className="flex justify-center">
          {/* CORREÇÃO CIRÚRGICA: grid-cols-5 para 1 coluna de label + 4 de dados */}
          <div className="grid grid-cols-5 gap-1 w-full max-w-lg">
            {/* CORREÇÃO CIRÚRGICA: Iterar de 4 a 1 para renderizar na ordem correta */}
            {[4, 3, 2, 1].map((likelihoodValue) => (
              <React.Fragment key={`row-${likelihoodValue}`}>
                <div className="flex items-center justify-center text-sm font-medium text-gray-500">
                  {likelihoodValue}
                </div>
                
                {/* CORREÇÃO CIRÚRGICA: Array(4) para criar 4 colunas de células */}
                {Array(4).fill(null).map((_, colIndex) => {
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
            Probabilidade (vertical) x Impacto (horizontal)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;

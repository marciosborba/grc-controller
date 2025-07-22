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
    
    // Matriz de cores corrigida: 1=verde (baixo risco), 5=vermelho escuro (alto risco)
    if (product >= 20) return 'bg-red-900'; // 4x5 ou 5x4 ou 5x5 - Vermelho muito escuro
    if (product >= 16) return 'bg-red-700'; // 4x4 - Vermelho escuro
    if (product >= 12) return 'bg-red-500'; // 3x4, 4x3 - Vermelho
    if (product >= 9) return 'bg-orange-600'; // 3x3 - Laranja escuro
    if (product >= 6) return 'bg-orange-400'; // 2x3, 3x2 - Laranja
    if (product >= 4) return 'bg-yellow-500'; // 2x2 - Amarelo
    if (product >= 2) return 'bg-yellow-300'; // 1x2, 2x1 - Amarelo claro
    return 'bg-green-500'; // 1x1 - Verde (menor risco)
  };

  const getRiskLevel = (impact: number, likelihood: number): 'low' | 'medium' | 'high' | 'critical' => {
    const score = impact * likelihood;
    if (score >= 15) return 'critical';
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
    // Criar matriz 5x5
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
        const cell = newMatrix[4 - likelihoodIndex][impactIndex]; // Ajustar para coincidir com a imagem
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="text-sm text-muted-foreground">
            {totalRisks} risco{totalRisks !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Labels dos números 1-5 no topo */}
        <div className="flex-justify-center">
          <div className="grid grid-cols-5 gap-1 w-full max-w-lg">
            <div></div> {/* Espaço vazio para alinhamento */}
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="text-center text-sm font-medium text-muted-foreground">
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Matriz Principal */}
        <div className="flex justify-center">
          <div className="grid grid-cols-6 gap-1 w-full max-w-lg">
            {/* Linha por linha com labels laterais */}
            {[5, 4, 3, 2, 1].map((rowNum, rowIndex) => (
              <React.Fragment key={`row-${rowNum}`}>
                {/* Label lateral */}
                <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {rowNum}
                </div>
                
                {/* Células da matriz */}
                {Array(5).fill(null).map((_, colIndex) => {
                  const impact = colIndex + 1;
                  const likelihood = 6 - rowNum; // 5,4,3,2,1 baseado no rowNum
                  const cellRisks = risks.filter(risk => 
                    risk.impact_score === impact && risk.likelihood_score === likelihood
                  );
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center
                        border-2 border-white transition-all duration-200
                        ${getRiskColor(impact, likelihood)}
                        hover:scale-105 cursor-pointer
                      `}
                      title={`${cellRisks.length} risco(s) - Impacto: ${impact}, Probabilidade: ${likelihood}`}
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 border border-white"></div>
              <span className="text-sm text-muted-foreground">Baixo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500 border border-white"></div>
              <span className="text-sm text-muted-foreground">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500 border border-white"></div>
              <span className="text-sm text-muted-foreground">Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500 border border-white"></div>
              <span className="text-sm text-muted-foreground">Crítico</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Probabilidade (vertical) x Impacto (horizontal)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;
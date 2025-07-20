import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Loader2 } from 'lucide-react';

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

  const impactLabels = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];
  const likelihoodLabels = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];

  const getRiskLevel = (impact: number, likelihood: number): 'low' | 'medium' | 'high' | 'critical' => {
    const score = impact * likelihood;
    if (score >= 20) return 'critical';
    if (score >= 12) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 border-red-500/40 text-red-600';
      case 'high': return 'bg-orange-500/20 border-orange-500/40 text-orange-600';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-600';
      case 'low': return 'bg-green-500/20 border-green-500/40 text-green-600';
      default: return 'bg-muted/20 border-muted/40 text-muted-foreground';
    }
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
    const newMatrix: MatrixCell[][] = Array(5).fill(null).map(() => 
      Array(5).fill(null).map(() => ({
        risks: [],
        level: 'low' as const,
        count: 0
      }))
    );

    // Distribuir riscos na matriz
    risks.forEach(risk => {
      const impactIndex = risk.impact_score - 1;
      const likelihoodIndex = risk.likelihood_score - 1;
      
      if (impactIndex >= 0 && impactIndex < 5 && likelihoodIndex >= 0 && likelihoodIndex < 5) {
        const cell = newMatrix[4 - impactIndex][likelihoodIndex]; // Inverter impacto para mostrar maior no topo
        cell.risks.push(risk);
        cell.count = cell.risks.length;
        cell.level = getRiskLevel(risk.impact_score, risk.likelihood_score);
      }
    });

    setMatrix(newMatrix);
  }, [risks]);

  if (loading) {
    return (
      <Card className="grc-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Matriz de Riscos 5x5</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="grc-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span>Matriz de Riscos 5x5</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição de riscos por impacto vs. probabilidade
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Labels do eixo Y (Impacto) */}
          <div className="absolute left-0 top-8 h-80 flex flex-col justify-between items-end pr-2">
            <div className="text-xs text-muted-foreground writing-mode-vertical">
              <span className="font-medium text-foreground">IMPACTO</span>
            </div>
            {impactLabels.slice().reverse().map((label, index) => (
              <div key={index} className="text-xs text-muted-foreground text-right">
                {index + 1}
              </div>
            ))}
          </div>

          {/* Matriz */}
          <div className="ml-20 mt-4">
            <div className="grid grid-cols-5 gap-1 w-80 h-80">
              {matrix.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      border-2 rounded-lg p-2 flex flex-col items-center justify-center
                      cursor-pointer transition-all duration-200 hover:scale-105
                      ${getRiskColor(cell.level)}
                    `}
                    title={`${cell.count} risco(s) - ${cell.level.toUpperCase()}`}
                  >
                    <div className="text-lg font-bold">
                      {cell.count}
                    </div>
                    {cell.count > 0 && (
                      <div className="text-xs text-center space-y-1">
                        {cell.risks.slice(0, 2).map((risk, index) => (
                          <div key={index} className="truncate w-full text-xs" title={risk.title}>
                            {risk.risk_category}
                          </div>
                        ))}
                        {cell.count > 2 && (
                          <div className="text-xs opacity-70">
                            +{cell.count - 2} mais
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Labels do eixo X (Probabilidade) */}
            <div className="mt-2 flex justify-between w-80">
              {likelihoodLabels.map((label, index) => (
                <div key={index} className="text-xs text-muted-foreground text-center w-16">
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-xs text-muted-foreground">
              <span className="font-medium text-foreground">PROBABILIDADE</span>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded border-2 bg-green-500/20 border-green-500/40"></div>
            <span className="text-xs text-muted-foreground">Baixo (1-5)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded border-2 bg-yellow-500/20 border-yellow-500/40"></div>
            <span className="text-xs text-muted-foreground">Médio (6-11)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded border-2 bg-orange-500/20 border-orange-500/40"></div>
            <span className="text-xs text-muted-foreground">Alto (12-19)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded border-2 bg-red-500/20 border-red-500/40"></div>
            <span className="text-xs text-muted-foreground">Crítico (20-25)</span>
          </div>
        </div>

        {/* Resumo por categoria */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from(new Set(risks.map(r => r.risk_category))).map(category => {
            const categoryRisks = risks.filter(r => r.risk_category === category);
            const criticalCount = categoryRisks.filter(r => getRiskLevel(r.impact_score, r.likelihood_score) === 'critical').length;
            const highCount = categoryRisks.filter(r => getRiskLevel(r.impact_score, r.likelihood_score) === 'high').length;
            
            return (
              <div key={category} className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-medium text-foreground mb-1">{category}</div>
                <div className="text-xs text-muted-foreground">
                  Total: {categoryRisks.length}
                </div>
                {(criticalCount > 0 || highCount > 0) && (
                  <div className="flex space-x-1 mt-1">
                    {criticalCount > 0 && (
                      <Badge className="risk-critical text-xs">{criticalCount}</Badge>
                    )}
                    {highCount > 0 && (
                      <Badge className="risk-high text-xs">{highCount}</Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;
import React, { useEffect, useState } from 'react';
// Supondo que esses componentes venham de um local como 'shadcn/ui'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Loader2 } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';

// --- Início: Mocks para demonstração ---
// Componentes de UI e Supabase mockados para que o exemplo seja executável.
// Substitua pelos seus imports reais.
const Card = ({ className, children }) => <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ className, children }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ className, children }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ className, children }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Loader2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// Mock do Supabase e dados de risco
const mockRisksData = [
    { id: '1', title: 'Falha no Servidor', risk_category: 'TI', impact_score: 4, likelihood_score: 4, risk_score: 16, severity: 'Crítico', status: 'open' },
    { id: '2', title: 'Ataque de Phishing', risk_category: 'Segurança', impact_score: 3, likelihood_score: 4, risk_score: 12, severity: 'Crítico', status: 'open' },
    { id: '3', title: 'Vazamento de Dados', risk_category: 'Segurança', impact_score: 4, likelihood_score: 2, risk_score: 8, severity: 'Alto', status: 'open' },
    { id: '4', title: 'Atraso na Entrega', risk_category: 'Operacional', impact_score: 2, likelihood_score: 3, risk_score: 6, severity: 'Médio', status: 'open' },
    { id: '5', title: 'Bug em Produção', risk_category: 'TI', impact_score: 3, likelihood_score: 2, risk_score: 6, severity: 'Médio', status: 'open' },
    { id: '6', title: 'Perda de Fornecedor', risk_category: 'Operacional', impact_score: 4, likelihood_score: 1, risk_score: 4, severity: 'Médio', status: 'open' },
    { id: '7', title: 'Erro de Faturamento', risk_category: 'Financeiro', impact_score: 1, likelihood_score: 2, risk_score: 2, severity: 'Baixo', status: 'open' },
    { id: '8', title: 'Problema de Compliance', risk_category: 'Legal', impact_score: 2, likelihood_score: 2, risk_score: 4, severity: 'Médio', status: 'open' },
];

const supabase = {
  from: () => ({
    select: () => ({
      eq: () => new Promise(resolve => setTimeout(() => resolve({ data: mockRisksData, error: null }), 1000)),
    }),
  }),
};
// --- Fim: Mocks para demonstração ---


interface Risk {
  id: string;
  title: string;
  risk_category: string;
  impact_score: number; // 1 a 4
  likelihood_score: number; // 1 a 4
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
  // A matriz agora é 4x4
  const [matrix, setMatrix] = useState<MatrixCell[][]>([]);

  // Função para definir a cor com base no produto de impacto e probabilidade
  const getRiskColor = (impact: number, likelihood: number) => {
    const product = impact * likelihood;
    // Valores ajustados para uma matriz 4x4 e cores consistentes com a legenda
    if (product >= 12) return 'bg-red-500';      // Crítico
    if (product >= 8) return 'bg-orange-500';   // Alto
    if (product >= 4) return 'bg-yellow-500';   // Médio
    return 'bg-green-500';                      // Baixo
  };

  // Função para definir o nível de risco (usado ao construir a matriz)
  const getRiskLevel = (impact: number, likelihood: number): 'low' | 'medium' | 'high' | 'critical' => {
    const score = impact * likelihood;
    if (score >= 12) return 'critical';
    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };

  // Efeito para buscar os dados de risco
  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const { data, error } = await supabase
          .from('risk_assessments')
          .select('*')
          .eq('status', 'open');

        if (error) throw error;
        // Filtra riscos para garantir que os scores estão dentro do limite da matriz 4x4
        const validRisks = (data || []).filter(r => 
            r.impact_score >= 1 && r.impact_score <= 4 &&
            r.likelihood_score >= 1 && r.likelihood_score <= 4
        );
        setRisks(validRisks);
      } catch (error) {
        console.error('Erro ao carregar riscos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRisks();
  }, []);

  // Efeito para construir a matriz sempre que a lista de riscos mudar
  useEffect(() => {
    // Cria uma matriz 4x4 vazia
    const newMatrix: MatrixCell[][] = Array(4).fill(null).map(() =>
      Array(4).fill(null).map(() => ({
        risks: [],
        level: 'low' as const,
        count: 0
      }))
    );

    // Distribui os riscos na matriz
    risks.forEach(risk => {
      // Índices são base 0 (score - 1)
      const impactIndex = risk.impact_score - 1;
      const likelihoodIndex = risk.likelihood_score - 1;

      // Acesso à matriz com o eixo Y (probabilidade) invertido
      // O índice da linha é `3 - likelihoodIndex` para que a probabilidade 4 fique no topo (índice 0)
      const cell = newMatrix[3 - likelihoodIndex][impactIndex];
      cell.risks.push(risk);
      cell.count = cell.risks.length;
      cell.level = getRiskLevel(risk.impact_score, risk.likelihood_score);
    });

    setMatrix(newMatrix);
  }, [risks]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
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
  // Labels para os eixos, com o eixo Y (Probabilidade) em ordem decrescente
  const impactLabels = ['1', '2', '3', '4'];
  const likelihoodLabels = ['4', '3', '2', '1'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-xl">Matriz de Riscos 4x4</CardTitle>
          <div className="text-sm text-gray-500">
            {totalRisks} risco{totalRisks !== 1 ? 's' : ''} em aberto
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
            {/* Eixo X - Impacto */}
            <div className="text-center mb-2 font-semibold text-gray-600">Impacto</div>
            {/* Grid principal da matriz */}
            <div className="flex gap-4">
                {/* Eixo Y - Probabilidade */}
                <div className="flex flex-col justify-around items-center w-12">
                    <div className="transform -rotate-90 whitespace-nowrap font-semibold text-gray-600">Probabilidade</div>
                </div>

                {/* Grid 4x4 com labels */}
                <div className="grid grid-cols-5 gap-1">
                    {/* Canto Vazio + Labels de Impacto */}
                    <div />
                    {impactLabels.map((label) => (
                        <div key={`impact-label-${label}`} className="flex items-center justify-center font-medium text-gray-500">
                            {label}
                        </div>
                    ))}

                    {/* Labels de Probabilidade + Células da Matriz */}
                    {matrix.map((row, rowIndex) => (
                        <React.Fragment key={`row-${rowIndex}`}>
                            <div className="flex items-center justify-center font-medium text-gray-500">
                                {likelihoodLabels[rowIndex]}
                            </div>
                            {row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`
                                        aspect-square rounded-lg flex items-center justify-center
                                        border-2 border-white transition-all duration-200
                                        ${getRiskColor(colIndex + 1, 4 - rowIndex)}
                                        ${cell.count > 0 ? 'cursor-pointer hover:scale-105 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500' : 'opacity-70'}
                                    `}
                                    title={`${cell.count} risco(s) - Impacto: ${colIndex + 1}, Probabilidade: ${4 - rowIndex}`}
                                >
                                    {cell.count > 0 && (
                                        <span className="text-white font-bold text-lg drop-shadow-md">
                                            {cell.count}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>

        {/* Legenda */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Baixo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-600">Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Crítico</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;


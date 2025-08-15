import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import type { MatrixSize, RiskLevel } from '@/types/risk-management';
import { generateMatrixData, findRiskPositionInMatrix, getTenantMatrixConfig } from '@/utils/risk-analysis';
import { useAuth } from '@/contexts/AuthContext';

interface RiskMatrixProps {
  probabilityScore: number;
  impactScore: number;
  matrixSize?: MatrixSize;
  qualitativeLevel?: RiskLevel;
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ 
  probabilityScore, 
  impactScore, 
  matrixSize: propMatrixSize,
  qualitativeLevel
}) => {
  const { user } = useAuth();
  const [matrixSize, setMatrixSize] = useState<MatrixSize>(propMatrixSize || '4x4');
  const [matrixData, setMatrixData] = useState(generateMatrixData(matrixSize));
  
  useEffect(() => {
    const loadTenantConfig = async () => {
      if (user?.tenant?.id) {
        const config = await getTenantMatrixConfig(user.tenant.id);
        setMatrixSize(config.type);
        setMatrixData(generateMatrixData(config.type));
      } else if (propMatrixSize) {
        setMatrixSize(propMatrixSize);
        setMatrixData(generateMatrixData(propMatrixSize));
      }
    };
    
    loadTenantConfig();
  }, [user?.tenant?.id, propMatrixSize]);
  
  const riskPosition = findRiskPositionInMatrix(probabilityScore, impactScore, matrixSize);
  
  const size = matrixSize === '4x4' ? 4 : 5;
  const cellSize = size === 4 ? 'h-16 w-16' : 'h-12 w-12';
  const textSize = size === 4 ? 'text-sm' : 'text-xs';

  const getQualitativeLevelColor = (level?: RiskLevel) => {
    if (!level) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (level) {
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      case 'Muito Baixo': return 'bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Matriz de Risco ({matrixSize})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Scores */}
          <div className="flex justify-center space-x-8 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {probabilityScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Probabilidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {impactScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Impacto</div>
            </div>
          </div>

          {/* Matriz */}
          <div className="flex justify-center">
            <div className="inline-block">
              {/* Label do eixo Y (Impacto) */}
              <div className="flex">
                <div className="flex flex-col justify-center items-center mr-3">
                  <div 
                    className="text-sm font-medium text-muted-foreground transform -rotate-90 whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    IMPACTO
                  </div>
                </div>
                
                <div className="space-y-0">
                  {/* Números do eixo Y */}
                  <div className="flex">
                    <div className="flex flex-col space-y-0 mr-2">
                      {Array.from({ length: size }, (_, i) => (
                        <div 
                          key={i} 
                          className={`${cellSize} flex items-center justify-center text-sm font-medium text-muted-foreground`}
                        >
                          {size - i}
                        </div>
                      ))}
                    </div>
                    
                    {/* Grid da matriz */}
                    <div className={`grid grid-rows-${size} gap-0 border border-gray-300 dark:border-gray-600`}>
                      {matrixData.slice(0, size).map((row, rowIndex) => (
                        <div key={rowIndex} className={`grid grid-cols-${size} gap-0`}>
                          {row.slice(0, size).map((cell, colIndex) => {
                            const isRiskPosition = 
                              rowIndex === riskPosition.y && colIndex === riskPosition.x;
                            
                            return (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`
                                  ${cellSize} border border-gray-200 dark:border-gray-600 
                                  flex items-center justify-center relative transition-all
                                  ${isRiskPosition ? 'ring-2 ring-blue-500 z-10' : ''}
                                `}
                                style={{ 
                                  backgroundColor: cell.color,
                                }}
                              >
                                {isRiskPosition && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-600 border border-white rounded-full shadow-lg" />
                                  </div>
                                )}
                                <span className={`${textSize} font-medium text-white drop-shadow-sm`}>
                                  {cell.probability}×{cell.impact}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Label do eixo X (Probabilidade) */}
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-0 ml-10">
                      {Array.from({ length: size }, (_, i) => (
                        <div 
                          key={i} 
                          className={`${cellSize} flex items-center justify-center text-sm font-medium text-muted-foreground`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center mt-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      PROBABILIDADE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-6">
            <h6 className="font-medium mb-3 text-center">Legenda dos Níveis de Risco (Matriz {matrixSize})</h6>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { level: 'Muito Baixo', color: '#22c55e' },
                { level: 'Baixo', color: '#84cc16' },
                { level: 'Médio', color: '#eab308' },
                { level: 'Alto', color: '#f97316' },
                { level: 'Muito Alto', color: '#ef4444' }
              ].map(({ level, color }) => (
                <div key={level} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Posição do risco */}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              Posição do risco: <strong>({Math.round(probabilityScore)}, {Math.round(impactScore)})</strong>
              <br />
              <span className="text-muted-foreground">
                O ponto azul na matriz mostra a posição calculada do seu risco
              </span>
            </p>
          </div>

          {/* Nível Qualitativo */}
          {qualitativeLevel && (
            <div className="text-center p-4 border-t">
              <h6 className="text-sm font-medium text-muted-foreground mb-2">Nível de Risco Qualitativo</h6>
              <Badge 
                className={`text-lg px-4 py-2 font-semibold ${getQualitativeLevelColor(qualitativeLevel)}`}
                variant="outline"
              >
                {qualitativeLevel}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;
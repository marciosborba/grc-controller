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
  
  const riskPosition = findRiskPositionInMatrix(probabilityScore || 0, impactScore || 0, matrixSize);
  
  const size = matrixSize === '4x4' ? 4 : 5;
  // Responsivo: células menores em mobile, maiores em desktop
  const cellSize = size === 4 
    ? 'h-12 w-12 sm:h-16 sm:w-16' 
    : 'h-10 w-10 sm:h-12 sm:w-12';
  const textSize = size === 4 
    ? 'text-xs sm:text-sm' 
    : 'text-[10px] sm:text-xs';

  const getQualitativeLevelColor = (level?: RiskLevel) => {
    if (!level) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (level) {
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      case 'Médio': return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900 dark:text-amber-200';
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
          {/* Scores - Responsivo */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {probabilityScore?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Probabilidade</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {impactScore?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Impacto</div>
            </div>
          </div>

          {/* Matriz - Responsiva */}
          <div className="flex justify-center overflow-x-auto">
            <div className="inline-block min-w-fit">
              {/* Label do eixo Y (Impacto) - Escondido em mobile muito pequeno */}
              <div className="flex">
                <div className="hidden xs:flex flex-col justify-center items-center mr-2 sm:mr-3">
                  <div 
                    className="text-xs sm:text-sm font-medium text-muted-foreground transform -rotate-90 whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    IMPACTO
                  </div>
                </div>
                
                <div className="space-y-0">
                  {/* Números do eixo Y */}
                  <div className="flex">
                    <div className="flex flex-col space-y-0 mr-1 sm:mr-2">
                      {Array.from({ length: size }, (_, i) => (
                        <div 
                          key={i} 
                          className={`${cellSize} flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground`}
                        >
                          {size - i}
                        </div>
                      ))}
                    </div>
                    
                    {/* Grid da matriz */}
                    <div className={`grid grid-rows-${size} gap-0 border-2 border-white shadow-lg`}>
                      {matrixData.slice(0, size).map((row, rowIndex) => (
                        <div key={rowIndex} className={`grid grid-cols-${size} gap-0`}>
                          {row.slice(0, size).map((cell, colIndex) => {
                            const isRiskPosition = 
                              rowIndex === riskPosition.y && colIndex === riskPosition.x;
                            
                            return (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`
                                  ${cellSize} border-2 border-white 
                                  flex items-center justify-center relative transition-all
                                  hover:scale-105 hover:z-20 hover:shadow-lg
                                  ${isRiskPosition ? 'ring-4 ring-blue-500 ring-offset-2 z-10 shadow-xl' : ''}
                                `}
                                style={{ 
                                  backgroundColor: cell.color,
                                }}
                              >
                                {isRiskPosition && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                      {/* Pulso de fundo */}
                                      <div className="absolute w-10 h-10 bg-blue-400 rounded-full animate-ping opacity-30" />
                                      {/* Círculo principal */}
                                      <div className="relative w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-xl flex items-center justify-center">
                                        <div className="absolute inset-0.5 bg-blue-300 rounded-full animate-pulse opacity-50" />
                                        {/* Número dentro do círculo */}
                                        <span className="text-xs font-bold text-white z-10 relative">
                                          {cell.probability * cell.impact}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {/* Números normais (quando não é posição do risco) */}
                                {!isRiskPosition && (
                                  <>
                                    <span className={`${textSize} font-bold text-white drop-shadow-lg hidden sm:inline relative z-10`}>
                                      {cell.probability * cell.impact}
                                    </span>
                                    {/* Versão simplificada para mobile */}
                                    <span className="text-[8px] font-bold text-white drop-shadow-lg sm:hidden relative z-10">
                                      {cell.probability * cell.impact}
                                    </span>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Label do eixo X (Probabilidade) */}
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-0 ml-6 sm:ml-10">
                      {Array.from({ length: size }, (_, i) => (
                        <div 
                          key={i} 
                          className={`${cellSize} flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center mt-1">
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      PROBABILIDADE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda - Responsiva */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            <h6 className="font-semibold mb-4 text-center text-sm sm:text-base text-gray-700 dark:text-gray-200">
              Legenda dos Níveis de Risco (Matriz {matrixSize})
            </h6>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {(
                matrixSize === '5x5' ? [
                  { level: 'Muito Baixo', color: '#3b82f6', description: 'Scores 1-2: Risco aceitável', range: '1-2' },
                  { level: 'Baixo', color: '#22c55e', description: 'Scores 3-4: Monitoramento básico', range: '3-4' },
                  { level: 'Médio', color: '#eab308', description: 'Scores 5-8: Atenção necessária', range: '5-8' },
                  { level: 'Alto', color: '#f97316', description: 'Scores 9-16: Ação urgente', range: '9-16' },
                  { level: 'Muito Alto', color: '#ef4444', description: 'Scores 17-25: Prioridade máxima', range: '17-25' }
                ] : [
                  { level: 'Baixo', color: '#22c55e', description: 'Scores 1-2: Monitoramento básico', range: '1-2' },
                  { level: 'Médio', color: '#eab308', description: 'Scores 3-6: Atenção necessária', range: '3-6' },
                  { level: 'Alto', color: '#f97316', description: 'Scores 7-9: Ação urgente', range: '7-9' },
                  { level: 'Muito Alto', color: '#ef4444', description: 'Scores 10-16: Prioridade máxima', range: '10-16' }
                ]
              ).map(({ level, color, description, range }) => (
                <div key={level} className="flex items-center space-x-2 bg-white dark:bg-gray-600 px-3 py-2 rounded-lg shadow-sm">
                  <div 
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">{level}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Posição do risco - Responsiva */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <h6 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Posição na Matriz</h6>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              Coordenadas: <strong className="text-blue-900 dark:text-blue-100">({Math.round(probabilityScore || 0)}, {Math.round(impactScore || 0)})</strong>
              <br className="hidden sm:block" />
              <span className="block sm:inline mt-1 sm:mt-0 text-blue-600 dark:text-blue-400">
                🔵 O ponto azul animado indica a posição exata do risco
              </span>
            </p>
          </div>

          {/* Nível Qualitativo - Responsivo */}
          {qualitativeLevel && (
            <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Nível de Risco Qualitativo</h6>
              <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-600 px-4 py-3 rounded-lg shadow-md">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 
                  qualitativeLevel === 'Muito Alto' ? '#ef4444' :
                  qualitativeLevel === 'Alto' ? '#f97316' :
                  qualitativeLevel === 'Médio' ? '#eab308' :
                  qualitativeLevel === 'Baixo' ? '#84cc16' : '#22c55e'
                }} />
                <Badge 
                  className={`text-lg px-4 py-2 font-bold ${getQualitativeLevelColor(qualitativeLevel)}`}
                  variant="outline"
                >
                  {qualitativeLevel}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMatrix;
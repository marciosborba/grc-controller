import React, { useEffect } from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useQueryClient } from '@tanstack/react-query';

interface RiskLevelDisplayProps {
  risks?: Array<{ risk_level?: string; riskLevel?: string }>;
  className?: string;
  showOnlyLevels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

export const RiskLevelDisplay: React.FC<RiskLevelDisplayProps> = ({
  risks = [],
  className = '',
  showOnlyLevels = false,
  size = 'md',
  responsive = true
}) => {
  const { tenantSettings, getRiskLevels, isLoading, refetch } = useTenantSettings();
  const queryClient = useQueryClient();
  
  // Forçar atualização quando o componente for montado
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Storage change detected, refetching tenant settings...');
      refetch();
    };
    
    // Escutar mudanças no localStorage (caso outras abas atualizem)
    window.addEventListener('storage', handleStorageChange);
    
    // Escutar evento customizado para atualizações da matriz
    window.addEventListener('risk-matrix-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('risk-matrix-updated', handleStorageChange);
    };
  }, [refetch]);

  if (isLoading) {
    // Mostrar skeleton com 5 níveis por padrão durante carregamento
    return (
      <div className={`grid grid-cols-2 md:grid-cols-5 gap-2 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="text-center">
            <div className="h-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  const matrixConfig = tenantSettings?.risk_matrix;
  
  const getRiskLevelColor = (levelName: string) => {
    if (matrixConfig?.risk_levels_custom) {
      const customLevel = matrixConfig.risk_levels_custom.find(level => level.name === levelName);
      if (customLevel?.color) {
        return {
          bg: '',
          text: 'text-white',
          dark: '',
          customStyle: { backgroundColor: customLevel.color }
        };
      }
    }

    switch (levelName) {
      case 'Muito Baixo': return { bg: 'bg-blue-100', text: 'text-blue-800', dark: 'dark:bg-blue-900 dark:text-blue-200' };
      case 'Baixo': return { bg: 'bg-green-100', text: 'text-green-800', dark: 'dark:bg-green-900 dark:text-green-200' };
      case 'Médio': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dark: 'dark:bg-yellow-900 dark:text-yellow-200' };
      case 'Alto': return { bg: 'bg-orange-100', text: 'text-orange-800', dark: 'dark:bg-orange-900 dark:text-orange-200' };
      case 'Muito Alto': return { bg: 'bg-red-100', text: 'text-red-800', dark: 'dark:bg-red-900 dark:text-red-200' };
      case 'Crítico': return { bg: 'bg-red-100', text: 'text-red-800', dark: 'dark:bg-red-900 dark:text-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dark: 'dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const countRisksByLevel = (levelName: string) => {
    if (showOnlyLevels) return 0;
    
    return risks.filter(risk => {
      const riskLevel = risk.risk_level || risk.riskLevel;
      return riskLevel === levelName;
    }).length;
  };

  const configuredLevels = getRiskLevels();
  
  const isMatrix4x4 = tenantSettings?.risk_matrix?.type === '4x4';
  const isMatrix3x3 = tenantSettings?.risk_matrix?.type === '3x3';
  
  let levelsToShow = configuredLevels;
  
  if (isMatrix3x3) {
    levelsToShow = ['Baixo', 'Médio', 'Alto'];
  } else if (isMatrix4x4) {
    levelsToShow = ['Baixo', 'Médio', 'Alto', 'Crítico'];
  } else {
    if (matrixConfig?.risk_levels_custom) {
      levelsToShow = matrixConfig.risk_levels_custom
        .sort((a, b) => a.value - b.value)
        .map(level => level.name);
    } else {
      levelsToShow = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];
    }
  }

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return { container: 'h-12', text: 'text-sm', label: 'text-xs' };
      case 'lg':
        return { container: 'h-24', text: 'text-xl', label: 'text-sm' };
      default:
        return { container: 'h-20', text: 'text-lg', label: 'text-xs' };
    }
  };

  const sizeClasses = getSizeClasses(size);

  // Determinar classes de grid baseado no número de níveis
  const getGridClasses = () => {
    const numLevels = levelsToShow.length;
    
    if (responsive) {
      // Layout responsivo baseado no número de níveis
      switch (numLevels) {
        case 3:
          return 'grid grid-cols-3 gap-2';
        case 4:
          return 'grid grid-cols-2 md:grid-cols-4 gap-2';
        case 5:
        default:
          return 'grid grid-cols-2 md:grid-cols-5 gap-2';
      }
    } else {
      // Layout fixo baseado no número de níveis
      switch (numLevels) {
        case 3:
          return 'grid grid-cols-3 gap-2';
        case 4:
          return 'grid grid-cols-4 gap-2';
        case 5:
        default:
          return 'grid grid-cols-5 gap-2';
      }
    }
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {levelsToShow.map((levelName, index) => {
        const colors = getRiskLevelColor(levelName);
        const count = countRisksByLevel(levelName);
        
        return (
          <div key={levelName} className="text-center">
            <div 
              className={`
                ${sizeClasses.container} rounded flex items-center justify-center font-bold ${sizeClasses.text}
                ${colors.customStyle ? '' : `${colors.bg} ${colors.text} ${colors.dark}`}
              `}
              style={colors.customStyle}
            >
              {showOnlyLevels ? (index + 1) : count}
            </div>
            <p className={`${sizeClasses.label} mt-1`}>
              {showOnlyLevels ? `Nível ${index + 1}` : levelName}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default RiskLevelDisplay;
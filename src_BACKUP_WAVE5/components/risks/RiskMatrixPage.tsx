import React from 'react';
import { useRiskManagement } from '@/hooks/useRiskManagement';
import { RiskMatrixView } from './views/RiskMatrixView';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
  </div>
);

export const RiskMatrixPage: React.FC = () => {
  const { risks, loading, error } = useRiskManagement();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar riscos</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <RiskMatrixView 
        risks={risks || []} 
        searchTerm=""
        filters={{}}
      />
    </div>
  );
};
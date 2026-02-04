/**
 * TESTE COM HOOK useRiskManagement
 * 
 * Para verificar se o problema está no hook de riscos
 */

import React from 'react';
import { useRiskManagement } from '@/hooks/useRiskManagement';

const RiskTestWithHook: React.FC = () => {
  console.log('🔍 RiskTestWithHook iniciado em:', new Date().toISOString());
  
  const startTime = performance.now();
  
  const { 
    risks, 
    isLoading, 
    error 
  } = useRiskManagement();
  
  const endTime = performance.now();
  const loadTime = Math.round(endTime - startTime);
  
  console.log('🔍 Hook useRiskManagement executado em:', loadTime, 'ms');
  console.log('🔍 Dados do hook:', { 
    risksCount: risks?.length || 0, 
    isLoading, 
    hasError: !!error 
  });
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste com Hook useRiskManagement</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-100 border border-blue-300 rounded">
          <p className="text-blue-800">⏱️ Tempo de execução do hook: {loadTime}ms</p>
        </div>
        
        <div className="p-4 bg-gray-100 border border-gray-300 rounded">
          <p><strong>Status:</strong> {isLoading ? 'Carregando...' : 'Carregado'}</p>
          <p><strong>Riscos encontrados:</strong> {risks?.length || 0}</p>
          <p><strong>Erro:</strong> {error ? 'Sim' : 'Não'}</p>
        </div>
        
        {isLoading && (
          <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800">🔄 Hook ainda está carregando...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800">❌ Erro no hook: {error.message}</p>
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800">✅ Hook carregado com sucesso!</p>
            <p className="text-sm text-green-600 mt-2">
              Tempo total: {loadTime}ms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskTestWithHook;
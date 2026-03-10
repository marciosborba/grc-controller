/**
 * COMPONENTE DE TESTE MÍNIMO PARA IDENTIFICAR GARGALOS
 * 
 * Versão ultra-simplificada do módulo de riscos para testar performance
 */

import React from 'react';

const RiskTestMinimal: React.FC = () => {
  console.log('🔍 RiskTestMinimal renderizado em:', new Date().toISOString());
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste Mínimo - Módulo de Riscos</h1>
      <p className="text-muted-foreground">
        Se esta página carregou rapidamente, o problema não é no roteamento básico.
      </p>
      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
        <p className="text-green-800">✅ Componente mínimo carregado com sucesso!</p>
        <p className="text-sm text-green-600 mt-2">
          Tempo de carregamento: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default RiskTestMinimal;
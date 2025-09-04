/**
 * ALEX ASSESSMENT ENGINE - VERSÃO DE TESTE
 */

import React from 'react';

const AlexAssessmentEngineTemp: React.FC = () => {
  console.log('🎯 [ALEX DEBUG TEMP] AlexAssessmentEngineTemp RENDERIZANDO!');
  
  return (
    <div className="p-8 space-y-6">
      <div className="bg-green-500 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">✅ ALEX ASSESSMENT ENGINE (TEMP) CARREGADO!</h1>
        <p>Timestamp: {new Date().toLocaleString()}</p>
        <p>Este é o AlexAssessmentEngine temporário para teste</p>
      </div>
      
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">🚀 Funcionando!</h2>
        <p>Se você está vendo isso, a rota /assessments está funcionando corretamente.</p>
      </div>
    </div>
  );
};

export default AlexAssessmentEngineTemp;
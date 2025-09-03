import React from 'react';

const EthicsTestPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste do Módulo de Ética</h1>
      <p className="text-muted-foreground">
        Se você está vendo esta página, a rota de ética está funcionando corretamente.
      </p>
      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
        <p className="text-green-800">✅ Rota /ethics está funcionando!</p>
      </div>
    </div>
  );
};

export default EthicsTestPage;
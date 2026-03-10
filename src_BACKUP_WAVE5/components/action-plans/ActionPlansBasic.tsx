import React from 'react';

export const ActionPlansBasic: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Planos de Ação - Teste Básico</h1>
      <p>Se você está vendo essa mensagem, o componente está carregando corretamente.</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p>✅ Componente funcionando</p>
        <p>✅ React renderizando</p>
        <p>✅ Rota ativa</p>
      </div>
    </div>
  );
};
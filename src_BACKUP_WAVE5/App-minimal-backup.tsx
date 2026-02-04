import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">
        🧪 TESTE MÍNIMO - APLICAÇÃO FUNCIONANDO!
      </h1>
      <p className="text-muted-foreground">
        Se você está vendo essa mensagem, a aplicação está carregando corretamente.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Timestamp: {new Date().toISOString()}
      </p>
    </div>
  );
};

export default App;
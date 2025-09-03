import React from 'react';

const DashboardPageIsolated = () => {
  console.log('🚀 DashboardPageIsolated carregado em:', new Date().toISOString());

  return (
    <div className="p-6 space-y-6">
      {/* Banner de Teste */}
      <div className="bg-green-500 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">🧪 Dashboard Completamente Isolado</h1>
        <p className="text-sm opacity-90">
          Esta versão não importa NENHUM componente externo. 
          Se ainda estiver lento, o problema é no AuthContext ou servidor.
        </p>
      </div>

      {/* Cards de Teste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-semibold text-lg">Teste 1</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">HTML puro</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-3xl mb-3">🚫</div>
          <h3 className="font-semibold text-lg">Teste 2</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sem imports</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-semibold text-lg">Teste 3</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sem hooks</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-3xl mb-3">🔥</div>
          <h3 className="font-semibold text-lg">Teste 4</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ultra rápido</p>
        </div>
      </div>

      {/* Informações de Debug */}
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">🔍 Informações de Debug</h3>
        <div className="text-sm space-y-1">
          <p><strong>Tempo de carregamento:</strong> {new Date().toLocaleTimeString()}</p>
          <p><strong>Imports externos:</strong> ZERO</p>
          <p><strong>Hooks executados:</strong> ZERO</p>
          <p><strong>Queries ao banco:</strong> ZERO</p>
          <p><strong>Componentes UI:</strong> ZERO</p>
          <p><strong>Apenas:</strong> HTML + Tailwind CSS + React básico</p>
        </div>
      </div>

      {/* Status de Performance */}
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚡ Status de Performance</h3>
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          <p>✅ Componente carregado instantaneamente</p>
          <p>✅ Sem dependências externas</p>
          <p>✅ Sem queries ao banco de dados</p>
          <p>✅ Sem hooks complexos</p>
        </div>
      </div>

      {/* Navegação de Teste */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">🧪 Rotas de Teste Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
            <strong>/dashboard</strong> - Dashboard normal (original)
          </div>
          <div className="bg-green-200 dark:bg-green-800 p-3 rounded border">
            <strong>/dashboard-test-isolated</strong> - Versão isolada (atual)
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
            <strong>/dashboard-test-minimal</strong> - Ultra mínima
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
            <strong>/dashboard-test-no-queries</strong> - Sem queries
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900 rounded border">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Para voltar ao dashboard normal:</strong> acesse <code>/dashboard</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageIsolated;
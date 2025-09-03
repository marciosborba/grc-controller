/**
 * DASHBOARD PAGE ULTRA LEVE - TEMPORÁRIO PARA CORRIGIR PERFORMANCE
 * 
 * Versão extremamente simplificada sem imports pesados.
 */

import React from 'react';
import { useAuth} from '@/contexts/AuthContextOptimized';

const DashboardPageUltraLight = () => {
  console.log('🚀 DashboardPageUltraLight carregado em:', new Date().toISOString());
  
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Simples */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🚀 Dashboard Ultra Leve
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bem-vindo, {user.name}! Esta é uma versão temporária ultra-leve para corrigir problemas de performance.
        </p>
      </div>

      {/* Informações do Usuário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">👤 Usuário</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">{user.name}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">{user.email}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🏢 Tenant</h3>
          <p className="text-sm text-green-700 dark:text-green-300">{user.tenant?.name || 'GRC-Controller'}</p>
          <p className="text-xs text-green-600 dark:text-green-400">ID: {user.tenantId}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🔑 Roles</h3>
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role, index) => (
              <span 
                key={index}
                className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status de Performance */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚡ Status de Performance</h3>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <p>✅ Dashboard carregado instantaneamente</p>
          <p>✅ Sem queries pesadas ao banco</p>
          <p>✅ Sem componentes complexos</p>
          <p>✅ Sem hooks de risco ou criptografia</p>
          <p>🔧 Versão temporária para correção de performance</p>
        </div>
      </div>

      {/* Informações de Debug */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">🔍 Debug Info</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Carregado em:</strong> {new Date().toLocaleTimeString()}</p>
          <p><strong>Componentes carregados:</strong> Apenas este dashboard ultra-leve</p>
          <p><strong>Queries executadas:</strong> Apenas AuthContext básico</p>
          <p><strong>Hooks pesados:</strong> NENHUM</p>
          <p><strong>Imports pesados:</strong> NENHUM</p>
        </div>
      </div>

      {/* Próximos Passos */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔄 Próximos Passos</h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>1. ✅ Desabilitar sistema de criptografia pesado</p>
          <p>2. ✅ Desabilitar queries de roles do banco</p>
          <p>3. ✅ Usar dashboard ultra-leve</p>
          <p>4. 🔧 Corrigir erro SQL app.current_tenant</p>
          <p>5. 🔧 Otimizar ExecutiveDashboard original</p>
          <p>6. 🔧 Reativar funcionalidades otimizadas</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageUltraLight;
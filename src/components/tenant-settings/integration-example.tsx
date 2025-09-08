// Exemplo de como integrar o módulo de Configurações da Tenant no sistema de rotas

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { TenantSettingsPage } from './TenantSettingsPage';

// Componente de proteção para rotas de configuração
const TenantSettingsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar se o usuário é admin da tenant
  const isTenantAdmin = user?.role === 'tenant_admin' || user?.role === 'admin';

  if (!isTenantAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Exemplo de integração nas rotas principais
export const TenantSettingsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/settings"
        element={
          <TenantSettingsGuard>
            <TenantSettingsPage />
          </TenantSettingsGuard>
        }
      />
      <Route
        path="/settings/*"
        element={
          <TenantSettingsGuard>
            <TenantSettingsPage />
          </TenantSettingsGuard>
        }
      />
    </Routes>
  );
};

// Exemplo de como adicionar no menu de navegação
export const NavigationMenuExample = () => {
  const { user } = useAuth();
  const isTenantAdmin = user?.role === 'tenant_admin' || user?.role === 'admin';

  return (
    <nav>
      {/* Outros itens do menu */}
      
      {isTenantAdmin && (
        <a href="/settings" className="nav-link">
          <Settings className="h-4 w-4" />
          Configurações da Organização
        </a>
      )}
    </nav>
  );
};

// Exemplo de integração no App.tsx principal
export const AppRoutesExample = () => {
  return (
    <Routes>
      {/* Outras rotas */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/risks/*" element={<RiskRoutes />} />
      <Route path="/audit/*" element={<AuditRoutes />} />
      
      {/* Rotas de configurações da tenant */}
      <Route path="/settings/*" element={<TenantSettingsRoutes />} />
      
      {/* Rota padrão */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Exemplo de hook personalizado para verificar permissões
export const useTenantAdmin = () => {
  const { user } = useAuth();
  
  return {
    isTenantAdmin: user?.role === 'tenant_admin' || user?.role === 'admin',
    canManageUsers: user?.role === 'tenant_admin' || user?.role === 'admin',
    canConfigureSecurity: user?.role === 'tenant_admin',
    canViewLogs: user?.role === 'tenant_admin' || user?.role === 'admin',
  };
};

// Exemplo de como usar o hook em outros componentes
export const SomeOtherComponent = () => {
  const { isTenantAdmin, canManageUsers } = useTenantAdmin();

  return (
    <div>
      {canManageUsers && (
        <button onClick={() => navigate('/settings?tab=users')}>
          Gerenciar Usuários
        </button>
      )}
      
      {isTenantAdmin && (
        <button onClick={() => navigate('/settings?tab=security')}>
          Configurações de Segurança
        </button>
      )}
    </div>
  );
};
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProviderSimple as AuthProvider, useAuth } from "@/contexts/AuthContextSimple";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TenantSelectorProvider } from "@/contexts/TenantSelectorContext";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import UserTenantDebug from "@/components/debug/UserTenantDebug";
import ErrorBoundary from "@/components/ErrorBoundary";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '4px solid #e5e7eb', 
          borderTop: '4px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '4px solid #e5e7eb', 
          borderTop: '4px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantSelectorProvider>
            <ThemeProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    
                    {/* Debug Routes */}
                    <Route path="debug-tenant" element={<UserTenantDebug />} />
                    
                    {/* Test Routes */}
                    <Route path="test-route" element={
                      <div style={{padding: '20px'}}>
                        <h1>🧪 TESTE DE ROTA FUNCIONANDO!</h1>
                        <p>Se você consegue ver essa mensagem, a aplicação está carregando corretamente.</p>
                        <p>Timestamp: {new Date().toISOString()}</p>
                        <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', border: '1px solid green'}}>
                          <h3>✅ APLICAÇÃO FUNCIONANDO</h3>
                          <p>React está renderizando corretamente!</p>
                        </div>
                      </div>
                    } />
                    
                    {/* Vulnerabilities Classification */}
                    <Route path="vulnerabilities/classification" element={
                      <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
                        <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
                          🎯 CLASSIFICAÇÃO DE VULNERABILIDADES
                        </h1>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          <h2>✅ Página de Classificação Funcionando!</h2>
                          <p>A rota /vulnerabilities/classification está funcionando corretamente.</p>
                          <p><strong>URL atual:</strong> {window.location.pathname}</p>
                          <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                          <div style={{ marginTop: '20px' }}>
                            <UserTenantDebug />
                          </div>
                        </div>
                      </div>
                    } />
                  </Route>
                  
                  {/* Catch-all */}
                  <Route path="*" element={
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <h1>404 - Página não encontrada</h1>
                      <p>A página que você está procurando não existe.</p>
                      <a href="/dashboard" style={{ color: '#3b82f6' }}>Voltar ao Dashboard</a>
                    </div>
                  } />
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </TenantSelectorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProviderSimple as AuthProvider, useAuth } from "@/contexts/AuthContextSimple";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsRealtimeProvider } from "@/contexts/NotificationsRealtimeContext";
import { TenantSelectorProvider } from "@/contexts/TenantSelectorContext";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import UserTenantDebug from "@/components/debug/UserTenantDebug";

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
  </div>
);

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      networkMode: 'online',
      throwOnError: false
    },
    mutations: {
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
      throwOnError: false
    }
  }
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-border border-t-primary"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-border border-t-primary"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantSelectorProvider>
          <ThemeProvider>
            <NotificationsRealtimeProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                  
                  {/* Vulnerabilities Classification Test */}
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
                        <UserTenantDebug />
                      </div>
                    </div>
                  } />
                </Route>
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
              </TooltipProvider>
            </NotificationsRealtimeProvider>
          </ThemeProvider>
        </TenantSelectorProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProviderOptimized as AuthProvider, useAuth } from "@/contexts/AuthContextOptimized";
import { TenantSelectorProvider } from "@/contexts/TenantSelectorContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Critical imports (always loaded)
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import NotFound from "./pages/NotFound";

// Lazy imports for main modules
const RiskManagementCenter = lazy(() => import("@/components/risks/RiskManagementCenterImproved"));
const PrivacyDashboard = lazy(() => import("@/components/privacy/PrivacyDashboard").then(module => ({ default: module.PrivacyDashboard })));
const PolicyManagementPage = lazy(() => import("@/components/policies/PolicyManagementPage"));
const VendorsPage = lazy(() => import("@/components/vendors/VendorsPage"));
const IncidentManagementPage = lazy(() => import("@/components/incidents/IncidentManagementPage"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
    <span className="ml-2 text-sm text-muted-foreground">Carregando módulo...</span>
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

const App = () => {
  console.log('🚀 [APP] Aplicação iniciando...');
  console.log('📅 [APP] Timestamp:', new Date().toISOString());
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantSelectorProvider>
            <ThemeProvider>
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
                      
                      {/* Main modules with lazy loading */}
                      <Route path="risks" element={
                        <Suspense fallback={<PageLoader />}>
                          <RiskManagementCenter />
                        </Suspense>
                      } />
                      
                      <Route path="privacy" element={
                        <Suspense fallback={<PageLoader />}>
                          <PrivacyDashboard />
                        </Suspense>
                      } />
                      
                      <Route path="policy-management" element={
                        <Suspense fallback={<PageLoader />}>
                          <PolicyManagementPage />
                        </Suspense>
                      } />
                      
                      <Route path="vendors" element={
                        <Suspense fallback={<PageLoader />}>
                          <VendorsPage />
                        </Suspense>
                      } />
                      
                      <Route path="incidents" element={
                        <Suspense fallback={<PageLoader />}>
                          <IncidentManagementPage />
                        </Suspense>
                      } />
                      
                      {/* Test route */}
                      <Route path="test-route" element={
                        <div style={{padding: '20px'}}>
                          <h1>🧪 TESTE DE ROTA FUNCIONANDO!</h1>
                          <p>Se você consegue ver essa mensagem, o roteamento está funcionando.</p>
                          <p>Timestamp: {new Date().toISOString()}</p>
                        </div>
                      } />
                    </Route>
                    
                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </TenantSelectorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
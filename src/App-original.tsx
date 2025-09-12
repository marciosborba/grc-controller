import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProviderOptimized as AuthProvider, useAuth } from "@/contexts/AuthContextOptimized";
import { TenantSelectorProvider } from "@/contexts/TenantSelectorContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";

// Simple test pages
const TestPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{title} Funcionando!</h1>
    <p>Módulo {title} carregado com sucesso.</p>
    <p>Timestamp: {new Date().toISOString()}</p>
  </div>
);

// Lazy load real components
const RiskManagementCenter = lazy(() => import("@/components/risks/RiskManagementCenterImproved"));
const PrivacyDashboardComponent = lazy(() => import("@/components/privacy/PrivacyDashboardSimple"));
const PolicyManagementPage = lazy(() => import("@/components/policies/PolicyManagementPage"));
const VendorsPage = lazy(() => import("@/components/vendors/VendorsPage"));
const IncidentManagementPage = lazy(() => import("@/components/incidents/IncidentManagementPage"));

// Loader component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
    <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
  </div>
);

const queryClient = new QueryClient();

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
            <TooltipProvider>
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
                    
                    {/* Risk Management Routes */}
                    <Route path="risks" element={
                      <Suspense fallback={<PageLoader />}>
                        <RiskManagementCenter />
                      </Suspense>
                    } />
                    
                    {/* Privacy Routes */}
                    <Route path="privacy/*" element={
                      <Suspense fallback={<PageLoader />}>
                        <PrivacyDashboardComponent />
                      </Suspense>
                    } />
                    
                    {/* Policy Management Routes */}
                    <Route path="policy-management" element={
                      <Suspense fallback={<PageLoader />}>
                        <PolicyManagementPage />
                      </Suspense>
                    } />
                    
                    {/* Vendor/TPRM Routes */}
                    <Route path="vendors" element={
                      <Suspense fallback={<PageLoader />}>
                        <VendorsPage />
                      </Suspense>
                    } />
                    
                    {/* Incident Management Routes */}
                    <Route path="incidents" element={
                      <Suspense fallback={<PageLoader />}>
                        <IncidentManagementPage />
                      </Suspense>
                    } />
                  </Route>
                </Routes>
                <Toaster />
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </TenantSelectorProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
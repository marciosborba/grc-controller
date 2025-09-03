import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProviderOptimized as AuthProvider, useAuth } from "@/contexts/AuthContextOptimized";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsRealtimeProvider } from "@/contexts/NotificationsRealtimeContext";

// Critical imports - apenas o que é NECESSÁRIO para o primeiro carregamento
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";

// ============================================================================
// LAZY IMPORTS ORGANIZADOS POR PRIORIDADE
// ============================================================================

// NÍVEL 1: Módulos principais (carregados sob demanda)
const RiskManagementCenter = lazy(() => import("@/components/risks/RiskManagementCenterImproved"));
const AssessmentsPage = lazy(() => import("@/components/assessments/AssessmentsPage"));
const CompliancePage = lazy(() => import("@/components/compliance/CompliancePage"));
const AuditIADashboard = lazy(() => import("@/components/audit/AuditIADashboard"));
const PrivacyDashboard = lazy(() => import("@/components/privacy/PrivacyDashboard").then(module => ({ default: module.PrivacyDashboard })));

// NÍVEL 2: Configurações e administração (menos críticos)
const UserManagementPage = lazy(() => import("@/components/settings/UserManagementPage").then(module => ({ default: module.UserManagementPage })));
const GeneralSettingsPage = lazy(() => import("@/components/general-settings/GeneralSettingsPage").then(module => ({ default: module.GeneralSettingsPage })));
const NotificationsPage = lazy(() => import("@/components/notifications/NotificationsPage").then(module => ({ default: module.NotificationsPage })));

// NÍVEL 3: Funcionalidades avançadas (carregadas apenas quando necessário)
const PolicyManagementPage = lazy(() => import("@/components/policies/PolicyManagementPage"));
const VendorsPage = lazy(() => import("@/components/vendors/VendorsPage"));
const ReportsPage = lazy(() => import("@/components/reports/ReportsPageOptimized"));
const IncidentManagementPage = lazy(() => import("@/components/incidents/IncidentManagementPage"));
const EthicsChannelPage = lazy(() => import("@/components/ethics/EthicsChannelPage"));

// NÍVEL 4: Sub-módulos específicos (lazy loading máximo)
const RiskMatrixPage = lazy(() => import("@/components/risks/RiskMatrixPage").then(module => ({ default: module.RiskMatrixPage })));
const ActionPlansManagementPage = lazy(() => import("@/components/risks/ActionPlansManagementPage").then(module => ({ default: module.ActionPlansManagementPage })));
const FrameworkManagementPage = lazy(() => import("@/components/assessments/FrameworkManagementPage").then(module => ({ default: module.FrameworkManagementPage })));
const DataInventoryPage = lazy(() => import("@/components/privacy/DataInventoryPage").then(module => ({ default: module.DataInventoryPage })));
const DPIAPage = lazy(() => import("@/components/privacy/DPIAPage").then(module => ({ default: module.DPIAPage })));

// NÍVEL 5: Admin e debug (carregamento sob demanda extremo)
const TenantManagement = lazy(() => import("@/components/admin/TenantManagement"));
const UserProfilePage = lazy(() => import("@/components/profile/UserProfilePage").then(module => ({ default: module.UserProfilePage })));

// Import direto para SystemDiagnosticPage para evitar problemas de carregamento dinâmico
import SystemDiagnosticPage from "@/components/admin/SystemDiagnosticPage";

// Contextos opcionais removidos - carregamos diretamente

// ============================================================================
// CONFIGURAÇÕES OTIMIZADAS
// ============================================================================

// React Query com configuração mínima para startup rápido
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Sem retry no startup
      staleTime: 30000, // 30 segundos apenas
      gcTime: 2 * 60 * 1000, // 2 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false
    },
    mutations: {
      retry: false
    }
  }
});

// Loading components otimizados
const QuickLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-2 border-border border-t-primary"></div>
  </div>
);

const PageLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
  </div>
);

// ============================================================================
// ROUTE GUARDS OTIMIZADOS
// ============================================================================

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <QuickLoader />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PlatformAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <QuickLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isPlatformAdmin) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <QuickLoader />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// ============================================================================
// COMPONENTE PRINCIPAL OTIMIZADO
// ============================================================================

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationsRealtimeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                {/* Public Routes - Carregamento imediato */}
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
                  
                  {/* NÍVEL 1: Módulos principais */}
                  <Route path="risks" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskManagementCenter />
                    </Suspense>
                  } />
                  <Route path="assessments" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentsPage />
                    </Suspense>
                  } />
                  <Route path="compliance" element={
                    <Suspense fallback={<PageLoader />}>
                      <CompliancePage />
                    </Suspense>
                  } />
                  <Route path="audit" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditIADashboard />
                    </Suspense>
                  } />
                  <Route path="privacy" element={
                    <Suspense fallback={<PageLoader />}>
                      <PrivacyDashboard />
                    </Suspense>
                  } />

                  {/* NÍVEL 2: Configurações */}
                  <Route path="settings" element={
                    <Suspense fallback={<PageLoader />}>
                      <UserManagementPage />
                    </Suspense>
                  } />
                  <Route path="settings/general" element={
                    <Suspense fallback={<PageLoader />}>
                      <GeneralSettingsPage />
                    </Suspense>
                  } />
                  <Route path="notifications" element={
                    <Suspense fallback={<PageLoader />}>
                      <NotificationsPage />
                    </Suspense>
                  } />

                  {/* NÍVEL 3: Funcionalidades avançadas */}
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
                  <Route path="reports" element={
                    <Suspense fallback={<PageLoader />}>
                      <ReportsPage />
                    </Suspense>
                  } />
                  <Route path="incidents" element={
                    <Suspense fallback={<PageLoader />}>
                      <IncidentManagementPage />
                    </Suspense>
                  } />
                  <Route path="ethics" element={
                    <Suspense fallback={<PageLoader />}>
                      <EthicsChannelPage />
                    </Suspense>
                  } />

                  {/* NÍVEL 4: Sub-módulos específicos */}
                  <Route path="risks/matrix" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskMatrixPage />
                    </Suspense>
                  } />
                  <Route path="action-plans" element={
                    <Suspense fallback={<PageLoader />}>
                      <ActionPlansManagementPage />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworkManagementPage />
                    </Suspense>
                  } />
                  <Route path="privacy/inventory" element={
                    <Suspense fallback={<PageLoader />}>
                      <DataInventoryPage />
                    </Suspense>
                  } />
                  <Route path="privacy/dpia" element={
                    <Suspense fallback={<PageLoader />}>
                      <DPIAPage />
                    </Suspense>
                  } />

                  {/* NÍVEL 5: Admin (apenas para platform admins) */}
                  <Route path="admin/tenants" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <TenantManagement />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="admin/system-diagnostic" element={
                    <PlatformAdminRoute>
                      <SystemDiagnosticPage />
                    </PlatformAdminRoute>
                  } />
                  <Route path="profile" element={
                    <Suspense fallback={<PageLoader />}>
                      <UserProfilePage />
                    </Suspense>
                  } />
                </Route>
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </NotificationsRealtimeProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
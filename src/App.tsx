import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProviderOptimized as AuthProvider, useAuth } from "@/contexts/AuthContextOptimized";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsRealtimeProvider } from "@/contexts/NotificationsRealtimeContext";
import { TenantSelectorProvider } from "@/contexts/TenantSelectorContext";
// Critical imports (always loaded)
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import DashboardPageNoQueries from "@/components/dashboard/DashboardPageNoQueries";
import DashboardPageUltraMinimal from "@/components/dashboard/DashboardPageUltraMinimal";
import DashboardPageIsolated from "@/components/dashboard/DashboardPageIsolated";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
// Lazy import for GeneralSettingsPage to reduce initial bundle size
const GeneralSettingsPage = lazy(() => import("@/components/general-settings/GeneralSettingsPage").then(module => ({ default: module.GeneralSettingsPage })));

// Lazy imports for feature modules
const RiskManagementCenter = lazy(() => import("@/components/risks/RiskManagementCenterImproved"));
const RiskTestMinimal = lazy(() => import("@/components/risks/RiskTestMinimal"));
const RiskTestWithHook = lazy(() => import("@/components/risks/RiskTestWithHook"));
const RiskManagementHub = lazy(() => import("@/components/risks/RiskManagementHub").then(module => ({ default: module.RiskManagementHub })));

const RiskMatrixPage = lazy(() => import("@/components/risks/RiskMatrixPage").then(module => ({ default: module.RiskMatrixPage })));
const ActionPlansManagementPage = lazy(() => import("@/components/risks/ActionPlansManagementPage").then(module => ({ default: module.ActionPlansManagementPage })));
const RiskAcceptanceManagement = lazy(() => import("@/components/risks/RiskAcceptanceManagement"));
const IncidentManagementPage = lazy(() => import("@/components/incidents/IncidentManagementPage"));
// Módulo de Compliance
const ComplianceDashboard = lazy(() => import("@/components/compliance/ComplianceDashboard"));
const AuditoriasDashboard = lazy(() => import("@/components/auditorias/AuditoriasDashboard"));
const PlanejamentoAuditoria = lazy(() => import("@/components/auditorias/PlanejamentoAuditoria"));
const ProjetosAuditoria = lazy(() => import("@/components/auditorias/ProjetosAuditoria"));
const PapeisTrabalho = lazy(() => import("@/components/auditorias/PapeisTrabalho"));
const RelatoriosAuditoria = lazy(() => import("@/components/auditorias/RelatoriosAuditoria"));
const PlanejamentoAuditoriaDashboard = lazy(() => import("@/components/planejamento/PlanejamentoAuditoriaDashboard").then(module => ({ default: module.PlanejamentoAuditoriaDashboard })));
const PlanejamentoTestePage = lazy(() => import("@/components/planejamento/PlanejamentoTestePage").then(module => ({ default: module.PlanejamentoTestePage })));
const PlanejamentoAuditoriaCorrigido = lazy(() => import("@/components/planejamento/PlanejamentoAuditoriaCorrigido").then(module => ({ default: module.PlanejamentoAuditoriaCorrigido })));
const PlanejamentoAuditoriaCompleto = lazy(() => import("@/components/planejamento/PlanejamentoAuditoriaCompleto").then(module => ({ default: module.PlanejamentoAuditoriaCompleto })));
const PlanejamentoMinimalTest = lazy(() => import("@/components/planejamento/PlanejamentoMinimalTest").then(module => ({ default: module.PlanejamentoMinimalTest })));
const PlanejamentoAuditoriaSimplificado = lazy(() => import("@/components/planejamento/PlanejamentoAuditoriaSimplificado").then(module => ({ default: module.PlanejamentoAuditoriaSimplificado })));
const PlanosAcaoPage = lazy(() => import("@/components/planejamento/PlanosAcaoPage"));
const CronogramaAtividadesPage = lazy(() => import("@/components/planejamento/CronogramaAtividadesPage"));
const TimelineVisualizacao = lazy(() => import("@/components/planejamento/TimelineVisualizacao"));
const NotificacoesPlanejamento = lazy(() => import("@/components/planejamento/NotificacoesPlanejamento"));
const PolicyManagementPage = lazy(() => import("@/components/policies/PolicyManagementPage"));
const VendorsPage = lazy(() => import("@/components/vendors/VendorsPage"));

// Módulo Assessment - Versão Profissional Atualizada
const AssessmentsDashboard = lazy(() => import("@/components/assessments/AssessmentsDashboard"));
const AssessmentCRUD = lazy(() => import("@/components/assessments/AssessmentCRUD"));
const AssessmentsDashboardSimple = lazy(() => import("@/components/assessments/views/AssessmentsDashboardSimple"));
const AssessmentsDashboardConsistent = lazy(() => import("@/components/assessments/views/AssessmentsDashboardConsistent"));
const FrameworksAssessment = lazy(() => import("@/components/assessments/FrameworksAssessment"));
const FrameworksManagement = lazy(() => import("@/components/assessments/views/FrameworksManagement"));
const FrameworksManagementSimple = lazy(() => import("@/components/assessments/views/FrameworksManagementSimple"));
const FrameworksManagementFixed = lazy(() => import("@/components/assessments/views/FrameworksManagementFixed"));
const AssessmentExecution = lazy(() => import("@/components/assessments/AssessmentExecution"));
const AssessmentExecutionComplete = lazy(() => import("@/components/assessments/AssessmentExecutionComplete"));
// Componente corrigido após fix do RLS
import AssessmentsListWorking from "@/components/assessments/AssessmentsListWorking";
const QuestionsManagement = lazy(() => import("@/components/assessments/QuestionsManagement"));
const ActionPlansManagement = lazy(() => import("@/components/assessments/ActionPlansManagement"));
const ActionPlansManagementProfessional = lazy(() => import("@/components/assessments/ActionPlansManagementProfessional"));
const ActionPlansDashboard = lazy(() => import("@/components/action-plans/ActionPlansDashboard"));
const ActionPlansDebug = lazy(() => import("@/components/action-plans/ActionPlansDebug"));
const ActionPlansSimpleTest = lazy(() => import("@/components/action-plans/ActionPlansSimpleTest"));
const ActionPlansMinimalTest = lazy(() => import("@/components/action-plans/ActionPlansMinimalTest"));
const ActionPlansDebugSimple = lazy(() => import("@/components/assessments/ActionPlansDebugSimple"));
const AssessmentReporting = lazy(() => import("@/components/assessments/AssessmentReporting"));

// Privacy module
const PrivacyDashboard = lazy(() => import("@/components/privacy/PrivacyDashboard").then(module => ({ default: module.PrivacyDashboard })));
const DataDiscoveryPage = lazy(() => import("@/components/privacy/DataDiscoveryPage").then(module => ({ default: module.DataDiscoveryPage })));
const DataInventoryPage = lazy(() => import("@/components/privacy/DataInventoryPage").then(module => ({ default: module.DataInventoryPage })));
const DPIAPage = lazy(() => import("@/components/privacy/DPIAPage").then(module => ({ default: module.DPIAPage })));
const PrivacyIncidentsPage = lazy(() => import("@/components/privacy/PrivacyIncidentsPage").then(module => ({ default: module.PrivacyIncidentsPage })));
const DataSubjectRequestsPage = lazy(() => import("@/components/privacy/DataSubjectRequestsPage").then(module => ({ default: module.DataSubjectRequestsPage })));
const DataSubjectPortal = lazy(() => import("@/components/privacy/DataSubjectPortal").then(module => ({ default: module.DataSubjectPortal })));
const LegalBasesPage = lazy(() => import("@/components/privacy/LegalBasesPage").then(module => ({ default: module.LegalBasesPage })));
const ConsentsPage = lazy(() => import("@/components/privacy/ConsentsPage").then(module => ({ default: module.ConsentsPage })));
const ProcessingActivitiesPage = lazy(() => import("@/components/privacy/ProcessingActivitiesPage").then(module => ({ default: module.ProcessingActivitiesPage })));
const RATReport = lazy(() => import("@/components/privacy/RATReport").then(module => ({ default: module.RATReport })));

// Settings and admin
const UserManagementPage = lazy(() => import("@/components/settings/UserManagementPage").then(module => ({ default: module.UserManagementPage })));
const ActivityLogsPage = lazy(() => import("@/components/settings/ActivityLogsPage").then(module => ({ default: module.ActivityLogsPage })));
// GeneralSettingsPage agora é importado diretamente acima
const TenantManagement = lazy(() => import("@/components/admin/TenantManagement"));
const SystemDiagnosticPage = lazy(() => import("@/components/admin/SystemDiagnosticPage"));
const PlatformAdminMigration = lazy(() => import("@/components/admin/PlatformAdminMigration"));

// AI Manager - New modular structure
const AIManagerDashboard = lazy(() => import("@/components/ai/AIManagerDashboard"));
const AIProvidersPage = lazy(() => import("@/components/ai/AIProvidersPage"));
const AIPromptsPage = lazy(() => import("@/components/ai/AIPromptsPage"));
const AIWorkflowsPage = lazy(() => import("@/components/ai/AIWorkflowsPage"));
const AIUsagePage = lazy(() => import("@/components/ai/AIUsagePage"));
const AISettingsPage = lazy(() => import("@/components/ai/AISettingsPage"));
const AIAuditPage = lazy(() => import("@/components/ai/AIAuditPage"));

// Import direto para teste (sem lazy loading)
import AIManagerNew from "@/components/ai/AIManagerNew";
import AIManagementPageDirect from "@/components/ai/AIManagementPage";
import UserStatusCheck from "@/components/UserStatusCheck";
import FixUserPermissions from "@/components/FixUserPermissions";


// Other modules
const EthicsChannelPage = lazy(() => import("@/components/ethics/EthicsChannelPage"));
const ReportsPage = lazy(() => import("@/components/reports/ReportsPageOptimized"));
const UserProfilePage = lazy(() => import("@/components/profile/UserProfilePage").then(module => ({ default: module.UserProfilePage })));
const NotificationsPage = lazy(() => import("@/components/notifications/NotificationsPage").then(module => ({ default: module.NotificationsPage })));
const HelpPage = lazy(() => import("./pages/HelpPage"));

// Tenant Settings module
const TenantSettingsPage = lazy(() => import("@/components/tenant-settings/TenantSettingsPage"));

// Página pública de avaliação de fornecedores (mantida)
const PublicVendorAssessmentPage = lazy(() => import("./pages/PublicVendorAssessmentPage"));

// Debug pages (development only)
const DebugUserInfo = lazy(() => import("@/components/admin/DebugUserInfo"));
const UserDebugInfo = lazy(() => import("@/components/admin/UserDebugInfo"));
const AuthDebugComponent = lazy(() => import("@/components/debug/AuthDebugComponent"));
const PlatformAdminDebugRoute = lazy(() => import("@/components/debug/PlatformAdminDebugRoute"));
const UserPermissionsDebug = lazy(() => import("@/components/debug/UserPermissionsDebug"));
const AIManagerDirectTest = lazy(() => import("@/components/debug/AIManagerDirectTest"));
const SimpleAITest = lazy(() => import("@/components/debug/SimpleAITest"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
  </div>
);

// Configure React Query with optimized defaults for faster startup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Permitir 2 tentativas
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Reconectar quando voltar online
      refetchOnMount: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      networkMode: 'online',
      throwOnError: false
    },
    mutations: {
      retry: 1, // Uma tentativa para mutations
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

const PlatformAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  console.log('🔐 [PLATFORM ADMIN ROUTE] === VERIFICAÇÃO DE ACESSO ===');
  console.log('👤 [PLATFORM ADMIN ROUTE] Dados do usuário:', {
    user,
    isLoading,
    isPlatformAdmin: user?.isPlatformAdmin,
    roles: user?.roles,
    permissions: user?.permissions,
    timestamp: new Date().toISOString(),
    currentUrl: window.location.pathname
  });
  
  console.log('🗺️ [PLATFORM ADMIN ROUTE] URL atual:', window.location.pathname);
  console.log('🕰️ [PLATFORM ADMIN ROUTE] Timestamp:', new Date().toISOString());
  
  if (isLoading) {
    console.log('⏳ [PLATFORM ADMIN ROUTE] Usuário ainda carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-border border-t-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ [PLATFORM ADMIN ROUTE] Usuário não logado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }
  
  if (!user.isPlatformAdmin) {
    console.log('❌ [PLATFORM ADMIN ROUTE] Usuário não é Platform Admin, redirecionando para /dashboard');
    console.log('📊 [PLATFORM ADMIN ROUTE] Detalhes da verificação:', {
      isPlatformAdmin: user.isPlatformAdmin,
      roles: user.roles,
      hasAdminRole: user.roles?.includes('admin'),
      hasSuperAdminRole: user.roles?.includes('super_admin'),
      hasPlatformAdminRole: user.roles?.includes('platform_admin')
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ [PLATFORM ADMIN ROUTE] Usuário é Platform Admin, permitindo acesso');
  console.log('🔐 [PLATFORM ADMIN ROUTE] === FIM VERIFICAÇÃO ===');
  
  return <>{children}</>;
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
                <Route path="/privacy-portal" element={
                  <Suspense fallback={<PageLoader />}>
                    <DataSubjectPortal />
                  </Suspense>
                } />
                <Route path="/vendor-assessment/:publicLinkId" element={
                  <Suspense fallback={<PageLoader />}>
                    <PublicVendorAssessmentPage />
                  </Suspense>
                } />
                

                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="assessments" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentsDashboard />
                    </Suspense>
                  } />
                  <Route path="assessments/manage" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentCRUD />
                    </Suspense>
                  } />
                  <Route path="assessments/simple" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentsDashboardSimple />
                    </Suspense>
                  } />
                  <Route path="assessments/legacy" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentsDashboard />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworksManagementFixed />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks/simple" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworksManagementSimple />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks/pro" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworksManagement />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks/legacy" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworksAssessment />
                    </Suspense>
                  } />
                  <Route path="assessments/execution" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentExecutionComplete />
                    </Suspense>
                  } />
                  <Route path="assessments/execution/:assessmentId" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentExecutionComplete />
                    </Suspense>
                  } />
                  <Route path="assessments/execution/legacy" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentExecution />
                    </Suspense>
                  } />
                  <Route path="assessments/list" element={<AssessmentsListWorking />} />
                  <Route path="assessments/questions" element={
                    <Suspense fallback={<PageLoader />}>
                      <QuestionsManagement />
                    </Suspense>
                  } />
                  <Route path="action-plans" element={
                    <Suspense fallback={<PageLoader />}>
                      <ActionPlansDashboard />
                    </Suspense>
                  } />
                  <Route path="assessments/action-plans" element={
                    <Suspense fallback={<PageLoader />}>
                      <ActionPlansManagementProfessional />
                    </Suspense>
                  } />
                  <Route path="assessments/reports" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentReporting />
                    </Suspense>
                  } />
                  <Route path="assessments/action-plans/debug" element={
                    <Suspense fallback={<PageLoader />}>
                      <ActionPlansDebugSimple />
                    </Suspense>
                  } />
                  
                  <Route path="dashboard-test-isolated" element={<DashboardPageIsolated />} />
                  <Route path="dashboard-test-minimal" element={<DashboardPageUltraMinimal />} />
                  <Route path="dashboard-test-no-queries" element={<DashboardPageNoQueries />} />
                  <Route path="risks" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskManagementCenter />
                    </Suspense>
                  } />
                  <Route path="risks-test" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskTestMinimal />
                    </Suspense>
                  } />
                  <Route path="risks-hook-test" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskTestWithHook />
                    </Suspense>
                  } />
                  <Route path="risks-hub" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskManagementHub />
                    </Suspense>
                  } />

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
                  <Route path="risk-letters" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskAcceptanceManagement />
                    </Suspense>
                  } />
                  <Route path="compliance" element={
                    <Suspense fallback={<PageLoader />}>
                      <ComplianceDashboard />
                    </Suspense>
                  } />
                  <Route path="incidents" element={
                    <Suspense fallback={<PageLoader />}>
                      <IncidentManagementPage />
                    </Suspense>
                  } />
                  <Route path="auditorias" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditoriasDashboard />
                    </Suspense>
                  } />
                  <Route path="auditorias/planejamento" element={
                    <Suspense fallback={<PageLoader />}>
                      <PlanejamentoAuditoria />
                    </Suspense>
                  } />
                  <Route path="auditorias/projetos" element={
                    <Suspense fallback={<PageLoader />}>
                      <ProjetosAuditoria />
                    </Suspense>
                  } />
                  <Route path="auditorias/papeis-trabalho" element={
                    <Suspense fallback={<PageLoader />}>
                      <PapeisTrabalho />
                    </Suspense>
                  } />
                  <Route path="auditorias/relatorios" element={
                    <Suspense fallback={<PageLoader />}>
                      <RelatoriosAuditoria />
                    </Suspense>
                  } />
                  <Route path="planejamento-estrategico" element={
                    <Suspense fallback={<PageLoader />}>
                      <PlanejamentoAuditoriaSimplificado />
                    </Suspense>
                  } />
                  <Route path="planejamento/planos-acao" element={
                    <Suspense fallback={<PageLoader />}>
                      <PlanosAcaoPage />
                    </Suspense>
                  } />
                  <Route path="planejamento/cronograma" element={
                    <Suspense fallback={<PageLoader />}>
                      <CronogramaAtividadesPage />
                    </Suspense>
                  } />
                  <Route path="planejamento/timeline" element={
                    <Suspense fallback={<PageLoader />}>
                      <TimelineVisualizacao />
                    </Suspense>
                  } />
                  <Route path="planejamento/notificacoes" element={
                    <Suspense fallback={<PageLoader />}>
                      <NotificacoesPlanejamento />
                    </Suspense>
                  } />
                  {/* Todas as rotas do módulo Assessment foram removidas */}
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
                  <Route path="ethics" element={
                    <Suspense fallback={<PageLoader />}>
                      <EthicsChannelPage />
                    </Suspense>
                  } />
                  <Route path="privacy" element={
                    <Suspense fallback={<PageLoader />}>
                      <PrivacyDashboard />
                    </Suspense>
                  } />
                  <Route path="privacy/discovery" element={
                    <Suspense fallback={<PageLoader />}>
                      <DataDiscoveryPage />
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
                  <Route path="privacy/incidents" element={
                    <Suspense fallback={<PageLoader />}>
                      <PrivacyIncidentsPage />
                    </Suspense>
                  } />
                  <Route path="privacy/requests" element={
                    <Suspense fallback={<PageLoader />}>
                      <DataSubjectRequestsPage />
                    </Suspense>
                  } />
                  <Route path="privacy/legal-bases" element={
                    <Suspense fallback={<PageLoader />}>
                      <LegalBasesPage />
                    </Suspense>
                  } />
                  <Route path="privacy/consents" element={
                    <Suspense fallback={<PageLoader />}>
                      <ConsentsPage />
                    </Suspense>
                  } />
                  <Route path="privacy/processing-activities" element={
                    <Suspense fallback={<PageLoader />}>
                      <ProcessingActivitiesPage />
                    </Suspense>
                  } />
                  <Route path="privacy/rat-report" element={
                    <Suspense fallback={<PageLoader />}>
                      <RATReport />
                    </Suspense>
                  } />
                  <Route path="admin/tenants" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <TenantManagement />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="admin/system-diagnostic" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <SystemDiagnosticPage />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="admin/platform-migration" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <PlatformAdminMigration />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  {/* AI Manager - New modular structure */}
                  <Route path="ai-manager" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIManagementPageDirect />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="ai-manager/providers" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIProvidersPage />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="ai-manager/prompts" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIPromptsPage />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="ai-manager/workflows" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIWorkflowsPage />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="ai-manager/usage" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIUsagePage />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="ai-manager/settings" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AISettingsPage />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="ai-manager/audit" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIAuditPage />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  
                  {/* Legacy AI management routes for compatibility */}
                  <Route path="ai-management" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIManagerDashboard />
                      </Suspense>
                    </PlatformAdminRoute>
                  } />
                  <Route path="debug-user" element={
                    <Suspense fallback={<PageLoader />}>
                      <DebugUserInfo />
                    </Suspense>
                  } />
                  <Route path="user-debug" element={
                    <Suspense fallback={<PageLoader />}>
                      <UserDebugInfo />
                    </Suspense>
                  } />
                  <Route path="auth-debug" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuthDebugComponent />
                    </Suspense>
                  } />
                  <Route path="permissions-debug" element={
                    <Suspense fallback={<PageLoader />}>
                      <UserPermissionsDebug />
                    </Suspense>
                  } />
                  <Route path="ai-manager-test" element={
                    <Suspense fallback={<PageLoader />}>
                      <AIManagerDirectTest />
                    </Suspense>
                  } />
                  <Route path="profile" element={
                    <Suspense fallback={<PageLoader />}>
                      <UserProfilePage />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<PageLoader />}>
                      <UserManagementPage />
                    </Suspense>
                  } />
                  <Route path="settings/activity-logs" element={
                    <Suspense fallback={<PageLoader />}>
                      <ActivityLogsPage />
                    </Suspense>
                  } />
                  <Route path="settings/general" element={
                    <Suspense fallback={<PageLoader />}>
                      <GeneralSettingsPage />
                    </Suspense>
                  } />
                  <Route path="tenant-settings" element={
                    <Suspense fallback={<PageLoader />}>
                      <TenantSettingsPage />
                    </Suspense>
                  } />
                  


                  <Route path="notifications" element={
                    <Suspense fallback={<PageLoader />}>
                      <NotificationsPage />
                    </Suspense>
                  } />
                  <Route path="help" element={
                    <Suspense fallback={<PageLoader />}>
                      <HelpPage />
                    </Suspense>
                  } />
                  
                  {/* Rotas de teste movidas para DENTRO da estrutura aninhada */}
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
                  <Route path="planejamento-teste" element={
                    <div style={{padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh'}}>
                      <h1 style={{color: '#1e40af', marginBottom: '20px'}}>🎯 TESTE PLANEJAMENTO ESTRATÉGICO</h1>
                      <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                        <h2>✅ Página de Planejamento Carregou!</h2>
                        <p>Se você está vendo esta mensagem, o roteamento está funcionando corretamente.</p>
                        <p><strong>URL atual:</strong> {window.location.pathname}</p>
                        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                        <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a'}}>
                          <h3>Status do Sistema:</h3>
                          <ul>
                            <li>✅ React renderizando</li>
                            <li>✅ Router funcionando</li>
                            <li>✅ Componente carregando</li>
                            <li>✅ Servidor ativo na porta 8080</li>
                          </ul>
                        </div>
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
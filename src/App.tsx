import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsRealtimeProvider } from "@/contexts/NotificationsRealtimeContext";
// Critical imports (always loaded)
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GeneralSettingsPage } from "@/components/general-settings/GeneralSettingsPage";

// Lazy imports for feature modules
const RiskManagementCenter = lazy(() => import("@/components/risks/RiskManagementCenterImproved"));
const RiskManagementHub = lazy(() => import("@/components/risks/RiskManagementHub").then(module => ({ default: module.RiskManagementHub })));

const RiskMatrixPage = lazy(() => import("@/components/risks/RiskMatrixPage").then(module => ({ default: module.RiskMatrixPage })));
const ActionPlansManagementPage = lazy(() => import("@/components/risks/ActionPlansManagementPage").then(module => ({ default: module.ActionPlansManagementPage })));
const RiskAcceptanceManagement = lazy(() => import("@/components/risks/RiskAcceptanceManagement"));
const IncidentManagementPage = lazy(() => import("@/components/incidents/IncidentManagementPage"));
const CompliancePage = lazy(() => import("@/components/compliance/CompliancePage"));
// Audit IA Module - Comprehensive audit management with AI
const AuditIADashboard = lazy(() => import("@/components/audit/AuditIADashboard"));
const AuditPlanningWizard = lazy(() => import("@/components/audit/AuditPlanningWizard"));
const AuditScopingMatrix = lazy(() => import("@/components/audit/AuditScopingMatrix"));
const AuditExecutionWorkspace = lazy(() => import("@/components/audit/AuditExecutionWorkspace"));
const AIWorkingPapers = lazy(() => import("@/components/audit/AIWorkingPapers"));
const AuditReportGenerator = lazy(() => import("@/components/audit/AuditReportGenerator"));
const AuditEvidenceManager = lazy(() => import("@/components/audit/AuditEvidenceManager"));
const AlexAuditAI = lazy(() => import("@/components/audit/AlexAuditAI"));
const PolicyManagementPage = lazy(() => import("@/components/policies/PolicyManagementPage"));
const VendorsPage = lazy(() => import("@/components/vendors/VendorsPage"));

// Assessments module
const AssessmentsPage = lazy(() => import("@/components/assessments/AssessmentsPage"));
const FrameworkManagementPage = lazy(() => import("@/components/assessments/FrameworkManagementPage").then(module => ({ default: module.FrameworkManagementPage })));
const AssessmentDetailPage = lazy(() => import("@/components/assessments/AssessmentDetailPage"));
const FrameworkDetailPage = lazy(() => import("@/components/assessments/FrameworkDetailPage"));
const FrameworkEvaluationPage = lazy(() => import("@/components/assessments/FrameworkEvaluationPage"));
const CreateFrameworkPage = lazy(() => import("@/components/assessments/CreateFrameworkPage"));

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
const AIManagementPage = lazy(() => import("@/components/ai/AIManagementPage").then(module => ({ default: module.AIManagementPage })));

// Other modules
const EthicsChannelPage = lazy(() => import("@/components/ethics/EthicsChannelPage"));
const ReportsPage = lazy(() => import("@/components/reports/ReportsPage").then(module => ({ default: module.ReportsPage })));
const UserProfilePage = lazy(() => import("@/components/profile/UserProfilePage").then(module => ({ default: module.UserProfilePage })));
const NotificationsPage = lazy(() => import("@/components/notifications/NotificationsPage").then(module => ({ default: module.NotificationsPage })));
const HelpPage = lazy(() => import("./pages/HelpPage"));

// Public vendor assessment
const PublicVendorAssessmentPage = lazy(() => import("./pages/PublicVendorAssessmentPage"));

// Debug pages (development only)
const DebugUserInfo = lazy(() => import("@/components/admin/DebugUserInfo"));
const UserDebugInfo = lazy(() => import("@/components/admin/UserDebugInfo"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
  </div>
);

// Configure React Query with secure defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1,
      retryDelay: 1000
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-border border-t-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user.isPlatformAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
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
        <ThemeProvider>
          <NotificationsRealtimeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
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
                  <Route path="risks" element={
                    <Suspense fallback={<PageLoader />}>
                      <RiskManagementCenter />
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
                      <CompliancePage />
                    </Suspense>
                  } />
                  <Route path="incidents" element={
                    <Suspense fallback={<PageLoader />}>
                      <IncidentManagementPage />
                    </Suspense>
                  } />
                  {/* Audit IA Module - Comprehensive audit management */}
                  <Route path="audit" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditIADashboard />
                    </Suspense>
                  } />
                  <Route path="audit/planning" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditPlanningWizard />
                    </Suspense>
                  } />
                  <Route path="audit/scoping" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditScopingMatrix />
                    </Suspense>
                  } />
                  <Route path="audit/execution" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditExecutionWorkspace />
                    </Suspense>
                  } />
                  <Route path="audit/working-papers" element={
                    <Suspense fallback={<PageLoader />}>
                      <AIWorkingPapers />
                    </Suspense>
                  } />
                  <Route path="audit/reports" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditReportGenerator />
                    </Suspense>
                  } />
                  <Route path="audit/evidence" element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditEvidenceManager />
                    </Suspense>
                  } />
                  <Route path="audit/alex-ai" element={
                    <Suspense fallback={<PageLoader />}>
                      <AlexAuditAI />
                    </Suspense>
                  } />
                  <Route path="assessments" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentsPage />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworkManagementPage />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks/create" element={
                    <Suspense fallback={<PageLoader />}>
                      <CreateFrameworkPage />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworkDetailPage />
                    </Suspense>
                  } />
                  <Route path="assessments/frameworks/:id/evaluate" element={
                    <Suspense fallback={<PageLoader />}>
                      <FrameworkEvaluationPage />
                    </Suspense>
                  } />
                  <Route path="assessments/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentDetailPage />
                    </Suspense>
                  } />
                  <Route path="assessment-detail/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <AssessmentDetailPage />
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
                  <Route path="settings/general" element={<GeneralSettingsPage />} />
                  <Route path="admin/ai-management" element={
                    <PlatformAdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AIManagementPage />
                      </Suspense>
                    </PlatformAdminRoute>
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
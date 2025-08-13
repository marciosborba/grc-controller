import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import NewRiskManagementPage from "@/components/risks/NewRiskManagementPage";
import IncidentManagementPage from "@/components/incidents/IncidentManagementPage";
import CompliancePage from "@/components/compliance/CompliancePage";
import AuditReportsPage from "@/components/audit/AuditReportsPage";
import PolicyManagementPage from "@/components/policies/PolicyManagementPage";
import VendorsPage from "@/components/vendors/VendorsPage";
import AssessmentsPage from "@/components/assessments/AssessmentsPage";
import { FrameworkManagementPage } from "@/components/assessments/FrameworkManagementPage";
import EthicsChannelPage from "@/components/ethics/EthicsChannelPage";
import { ReportsPage } from "@/components/reports/ReportsPage";
import { UserManagementPage } from "@/components/settings/UserManagementPage";
import { ActivityLogsPage } from "@/components/settings/ActivityLogsPage";
import TenantManagement from "@/components/admin/TenantManagement";
import DebugUserInfo from "@/components/admin/DebugUserInfo";
import UserDebugInfo from "@/components/admin/UserDebugInfo";
import SystemDiagnosticPage from "@/components/admin/SystemDiagnosticPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import AssessmentDetailPage from "@/components/assessments/AssessmentDetailPage";
import FrameworkDetailPage from "@/components/assessments/FrameworkDetailPage";
import FrameworkEvaluationPage from "@/components/assessments/FrameworkEvaluationPage";
import CreateFrameworkPage from "@/components/assessments/CreateFrameworkPage";
import HelpPage from "./pages/HelpPage";
import { UserProfilePage } from "@/components/profile/UserProfilePage";
import { PrivacyDashboard } from "@/components/privacy/PrivacyDashboard";
import { DataDiscoveryPage } from "@/components/privacy/DataDiscoveryPage";
import { DataInventoryPage } from "@/components/privacy/DataInventoryPage";
import { DPIAPage } from "@/components/privacy/DPIAPage";
import { PrivacyIncidentsPage } from "@/components/privacy/PrivacyIncidentsPage";
import { DataSubjectRequestsPage } from "@/components/privacy/DataSubjectRequestsPage";
import { DataSubjectPortal } from "@/components/privacy/DataSubjectPortal";
import { LegalBasesPage } from "@/components/privacy/LegalBasesPage";
import { ConsentsPage } from "@/components/privacy/ConsentsPage";
import { ProcessingActivitiesPage } from "@/components/privacy/ProcessingActivitiesPage";
import { RATReport } from "@/components/privacy/RATReport";

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
                <Route path="/privacy-portal" element={<DataSubjectPortal />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="risks" element={<NewRiskManagementPage />} />
                  <Route path="compliance" element={<CompliancePage />} />
                  <Route path="incidents" element={<IncidentManagementPage />} />
                  <Route path="audit" element={<AuditReportsPage />} />
                  <Route path="assessments" element={<AssessmentsPage />} />
                  <Route path="assessments/frameworks" element={<FrameworkManagementPage />} />
                  <Route path="assessments/frameworks/create" element={<CreateFrameworkPage />} />
                  <Route path="assessments/frameworks/:id" element={<FrameworkDetailPage />} />
                  <Route path="assessments/frameworks/:id/evaluate" element={<FrameworkEvaluationPage />} />
                  <Route path="assessments/:id" element={<AssessmentDetailPage />} />
                  <Route path="assessment-detail/:id" element={<AssessmentDetailPage />} />
                  <Route path="policies" element={<PolicyManagementPage />} />
                  <Route path="vendors" element={<VendorsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="ethics" element={<EthicsChannelPage />} />
                  <Route path="privacy" element={<PrivacyDashboard />} />
                  <Route path="privacy/discovery" element={<DataDiscoveryPage />} />
                  <Route path="privacy/inventory" element={<DataInventoryPage />} />
                  <Route path="privacy/dpia" element={<DPIAPage />} />
                  <Route path="privacy/incidents" element={<PrivacyIncidentsPage />} />
                  <Route path="privacy/requests" element={<DataSubjectRequestsPage />} />
                  <Route path="privacy/legal-bases" element={<LegalBasesPage />} />
                  <Route path="privacy/consents" element={<ConsentsPage />} />
                  <Route path="privacy/processing-activities" element={<ProcessingActivitiesPage />} />
                  <Route path="privacy/rat-report" element={<RATReport />} />
                  <Route path="admin/tenants" element={
                    <PlatformAdminRoute>
                      <TenantManagement />
                    </PlatformAdminRoute>
                  } />
                  <Route path="admin/system-diagnostic" element={
                    <PlatformAdminRoute>
                      <SystemDiagnosticPage />
                    </PlatformAdminRoute>
                  } />
                  <Route path="debug-user" element={<DebugUserInfo />} />
                  <Route path="user-debug" element={<UserDebugInfo />} />
                  <Route path="profile" element={<UserProfilePage />} />
                  <Route path="settings" element={<UserManagementPage />} />
                  <Route path="settings/activity-logs" element={<ActivityLogsPage />} />
                  <Route path="help" element={<HelpPage />} />
                </Route>
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
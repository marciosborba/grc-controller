
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/components/dashboard/DashboardPage";
import RiskManagementPage from "@/components/risks/RiskManagementPage";
import SecurityIncidentsPage from "@/components/incidents/SecurityIncidentsPage";
import CompliancePage from "@/components/compliance/CompliancePage";
import AuditReportsPage from "@/components/audit/AuditReportsPage";
import PoliciesPage from "@/components/policies/PoliciesPage";
import VendorsPage from "@/components/vendors/VendorsPage";
import AssessmentsPage from "@/components/assessments/AssessmentsPage";
import EthicsChannelPage from "@/components/ethics/EthicsChannelPage";
import { UserManagementPage } from "@/components/settings/UserManagementPage";
import { ActivityLogsPage } from "@/components/settings/ActivityLogsPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";

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
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="risks" element={<RiskManagementPage />} />
                <Route path="compliance" element={<CompliancePage />} />
                <Route path="incidents" element={<SecurityIncidentsPage />} />
                <Route path="audit" element={<AuditReportsPage />} />
                <Route path="assessments" element={<AssessmentsPage />} />
                <Route path="policies" element={<PoliciesPage />} />
                <Route path="vendors" element={<VendorsPage />} />
                <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
                <Route path="ethics" element={<EthicsChannelPage />} />
                <Route path="settings" element={<UserManagementPage />} />
                <Route path="settings/activity-logs" element={<ActivityLogsPage />} />
                <Route path="help" element={<div className="p-6"><h1 className="text-2xl font-bold">Ajuda</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

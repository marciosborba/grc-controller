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
import { UserManagementPage } from "@/components/settings/UserManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Route path="assessments" element={<div className="p-6"><h1 className="text-2xl font-bold">Assessments</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
              <Route path="policies" element={<div className="p-6"><h1 className="text-2xl font-bold">Políticas</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
              <Route path="vendors" element={<div className="p-6"><h1 className="text-2xl font-bold">Fornecedores</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
              <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
              <Route path="settings" element={<UserManagementPage />} />
              <Route path="help" element={<div className="p-6"><h1 className="text-2xl font-bold">Ajuda</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

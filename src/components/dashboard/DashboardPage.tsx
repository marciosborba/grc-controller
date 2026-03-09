import React, { lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import WelcomePendingPage from '@/pages/WelcomePendingPage';

// Lazy load dashboards to reduce initial bundle size
const IntegratedExecutiveDashboardFixed = lazy(() => import('./IntegratedExecutiveDashboardFixed'));
const IntegratedDashboardComplete = lazy(() => import('./IntegratedDashboardComplete'));
const IntegratedDashboardFixed = lazy(() => import('./IntegratedDashboardFixed'));
const SimpleDashboard = lazy(() => import('./SimpleDashboard'));
const IntegratedExecutiveDashboard = lazy(() => import('./IntegratedExecutiveDashboard'));
const ExecutiveDashboard = lazy(() => import('./ExecutiveDashboard'));
const RiskManagerDashboard = lazy(() => import('./RiskManagerDashboard'));
const ComplianceDashboard = lazy(() => import('./ComplianceDashboard'));
const AuditorDashboard = lazy(() => import('./AuditorDashboard'));
const ModernDashboard = lazy(() => import('./ModernDashboard'));

// Lightweight loader for dashboard switching
const DashboardLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
  </div>
);

// Roles that indicate the user has been given functional access
const FUNCTIONAL_ROLES = ['admin', 'super_admin', 'ciso', 'risk_manager', 'compliance_officer', 'auditor', 'tenant_admin'];

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  // If user has NO functional role (only basic 'user') and is not a platform admin,
  // show the welcome/pending page instead of the full dashboard
  const hasFunctionalRole = user.isPlatformAdmin ||
    user.customRoleId ||
    user.roles?.some(r => FUNCTIONAL_ROLES.includes(r));

  if (!hasFunctionalRole) {
    return <WelcomePendingPage />;
  }

  return (
    <Suspense fallback={<DashboardLoader />}>
      <ModernDashboard />
    </Suspense>
  );
};

export default DashboardPage;

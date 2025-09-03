import React, { lazy, Suspense } from 'react';
import { useAuth} from '@/contexts/AuthContextOptimized';

// Lazy load dashboards to reduce initial bundle size
const ExecutiveDashboard = lazy(() => import('./ExecutiveDashboard').then(module => ({ default: module.ExecutiveDashboard })));
const RiskManagerDashboard = lazy(() => import('./RiskManagerDashboard').then(module => ({ default: module.RiskManagerDashboard })));
const ComplianceDashboard = lazy(() => import('./ComplianceDashboard').then(module => ({ default: module.ComplianceDashboard })));
const AuditorDashboard = lazy(() => import('./AuditorDashboard').then(module => ({ default: module.AuditorDashboard })));

// Lightweight loader for dashboard switching
const DashboardLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Route to appropriate dashboard based on user role with lazy loading
  if (user.roles.includes('admin') || user.roles.includes('ciso')) {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <ExecutiveDashboard />
      </Suspense>
    );
  }

  if (user.roles.includes('risk_manager')) {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <RiskManagerDashboard />
      </Suspense>
    );
  }

  if (user.roles.includes('compliance_officer')) {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <ComplianceDashboard />
      </Suspense>
    );
  }

  if (user.roles.includes('auditor')) {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <AuditorDashboard />
      </Suspense>
    );
  }

  // Default dashboard with lazy loading
  return (
    <Suspense fallback={<DashboardLoader />}>
      <ExecutiveDashboard />
    </Suspense>
  );
};

export default DashboardPage;
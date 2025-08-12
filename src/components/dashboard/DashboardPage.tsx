import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { RiskManagerDashboard } from './RiskManagerDashboard';
import { ComplianceDashboard } from './ComplianceDashboard';
import { AuditorDashboard } from './AuditorDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Route to appropriate dashboard based on user role
  if (user.roles.includes('admin') || user.roles.includes('ciso')) {
    return <ExecutiveDashboard />;
  }

  if (user.roles.includes('risk_manager')) {
    return <RiskManagerDashboard />;
  }

  if (user.roles.includes('compliance_officer')) {
    return <ComplianceDashboard />;
  }

  if (user.roles.includes('auditor')) {
    return <AuditorDashboard />;
  }

  // Default dashboard
  return <ExecutiveDashboard />;
};

export default DashboardPage;
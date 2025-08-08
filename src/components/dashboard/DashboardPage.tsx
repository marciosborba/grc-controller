import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { RiskManagerDashboard } from './RiskManagerDashboard';
import { ComplianceDashboard } from './ComplianceDashboard';
import { AuditorDashboard } from './AuditorDashboard';
import UserDebugInfo from '@/components/admin/UserDebugInfo';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const { user } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  if (!user) return null;

  // Debug mode for troubleshooting
  if (showDebug) {
    return (
      <div className="space-y-4">
        <Button onClick={() => setShowDebug(false)} variant="outline">
          Voltar ao Dashboard
        </Button>
        <UserDebugInfo />
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (user.roles.includes('admin') || user.roles.includes('ciso')) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowDebug(true)} variant="ghost" size="sm">
            Debug Info
          </Button>
        </div>
        <ExecutiveDashboard />
      </div>
    );
  }

  if (user.roles.includes('risk_manager')) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowDebug(true)} variant="ghost" size="sm">
            Debug Info
          </Button>
        </div>
        <RiskManagerDashboard />
      </div>
    );
  }

  if (user.roles.includes('compliance_officer')) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowDebug(true)} variant="ghost" size="sm">
            Debug Info
          </Button>
        </div>
        <ComplianceDashboard />
      </div>
    );
  }

  if (user.roles.includes('auditor')) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowDebug(true)} variant="ghost" size="sm">
            Debug Info
          </Button>
        </div>
        <AuditorDashboard />
      </div>
    );
  }

  // Default dashboard
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowDebug(true)} variant="ghost" size="sm">
          Debug Info
        </Button>
      </div>
      <ExecutiveDashboard />
    </div>
  );
};

export default DashboardPage;
import React from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { Navigate } from 'react-router-dom';
import AIManagerCore from './AIManagerCore';
import { PLATFORM_TENANT_ID } from '@/services/aiConfigService';

const AIManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();

  // Logic: User Tenant > Selected Tenant (if Super/Platform Admin)
  const isPlatformAdmin = user?.isPlatformAdmin || user?.roles?.includes('platform_admin');

  // For AI Manager (Global), we want to default to the Platform Tenant ID if we are looking at global config.
  // If the admin specifically selected a tenant in the sidebar, they might expect to see THAT tenant's AI settings.
  // HOWEVER, the requirement distinguishes /ai-manager (Super Adm) from /tenant-settings (Tenant).
  // Thus, /ai-manager should probably ALWAYS point to the PLATFORM settings for the "Fallback" configuration.

  const effectiveTenantId = PLATFORM_TENANT_ID;

  // Access Control
  const hasAccess = isPlatformAdmin || user?.roles?.includes('admin'); // Only admins can access this page

  if (!user) return null;
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AIManagerCore
      tenantId={effectiveTenantId}
      mode={isPlatformAdmin ? 'platform' : 'tenant'} // Although if we force platform ID, mode should likely be platform
    />
  );
};

export default AIManagementPage;

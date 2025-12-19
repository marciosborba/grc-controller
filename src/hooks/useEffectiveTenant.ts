import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';

interface UseEffectiveTenantReturn {
    effectiveTenantId: string | null;
    selectedTenantId: string | null;
    userTenantId: string | undefined;
    isPlatformAdmin: boolean;
    isLoading: boolean;
}

/**
 * Hook to determine the 'effective' tenant ID for data fetching.
 * 
 * Logic:
 * 1. If user is Platform Admin:
 *    - Use 'selectedTenantId' from Tenant Selector (top bar).
 *    - If no selection, return null (or handle specific 'all' case in consumer).
 * 2. If user is Normal User:
 *    - Use 'user.tenantId'.
 */
export const useEffectiveTenant = (): UseEffectiveTenantReturn => {
    const { user, isLoading: authLoading } = useAuth();
    const { selectedTenantId, loadingTenants } = useTenantSelector();

    const isPlatformAdmin = !!(user?.isPlatformAdmin || user?.roles?.includes('platform_admin') || user?.roles?.includes('admin')); // Fallback for safety

    let effectiveTenantId: string | null = null;

    if (isPlatformAdmin) {
        if (selectedTenantId) {
            effectiveTenantId = selectedTenantId;
        } else {
            // If admin has not selected anything, we might default to their own tenantId 
            // OR return null to imply "All Tenants" or "No Selection".
            // For safety in mutations, we usually want explicit selection.
            // For queries, null might mean "Fetch All".
            effectiveTenantId = null;
        }
    } else {
        effectiveTenantId = user?.tenantId || null;
    }

    // Handle 'default' string edge case
    if (effectiveTenantId === 'default') {
        // If regular user has 'default', it's likely invalid for data fetching unless they actually belong to a tenant named 'default'.
        // Usually we treat this as invalid for queries if UUIDs are expected.
    }

    return {
        effectiveTenantId,
        selectedTenantId,
        userTenantId: user?.tenantId,
        isPlatformAdmin,
        isLoading: authLoading || loadingTenants
    };
};

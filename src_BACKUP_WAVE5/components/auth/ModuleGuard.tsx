import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface ModuleGuardProps {
    moduleKey: string;
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * Guard component that only renders children if the user has access to the specified module.
 * Checks both tenant module enablement and user role permissions (via checkModuleAccess).
 */
export const ModuleGuard: React.FC<ModuleGuardProps> = ({
    moduleKey,
    children,
    redirectTo = '/dashboard'
}) => {
    const { checkModuleAccess, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
            </div>
        );
    }

    // If user is not logged in, let ProtectedRoute handle it (or redirect to login)
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const hasAccess = checkModuleAccess(moduleKey);

    if (!hasAccess) {
        console.warn(`🚫 [MODULE GUARD] Access denied to module '${moduleKey}' for user '${user.email}'. Redirecting to ${redirectTo}`);
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

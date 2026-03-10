
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface ProtectedRouteModuleProps {
    moduleKey: string;
    children?: React.ReactNode;
}

export const ProtectedRouteModule: React.FC<ProtectedRouteModuleProps> = ({ moduleKey, children }) => {
    const { checkModuleAccess, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Carregando permissões...</div>;
    }

    // Special case for 'risk_management' key which might be passed as 'risks' in some legacy code,
    // though I should standardize on 'risk_management'.
    // Let's rely on the keys I standardized: 'audit', 'strategic_planning', 'assessments', etc.

    if (!checkModuleAccess(moduleKey)) {
        return <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">Seu tenant não tem o módulo <strong>{moduleKey}</strong> habilitado.</p>
            <Navigate to="/dashboard" replace />
        </div>;
    }

    return children ? <>{children}</> : <Outlet />;
};

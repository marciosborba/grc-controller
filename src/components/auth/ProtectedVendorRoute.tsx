import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';

export const ProtectedVendorRoute = ({ children }: { children: React.ReactNode }) => {
    const { session, isLoading: authLoading } = useAuth();
    const [isVendor, setIsVendor] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        async function checkVendorAccess() {
            if (!session?.user) {
                if (mounted) {
                    setIsVendor(false);
                    setLoading(false);
                }
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('vendor_users')
                    .select('id')
                    .eq('auth_user_id', session.user.id)
                    .single();

                if (mounted) {
                    if (error || !data) {
                        setIsVendor(false);
                    } else {
                        setIsVendor(true);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setIsVendor(false);
                    setLoading(false);
                }
            }
        }

        if (!authLoading) {
            checkVendorAccess();
        }

        return () => {
            mounted = false;
        };
    }, [session, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!session || isVendor === false) {
        // Redireciona para o login do portal do fornecedor
        return <Navigate to="/vendor-portal/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedVendorRoute;

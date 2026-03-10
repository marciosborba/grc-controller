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
                // Primeira tentativa: buscar em vendor_users
                const { data: vendorUser, error: vendorError } = await supabase
                    .from('vendor_users')
                    .select('id, is_active')
                    .eq('auth_user_id', session.user.id)
                    .limit(1)
                    .maybeSingle();

                if (vendorUser) {
                    if (mounted) {
                        setIsVendor(vendorUser.is_active !== false);
                        setLoading(false);
                    }
                    return;
                }

                // Segunda tentativa: buscar em vendor_portal_users
                const { data: portalUser, error: portalError } = await supabase
                    .from('vendor_portal_users')
                    .select('vendor_id, is_active')
                    .eq('email', session.user.email?.trim().toLowerCase())
                    .limit(1)
                    .maybeSingle();

                if (mounted) {
                    if (portalUser) {
                        setIsVendor(portalUser.is_active !== false);
                    } else {
                        setIsVendor(false);
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

            // Subscrever a mudanças em tempo real no status is_active (tabela vendor_users)
            const vendorUsersChannel = supabase
                .channel('vendor_users_status')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'vendor_users',
                        filter: `auth_user_id=eq.${session?.user?.id}`
                    },
                    (payload) => {
                        if (payload.new && 'is_active' in payload.new) {
                            if (mounted) setIsVendor(payload.new.is_active !== false);
                        }
                    }
                )
                .subscribe();

            // Subscrever a mudanças em tempo real no status is_active (tabela vendor_portal_users)
            const portalUsersChannel = supabase
                .channel('portal_users_status')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'vendor_portal_users',
                        filter: `email=eq.${session?.user?.email}`
                    },
                    (payload) => {
                        if (payload.new && 'is_active' in payload.new) {
                            if (mounted) setIsVendor(payload.new.is_active !== false);
                        }
                    }
                )
                .subscribe();

            return () => {
                mounted = false;
                supabase.removeChannel(vendorUsersChannel);
                supabase.removeChannel(portalUsersChannel);
            };
        }

        return () => {
            mounted = false;
        };
    }, [session, authLoading, location.pathname]);

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

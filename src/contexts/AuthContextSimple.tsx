import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  jobTitle?: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  isPlatformAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, jobTitle?: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple permission mapping
const getPermissionsForRoles = (roles: string[], isPlatformAdmin: boolean = false): string[] => {
  if (isPlatformAdmin) {
    return ['read', 'write', 'delete', 'admin', 'platform_admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage', 'assessment.read', 'all'];
  }

  const permissionMap: Record<string, string[]> = {
    admin: ['read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'assessment.read', 'all'],
    ciso: ['read', 'write', 'admin', 'users.read', 'users.update', 'security.read', 'incidents.read', 'vulnerabilities.read', 'assessment.read'],
    risk_manager: ['read', 'write', 'risk.read', 'risk.write', 'vendor.read', 'assessment.read'],
    compliance_officer: ['read', 'write', 'compliance.read', 'compliance.write', 'privacy.read', 'audit.read', 'assessment.read'],
    auditor: ['read', 'audit.read', 'audit.write', 'logs.read', 'assessment.read', 'report.read', 'compliance.read'],
    user: ['read', 'all']
  };
  
  const allPermissions = new Set<string>();
  roles.forEach(role => {
    const rolePermissions = permissionMap[role] || ['read'];
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });
  
  return Array.from(allPermissions);
};

export const AuthProviderSimple: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (supabaseUser: User): Promise<AuthUser | null> => {
    try {
      console.log('Loading user data for:', supabaseUser.id);
      
      // Create basic user first
      const basicUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        tenantId: 'default',
        roles: ['user'],
        permissions: getPermissionsForRoles(['user'], false),
        isPlatformAdmin: false
      };

      try {
        // Try to load additional data
        const [profileResult, rolesResult, platformAdminResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', supabaseUser.id).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', supabaseUser.id),
          supabase.from('platform_admins').select('user_id').eq('user_id', supabaseUser.id).maybeSingle()
        ]);

        const profile = profileResult?.data;
        const roles = rolesResult?.data || [];
        const platformAdmin = platformAdminResult?.data;
        
        const isPlatformAdmin = !!platformAdmin;
        const userRoles = roles.length > 0 ? roles.map((r: any) => r.role) : ['user'];
        const userPermissions = getPermissionsForRoles(userRoles, isPlatformAdmin);
        
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          jobTitle: profile?.job_title,
          tenantId: profile?.tenant_id || 'default',
          roles: userRoles,
          permissions: userPermissions,
          isPlatformAdmin
        };
        
      } catch (dbError) {
        console.warn('Error loading user data from database, using basic user:', dbError);
        return basicUser;
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  };

  const handleAuthChange = async (event: string, session: Session | null) => {
    console.log('Auth state changed:', { event, hasSession: !!session });
    
    setSession(session);

    if (event === 'SIGNED_OUT' || !session) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      try {
        setIsLoading(true);
        const userData = await loadUserData(session.user);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Create basic user on error
        const basicUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || 'User',
          tenantId: 'default',
          roles: ['user'],
          permissions: getPermissionsForRoles(['user'], false),
          isPlatformAdmin: false
        };
        setUser(basicUser);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.warn('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          await handleAuthChange('SIGNED_IN', currentSession);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Error signing out');
    }
  };

  const signup = async (email: string, password: string, fullName: string, jobTitle?: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          full_name: fullName.trim(),
          job_title: jobTitle?.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const refreshUserData = async () => {
    if (!session?.user) return;
    
    try {
      const userData = await loadUserData(session.user);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    signup,
    refreshUserData,
    refreshUser: refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
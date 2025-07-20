
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { cleanupAuthState, performSecureSignOut, validateEmailFormat, validatePassword, sanitizeInput } from '@/utils/authCleanup';
import { logAuthEvent, logSuspiciousActivity } from '@/utils/securityLogger';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  job_title?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
}

interface UserRole {
  role: 'admin' | 'ciso' | 'risk_manager' | 'compliance_officer' | 'auditor' | 'user';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  jobTitle?: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  theme: 'light' | 'dark';
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  signup: (email: string, password: string, fullName: string, jobTitle?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get user permissions based on roles
  const getPermissions = (roles: string[]): string[] => {
    const permissionMap: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'admin'],
      ciso: ['read', 'write', 'admin'],
      risk_manager: ['read', 'write'],
      compliance_officer: ['read', 'write'],
      auditor: ['read'],
      user: ['read']
    };
    
    const allPermissions = new Set<string>();
    roles.forEach(role => {
      const rolePermissions = permissionMap[role] || ['read'];
      rolePermissions.forEach(permission => allPermissions.add(permission));
    });
    
    return Array.from(allPermissions);
  };

  // Helper function to build user object from Supabase data
  const buildUserObject = async (supabaseUser: User): Promise<AuthUser> => {
    console.log('Building user object for:', supabaseUser.id);
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (rolesError) {
        console.error('Roles error:', rolesError);
      }

      const roles = userRoles?.map(r => r.role) || ['user'];
      const permissions = getPermissions(roles);

      const authUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: sanitizeInput(profile?.full_name || supabaseUser.email || ''),
        jobTitle: sanitizeInput(profile?.job_title || ''),
        tenantId: 'tenant-1',
        roles,
        permissions,
        theme: 'light' as const
      };

      await logAuthEvent('login_success', { user_id: supabaseUser.id });
      return authUser;
    } catch (error) {
      console.error('Error building user object:', error);
      await logSuspiciousActivity('user_build_error', { user_id: supabaseUser.id, error: error.message });
      
      // Return basic user object if profile/roles query fails
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: sanitizeInput(supabaseUser.email || ''),
        tenantId: 'tenant-1',
        roles: ['user'],
        permissions: ['read'],
        theme: 'light' as const
      };
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!validateEmailFormat(email)) {
        await logAuthEvent('login_failure', { reason: 'invalid_email_format', email });
        throw new Error('Formato de email inválido');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        await logAuthEvent('login_failure', { reason: 'invalid_password', email });
        throw new Error('Senha não atende aos critérios de segurança');
      }

      await logAuthEvent('login_attempt', { email });

      // Clean up existing state before new login
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Pre-login cleanup signout failed:', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password,
      });

      if (error) {
        await logAuthEvent('login_failure', { reason: error.message, email });
        throw error;
      }
      
      if (data.user && data.session) {
        setSession(data.session);
        const authUser = await buildUserObject(data.user);
        setUser(authUser);
      }
    } catch (error: any) {
      await logAuthEvent('login_failure', { reason: error.message, email });
      throw new Error(error.message || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, jobTitle?: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!validateEmailFormat(email)) {
        await logAuthEvent('signup_failure', { reason: 'invalid_email_format', email });
        throw new Error('Formato de email inválido');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        await logAuthEvent('signup_failure', { reason: 'weak_password', email });
        throw new Error(passwordValidation.errors.join(', '));
      }

      if (!fullName || fullName.trim().length < 2) {
        throw new Error('Nome completo é obrigatório');
      }

      await logAuthEvent('signup_attempt', { email });

      const { data, error } = await supabase.auth.signUp({
        email: sanitizeInput(email),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: sanitizeInput(fullName),
            job_title: sanitizeInput(jobTitle || '')
          }
        }
      });

      if (error) {
        await logAuthEvent('signup_failure', { reason: error.message, email });
        throw error;
      }
      
      if (data.user) {
        // Assign default user role
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'user' });

        await logAuthEvent('signup_success', { user_id: data.user.id, email });
      }
    } catch (error: any) {
      await logAuthEvent('signup_failure', { reason: error.message, email });
      throw new Error(error.message || 'Falha no registro');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logAuthEvent('logout', { user_id: user?.id });
      
      const result = await performSecureSignOut(supabase);
      
      setUser(null);
      setSession(null);
      
      // Force page reload for clean state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      await logSuspiciousActivity('logout_error', { user_id: user?.id, error: error.message });
    }
  };

  const toggleTheme = () => {
    if (user) {
      const newTheme: 'light' | 'dark' = user.theme === 'light' ? 'dark' : 'light';
      const updatedUser: AuthUser = { ...user, theme: newTheme };
      setUser(updatedUser);
      
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    console.log('AuthContext: Starting initialization');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer user data fetching to prevent deadlocks
          setTimeout(async () => {
            try {
              const authUser = await buildUserObject(session.user);
              setUser(authUser);
            } catch (error) {
              console.error('Error in auth state change:', error);
              await logSuspiciousActivity('auth_state_error', { error: error.message });
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          cleanupAuthState();
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(async () => {
          try {
            const authUser = await buildUserObject(session.user);
            setUser(authUser);
          } catch (error) {
            console.error('Error loading existing session:', error);
          }
        }, 0);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      console.log('AuthContext cleanup');
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    toggleTheme,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


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

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  max_users: number;
  current_users_count: number;
  subscription_plan: string;
  is_active: boolean;
  settings?: Record<string, any>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  jobTitle?: string;
  tenantId: string;
  tenant?: Tenant;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get user permissions based on roles
  const getPermissions = (roles: string[], isPlatformAdmin: boolean = false): string[] => {
    // Platform admins have all permissions
    if (isPlatformAdmin) {
      return ['read', 'write', 'delete', 'admin', 'platform_admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage'];
    }

    const permissionMap: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete'],
      ciso: ['read', 'write', 'admin', 'users.read', 'users.update'],
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
      
      console.log(`[AuthContext] Profile loaded:`, !!profile, profile?.full_name || 'No name found');

      // Check if user is platform admin
      const { data: platformAdmin, error: platformAdminError } = await supabase
        .from('platform_admins')
        .select('role, permissions')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (platformAdminError && platformAdminError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Platform admin check error:', platformAdminError);
      }

      const isPlatformAdmin = !!platformAdmin;
      console.log(`[AuthContext] Platform admin check for user ${supabaseUser.id}: found=${!!platformAdmin}, isPlatformAdmin=${isPlatformAdmin}`);
      if (platformAdmin) {
        console.log(`[AuthContext] Platform admin data:`, platformAdmin);
      }

      // Get user roles (system roles)
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (rolesError) {
        console.error('Roles error:', rolesError);
      }

      const roles = userRoles?.map(r => r.role) || ['user'];
      const permissions = getPermissions(roles, isPlatformAdmin);

      // Get tenant information if tenant_id exists
      let tenant: Tenant | undefined;
      if (profile?.tenant_id) {
        try {
          // Primeiro tentar com o usuário normal
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, slug, contact_email, max_users, current_users_count, subscription_plan, is_active, settings')
            .eq('id', profile.tenant_id)
            .maybeSingle();
          
          if (tenantData) {
            tenant = tenantData;
            console.log('[AuthContext] Tenant loaded successfully:', tenantData.name);
          } else if (tenantError) {
            console.warn('[AuthContext] Error loading tenant with user permissions:', tenantError.message);
            
            // Mapeamento de tenant IDs para nomes corretos
            const TENANT_NAMES: Record<string, string> = {
              '37b809d4-1a23-40b9-8ef1-17f24ed4c08b': 'empresa 2',
              '46b1c048-85a1-423b-96fc-776007c8de1f': 'GRC-Controller',
            };
            
            // Usar o nome correto baseado no tenant_id
            const tenantName = TENANT_NAMES[profile.tenant_id] || 'Organização';
            
            // Se falhar devido ao RLS, criar um objeto tenant básico com o nome correto
            tenant = {
              id: profile.tenant_id,
              name: tenantName,
              slug: tenantName.toLowerCase().replace(/\s+/g, '-'),
              contact_email: profile.email || '',
              max_users: 10,
              current_users_count: 1,
              subscription_plan: 'basic',
              is_active: true,
              settings: {}
            };
            console.log(`[AuthContext] Created fallback tenant object with name: ${tenantName}`);
          }
        } catch (tenantError) {
          console.warn('Error loading tenant:', tenantError);
          
          // Mapeamento de tenant IDs para nomes corretos (mesmo código para catch)
          const TENANT_NAMES: Record<string, string> = {
            '37b809d4-1a23-40b9-8ef1-17f24ed4c08b': 'empresa 2',
            '46b1c048-85a1-423b-96fc-776007c8de1f': 'GRC-Controller',
          };
          
          const tenantName = TENANT_NAMES[profile.tenant_id] || 'Organização';
          
          // Criar objeto tenant de fallback com nome correto
          tenant = {
            id: profile.tenant_id,
            name: tenantName,
            slug: tenantName.toLowerCase().replace(/\s+/g, '-'),
            contact_email: profile.email || '',
            max_users: 10,
            current_users_count: 1,
            subscription_plan: 'basic',
            is_active: true,
            settings: {}
          };
          console.log(`[AuthContext] Created fallback tenant object with name: ${tenantName}`);
        }
      }

      const authUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: sanitizeInput(profile?.full_name || supabaseUser.email || ''),
        jobTitle: sanitizeInput(profile?.job_title || ''),
        tenantId: profile?.tenant_id || '46b1c048-85a1-423b-96fc-776007c8de1f',
        tenant,
        roles,
        permissions,
        isPlatformAdmin
      };

      console.log(`[AuthContext] User object created:`, {
        name: authUser.name,
        email: authUser.email,
        isPlatformAdmin: authUser.isPlatformAdmin
      });

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
        tenantId: '46b1c048-85a1-423b-96fc-776007c8de1f',
        roles: ['user'],
        permissions: ['read'],
        isPlatformAdmin: false
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

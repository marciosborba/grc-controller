import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  toggleTheme: () => void;
  signup: (email: string, password: string, fullName: string, jobTitle?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

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
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      // Get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      const roles = userRoles?.map(r => r.role) || ['user'];
      const permissions = getPermissions(roles);

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.full_name || supabaseUser.email || '',
        jobTitle: profile?.job_title,
        tenantId: 'tenant-1', // Default tenant for now
        roles,
        permissions,
        theme: 'light' // Default theme
      };
    } catch (error) {
      console.error('Error building user object:', error);
      // Return basic user object if profile/roles query fails
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email || '',
        tenantId: 'tenant-1',
        roles: ['user'],
        permissions: ['read'],
        theme: 'light'
      };
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        const authUser = await buildUserObject(data.user);
        setUser(authUser);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, jobTitle?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            job_title: jobTitle
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        // Assign default user role
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'user' });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    if (user) {
      const newTheme: 'light' | 'dark' = user.theme === 'light' ? 'dark' : 'light';
      const updatedUser: AuthUser = { ...user, theme: newTheme };
      setUser(updatedUser);
      
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          try {
            const authUser = await buildUserObject(session.user);
            setUser(authUser);
          } catch (error) {
            console.error('Error building user object:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildUserObject(session.user).then(authUser => {
          setUser(authUser);
          setSession(session);
          setIsLoading(false);
        }).catch(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
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
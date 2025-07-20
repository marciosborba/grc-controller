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
    console.log('Building user object for:', supabaseUser.id);
    try {
      // Get user profile
      console.log('Fetching profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
      } else {
        console.log('Profile data:', profile);
      }

      // Get user roles
      console.log('Fetching roles...');
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (rolesError) {
        console.error('Roles error:', rolesError);
      } else {
        console.log('Roles data:', userRoles);
      }

      const roles = userRoles?.map(r => r.role) || ['user'];
      const permissions = getPermissions(roles);

      const authUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.full_name || supabaseUser.email || '',
        jobTitle: profile?.job_title,
        tenantId: 'tenant-1', // Default tenant for now
        roles,
        permissions,
        theme: 'light' as const // Default theme
      };

      console.log('Built auth user:', authUser);
      return authUser;
    } catch (error) {
      console.error('Error building user object:', error);
      // Return basic user object if profile/roles query fails
      const basicUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email || '',
        tenantId: 'tenant-1',
        roles: ['user'],
        permissions: ['read'],
        theme: 'light' as const
      };
      console.log('Returning basic user:', basicUser);
      return basicUser;
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
    console.log('AuthContext: Starting initialization');
    setIsLoading(false); // Force loading to false immediately for debugging
    
    // Create a simple mock user for testing
    const mockUser: AuthUser = {
      id: 'mock-user',
      email: 'admin@cyberguard.com',
      name: 'Admin User',
      jobTitle: 'CISO',
      tenantId: 'tenant-1',
      roles: ['admin'],
      permissions: ['read', 'write', 'delete', 'admin'],
      theme: 'light'
    };
    
    console.log('Setting mock user:', mockUser);
    setUser(mockUser);
    
    return () => {
      console.log('AuthContext cleanup');
    };
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
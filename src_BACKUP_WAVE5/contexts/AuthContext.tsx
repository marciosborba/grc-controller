import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  tenant_id?: string;
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache otimizado para roles e permissões
const roleCache = new Map<string, { roles: string[], permissions: string[], timestamp: number, profile?: any }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (aumentado para melhor performance)

// Funções utilitárias simples
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().replace(/[<>"']/g, '').substring(0, 255);
};

const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  return { valid: errors.length === 0, errors };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache de permissões otimizado
  const getCachedRoles = useCallback((userId: string) => {
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, []);

  const setCachedRoles = useCallback((userId: string, roles: string[], permissions: string[], profile?: any) => {
    roleCache.set(userId, {
      roles,
      permissions,
      timestamp: Date.now(),
      profile
    });
  }, []);

  // Helper function para obter permissões
  const getPermissions = useCallback(async (roles: string[], isPlatformAdmin: boolean = false, userId?: string): Promise<string[]> => {
    // Platform admins têm todas as permissões
    if (isPlatformAdmin) {
      return ['read', 'write', 'delete', 'admin', 'platform_admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage', 'assessment.read', 'all'];
    }

    // Verificar cache primeiro
    if (userId) {
      const cached = getCachedRoles(userId);
      if (cached) {
        console.log(`[AUTH CACHE] Usando permissões em cache para usuário ${userId}`);
        return cached.permissions;
      }
    }

    // Mapeamento básico de permissões para roles do sistema
    const permissionMap: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'assessment.read', 'all'],
      ciso: ['read', 'write', 'admin', 'users.read', 'users.update', 'security.read', 'incidents.read', 'vulnerabilities.read', 'assessment.read'],
      risk_manager: ['read', 'write', 'risk.read', 'risk.write', 'vendor.read', 'assessment.read'],
      compliance_officer: ['read', 'write', 'compliance.read', 'compliance.write', 'privacy.read', 'audit.read', 'assessment.read'],
      auditor: ['read', 'audit.read', 'audit.write', 'logs.read', 'assessment.read', 'report.read', 'compliance.read'],
      user: ['read', 'all']
    };
    
    const allPermissions = new Set<string>();
    
    // Adicionar permissões das roles básicas
    roles.forEach(role => {
      const rolePermissions = permissionMap[role] || ['read'];
      rolePermissions.forEach(permission => allPermissions.add(permission));
    });
    
    const finalPermissions = Array.from(allPermissions);
    
    // Cachear resultado
    if (userId) {
      setCachedRoles(userId, roles, finalPermissions);
    }
    
    return finalPermissions;
  }, [getCachedRoles, setCachedRoles]);

  // Helper function para construir objeto do usuário
  const buildUserObject = useCallback(async (supabaseUser: User): Promise<AuthUser> => {
    console.log('[AUTH] Construindo objeto do usuário:', supabaseUser.id);
    
    // Verificar cache primeiro para otimização completa
    const cached = getCachedRoles(supabaseUser.id);
    if (cached) {
      console.log(`[AUTH] Usuário em cache completo encontrado para ${supabaseUser.id}`);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: cached.profile?.full_name || supabaseUser.email || '',
        jobTitle: cached.profile?.job_title || '',
        tenantId: cached.profile?.tenant_id || '46b1c048-85a1-423b-96fc-776007c8de1f',
        tenant: cached.profile?.tenant,
        roles: cached.roles,
        permissions: cached.permissions,
        isPlatformAdmin: cached.roles.includes('platform_admin')
      };
    }
    
    try {
      // Queries otimizadas com timeout menor
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na consulta do usuário')), 3000)
      );
      
      const queryPromise = Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', supabaseUser.id)
          .maybeSingle(),
        supabase
          .from('platform_admins')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .limit(5)
      ]);

      const [profileResult, platformAdminResult, userRolesResult] = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      const { data: profile } = profileResult;
      const { data: platformAdmin } = platformAdminResult;
      const { data: userRoles } = userRolesResult;

      console.log(`[AUTH] Perfil carregado:`, !!profile, profile?.full_name || 'Sem nome');

      const isPlatformAdmin = !!platformAdmin;
      console.log(`[AUTH] Verificação de Platform Admin:`, isPlatformAdmin);

      const roles = userRoles?.map((r: any) => r.role) || ['user'];
      const permissions = await getPermissions(roles, isPlatformAdmin, supabaseUser.id);

      // Tenant básico
      let tenant: Tenant | undefined;
      if (profile?.tenant_id) {
        tenant = {
          id: profile.tenant_id,
          name: 'GRC-Controller',
          slug: 'grc-controller',
          contact_email: profile.email || '',
          max_users: 10,
          current_users_count: 1,
          subscription_plan: 'basic',
          is_active: true,
          settings: {}
        };
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

      // Cache o perfil completo para próximas consultas
      setCachedRoles(supabaseUser.id, roles, permissions, { ...profile, tenant });

      console.log(`[AUTH] Usuário criado e cacheado:`, {
        name: authUser.name,
        email: authUser.email,
        isPlatformAdmin: authUser.isPlatformAdmin,
        roles: authUser.roles,
        permissionsCount: authUser.permissions.length
      });
      
      return authUser;
      
    } catch (error: any) {
      console.error('[AUTH] Erro ao construir usuário:', error);
      
      // Retornar usuário básico em caso de erro
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: sanitizeInput(supabaseUser.email || ''),
        tenantId: '46b1c048-85a1-423b-96fc-776007c8de1f',
        roles: ['user'],
        permissions: ['read', 'all'],
        isPlatformAdmin: false
      };
    }
  }, [getPermissions]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Validações básicas
      if (!validateEmailFormat(email)) {
        throw new Error('Formato de email inválido');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error('Senha muito fraca');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password,
      });

      if (error) {
        throw error;
      }
      
      if (data.user && data.session) {
        setSession(data.session);
        
        // Construir usuário de forma assíncrona
        setTimeout(async () => {
          try {
            const authUser = await buildUserObject(data.user);
            setUser(authUser);
          } catch (buildError) {
            console.error('[AUTH] Erro ao construir usuário após login:', buildError);
          }
        }, 0);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, jobTitle?: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (!validateEmailFormat(email)) {
        throw new Error('Formato de email inválido');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      if (!fullName || fullName.trim().length < 2) {
        throw new Error('Nome completo é obrigatório');
      }

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
        throw error;
      }
      
      if (data.user) {
        // Atribuir role padrão
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'user' });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Falha no registro');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Limpar cache
      roleCache.clear();
      
      await supabase.auth.signOut();
      
      setUser(null);
      setSession(null);
      
      // Forçar reload para estado limpo
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error: any) {
      console.error('[AUTH] Erro no logout:', error);
    }
  };

  useEffect(() => {
    console.log('[AUTH] Inicializando AuthProvider simples');
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Mudança de estado:', event);
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer para evitar deadlocks
          setTimeout(async () => {
            try {
              const authUser = await buildUserObject(session.user);
              setUser(authUser);
            } catch (error) {
              console.error('[AUTH] Erro na mudança de estado:', error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          roleCache.clear();
        }
        
        setIsLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(async () => {
          try {
            const authUser = await buildUserObject(session.user);
            setUser(authUser);
          } catch (error) {
            console.error('[AUTH] Erro ao carregar sessão existente:', error);
          }
        }, 0);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      console.log('[AUTH] Limpeza do AuthProvider');
    };
  }, [buildUserObject]);

  const refreshUser = async () => {
    if (session?.user) {
      // Limpar cache do usuário atual
      roleCache.delete(session.user.id);
      
      try {
        const authUser = await buildUserObject(session.user);
        setUser(authUser);
        console.log('[AUTH] Usuário atualizado com novas permissões');
      } catch (error) {
        console.error('[AUTH] Erro ao atualizar usuário:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    signup,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('[AUTH] useAuth chamado fora do AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
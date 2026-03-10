import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { cleanupAuthState, performSecureSignOut, validateEmailFormat, validatePassword, sanitizeInput } from '@/utils/authCleanup';
import { logAuthEvent, logSuspiciousActivity, captureSessionInfo } from '@/utils/securityLogger';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache para roles e permissões
const roleCache = new Map<string, { roles: string[], permissions: string[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

  const setCachedRoles = useCallback((userId: string, roles: string[], permissions: string[]) => {
    roleCache.set(userId, {
      roles,
      permissions,
      timestamp: Date.now()
    });
  }, []);

  // Helper function otimizada para obter permissões
  const getPermissions = useCallback(async (roles: string[], isPlatformAdmin: boolean = false, userId?: string): Promise<string[]> => {
    // Platform admins têm todas as permissões
    if (isPlatformAdmin) {
      return ['read', 'write', 'delete', 'admin', 'platform_admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage', 'all'];
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
      admin: ['read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'all'],
      ciso: ['read', 'write', 'admin', 'users.read', 'users.update', 'security.read', 'incidents.read', 'vulnerabilities.read'],
      risk_manager: ['read', 'write', 'risk.read', 'risk.write', 'vendor.read'],
      compliance_officer: ['read', 'write', 'compliance.read', 'compliance.write', 'privacy.read', 'audit.read'],
      auditor: ['read', 'audit.read', 'audit.write', 'logs.read', 'assessment.read', 'report.read', 'compliance.read'],
      user: ['read', 'all']
    };
    
    const allPermissions = new Set<string>();
    
    // Adicionar permissões das roles básicas
    roles.forEach(role => {
      const rolePermissions = permissionMap[role] || ['read'];
      rolePermissions.forEach(permission => allPermissions.add(permission));
    });
    
    // Buscar permissões de roles customizadas do banco de dados (com timeout)
    if (userId) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const queryPromise = supabase
          .from('custom_roles')
          .select('permissions')
          .in('name', roles)
          .eq('is_active', true);
          
        const { data: customRoles, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
          
        if (!error && customRoles) {
          customRoles.forEach((customRole: any) => {
            if (customRole.permissions) {
              customRole.permissions.forEach((permission: string) => allPermissions.add(permission));
            }
          });
          console.log(`[AUTH] Carregadas permissões customizadas para roles:`, roles);
        }
      } catch (error) {
        console.warn('[AUTH] Erro ou timeout ao carregar permissões customizadas:', error);
        // Continuar com permissões básicas
      }
    }
    
    const finalPermissions = Array.from(allPermissions);
    
    // Cachear resultado
    if (userId) {
      setCachedRoles(userId, roles, finalPermissions);
    }
    
    return finalPermissions;
  }, [getCachedRoles, setCachedRoles]);

  // Helper function otimizada para construir objeto do usuário
  const buildUserObject = useCallback(async (supabaseUser: User): Promise<AuthUser> => {
    console.log('[AUTH] Construindo objeto do usuário:', supabaseUser.id);
    
    try {
      // Query otimizada com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na consulta do usuário')), 5000)
      );
      
      const queryPromise = Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', supabaseUser.id)
          .maybeSingle(),
        supabase
          .from('platform_admins')
          .select('role, permissions')
          .eq('user_id', supabaseUser.id)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .limit(10) // Limitar para evitar queries muito grandes
      ]);

      const [profileResult, platformAdminResult, userRolesResult] = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      const { data: profile, error: profileError } = profileResult;
      const { data: platformAdmin, error: platformAdminError } = platformAdminResult;
      const { data: userRoles, error: rolesError } = userRolesResult;

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[AUTH] Erro no perfil:', profileError);
      }
      
      console.log(`[AUTH] Perfil carregado:`, !!profile, profile?.full_name || 'Sem nome');

      const isPlatformAdmin = !!platformAdmin;
      console.log(`[AUTH] Verificação de Platform Admin:`, isPlatformAdmin);

      if (rolesError && rolesError.code !== 'PGRST116') {
        console.error('[AUTH] Erro nas roles:', rolesError);
      }

      const roles = userRoles?.map((r: any) => r.role) || ['user'];
      const permissions = await getPermissions(roles, isPlatformAdmin, supabaseUser.id);

      // Obter informações do tenant de forma otimizada
      let tenant: Tenant | undefined;
      if (profile?.tenant_id) {
        try {
          const tenantQuery = supabase
            .from('tenants')
            .select('id, name, slug, contact_email, max_users, current_users_count, subscription_plan, is_active, settings')
            .eq('id', profile.tenant_id)
            .maybeSingle();
            
          const tenantTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout tenant')), 2000)
          );
          
          const { data: tenantData, error: tenantError } = await Promise.race([
            tenantQuery,
            tenantTimeout
          ]) as any;
          
          if (tenantData) {
            tenant = tenantData;
            console.log('[AUTH] Tenant carregado:', tenantData.name);
          } else {
            // Fallback para tenant conhecido
            const TENANT_NAMES: Record<string, string> = {
              '37b809d4-1a23-40b9-8ef1-17f24ed4c08b': 'empresa 2',
              '46b1c048-85a1-423b-96fc-776007c8de1f': 'GRC-Controller',
            };
            
            const tenantName = TENANT_NAMES[profile.tenant_id] || 'Organização';
            
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
            console.log(`[AUTH] Tenant fallback criado:`, tenantName);
          }
        } catch (tenantError) {
          console.warn('[AUTH] Erro ao carregar tenant:', tenantError);
          // Usar tenant padrão
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

      console.log(`[AUTH] Usuário criado:`, {
        name: authUser.name,
        email: authUser.email,
        isPlatformAdmin: authUser.isPlatformAdmin,
        roles: authUser.roles,
        permissionsCount: authUser.permissions.length
      });
      
      await logAuthEvent('login_success', { user_id: supabaseUser.id });
      return authUser;
      
    } catch (error: any) {
      console.error('[AUTH] Erro ao construir usuário:', error);
      await logSuspiciousActivity('user_build_error', { user_id: supabaseUser.id, error: error.message });
      
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
        await logAuthEvent('login_failure', { reason: 'invalid_email_format', email });
        throw new Error('Formato de email inválido');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        await logAuthEvent('login_failure', { reason: 'invalid_password', email });
        throw new Error('Senha não atende aos critérios de segurança');
      }

      const sessionInfo = await captureSessionInfo();
      
      await logAuthEvent('login_attempt', { 
        email,
        ip_address: sessionInfo.ip_address,
        user_agent: sessionInfo.user_agent,
        location: sessionInfo.location
      });

      // Limpeza antes do login
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('[AUTH] Falha na limpeza pré-login:', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password,
      });

      if (error) {
        await logAuthEvent('login_failure', { 
          reason: error.message, 
          email,
          ip_address: sessionInfo.ip_address
        });
        throw error;
      }
      
      if (data.user && data.session) {
        setSession(data.session);
        
        // Construir usuário de forma assíncrona para não bloquear
        setTimeout(async () => {
          try {
            const authUser = await buildUserObject(data.user);
            setUser(authUser);
            
            // Definir tenant no contexto
            if (authUser.tenantId) {
              try {
                await supabase.rpc('set_config', {
                  setting_name: 'app.current_tenant',
                  setting_value: authUser.tenantId,
                  is_local: true
                });
                console.log('✅ Tenant definido no contexto:', authUser.tenantId);
              } catch (error) {
                console.warn('[AUTH] Erro ao definir tenant:', error);
              }
            }
            
            // Atualizar dados de login
            try {
              const { data: currentProfile } = await supabase
                .from('profiles')
                .select('login_count')
                .eq('user_id', data.user.id)
                .single();
              
              const currentCount = currentProfile?.login_count || 0;
              
              await supabase
                .from('profiles')
                .update({
                  last_login_at: new Date().toISOString(),
                  login_count: currentCount + 1
                })
                .eq('user_id', data.user.id);
                
              console.log('✅ Dados de login atualizados');
            } catch (updateError) {
              console.warn('[AUTH] Erro ao atualizar dados de login:', updateError);
            }
            
            await logAuthEvent('login_success', {
              user_id: data.user.id,
              email,
              ip_address: sessionInfo.ip_address
            });
          } catch (buildError) {
            console.error('[AUTH] Erro ao construir usuário após login:', buildError);
          }
        }, 0);
      }
    } catch (error: any) {
      const sessionInfo = await captureSessionInfo();
      
      await logAuthEvent('login_failure', { 
        reason: error.message, 
        email,
        ip_address: sessionInfo.ip_address
      });
      throw new Error(error.message || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, jobTitle?: string): Promise<void> => {
    setIsLoading(true);
    
    try {
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
        // Atribuir role padrão
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
      
      // Limpar cache
      roleCache.clear();
      
      await performSecureSignOut(supabase);
      
      setUser(null);
      setSession(null);
      
      // Forçar reload para estado limpo
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error: any) {
      console.error('[AUTH] Erro no logout:', error);
      await logSuspiciousActivity('logout_error', { user_id: user?.id, error: error.message });
    }
  };

  useEffect(() => {
    console.log('[AUTH] Inicializando AuthProvider otimizado');
    
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
              await logSuspiciousActivity('auth_state_error', { error: error.message });
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          roleCache.clear();
          cleanupAuthState();
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
  if (context === undefined) {
    console.error('[AUTH] useAuth chamado fora do AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
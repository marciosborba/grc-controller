import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { logAuthEvent } from '@/utils/securityLogger';

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
  avatar_url?: string; // Added field
  tenantId: string;
  tenant?: Tenant;
  roles: string[];
  permissions: string[];
  isPlatformAdmin: boolean;
  enabledModules: string[]; // List of enabled module keys
  settings?: {
    enable_global_ai?: boolean;
    [key: string]: any;
  };
  mfaEnabled?: boolean;
  isVendorOnly?: boolean; // Added field to identify vendor users
  system_role?: string; // Identifies guest users natively
  customRoleId?: string;
}

// ... (existing code)



interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, jobTitle?: string) => Promise<void>;
  refreshUserData: () => Promise<AuthUser | undefined>;
  refreshUser: () => Promise<AuthUser | undefined>;
  checkModuleAccess: (moduleKey: string) => boolean;
  needsMFA: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache super otimizado para startup rápido
const authCache = new Map<string, { user: AuthUser, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos para auth
const STARTUP_TIMEOUT = 10000; // 10 segundos timeout para startup
const AUTH_TIMEOUT = 15000; // 15 segundos timeout para auth
const USER_DATA_TIMEOUT = 12000; // 12 segundos timeout para user data

// Funções utilitárias minimalistas
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().substring(0, 255);
};

const validateEmailFormat = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Debounce function para evitar múltiplas chamadas
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Função para obter permissões baseadas nas roles
const getPermissionsForRoles = (roles: string[], isPlatformAdmin: boolean = false): string[] => {
  // Platform admins têm todas as permissões
  if (isPlatformAdmin) {
    return ['read', 'write', 'delete', 'admin', 'platform_admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage', 'assessment.read', 'all'];
  }

  // Mapeamento básico de permissões para roles do sistema
  const permissionMap: Record<string, string[]> = {
    admin: [
      'read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete',
      'common.read', 'settings.read', 'settings.write'
    ],
    tenant_admin: [
      'read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete',
      'common.read', 'settings.read', 'settings.write'
    ],
    ciso: ['read', 'write', 'admin', 'users.read', 'users.update', 'security.read', 'incidents.read', 'vulnerabilities.read', 'assessment.read'],
    risk_manager: ['read', 'write', 'risk.read', 'risk.write', 'vendor.read', 'assessment.read'],
    compliance_officer: ['read', 'write', 'compliance.read', 'compliance.write', 'privacy.read', 'audit.read', 'assessment.read'],
    auditor: ['read', 'audit.read', 'audit.write', 'logs.read', 'assessment.read', 'report.read', 'compliance.read'],
    user: ['read', 'common.read']
  };

  const allPermissions = new Set<string>();

  // Adicionar permissões das roles básicas
  roles.forEach(role => {
    const rolePermissions = permissionMap[role] || ['read'];
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });

  return Array.from(allPermissions);
};

const CUSTOM_MODULE_MAPPING: Record<string, string[]> = {
  risk_management: ['risk.read', 'risk.write'],
  compliance: ['compliance.read', 'compliance.write'],
  audit: ['audit.read', 'audit.write'],
  incidents: ['incident.read', 'incident.write'],
  assets: ['asset.read', 'asset.write'],
  vulnerabilities: ['vulnerability.read', 'security.read'],
  vulnerability_portal: ['vulnerability.read', 'security.read'],
  risk_portal: ['risk.read'],
  vendor_portal: ['vendor.read', 'vendor.write'],
  policies: ['compliance.read'],
  privacy: ['privacy.read', 'privacy.write'],
  reports: ['report.read'],
  ethics: ['ethics.read'],
  assessments: ['assessment.read'],
  action_plans: ['action_plan.read'],
  strategic_planning: ['strategic.read'],
  tprm: ['vendor.read', 'vendor.write'],
  policy_management: ['compliance.read'],
  ai_manager: ['admin'],
  dashboard: ['dashboard.read'],
  settings: ['admin'],
  users: ['users.read']
};

export const AuthProviderOptimized: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache otimizado para startup
  const getCachedUser = useCallback((userId: string) => {
    const cached = authCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.user;
    }
    return null;
  }, []);

  const setCachedUser = useCallback((userId: string, userData: AuthUser) => {
    authCache.set(userId, { user: userData, timestamp: Date.now() });
  }, []);

  // Função simplificada para carregar dados do usuário
  const loadUserData = useCallback(async (supabaseUser: User, authEvent?: string): Promise<AuthUser | null> => {
    console.log('👤 [AUTH] Loading user data for:', supabaseUser.id);

    // Criar usuário básico primeiro para evitar travamento (Escopo global da função)
    const basicUser: AuthUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.email?.split('@')[0] || 'Usuário',
      tenantId: 'default',
      roles: ['user'],
      permissions: getPermissionsForRoles(['user'], false),
      isPlatformAdmin: false,
      enabledModules: [],
      mfaEnabled: false,
      isVendorOnly: false
    };

    try {
      // Verificar cache primeiro
      const cachedUser = getCachedUser(supabaseUser.id);
      if (cachedUser) {
        console.log('💾 [AUTH] Using cached user data');
        return cachedUser;
      }

      // 🛡️ EXCEÇÃO: Permitir se for fluxo de recuperação de senha ou convite (onde a conta começa inativa)
      const isRecoveryFlow = authEvent === 'PASSWORD_RECOVERY' || 
                           window.location.hash.includes('type=recovery') || 
                           window.location.hash.includes('type=invite') ||
                           window.location.hash.includes('type=signup') ||
                           window.location.hash.includes('recovery_token=') ||
                           window.location.search.includes('type=recovery') ||
                           window.location.pathname.includes('/reset-password');

      // Tentar carregar via RPC
      try {
        console.log('📊 [AUTH] Fetching profile via Secure RPC...');

        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_complete_profile');

        if (rpcError) {
          console.error('❌ [AUTH] RPC Error:', rpcError);
          throw rpcError;
        }

        const fullProfile = rpcData as any;
        console.log('✅ [AUTH] RPC Data received: profile loaded successfully');

        // PROTEÇÃO EXTRA: O usuário tem o perfil mas está marcado explicitamente como inativo
        if (fullProfile && fullProfile.is_active === false && !isRecoveryFlow) {
          console.error('❌ [AUTH] Conta REGULAR DESATIVADA detectada via perfil principal!');
          // Apenas deslogar se NÃO for fluxo de recuperação
          if (!isRecoveryFlow) {
            await supabase.auth.signOut();
            throw new Error('CONTA_DESATIVADA');
          } else {
            console.warn('⚠️ [AUTH] Conta inativa ignorada em fluxo de recuperação.');
          }
        }

        if (!fullProfile || !fullProfile.profile) {
          console.warn('⚠️ [AUTH] Perfil não retornado pelo RPC');
          throw new Error('Perfil não encontrado');
        }

        const profile = fullProfile.profile;
        const tenantData = fullProfile.tenant;
        const tenantSettings = tenantData?.settings || {};
        const modulesList = fullProfile.modules || [];
        const rolesList = fullProfile.roles || [];
        const platformAdminData = fullProfile.platform_admin;

        // Fetch Tenant Modules from RPC result (filtering only enabled ones)
        let enabledModules: string[] = modulesList
          .filter((m: any) => m.is_enabled === true)
          .map((m: any) => m.module_key);
        console.log('📦 [AUTH] Enabled Modules for Tenant:', enabledModules);

        // 🚀 Acesso Individual ao Portal de Risco
        // Override de perfil só é aplicado se o módulo já estiver habilitado no tenant.
        // Se o tenant não habilitou o módulo, o override individual não tem efeito.
        if (profile?.override_risk_portal && enabledModules.includes('risk_portal')) {
          console.log('🔓 [AUTH] Risk Portal access confirmed via individual override (tenant module enabled)');
        }

        // 🛡️ Acesso Individual ao Portal de Vulnerabilidades
        if (profile?.override_vulnerability_portal && enabledModules.includes('vulnerability_portal')) {
          console.log('🔓 [AUTH] Vulnerability Portal access confirmed via individual override (tenant module enabled)');
        }

        console.log('📊 [AUTH] Profile loaded via RPC:', {
          hasProfile: !!profile,
          rolesCount: rolesList.length,
          isPlatformAdminTable: !!platformAdminData
        });

        // 🔒 SEGURANÇA: Usar APENAS tabela platform_admins como fonte autoritativa
        let isPlatformAdmin = false;
        let adminSource = 'none';

        if (platformAdminData) {
          isPlatformAdmin = true;
          adminSource = 'platform_admins_table';
        }

        console.log('🔐 [AUTH] Platform Admin verification (SECURE):', {
          isPlatformAdmin,
          adminSource
        });

        // Atualizar com dados completos
        const userRoles = rolesList.length > 0 ? rolesList.map((r: any) => r.role) : ['user'];
        const basePermissions = getPermissionsForRoles(userRoles, isPlatformAdmin);
        const customModuleKeys = fullProfile.custom_permissions || [];

        // Mapear as chaves de módulo para as permissões reais esperadas pelo Sidebar/UI
        const mappedPermissions = customModuleKeys.flatMap((key: string) =>
          CUSTOM_MODULE_MAPPING[key] || [key]
        );

        const finalPermissions = [...new Set([...basePermissions, ...mappedPermissions])];

        let isVendorOnly = false;

        // 🚀 VERIFICAÇÃO SEGURA DE FORNECEDOR (Ignora RLS clientside, usa RPC)
        try {
          const { data: isVendorRpc, error: rpcVendorError } = await supabase
            .rpc('check_is_vendor', {
              check_uid: supabaseUser.id,
              check_email: supabaseUser.email || ''
            });

          if (rpcVendorError) {
            console.warn('⚠️ [AUTH] Erro ao chamar check_is_vendor RPC, fazendo fallback manual:', rpcVendorError);
          } else if (isVendorRpc === 'active') {
            console.log('✅ [AUTH] Usuário identificado como fornecedor seguro via RPC');
            isVendorOnly = true;
          } else if (isVendorRpc === 'inactive' && !isRecoveryFlow) {
            console.error('❌ [AUTH] Conta de fornecedor DESATIVADA detectada no fluxo principal!');
            if (!isRecoveryFlow) {
              await supabase.auth.signOut();
              throw new Error('CONTA_DESATIVADA');
            }
          }
        } catch (vendorCheckError: any) {
          if (vendorCheckError?.message === 'CONTA_DESATIVADA') throw vendorCheckError;
          console.error('❌ [AUTH] Erro ao verificar fornecedor no fluxo principal via RPC:', vendorCheckError);
        }

        const userData: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
          jobTitle: profile?.job_title,
          avatar_url: profile?.avatar_url,
          tenantId: profile?.tenant_id || 'default',
          roles: isVendorOnly ? ['vendor'] : userRoles,
          permissions: finalPermissions,
          isPlatformAdmin,
          enabledModules,
          settings: tenantSettings,
          tenant: tenantData ? {
            id: profile?.tenant_id,
            name: tenantData.name,
            slug: tenantData.slug,
            contact_email: '',
            max_users: 0,
            current_users_count: 0,
            subscription_plan: 'free',
            is_active: true
          } : undefined,
          mfaEnabled: false,
          isVendorOnly: isVendorOnly,
          system_role: profile?.system_role,
          customRoleId: profile?.custom_role_id
        };

        // Check MFA Status
        try {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          if (factors && factors.totp && factors.totp.length > 0) {
            const hasVerifiedFactor = factors.totp.some(f => f.status === 'verified');
            if (hasVerifiedFactor) {
              userData.mfaEnabled = true;
            }
          }
        } catch (mfaError) {
          console.warn('⚠️ [AUTH] Erro ao verificar MFA:', mfaError);
        }

        // Cache o resultado
        setCachedUser(supabaseUser.id, userData);
        return userData;

      } catch (dbError: any) {
        if (dbError?.message === 'CONTA_DESATIVADA') throw dbError;
        console.warn('⚠️ [AUTH] Erro ao carregar perfil, verificando se é fornecedor...', dbError);

        try {
          // 🚀 FALLBACK SEGURA DE FORNECEDOR - Agora retorna STATUS (active, inactive, not_found)
          const { data: vendorStatus, error: rpcVendorError } = await supabase
            .rpc('check_is_vendor', {
              check_uid: supabaseUser.id,
              check_email: supabaseUser.email || ''
            });

          if (vendorStatus === 'active') {
            console.log('✅ [AUTH] Usuário identificado como fornecedor ATIVO');
            const vendorData = { ...basicUser, isVendorOnly: true, roles: ['vendor'] };
            setCachedUser(supabaseUser.id, vendorData);
            return vendorData;
          } else if (vendorStatus === 'inactive' && !isRecoveryFlow) {
            console.error('❌ [AUTH] Conta de fornecedor DESATIVADA detectada!');
            // Forçar logout imediato se estiver inativo
            await supabase.auth.signOut();
            throw new Error('CONTA_DESATIVADA');
          }
        } catch (vendorCheckError: any) {
          if (vendorCheckError.message === 'CONTA_DESATIVADA') throw vendorCheckError;
          console.error('❌ [AUTH] Erro ao verificar status de fornecedor:', vendorCheckError);
        }

        console.warn('⚠️ [AUTH] Usuário não é fornecedor, usando dados básicos padrão');
        return basicUser;
      }

    } catch (error: any) {
      if (error.message === 'CONTA_DESATIVADA') {
        throw error;
      }
      console.error('❌ [AUTH] Erro inesperado ao carregar dados do usuário:', error);
      return basicUser;
    }
  }, [getCachedUser, setCachedUser]);

  // Handler otimizado para mudanças de auth
  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    console.log('🔄 [AUTH] Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id });

    setSession(session);

    if (event === 'SIGNED_OUT' || !session) {
      console.log('🚪 [AUTH] User signed out');
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      console.log('✅ [AUTH] User signed in, loading user data...');
      try {
        setIsLoading(true);

        // Timeout para carregamento de dados do usuário
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao carregar dados do usuário')), USER_DATA_TIMEOUT);
        });

        const userDataPromise = loadUserData(session.user, event);
        const userData = await Promise.race([userDataPromise, timeoutPromise]) as AuthUser;

        console.log('👤 [AUTH] User data loaded:', { id: userData?.id, name: userData?.name });
        setUser(userData);
      } catch (error: any) {
        console.error('❌ [AUTH] Erro ao carregar dados do usuário:', error);
        
        if (error.message === 'CONTA_DESATIVADA') {
          console.error('🛑 Bloqueando acesso de conta desativada no handler');
          setUser(null);
          setSession(null);
          return;
        }

        // Em caso de erro, criar usuário básico para não travar
        const basicUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || 'Usuário',
          tenantId: 'default',
          roles: ['user'],
          permissions: getPermissionsForRoles(['user'], false),
          isPlatformAdmin: false,
          enabledModules: [],
          mfaEnabled: false,
          isVendorOnly: false
        };
        setUser(basicUser);
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadUserData]);

  // Setup inicial simplificado
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        console.log('🚀 [AUTH] Inicializando autenticação...');

        // Timeout para inicialização
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ [AUTH] Timeout na inicialização, continuando sem sessão');
            setIsLoading(false);
          }
        }, STARTUP_TIMEOUT);

        const sessionPromise = supabase.auth.getSession();
        const result = await Promise.race([
          sessionPromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), STARTUP_TIMEOUT - 1000)
          )
        ]) as { data: { session: any }, error: any };

        const { data: { session: currentSession }, error } = result;

        if (timeoutId) clearTimeout(timeoutId);

        if (!mounted) return;

        if (error) {
          console.warn('⚠️ [AUTH] Erro ao recuperar sessão:', error);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          console.log('✅ [AUTH] Sessão encontrada, carregando dados...');
          await handleAuthChange('SIGNED_IN', currentSession);
        } else {
          console.log('🚪 [AUTH] Nenhuma sessão encontrada');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização do auth:', error);
        if (timeoutId) clearTimeout(timeoutId);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de auth com debounce
    const debouncedHandleAuthChange = debounce(handleAuthChange, 300);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(debouncedHandleAuthChange);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  // Heartbeat para verificar sessão periodicamente
  useEffect(() => {
    if (!user) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('⚠️ [AUTH HEARTBEAT] Erro ao verificar sessão:', error.message);
          return;
        }

        if (!currentSession && user) {
          console.warn('⚠️ [AUTH HEARTBEAT] Sessão perdida, fazendo logout limpo');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
      }
    }, 60000); // A cada minuto

    return () => clearInterval(heartbeatInterval);
  }, [user]);



  // Login otimizado
  const login = useCallback(async (email: string, password: string) => {
    console.log('🔐 [AUTH] Iniciando login para:', email);

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    if (!validateEmailFormat(cleanEmail)) {
      console.error('❌ [AUTH] Formato de email inválido:', cleanEmail);
      await logAuthEvent('login_failed', {
        email: cleanEmail,
        error: 'Invalid email format',
        severity: 'warning'
      });
      throw new Error('Formato de email inválido');
    }

    if (cleanPassword.length < 6) {
      console.error('❌ [AUTH] Senha muito curta');
      await logAuthEvent('login_failed', {
        email: cleanEmail,
        error: 'Password too short',
        severity: 'warning'
      });
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    try {
      console.log('🔐 [AUTH] Chamando supabase.auth.signInWithPassword...');

      // 0. IP Enforcement (Dynamic from Tenant Settings)
      try {
        const domain = cleanEmail.split('@')[1];
        if (domain) {
          const { data: securitySettings } = await supabase.rpc('get_tenant_security_settings', {
            domain_name: domain
          });

          if (securitySettings?.accessControl?.ipWhitelisting) {
            const allowedIPs = securitySettings.accessControl.allowedIPs || [];
            // IP enforcement would be done server-side via Edge Functions
            // allowedIPs array is available here for future enforcement logic
            void allowedIPs;
          }
        }
      } catch {
        // Security settings fetch is optional; continue login flow if unavailable
      }

      // 1. Check for Account Lockout (Brute Force Protection)
      const { data: lockoutStatus, error: lockoutError } = await supabase.rpc('check_account_lockout', {
        user_email: cleanEmail
      });

      if (lockoutStatus && lockoutStatus.locked) {
        console.error('🚫 [AUTH] Conta bloqueada temporariamente:', lockoutStatus.until);
        const until = new Date(lockoutStatus.until).toLocaleTimeString();
        await logAuthEvent('account_locked', { email: cleanEmail, until, severity: 'warning' });
        throw new Error(`Sua conta está bloqueada temporariamente até às ${until} devido a múltiplas tentativas falhas.`);
      }

      // Timeout para autenticação
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na autenticação. Verifique sua conexão.')), AUTH_TIMEOUT);
      });

      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      const result = await Promise.race([loginPromise, timeoutPromise]);
      const { data, error } = result as any;

      console.log('🔐 [AUTH] Resposta do Supabase:', { data: !!data, error: error?.message });

      if (error) {
        console.error('❌ [AUTH] Erro do Supabase:', error);

        // 2. Increment Failed Attempts on Error
        if (error.message === 'Invalid login credentials') {
          await supabase.rpc('increment_failed_login', { user_email: cleanEmail });
        }

        // O log será feito no bloco catch quando o erro for lançado para evitar duplicidade
        throw new Error(error.message);
      }

      console.log('✅ [AUTH] Login bem-sucedido!');

      // 3. Clear Failures on Success
      await supabase.rpc('clear_login_failures', { user_email: cleanEmail });

      // Log sucesso de login
      if (data.user) {
        await logAuthEvent('login_success', {
          user_id: data.user.id,
          email: cleanEmail,
          severity: 'info'
        });
      }

    } catch (error: any) {
      console.error('❌ [AUTH] Erro inesperado no login:', error);

      if (!error.message?.includes('Invalid email') && !error.message?.includes('Password too short')) {
        await logAuthEvent('login_failed', {
          email: cleanEmail,
          error: error.message || 'Unknown error',
          severity: 'error'
        });
      }

      throw error;
    }
  }, []);

  // Logout otimizado
  const logout = useCallback(async () => {
    console.log('🚪 [AUTH] Iniciando processo de logout...');

    // Limpar cache imediatamente
    authCache.clear();

    // Clear MFA Bypass Flag
    try {
      sessionStorage.removeItem('grc_mfa_completed');
    } catch (e) { }

    // Limpar estado local ANTES ou INDEPENDENTE do resultado do servidor
    // Isso garante que a UI não trave em um estado "logado" se o servidor der 403
    setUser(null);
    setSession(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('⚠️ [AUTH] Erro ao chamar signOut no Supabase (pode ser sessão já expirada):', error.message);
      } else {
        console.log('✅ [AUTH] Logout concluído com sucesso no servidor');
      }
    } catch (err) {
      console.error('❌ [AUTH] Exceção durante signOut:', err);
    }

    // Forçar recarregamento se necessário para limpar estados residuais de memória
    // mas o setUser(null) já deve disparar os redirects do ProtectedRoute
  }, []);

  // Signup otimizado
  const signup = useCallback(async (email: string, password: string, fullName: string, jobTitle?: string) => {
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);
    const cleanFullName = sanitizeInput(fullName);
    const cleanJobTitle = jobTitle ? sanitizeInput(jobTitle) : undefined;

    if (!validateEmailFormat(cleanEmail)) {
      throw new Error('Formato de email inválido');
    }

    if (cleanPassword.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (!cleanFullName) {
      throw new Error('Nome completo é obrigatório');
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          full_name: cleanFullName,
          job_title: cleanJobTitle,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  // Função para recarregar dados do usuário
  const refreshUserData = useCallback(async (): Promise<AuthUser | undefined> => {
    if (!session?.user) {
      return undefined;
    }

    try {
      // Limpar cache para forçar recarregamento
      authCache.delete(session.user.id);

      // Recarregar dados
      const userData = await loadUserData(session.user);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
      return undefined;
    }
  }, [session, loadUserData]);

  // Alias para compatibilidade
  const refreshUser = refreshUserData;

  // Check module access
  const checkModuleAccess = useCallback((moduleKey: string) => {
    if (!user) return false;

    // Platform Admin has all permissions, but should still respect ENABLED MODULES for the tenant
    // unless they are accessing an admin-only area.
    if (user.isPlatformAdmin) {
      if (['ai_manager', 'settings', 'admin', 'dashboard', 'help', 'notifications'].includes(moduleKey)) return true;
      return user.enabledModules?.includes(moduleKey) || false;
    }

    // AI Modules Check - Enforce Global AI Setting
    if (['ai_manager', 'policy_auditor'].includes(moduleKey)) {
      if (!user.settings?.enable_global_ai) return false;
    }

    // Public modules or basic ones - Ensure common.read is checked for these
    if (['help', 'notifications'].includes(moduleKey)) {
      return user.permissions?.includes('common.read') || user.permissions?.includes('all') || user.permissions?.includes('*');
    }

    // Core platform modules that skip the tenant-level "enabledModules" check
    const isCoreModule = ['dashboard', 'settings', 'users', 'admin', 'help', 'notifications'].includes(moduleKey);

    // 1. Is it enabled for the tenant? (Skip check for core platform features)
    if (!isCoreModule && !user.enabledModules?.includes(moduleKey)) return false;

    // 2. Map moduleKey to required permissions
    const requiredPermissions = CUSTOM_MODULE_MAPPING[moduleKey] || [];

    // 3. If no specific mapping, we default to strict (false) unless it's a known non-RBAC module
    if (requiredPermissions.length === 0) {
      // Fallback for modules not in mapping but enabled for tenant
      // If it's a valid system module key, it might not need RBAC (unlikely given request)
      return false;
    }

    // 4. Does the user HAVE any of these permissions?
    return requiredPermissions.some(p =>
      user.permissions?.includes(p) ||
      user.permissions?.includes('all') ||
      user.permissions?.includes('*')
    );
  }, [user]);

  // Listen for security events (Kick User) - REALTIME KILL SWITCH
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('security_broadcast')
      .on('broadcast', { event: 'force_logout' }, (payload) => {
        if (payload.payload?.user_id === user.id) {
          console.warn('🚨 [AUTH] Sessão encerrada remotamente pelo administrador');
          logout().then(() => {
            window.location.reload();
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, logout]);

  // IDLE TIMEOUT LOGIC (Moved here to be after logout definition)
  useEffect(() => {
    if (!user) return;

    const securitySettings = user.settings?.security?.sessionSecurity;
    const timeoutMinutes = securitySettings?.timeoutMinutes || 30;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    let idleTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.warn(`⚠️ [AUTH] Sessão expirou por inatividade (${timeoutMinutes} min)`);
        logout(); // Now logout is defined
      }, timeoutMs);
    };

    // Events to track activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer(); // Initialize

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [user, logout]);

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    signup,
    refreshUserData,
    refreshUser,
    checkModuleAccess,
    needsMFA: (() => {
      // 1. O Platform Admin obriga a Tenant a usar MFA? (Admin -> Gestão de Tenants)
      const platformForcedMFA = user?.settings?.security?.mfa_required;
      // 2. O Admin da própria Tenant obriga o uso de MFA? (Configurações da Empresa -> Segurança)
      const tenantRequiresMFA = user?.settings?.security?.sessionSecurity?.requireMFA;

      // Se NENHUM dos dois exige MFA, o MFA não é necessário (mesmo que o usuário tenha um registered).
      // Regra de negócio: o usuário comum só usa MFA se o ADM da empresa ou o Platform Admin habilitarem.
      if (!platformForcedMFA && !tenantRequiresMFA) return false;

      // Se chegamos aqui, o MFA é exigido por PELO MENOS um dos administradores.
      // Vamos checar os bypasses válidos (AAL2, Dispositivo Confiável, Sessão Recente).

      const currentAal = session?.user?.app_metadata?.aal;
      if (currentAal === 'aal2') return false;

      const allowTrusted = user?.settings?.security?.accessControl?.allowTrustedDevices;
      const ipWhitelist = user?.settings?.security?.accessControl?.ipWhitelist;

      if (ipWhitelist && ipWhitelist.length > 0) {
        // Placeholder IP check
      }

      // Bypass 1: Dispositivo confiável (por 90 dias)
      try {
        if (allowTrusted && user?.id) {
          const trustedToken = localStorage.getItem(`grc_trusted_device_${user.id}`);
          const expiryStr = localStorage.getItem(`grc_trusted_device_${user.id}_expiry`);
          if (trustedToken && expiryStr) {
            const expiryDate = new Date(expiryStr);
            if (expiryDate > new Date()) {
              return false; // Dispositivo ainda é confiável
            } else {
              // Expirou, limpar
              localStorage.removeItem(`grc_trusted_device_${user.id}`);
              localStorage.removeItem(`grc_trusted_device_${user.id}_expiry`);
            }
          }
        }
      } catch (e) { }

      // Bypass 2: MFA já confirmado recentemente nesta sessão (2 minutos)
      try {
        const mfaCompletedAt = sessionStorage.getItem('grc_mfa_completed');
        if (mfaCompletedAt) {
          const timeSince = Date.now() - parseInt(mfaCompletedAt);
          if (timeSince < 120000) {
            return false;
          }
        }
      } catch (e) { }

      // Se exige MFA e não caiu em nenhum bypass aprovado, então precisa de MFA.
      return true;
    })()
  };

  // Wrap logAuthEvent to respect settings
  const secureLogAuthEvent = async (event: string, details: any) => {
    // Always log failures or critical events
    if (details.severity === 'error' || details.severity === 'warning') {
      await logAuthEvent(event, details);
      return;
    }

    // For info events, check settings
    const logAll = user?.settings?.security?.monitoring?.logAllActivities !== false; // Default to true
    if (logAll) {
      await logAuthEvent(event, details);
    }
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
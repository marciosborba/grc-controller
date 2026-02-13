import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  Mail,
  Phone,
  CreditCard,
  Settings,
  Edit,
  Trash2,
  Activity,
  Save,
  X,
  Plus,
  UserPlus,
  UserX,
  Shield,
  Search,
  RefreshCw,
  Copy,
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/useTenantSettings';

import TenantCryptoManagement from './TenantCryptoManagement';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  billing_email?: string;
  max_users: number;
  current_users_count: number;
  subscription_plan: string;
  subscription_status: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TenantCompanyData {
  corporate_name?: string;
  trading_name?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  industry?: string;
  size?: string;
  description?: string;
}

interface TenantUser {
  user_id: string;
  full_name: string;
  email: string;
  job_title?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}



interface TenantCardProps {
  tenant: Tenant;
  onDelete: (tenantId: string) => void;
  isDeleting: boolean;
}

const TenantCard: React.FC<TenantCardProps> = ({ tenant, onDelete, isDeleting }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { tenantSettings, refetch: refetchTenantSettings } = useTenantSettings(tenant.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'info' | 'company' | 'users' | 'crypto' | 'config'>('info');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingUsers, setIsEditingUsers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para dados da empresa
  const [companyData, setCompanyData] = useState<TenantCompanyData>({
    corporate_name: tenant.name,
    trading_name: tenant.name,
    ...(tenant.settings?.company_data as Record<string, unknown> || {})
  });


  // Estados para configuracao de usuários
  const [userConfig, setUserConfig] = useState({
    max_users: tenant.max_users,
    current_users_count: tenant.current_users_count
  });

  // Estados para gerenciamento de usuários da tenant
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

  const getStatusBadge = () => {
    if (!tenant.is_active) {
      return (
        <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 shadow-none font-medium">
          Inativo
        </Badge>
      );
    }

    switch (tenant.subscription_status) {
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none font-medium">
            Ativo
          </Badge>
        );
      case 'trial':
        return (
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-none font-medium">
            Trial
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 shadow-none font-medium">
            Suspenso
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 font-medium">
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 font-medium">
            Desconhecido
          </Badge>
        );
    }
  };

  const getPlanBadge = () => {
    const planStyles: Record<string, string> = {
      basic: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
      professional: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      enterprise: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      trial: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
    };

    const style = planStyles[tenant.subscription_plan as keyof typeof planStyles] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <Badge className={`${style} shadow-none border font-medium px-2.5 py-0.5 rounded-full`}>
        {tenant.subscription_plan.charAt(0).toUpperCase() + tenant.subscription_plan.slice(1)}
      </Badge>
    );
  };

  // Helper para obter a contagem real de usuários
  const getCurrentUserCount = () => {
    // Se os usuários já foram carregados pelo menos uma vez, usar o length real
    // Caso contrário, usar o valor do tenant
    return usersLoaded ? tenantUsers.length : tenant.current_users_count;
  };

  // Helper para obter o nome de exibição da tenant (prioriza nome fantasia)
  const getDisplayName = () => {
    // Buscar primeiro nos dados salvos da tenant
    const savedCompanyData = tenant.settings?.company_data as TenantCompanyData || {};

    // Prioridade: Nome fantasia > Razão social > Nome da tenant
    return savedCompanyData.trading_name ||
      savedCompanyData.corporate_name ||
      companyData.trading_name ||
      companyData.corporate_name ||
      tenant.name;
  };

  const getUsersUsageColor = () => {
    const currentCount = getCurrentUserCount();
    const percentage = (currentCount / tenant.max_users) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 75) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const saveCompanyData = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...tenant.settings,
        company_data: companyData
      };

      // Também atualiza o nome da tenant se houver nome fantasia
      const tenantUpdateData: any = { settings: updatedSettings };

      // Se há nome fantasia, atualiza o nome da tenant para facilitar identificação
      if (companyData.trading_name && companyData.trading_name.trim()) {
        tenantUpdateData.name = companyData.trading_name.trim();
      } else if (companyData.corporate_name && companyData.corporate_name.trim()) {
        tenantUpdateData.name = companyData.corporate_name.trim();
      }

      const { error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'update',
        tenant_data: tenantUpdateData,
        tenant_id_param: tenant.id
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Dados da empresa atualizados com sucesso');
      setIsEditingCompany(false);

      // Não recarregar a página automaticamente - deixar o usuário decidir
      if (user?.tenantId === tenant.id &&
        (companyData.trading_name?.trim() || companyData.corporate_name?.trim())) {
        toast.info('Nome da organizacao atualizado. Recarregue a página para ver as mudanças na interface.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };


  // ... keep saveUserConfig ...
  const saveUserConfig = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'update',
        tenant_data: {
          max_users: userConfig.max_users,
          // Não permitir que current_users_count seja maior que max_users
          current_users_count: Math.min(userConfig.current_users_count, userConfig.max_users)
        },
        tenant_id_param: tenant.id
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Configuração de usuários atualizada com sucesso');
      setIsEditingUsers(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Carregar usuários da tenant
  const loadTenantUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          job_title,
          department,
          is_active,
          created_at,
          last_login_at
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenantUsers(data || []);
      setUsersLoaded(true); // Marcar como carregado
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários da tenant');
    } finally {
      setLoadingUsers(false);
    }
  };

  // ... keep addUserToTenant, removeUserFromTenant, filteredUsers, useEffects ...

  // Adicionar usuário à tenant
  const addUserToTenant = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newUserEmail.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers();

      if (userError) throw userError;

      const user = existingUser.users?.find(u => u.email === newUserEmail.trim());

      if (!user) {
        toast.error('Usuário não encontrado no sistema');
        return;
      }

      // Verificar se já está na tenant
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile?.tenant_id === tenant.id) {
        toast.error('Usuário já está vinculado a esta tenant');
        return;
      }

      if (existingProfile?.tenant_id && existingProfile.tenant_id !== tenant.id) {
        toast.error('Usuário já está vinculado a outra tenant');
        return;
      }

      // Verificar limite de usuários
      if (tenantUsers.length >= tenant.max_users) {
        toast.error('Limite máximo de usuários atingido para esta tenant');
        return;
      }

      // Atualizar o perfil para vincular à tenant
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          tenant_id: tenant.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Atualizar contador de usuários na tenant
      const { error: tenantUpdateError } = await supabase
        .from('tenants')
        .update({ current_users_count: tenantUsers.length + 1 })
        .eq('id', tenant.id);

      if (tenantUpdateError) throw tenantUpdateError;

      toast.success('Usuário adicionado à tenant com sucesso');
      setNewUserEmail('');
      setIsAddingUser(false);
      await loadTenantUsers();
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao adicionar usuário: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Remover usuário da tenant
  const removeUserFromTenant = async (userId: string, userName: string) => {
    if (!confirm(`Confirma a remoção do usuário "${userName}" desta tenant?`)) {
      return;
    }

    setIsSaving(true);
    try {
      // Remover perfil (descincular da tenant)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', tenant.id);

      if (deleteError) throw deleteError;

      // Atualizar contador de usuários na tenant
      const { error: tenantUpdateError } = await supabase
        .from('tenants')
        .update({ current_users_count: Math.max(0, tenantUsers.length - 1) })
        .eq('id', tenant.id);

      if (tenantUpdateError) throw tenantUpdateError;

      toast.success(`Usuário "${userName}" removido da tenant`);
      await loadTenantUsers();
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao remover usuário: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar usuários baseado na pesquisa
  const filteredUsers = tenantUsers.filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.job_title && user.job_title.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );


  // Carregar usuários imediatamente quando o componente for montado
  useEffect(() => {
    if (!usersLoaded) {
      loadTenantUsers();
    }
  }, []); // Executar apenas uma vez na montagem

  // Carregar usuários quando a guia for selecionada ou quando o card for expandido (backup)
  useEffect(() => {
    if (isExpanded && !usersLoaded) {
      loadTenantUsers();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (activeSection === 'users' && isExpanded && !usersLoaded) {
      loadTenantUsers();
    }
  }, [activeSection, isExpanded]);

  return (
    <Card className={cn(
      "rounded-xl border bg-card text-card-foreground w-full transition-all duration-300 overflow-hidden cursor-pointer relative group",
      isExpanded
        ? "shadow-lg border-primary/20 ring-1 ring-primary/5"
        : "hover:border-primary/30 hover:shadow-md"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 sm:p-5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              {/* Left Section: Icon + Basic Info */}
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1 sm:mt-0">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    isExpanded ? "bg-primary text-primary-foreground shadow-md" : "bg-primary/10 text-primary"
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-base font-semibold text-foreground truncate">{getDisplayName()}</h3>
                    {getStatusBadge()}
                    {getPlanBadge()}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground flex-wrap gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1.5 min-w-[140px]">
                      <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                        {tenant.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]">{tenant.contact_email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Metrics + Toggle */}
              <div className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0 pl-14 sm:pl-0">
                <div className="flex flex-col items-end">
                  <div className={cn("text-xs font-medium px-2 py-0.5 rounded-full border mb-1", getUsersUsageColor())}>
                    {getCurrentUserCount()} / {tenant.max_users} usuários
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-200 bg-muted hover:bg-muted/80 flex-shrink-0",
                  isExpanded && "rotate-180 bg-primary/10 text-primary"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 relative z-10">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveSection('info')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'info'
                      ? 'bg-background shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-primary'
                    }`}
                >
                  <Activity className="h-4 w-4" />
                  Informações
                </button>

                <button
                  onClick={() => setActiveSection('company')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'company'
                      ? 'bg-background shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-primary'
                    }`}
                >
                  <Building2 className="h-4 w-4" />
                  Empresa
                </button>

                <button
                  onClick={() => setActiveSection('users')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'users'
                      ? 'bg-background shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-primary'
                    }`}
                >
                  <Users className="h-4 w-4" />
                  Usuários
                  {tenantUsers.length > 0 && (
                    <Badge variant="outline" className="ml-1 h-5 text-xs">
                      {tenantUsers.length}
                    </Badge>
                  )}
                </button>

                <button
                  onClick={() => setActiveSection('crypto')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'crypto'
                      ? 'bg-background shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-primary'
                    }`}
                >
                  <Shield className="h-4 w-4" />
                  Criptografia
                </button>

                <button
                  onClick={() => setActiveSection('config')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeSection === 'config'
                      ? 'bg-background shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-primary'
                    }`}
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </button>
              </div>

              {/* 1. INFORMAÇÕES BÁSICAS */}
              {activeSection === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-muted-foreground mb-4">INFORMAÇÕES BÁSICAS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>Contato: {tenant.contact_email}</span>
                      </div>
                      {tenant.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>Telefone: {tenant.contact_phone}</span>
                        </div>
                      )}
                      {tenant.billing_email && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>Faturamento: {tenant.billing_email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Criado em: {new Date(tenant.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Estatísticas de Usuários */}
                  <div>
                    <h4 className="text-lg font-medium text-muted-foreground mb-4">ESTATÍSTICAS DE USUÁRIOS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <div className={`text-2xl font-bold ${getUsersUsageColor()}`}>
                          {getCurrentUserCount()}
                        </div>
                        <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-600">
                          {tenant.max_users}
                        </div>
                        <div className="text-sm text-muted-foreground">Limite Máximo</div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <BarChart3 className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">
                          {Math.round((getCurrentUserCount() / tenant.max_users) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Taxa de Utilização</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${(getCurrentUserCount() / tenant.max_users) * 100 >= 90
                                ? 'bg-red-500'
                                : (getCurrentUserCount() / tenant.max_users) * 100 >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                            style={{
                              width: `${Math.min(100, (getCurrentUserCount() / tenant.max_users) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium min-w-12">
                          {Math.round((getCurrentUserCount() / tenant.max_users) * 100)}%
                        </span>
                      </div>
                    </div>

                    {getCurrentUserCount() >= tenant.max_users * 0.9 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Activity className="h-4 w-4" />
                          <span className="font-medium">Atenção:</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Este tenant está próximo do limite de usuários. Considere aumentar o limite para evitar bloqueios.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. DADOS DA EMPRESA */}
              {activeSection === 'company' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      DADOS CADASTRAIS DA EMPRESA
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCompany(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>

                  {companyData.corporate_name || companyData.tax_id || companyData.address ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {companyData.corporate_name && (
                        <div>
                          <span className="font-medium">Razão Social:</span> {companyData.corporate_name}
                        </div>
                      )}
                      {companyData.trading_name && companyData.trading_name !== companyData.corporate_name && (
                        <div>
                          <span className="font-medium">Nome Fantasia:</span> {companyData.trading_name}
                        </div>
                      )}
                      {companyData.tax_id && (
                        <div>
                          <span className="font-medium">CNPJ:</span> {companyData.tax_id}
                        </div>
                      )}
                      {companyData.industry && (
                        <div>
                          <span className="font-medium">Setor:</span> {companyData.industry}
                        </div>
                      )}
                      {companyData.size && (
                        <div>
                          <span className="font-medium">Porte:</span> {companyData.size}
                        </div>
                      )}
                      {companyData.address && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Endereço:</span> {companyData.address}
                          {companyData.city && `, ${companyData.city}`}
                          {companyData.state && `, ${companyData.state}`}
                          {companyData.zip_code && ` - ${companyData.zip_code}`}
                        </div>
                      )}
                      {companyData.description && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Descrição:</span> {companyData.description}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum dado cadastral adicionado. Clique em "Editar" para configurar.
                    </p>
                  )}
                </div>
              )}

              {/* 3. USUÁRIOS */}
              {activeSection === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      USUÁRIOS DA TENANT ({tenantUsers.length}/{tenant.max_users})
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadTenantUsers}
                        disabled={loadingUsers}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingUsers ? 'animate-spin' : ''}`} />
                        Atualizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingUser(true)}
                        disabled={tenantUsers.length >= tenant.max_users}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Usuário
                      </Button>
                    </div>
                  </div>

                  {/* Barra de Pesquisa */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Pesquisar por nome, email ou cargo..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Lista de Usuários */}
                  {loadingUsers ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Carregando usuários...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium text-muted-foreground mb-2">
                        {userSearchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário vinculado'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userSearchTerm
                          ? 'Tente ajustar os termos da pesquisa'
                          : 'Clique em "Adicionar Usuário" para vincular usuários a esta tenant'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Adicionado</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.user_id}>
                              <TableCell className="font-medium">
                                {user.full_name || 'Nome não informado'}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {user.job_title || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                  {user.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeUserFromTenant(user.user_id, user.full_name)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={isSaving}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. CRIPTOGRAFIA */}
              {activeSection === 'crypto' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Gestão de Chaves Criptográficas</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tenant: {getDisplayName()} ({tenant.id})
                    </p>
                    <TenantCryptoManagement
                      tenantId={tenant.id}
                      tenantName={getDisplayName()}
                    />
                  </div>
                </div>
              )}

              {/* 5. CONFIGURAÇÕES */}
              {activeSection === 'config' && (
                <div className="space-y-6">
                  {/* Configuração de Usuários */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        LIMITES DE USUÁRIOS
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingUsers(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Limite Máximo:</span>
                        <div className="text-lg font-bold text-gray-600">
                          {tenant.max_users}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Usuários Ativos:</span>
                        <div className={`text-lg font-bold ${getUsersUsageColor()}`}>
                          {getCurrentUserCount()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REMOVIDO: Seção Matriz de Riscos - funcionalidade movida para tenant-settings */}

                  {/* Ações Perigosas */}
                  <div>
                    <h4 className="text-lg font-medium text-muted-foreground mb-3">AÇÕES PERIGOSAS</h4>
                    <div className="flex items-center justify-start">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={getCurrentUserCount() > 0 || isDeleting}
                            className="text-destructive hover:text-destructive border-destructive/20"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Tenant
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o tenant "{tenant.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(tenant.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar Configurações
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog para Adicionar Usuário */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Usuário à Tenant
            </DialogTitle>
            <DialogDescription>
              Digite o email de um usuário existente no sistema para vinculá-lo a esta tenant.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="user_email">Email do Usuário</Label>
              <Input
                id="user_email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUserToTenant();
                  }
                }}
              />
              <p className="text-sm text-muted-foreground mt-1">
                O usuário deve já estar registrado no sistema.
              </p>
            </div>

            {/* Informações sobre limites */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Limites Atuais:</span>
              </div>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>- Usuários atuais: <strong>{tenantUsers.length}</strong></li>
                <li>- Limite máximo: <strong>{tenant.max_users}</strong></li>
                <li>- Vagas disponíveis: <strong>{Math.max(0, tenant.max_users - tenantUsers.length)}</strong></li>
              </ul>
            </div>

            {tenantUsers.length >= tenant.max_users && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <X className="h-4 w-4" />
                  <span className="font-medium">Limite Atingido:</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Esta tenant atingiu o limite máximo de usuários. Aumente o limite nas configurações primeiro.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingUser(false);
                setNewUserEmail('');
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={addUserToTenant}
              disabled={
                isSaving ||
                !newUserEmail.trim() ||
                tenantUsers.length >= tenant.max_users
              }
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isSaving ? 'Adicionando...' : 'Adicionar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Dados da Empresa */}
      <Dialog open={isEditingCompany} onOpenChange={setIsEditingCompany}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dados Cadastrais da Empresa</DialogTitle>
            <DialogDescription>
              Configure as informações cadastrais completas da empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="corporate_name">Razão Social</Label>
                <Input
                  id="corporate_name"
                  value={companyData.corporate_name || ''}
                  onChange={(e) => setCompanyData({ ...companyData, corporate_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="trading_name">Nome Fantasia</Label>
                <Input
                  id="trading_name"
                  value={companyData.trading_name || ''}
                  onChange={(e) => setCompanyData({ ...companyData, trading_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax_id">CNPJ</Label>
                <Input
                  id="tax_id"
                  value={companyData.tax_id || ''}
                  onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label htmlFor="industry">Setor</Label>
                <Select
                  value={companyData.industry || ''}
                  onValueChange={(value) => setCompanyData({ ...companyData, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="manufatura">Manufatura</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="varejo">Varejo</SelectItem>
                    <SelectItem value="telecomunicacoes">Telecomunicações</SelectItem>
                    <SelectItem value="energia">Energia</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Porte da Empresa</Label>
                <Select
                  value={companyData.size || ''}
                  onValueChange={(value) => setCompanyData({ ...companyData, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o porte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro">Microempresa (até 19 funcionários)</SelectItem>
                    <SelectItem value="pequena">Pequena (20-99 funcionários)</SelectItem>
                    <SelectItem value="media">Média (100-499 funcionários)</SelectItem>
                    <SelectItem value="grande">Grande (500+ funcionários)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={companyData.country || 'Brasil'}
                  onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={companyData.address || ''}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={companyData.city || ''}
                  onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={companyData.state || ''}
                  onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                  placeholder="SP, RJ, MG..."
                />
              </div>
              <div>
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={companyData.zip_code || ''}
                  onChange={(e) => setCompanyData({ ...companyData, zip_code: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição da Empresa</Label>
              <Textarea
                id="description"
                value={companyData.description || ''}
                onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                placeholder="Descreva brevemente as atividades principais da empresa..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditingCompany(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="button" onClick={saveCompanyData} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Dialog para Configurar Usuários */}
      <Dialog open={isEditingUsers} onOpenChange={setIsEditingUsers}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configuração de Usuários</DialogTitle>
            <DialogDescription>
              Ajuste os limites e quantidade de usuários do tenant.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Limite Máximo de Usuários */}
            <div>
              <Label htmlFor="max_users">Limite Máximo de Usuários</Label>
              <Input
                id="max_users"
                type="number"
                min="1"
                max="10000"
                value={userConfig.max_users}
                onChange={(e) => setUserConfig({
                  ...userConfig,
                  max_users: parseInt(e.target.value) || 0
                })}
                placeholder="Ex: 100"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Número máximo de usuários que podem ser criados neste tenant.
              </p>
            </div>

            {/* Quantidade Atual de Usuários */}
            <div>
              <Label htmlFor="current_users">Usuários Ativos Atuais</Label>
              <Input
                id="current_users"
                type="number"
                min="0"
                max={userConfig.max_users}
                value={userConfig.current_users_count}
                onChange={(e) => setUserConfig({
                  ...userConfig,
                  current_users_count: parseInt(e.target.value) || 0
                })}
                placeholder="Ex: 45"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Quantidade atual de usuários ativos no tenant. Não pode exceder o limite máximo.
              </p>
            </div>

            {/* Informações de Validação */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Informações:</span>
              </div>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>- O limite máximo deve ser pelo menos igual aos usuários atuais</li>
                <li>- Reduzir o limite não remove usuários existentes automaticamente</li>
                <li>- O sistema irá impedir novos cadastros se o limite for atingido</li>
              </ul>
            </div>

            {/* Preview da Configuração */}
            {userConfig.max_users > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Preview da Utilização:</span>
                  <span className="text-sm font-mono">
                    {userConfig.current_users_count}/{userConfig.max_users}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-300 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${(userConfig.current_users_count / userConfig.max_users) * 100 >= 90
                          ? 'bg-red-500'
                          : (userConfig.current_users_count / userConfig.max_users) * 100 >= 75
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      style={{
                        width: `${Math.min(100, (userConfig.current_users_count / userConfig.max_users) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium min-w-12">
                    {Math.round((userConfig.current_users_count / userConfig.max_users) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Validação de Erro */}
            {userConfig.current_users_count > userConfig.max_users && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <X className="h-4 w-4" />
                  <span className="font-medium">Erro de Validação:</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  O número de usuários atuais não pode ser maior que o limite máximo.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditingUsers(false);
                // Resetar para valores originais
                setUserConfig({
                  max_users: tenant.max_users,
                  current_users_count: tenant.current_users_count
                });
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={saveUserConfig}
              disabled={
                isSaving ||
                userConfig.current_users_count > userConfig.max_users ||
                userConfig.max_users < 1
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TenantCard;
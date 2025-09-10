import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth} from '@/contexts/AuthContextOptimized';
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
  Grid3x3,
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

interface RiskMatrixConfig {
  type: '3x3' | '4x4' | '5x5';
  impact_labels: string[];
  likelihood_labels: string[];
  risk_levels: {
    low: number[];
    medium: number[];
    high: number[];
    critical?: number[];
  };
}

const DEFAULT_RISK_MATRIX_4X4: RiskMatrixConfig = {
  type: '4x4',
  impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior'],
  likelihood_labels: ['Raro', 'Improvavel', 'Possivel', 'Provavel'],
  risk_levels: {
    low: [1, 2, 4],
    medium: [3, 5, 6, 8],
    high: [7, 9, 10, 12],
    critical: [11, 13, 14, 15, 16]
  }
};

const DEFAULT_RISK_MATRIX_5X5: RiskMatrixConfig = {
  type: '5x5',
  impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrofico'],
  likelihood_labels: ['Raro', 'Improvavel', 'Possivel', 'Provavel', 'Quase Certo'],
  risk_levels: {
    low: [1, 2, 3, 5, 6],
    medium: [4, 7, 8, 9, 10, 11],
    high: [12, 13, 14, 15, 16, 17, 18],
    critical: [19, 20, 21, 22, 23, 24, 25]
  }
};

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
  const [isEditingRiskMatrix, setIsEditingRiskMatrix] = useState(false);
  const [isEditingUsers, setIsEditingUsers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para dados da empresa
  const [companyData, setCompanyData] = useState<TenantCompanyData>({
    corporate_name: tenant.name,
    trading_name: tenant.name,
    ...(tenant.settings?.company_data as Record<string, unknown> || {})
  });

  // Estados para matriz de riscos - usar useTenantSettings para sincronização
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrixConfig>(() => {
    // Usar a configuração do useTenantSettings se disponível
    if (tenantSettings?.risk_matrix) {
      console.log('DEBUG: Usando configuração do useTenantSettings:', tenantSettings.risk_matrix);
      return {
        type: tenantSettings.risk_matrix.type,
        impact_labels: tenantSettings.risk_matrix.impact_labels,
        likelihood_labels: tenantSettings.risk_matrix.likelihood_labels,
        risk_levels: tenantSettings.risk_matrix.risk_levels
      };
    }
    
    // Fallback para configuração salva no tenant
    const savedMatrix = tenant.settings?.risk_matrix;
    
    console.log('DEBUG: Inicializando matriz de risco (fallback):', {
      tenantId: tenant.id,
      savedMatrix,
      tenantSettings: tenant.settings
    });
    
    // Se não há configuracao salva, usar a configuração padrão 5x5
    if (!savedMatrix) {
      console.log('WARNING: Nenhuma matriz salva, usando configuração padrão 5x5');
      return {
        type: '5x5',
        impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico'],
        likelihood_labels: ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo'],
        risk_levels: {
          low: [1, 2, 3, 5, 6],
          medium: [4, 7, 8, 9, 10, 11],
          high: [12, 13, 14, 15, 16, 17, 18],
          critical: [19, 20, 21, 22, 23, 24, 25]
        }
      };
    }
    
    // Usar EXATAMENTE a configuração salva
    const initialMatrix = {
      type: savedMatrix.type || '5x5',
      impact_labels: savedMatrix.impact_labels || ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico'],
      likelihood_labels: savedMatrix.likelihood_labels || ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo'],
      risk_levels: savedMatrix.risk_levels || {
        low: [1, 2, 3, 5, 6],
        medium: [4, 7, 8, 9, 10, 11],
        high: [12, 13, 14, 15, 16, 17, 18],
        critical: [19, 20, 21, 22, 23, 24, 25]
      }
    };
    
    console.log('CONFIG: Matriz inicializada:', initialMatrix);
    return initialMatrix;
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
      return <Badge variant="destructive">Inativo</Badge>;
    }
    
    switch (tenant.subscription_status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspenso</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPlanBadge = () => {
    const planColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      basic: 'default',
      professional: 'secondary',
      enterprise: 'destructive',
      trial: 'outline'
    };
    
    return (
      <Badge variant={planColors[tenant.subscription_plan as keyof typeof planColors] || 'outline'}>
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
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
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

  const saveRiskMatrix = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSaving(true);
    try {
      console.log('SAVE: Salvando configuracao da matriz de risco:', {
        tenantId: tenant.id,
        currentRiskMatrix: riskMatrix,
        currentSettings: tenant.settings
      });

      const updatedSettings = {
        ...tenant.settings,
        risk_matrix: riskMatrix
      };

      console.log('SEND: Dados que serão enviados (via UPDATE direto):', {
        settings: updatedSettings,
        tenant_id: tenant.id
      });

      // Usar atualização direta na tabela tenants
      console.log('SEND: Executando UPDATE direto na tabela tenants...');
      const { data: updateResult, error: directError } = await supabase
        .from('tenants')
        .update({ 
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)
        .select('id, settings')
        .single();

      if (directError) {
        console.error('ERROR: Erro na atualização direta:', directError);
        throw directError;
      }

      console.log('SUCCESS: Configuração salva com sucesso! Resultado:', updateResult);
      
      // Verificar se o resultado contém os dados esperados
      if (updateResult?.settings?.risk_matrix) {
        console.log('DEBUG: Verificação imediata - Matriz salva:', {
          savedType: updateResult.settings.risk_matrix.type,
          expectedType: riskMatrix.type,
          typeMatches: updateResult.settings.risk_matrix.type === riskMatrix.type,
          fullMatrix: updateResult.settings.risk_matrix
        });
      }
      
      // Forçar recarregamento dos dados e invalidar cache do useTenantSettings
      await queryClient.invalidateQueries({ queryKey: ['tenants'] });
      await queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
      await queryClient.refetchQueries({ queryKey: ['tenants'] });
      
      // Forçar refetch do useTenantSettings para sincronizar
      if (refetchTenantSettings) {
        await refetchTenantSettings();
      }
      
      toast.success(`Configuração de matriz ${riskMatrix.type} atualizada com sucesso!`);
      setIsEditingRiskMatrix(false);
      
      // Verificar se foi salvo corretamente após um tempo
      setTimeout(async () => {
        const { data: verificationTenant, error: fetchError } = await supabase
          .from('tenants')
          .select('settings')
          .eq('id', tenant.id)
          .single();
        
        if (fetchError) {
          console.error('ERROR: Erro ao verificar salvamento:', fetchError);
        } else {
          console.log('DEBUG: Verificação pós-salvamento (1s depois):', {
            savedSettings: verificationTenant?.settings,
            savedRiskMatrix: verificationTenant?.settings?.risk_matrix,
            savedType: verificationTenant?.settings?.risk_matrix?.type,
            expectedType: riskMatrix.type,
            typeMatches: verificationTenant?.settings?.risk_matrix?.type === riskMatrix.type
          });
          
          if (verificationTenant?.settings?.risk_matrix?.type !== riskMatrix.type) {
            console.error('WARNING: ATENÇÃO: Tipo da matriz não foi salvo corretamente!');
            toast.error('Tipo da matriz não foi salvo corretamente. Tente novamente.');
          }
        }
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('ERROR: Erro ao salvar matriz de risco:', error);
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const switchMatrixType = (newType: '3x3' | '4x4' | '5x5') => {
    console.log('RELOAD: Alterando tipo de matriz:', {
      from: riskMatrix.type,
      to: newType,
      currentMatrix: riskMatrix
    });

    // NÃO usar configurações hardcoded - preservar a matriz verdadeira
    // Apenas ajustar o tipo e manter as configurações personalizadas do usuário
    const newMatrix = {
      ...riskMatrix,
      type: newType,
      // Ajustar arrays conforme o novo tamanho, mas preservar customizações
      impact_labels: newType === '3x3'
        ? riskMatrix.impact_labels.slice(0, 3)
        : newType === '4x4' 
          ? riskMatrix.impact_labels.slice(0, 4)
          : riskMatrix.impact_labels.length === 4 
            ? [...riskMatrix.impact_labels, 'Catastrófico']
            : riskMatrix.impact_labels.length === 3
              ? [...riskMatrix.impact_labels, 'Maior', 'Catastrófico']
              : riskMatrix.impact_labels,
      likelihood_labels: newType === '3x3'
        ? riskMatrix.likelihood_labels.slice(0, 3)
        : newType === '4x4'
          ? riskMatrix.likelihood_labels.slice(0, 4)
          : riskMatrix.likelihood_labels.length === 4
            ? [...riskMatrix.likelihood_labels, 'Quase Certo']
            : riskMatrix.likelihood_labels.length === 3
              ? [...riskMatrix.likelihood_labels, 'Provável', 'Quase Certo']
              : riskMatrix.likelihood_labels,
      // Ajustar risk_levels conforme o novo tipo (usar configuração da matriz verdadeira)
      risk_levels: newType === '4x4' ? {
        low: [1, 2, 4],
        medium: [3, 5, 6, 8],
        high: [7, 9, 10, 12],
        critical: [11, 13, 14, 15, 16]
      } : newType === '3x3' ? {
        low: [1, 2],
        medium: [3, 4],
        high: [5, 6, 7, 8, 9]
      } : {
        // 5x5 - usar configuração da matriz verdadeira
        low: [1, 2, 3, 5, 6],
        medium: [4, 7, 8, 9, 10, 11],
        high: [12, 13, 14, 15, 16, 17, 18],
        critical: [19, 20, 21, 22, 23, 24, 25]
      }
    };

    console.log('CONFIG: Nova configuracao da matriz:', newMatrix);
    setRiskMatrix(newMatrix);
  };

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

  // Sincronizar matriz de risco com useTenantSettings
  useEffect(() => {
    if (tenantSettings?.risk_matrix) {
      console.log('🔄 Sincronizando matriz de risco com useTenantSettings:', tenantSettings.risk_matrix);
      setRiskMatrix({
        type: tenantSettings.risk_matrix.type,
        impact_labels: tenantSettings.risk_matrix.impact_labels,
        likelihood_labels: tenantSettings.risk_matrix.likelihood_labels,
        risk_levels: tenantSettings.risk_matrix.risk_levels
      });
    }
  }, [tenantSettings?.risk_matrix]);

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
      "rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden cursor-pointer relative",
      isExpanded 
        ? "shadow-lg border-primary/30" 
        : "hover:bg-muted/50 border-border"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 relative z-10 group/header">
            {/* Hover Effect Gradient for Header */}
            <div 
              className="absolute inset-0 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300 pointer-events-none" 
              style={{
                background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)'
              }}
            />
            <div className="flex items-center justify-between gap-4 relative z-10">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{getDisplayName()}</CardTitle>
                    {getStatusBadge()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{tenant.slug}</span>
                    <span>•</span>
                    <span className="truncate">{getPlanBadge()}</span>
                    <span>•</span>
                    <span className="truncate">{tenant.contact_email}</span>
                  </div>
                </div>
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                <div className={`flex items-center gap-1 ${getUsersUsageColor()}`}>
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{getCurrentUserCount()}</span>
                  <span className="text-muted-foreground">/ {tenant.max_users}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Criado em {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'info' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Informações
                </button>
                
                <button
                  onClick={() => setActiveSection('company')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'company' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Empresa
                </button>
                
                <button
                  onClick={() => setActiveSection('users')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'users' 
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'crypto' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Criptografia
                </button>
                
                <button
                  onClick={() => setActiveSection('config')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'config' 
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
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (getCurrentUserCount() / tenant.max_users) * 100 >= 90
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

                  <Separator />

                  {/* Configuração da Matriz de Riscos */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                        <Grid3x3 className="h-4 w-4" />
                        MATRIZ DE RISCOS
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingRiskMatrix(true)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>

                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Tipo:</span>
                        <Badge variant="outline">{riskMatrix.type}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Níveis de Impacto:</span>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {riskMatrix.impact_labels.join(' - ')}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Níveis de Probabilidade:</span>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {riskMatrix.likelihood_labels?.join(' - ') || 'Não configurado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

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

      {/* Dialog para Configurar Matriz de Riscos */}
      <Dialog open={isEditingRiskMatrix} onOpenChange={setIsEditingRiskMatrix}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuração da Matriz de Riscos</DialogTitle>
            <DialogDescription>
              Configure o modelo de matriz de riscos utilizado pela organizacao.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Tipo da Matriz */}
            <div>
              <Label>Tipo de Matriz</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={riskMatrix.type === '3x3' ? 'default' : 'outline'}
                  onClick={() => switchMatrixType('3x3')}
                  className="w-24"
                >
                  3x3
                </Button>
                <Button
                  type="button"
                  variant={riskMatrix.type === '4x4' ? 'default' : 'outline'}
                  onClick={() => switchMatrixType('4x4')}
                  className="w-24"
                >
                  4x4
                </Button>
                <Button
                  type="button"
                  variant={riskMatrix.type === '5x5' ? 'default' : 'outline'}
                  onClick={() => switchMatrixType('5x5')}
                  className="w-24"
                >
                  5x5
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Matriz {riskMatrix.type} oferece {riskMatrix.type === '3x3' ? '9' : riskMatrix.type === '4x4' ? '16' : '25'} combinações de risco
              </p>
            </div>

            {/* Labels de Impacto */}
            <div>
              <Label>Níveis de Impacto</Label>
              <div className="grid gap-2 mt-2">
                {riskMatrix.impact_labels.map((label, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-6">{index + 1}:</span>
                    <Input
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...riskMatrix.impact_labels];
                        newLabels[index] = e.target.value;
                        setRiskMatrix({ ...riskMatrix, impact_labels: newLabels });
                      }}
                      placeholder={`Nível de impacto ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Labels de Probabilidade */}
            <div>
              <Label>Níveis de Probabilidade</Label>
              <div className="grid gap-2 mt-2">
                {riskMatrix.likelihood_labels?.map((label, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-6">{index + 1}:</span>
                    <Input
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...(riskMatrix.likelihood_labels || [])];
                        newLabels[index] = e.target.value;
                        setRiskMatrix({ ...riskMatrix, likelihood_labels: newLabels });
                      }}
                      placeholder={`Nível de probabilidade ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview da Matriz */}
            <div>
              <Label>Preview da Matriz</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="max-w-md mx-auto">
                  {/* Matrix Container */}
                  <div className="inline-block">
                    <div className="flex">
                      <div className="flex flex-col justify-center items-center mr-2">
                        <div className="text-xs font-medium text-muted-foreground dark:text-gray-400 transform -rotate-90 whitespace-nowrap">
                          IMPACTO
                        </div>
                      </div>
                      
                      <div className="space-y-0">
                        {/* Y-axis numbers */}
                        <div className="flex">
                          <div className="flex flex-col space-y-0 mr-1">
                            {Array.from({ length: riskMatrix.type === '3x3' ? 3 : riskMatrix.type === '4x4' ? 4 : 5 }, (_, i) => {
                              const size = riskMatrix.type === '3x3' ? 3 : riskMatrix.type === '4x4' ? 4 : 5;
                              return (
                                <div key={i} className={`${riskMatrix.type === '3x3' ? 'h-10 w-10' : riskMatrix.type === '4x4' ? 'h-8 w-8' : 'h-6 w-6'} flex items-center justify-center text-xs font-medium text-muted-foreground dark:text-gray-400`}>
                                  {size - i}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Grid Matrix */}
                          <div className={`grid ${riskMatrix.type === '3x3' ? 'grid-rows-3' : riskMatrix.type === '4x4' ? 'grid-rows-4' : 'grid-rows-5'} gap-0 border-2 border-white shadow-lg`}>
                            {Array.from({ length: riskMatrix.type === '3x3' ? 3 : riskMatrix.type === '4x4' ? 4 : 5 }, (_, rowIndex) => {
                              const size = riskMatrix.type === '3x3' ? 3 : riskMatrix.type === '4x4' ? 4 : 5;
                              return (
                                <div key={rowIndex} className={`grid ${riskMatrix.type === '3x3' ? 'grid-cols-3' : riskMatrix.type === '4x4' ? 'grid-cols-4' : 'grid-cols-5'} gap-0`}>
                                  {Array.from({ length: size }, (_, colIndex) => {
                                    const probability = colIndex + 1;
                                    const impact = size - rowIndex;
                                    const riskValue = probability * impact;
                                  
                                    // Usar a mesma lógica de cores do RiskMatrix
                                    let backgroundColor = '#22c55e'; // Verde (Baixo)
                                    
                                    if (riskMatrix.type === '3x3') {
                                      // Matriz 3x3: Baixo (1-2), Médio (3-4), Alto (5-9)
                                      if (riskValue >= 5) backgroundColor = '#ef4444'; // Alto
                                      else if (riskValue >= 3) backgroundColor = '#eab308'; // Médio
                                      else backgroundColor = '#22c55e'; // Baixo
                                    } else if (riskMatrix.type === '5x5') {
                                      // Matriz 5x5: Muito Baixo (1-2), Baixo (3-4), Médio (5-8), Alto (9-16), Muito Alto (17-25)
                                      if (riskValue >= 17) backgroundColor = '#ef4444'; // Muito Alto
                                      else if (riskValue >= 9) backgroundColor = '#f97316'; // Alto
                                      else if (riskValue >= 5) backgroundColor = '#eab308'; // Médio
                                      else if (riskValue >= 3) backgroundColor = '#22c55e'; // Baixo
                                      else backgroundColor = '#3b82f6'; // Muito Baixo (azul)
                                    } else {
                                      // Matriz 4x4: Baixo (1-2), Médio (3-6), Alto (7-9), Muito Alto (10-16)
                                      if (riskValue >= 10) backgroundColor = '#ef4444'; // Muito Alto
                                      else if (riskValue >= 7) backgroundColor = '#f97316'; // Alto
                                      else if (riskValue >= 3) backgroundColor = '#eab308'; // Médio
                                      else backgroundColor = '#22c55e'; // Baixo
                                    }
                                  
                                    return (
                                      <div
                                        key={colIndex}
                                        className={`${riskMatrix.type === '3x3' ? 'h-10 w-10' : riskMatrix.type === '4x4' ? 'h-8 w-8' : 'h-6 w-6'} border-2 border-white flex items-center justify-center hover:scale-105 transition-transform`}
                                        style={{ backgroundColor }}
                                      >
                                        <span className={`${riskMatrix.type === '3x3' ? 'text-sm' : riskMatrix.type === '4x4' ? 'text-xs' : 'text-[10px]'} font-bold text-white drop-shadow-lg`}>
                                          {riskValue}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* X-axis numbers */}
                        <div className="flex justify-center mt-1">
                          <div className={`flex space-x-0 ${riskMatrix.type === '3x3' ? 'ml-11' : riskMatrix.type === '4x4' ? 'ml-9' : 'ml-7'}`}>
                            {Array.from({ length: riskMatrix.type === '3x3' ? 3 : riskMatrix.type === '4x4' ? 4 : 5 }, (_, i) => (
                              <div key={i} className={`${riskMatrix.type === '3x3' ? 'h-10 w-10' : riskMatrix.type === '4x4' ? 'h-8 w-8' : 'h-6 w-6'} flex items-center justify-center text-xs font-medium text-muted-foreground dark:text-gray-400`}>
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-center mt-1">
                          <div className="text-xs font-medium text-muted-foreground dark:text-gray-400">PROBABILIDADE</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legenda Dinâmica */}
                  <div className="mt-4">
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      {(
                        riskMatrix.type === '3x3' ? [
                          { level: 'Baixo', color: '#22c55e', range: '1-2' },
                          { level: 'Médio', color: '#eab308', range: '3-4' },
                          { level: 'Alto', color: '#ef4444', range: '5-9' }
                        ] : riskMatrix.type === '5x5' ? [
                          { level: 'Muito Baixo', color: '#3b82f6', range: '1-2' },
                          { level: 'Baixo', color: '#22c55e', range: '3-4' },
                          { level: 'Médio', color: '#eab308', range: '5-8' },
                          { level: 'Alto', color: '#f97316', range: '9-16' },
                          { level: 'Muito Alto', color: '#ef4444', range: '17-25' }
                        ] : [
                          { level: 'Baixo', color: '#22c55e', range: '1-2' },
                          { level: 'Médio', color: '#eab308', range: '3-6' },
                          { level: 'Alto', color: '#f97316', range: '7-9' },
                          { level: 'Muito Alto', color: '#ef4444', range: '10-16' }
                        ]
                      ).map(({ level, color, range }) => (
                        <div key={level} className="flex items-center space-x-1 bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm">
                          <div className="w-3 h-3 rounded border" style={{ backgroundColor: color }}></div>
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{level}</span>
                          <span className="text-[10px] text-muted-foreground">({range})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Matriz {riskMatrix.type} - {riskMatrix.type === '3x3' ? 9 : riskMatrix.type === '4x4' ? 16 : 25} combinações possíveis
                    </p>
                    <p className="text-[10px] text-muted-foreground dark:text-gray-500 mt-1">
                      {riskMatrix.type === '3x3' ? '3 níveis de risco' : riskMatrix.type === '5x5' ? '5 níveis de risco (incluindo Muito Baixo)' : '4 níveis de risco'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditingRiskMatrix(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="button" onClick={saveRiskMatrix} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configuração'}
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
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (userConfig.current_users_count / userConfig.max_users) * 100 >= 90
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
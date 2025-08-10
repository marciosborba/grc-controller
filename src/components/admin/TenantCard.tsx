import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface RiskMatrixConfig {
  type: '4x4' | '5x5';
  impact_labels: string[];
  probability_labels: string[];
  risk_levels: {
    low: number[];
    medium: number[];
    high: number[];
    critical: number[];
  };
}

const DEFAULT_RISK_MATRIX_4X4: RiskMatrixConfig = {
  type: '4x4',
  impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior'],
  probability_labels: ['Raro', 'Improvável', 'Possível', 'Provável'],
  risk_levels: {
    low: [1, 2, 4],
    medium: [3, 5, 6, 8],
    high: [7, 9, 10, 12],
    critical: [11, 13, 14, 15, 16]
  }
};

const DEFAULT_RISK_MATRIX_5X5: RiskMatrixConfig = {
  type: '5x5',
  impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico'],
  probability_labels: ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo'],
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Estados para matriz de riscos
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrixConfig>(
    (tenant.settings?.risk_matrix as RiskMatrixConfig) || DEFAULT_RISK_MATRIX_4X4
  );

  // Estados para configuração de usuários
  const [userConfig, setUserConfig] = useState({
    max_users: tenant.max_users,
    current_users_count: tenant.current_users_count
  });

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

  const getUsersUsageColor = () => {
    const percentage = (tenant.current_users_count / tenant.max_users) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const saveCompanyData = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...tenant.settings,
        company_data: companyData
      };

      const { error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'update',
        tenant_data: { settings: updatedSettings },
        tenant_id_param: tenant.id
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Dados da empresa atualizados com sucesso');
      setIsEditingCompany(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveRiskMatrix = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...tenant.settings,
        risk_matrix: riskMatrix
      };

      const { error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'update',
        tenant_data: { settings: updatedSettings },
        tenant_id_param: tenant.id
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Configuração de matriz de riscos atualizada com sucesso');
      setIsEditingRiskMatrix(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const switchMatrixType = (newType: '4x4' | '5x5') => {
    const defaultMatrix = newType === '4x4' ? DEFAULT_RISK_MATRIX_4X4 : DEFAULT_RISK_MATRIX_5X5;
    setRiskMatrix({
      ...defaultMatrix,
      // Preservar customizações se existirem
      impact_labels: riskMatrix.impact_labels.length === defaultMatrix.impact_labels.length 
        ? riskMatrix.impact_labels 
        : defaultMatrix.impact_labels,
      probability_labels: riskMatrix.probability_labels.length === defaultMatrix.probability_labels.length
        ? riskMatrix.probability_labels
        : defaultMatrix.probability_labels
    });
  };

  const saveUserConfig = async () => {
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

  return (
    <Card className={`w-full transition-all duration-300 ${isExpanded ? 'bg-gray-200 dark:bg-gray-700 shadow-xl ring-2 ring-gray-400 dark:ring-gray-500 border-gray-400 dark:border-gray-500' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors py-3 px-4 ${isExpanded ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div>
                  <CardTitle className="text-lg font-semibold">{tenant.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{tenant.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${getUsersUsageColor()}`}>
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{tenant.current_users_count}</span>
                    <span className="text-muted-foreground">/ {tenant.max_users}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {getPlanBadge()}
                    {getStatusBadge()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">INFORMAÇÕES BÁSICAS</h4>
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
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Criado em: {new Date(tenant.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dados Cadastrais da Empresa */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
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

              <Separator />

              {/* Configuração de Usuários */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    CONFIGURAÇÃO DE USUÁRIOS
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
                    <span className="font-medium">Usuários Ativos:</span>
                    <div className={`text-lg font-bold ${getUsersUsageColor()}`}>
                      {tenant.current_users_count}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Limite Máximo:</span>
                    <div className="text-lg font-bold text-gray-600">
                      {tenant.max_users}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Taxa de Utilização:</span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (tenant.current_users_count / tenant.max_users) * 100 >= 90
                              ? 'bg-red-500'
                              : (tenant.current_users_count / tenant.max_users) * 100 >= 75
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (tenant.current_users_count / tenant.max_users) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium min-w-12">
                        {Math.round((tenant.current_users_count / tenant.max_users) * 100)}%
                      </span>
                    </div>
                  </div>
                  {tenant.current_users_count >= tenant.max_users * 0.9 && (
                    <div className="md:col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Activity className="h-4 w-4" />
                        <span className="font-medium">Atenção:</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Este tenant está próximo do limite de usuários. Consider aumentar o limite para evitar bloqueios.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Configuração da Matriz de Riscos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
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
                        {riskMatrix.impact_labels.join(' • ')}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Níveis de Probabilidade:</span>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {riskMatrix.probability_labels.join(' • ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ações */}
              <div className="flex items-center justify-end gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={tenant.current_users_count > 0 || isDeleting}
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

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
            <Button onClick={saveCompanyData} disabled={isSaving}>
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
              Configure o modelo de matriz de riscos utilizado pela organização.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Tipo da Matriz */}
            <div>
              <Label>Tipo de Matriz</Label>
              <div className="flex gap-4 mt-2">
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
                Matriz {riskMatrix.type} oferece {riskMatrix.type === '4x4' ? '16' : '25'} combinações de risco
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
                {riskMatrix.probability_labels.map((label, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-6">{index + 1}:</span>
                    <Input
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...riskMatrix.probability_labels];
                        newLabels[index] = e.target.value;
                        setRiskMatrix({ ...riskMatrix, probability_labels: newLabels });
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
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                <div className="grid gap-1" style={{ 
                  gridTemplateColumns: `auto repeat(${riskMatrix.type === '4x4' ? 4 : 5}, 1fr)` 
                }}>
                  {/* Header */}
                  <div></div>
                  {riskMatrix.impact_labels.map((label, index) => (
                    <div key={index} className="text-xs font-medium text-center p-2 bg-white rounded">
                      {label}
                    </div>
                  ))}
                  
                  {/* Rows */}
                  {riskMatrix.probability_labels.map((probLabel, probIndex) => (
                    <React.Fragment key={probIndex}>
                      <div className="text-xs font-medium p-2 bg-white rounded">
                        {probLabel}
                      </div>
                      {riskMatrix.impact_labels.map((impactLabel, impactIndex) => {
                        const riskValue = (probIndex + 1) * (impactIndex + 1);
                        let bgColor = 'bg-green-100';
                        
                        if (riskMatrix.risk_levels.critical.includes(riskValue)) bgColor = 'bg-red-200';
                        else if (riskMatrix.risk_levels.high.includes(riskValue)) bgColor = 'bg-orange-200';
                        else if (riskMatrix.risk_levels.medium.includes(riskValue)) bgColor = 'bg-yellow-200';
                        
                        return (
                          <div key={impactIndex} className={`text-xs text-center p-2 rounded ${bgColor}`}>
                            {riskValue}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditingRiskMatrix(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveRiskMatrix} disabled={isSaving}>
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
                <li>• O limite máximo deve ser pelo menos igual aos usuários atuais</li>
                <li>• Reduzir o limite não remove usuários existentes automaticamente</li>
                <li>• O sistema irá impedir novos cadastros se o limite for atingido</li>
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
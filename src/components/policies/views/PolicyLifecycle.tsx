import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  AlertTriangle,
  Clock,
  RefreshCw,
  Archive,
  FileText,
  User,
  Bell,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Policy, PolicyFilters, AlexPolicyConfig } from '@/types/policy-management';

interface PolicyLifecycleProps {
  policies: Policy[];
  onPolicyUpdate: () => void;
  alexConfig: AlexPolicyConfig;
  searchTerm: string;
  filters: PolicyFilters;
}

interface LifecycleAction {
  id: string;
  policy_id: string;
  action_type: 'review' | 'renewal' | 'archive' | 'extend';
  scheduled_date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export const PolicyLifecycle: React.FC<PolicyLifecycleProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig,
  searchTerm,
  filters
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [lifecycleActions, setLifecycleActions] = useState<LifecycleAction[]>([]);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [extensionMonths, setExtensionMonths] = useState(12);
  const [loading, setLoading] = useState(false);

  // Filtrar políticas baseado na busca
  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categorizar políticas por status de validade
  const categorizedPolicies = {
    expiring_soon: filteredPolicies.filter(policy => {
      if (!policy.expiry_date) return false;
      const expiryDate = new Date(policy.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }),
    expired: filteredPolicies.filter(policy => {
      if (!policy.expiry_date) return false;
      return new Date(policy.expiry_date) < new Date();
    }),
    active: filteredPolicies.filter(policy => {
      if (!policy.expiry_date) return true;
      const expiryDate = new Date(policy.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate > thirtyDaysFromNow;
    })
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
    }
  };

  const getExpiryStatus = (policy: Policy) => {
    if (!policy.expiry_date) return { status: 'no_expiry', color: 'text-gray-500', days: null };
    
    const expiryDate = new Date(policy.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', color: 'text-red-600', days: Math.abs(diffDays) };
    } else if (diffDays <= 30) {
      return { status: 'expiring_soon', color: 'text-orange-600', days: diffDays };
    } else {
      return { status: 'active', color: 'text-green-600', days: diffDays };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleExtendPolicy = async () => {
    if (!selectedPolicy) return;

    setLoading(true);
    try {
      const currentExpiryDate = new Date(selectedPolicy.expiry_date || new Date());
      const newExpiryDate = new Date(currentExpiryDate);
      newExpiryDate.setMonth(newExpiryDate.getMonth() + extensionMonths);

      const { error } = await supabase
        .from('policies')
        .update({
          expiry_date: newExpiryDate.toISOString().split('T')[0],
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPolicy.id);

      if (error) throw error;

      // Registrar ação no histórico
      await supabase
        .from('policy_change_history')
        .insert({
          policy_id: selectedPolicy.id,
          change_type: 'extension',
          change_description: `Validade estendida por ${extensionMonths} meses`,
          reason: 'Extensão de validade',
          impact_assessment: 'Baixo - extensão de prazo',
          changed_by: user?.id,
          tenant_id: user?.tenant?.id
        });

      toast({
        title: 'Validade Estendida',
        description: `Política válida até ${formatDate(newExpiryDate.toISOString())}`
      });

      setShowExtendDialog(false);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao estender validade:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao estender validade da política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenewPolicy = async () => {
    if (!selectedPolicy) return;

    setLoading(true);
    try {
      // Criar nova versão da política
      const newVersion = parseFloat(selectedPolicy.version) + 0.1;
      
      const { error } = await supabase
        .from('policies')
        .update({
          version: newVersion.toFixed(1),
          status: 'draft',
          workflow_stage: 'elaboration',
          expiry_date: null,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPolicy.id);

      if (error) throw error;

      // Registrar renovação no histórico
      await supabase
        .from('policy_change_history')
        .insert({
          policy_id: selectedPolicy.id,
          change_type: 'renewal',
          change_description: `Política renovada para versão ${newVersion.toFixed(1)}`,
          reason: 'Renovação periódica',
          impact_assessment: 'Médio - nova versão para revisão',
          changed_by: user?.id,
          tenant_id: user?.tenant?.id
        });

      toast({
        title: 'Política Renovada',
        description: `Nova versão ${newVersion.toFixed(1)} criada para revisão`
      });

      setShowRenewalDialog(false);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao renovar política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao renovar política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchivePolicy = async (policyId: string) => {
    if (!confirm('Tem certeza que deseja arquivar esta política?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          status: 'archived',
          is_active: false,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: 'Política Arquivada',
        description: 'Política arquivada com sucesso'
      });

      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao arquivar política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao arquivar política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLifecycleReport = () => {
    const report = {
      total_policies: filteredPolicies.length,
      expiring_soon: categorizedPolicies.expiring_soon.length,
      expired: categorizedPolicies.expired.length,
      active: categorizedPolicies.active.length,
      renewal_rate: categorizedPolicies.active.length / filteredPolicies.length * 100,
      average_lifecycle: 365 // dias
    };
    return report;
  };

  const report = generateLifecycleReport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Gestão de Validade
          </h2>
          <p className="text-muted-foreground">
            Controle de vencimento, renovação e arquivamento inteligente
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Configurar Alertas
          </Button>
        </div>
      </div>

      {/* Alex Policy Integration */}
      {alexConfig.enabled && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Alex Policy - Gestão de Ciclo de Vida</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitoramento inteligente e recomendações de renovação
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Calendar className="h-3 w-3 mr-1" />
                  Monitoramento Ativo
                </Badge>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Consultar IA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de Ciclo de Vida */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total de Políticas</p>
                <p className="text-3xl font-bold text-foreground">{report.total_policies}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Vencendo em 30 dias</p>
                <p className="text-3xl font-bold text-orange-600">{report.expiring_soon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Expiradas</p>
                <p className="text-3xl font-bold text-red-600">{report.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Taxa de Renovação</p>
                <p className="text-3xl font-bold text-green-600">{report.renewal_rate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Categorias */}
      <Tabs defaultValue="expiring_soon" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expiring_soon" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Vencendo ({categorizedPolicies.expiring_soon.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Expiradas ({categorizedPolicies.expired.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Ativas ({categorizedPolicies.active.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Todas ({filteredPolicies.length})
          </TabsTrigger>
        </TabsList>

        {/* Políticas Vencendo */}
        <TabsContent value="expiring_soon" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categorizedPolicies.expiring_soon.map((policy) => {
              const expiryInfo = getExpiryStatus(policy);
              return (
                <Card key={policy.id} className="border-orange-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{policy.title}</CardTitle>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {expiryInfo.days} dias restantes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Categoria</Label>
                        <p className="text-muted-foreground">{policy.category}</p>
                      </div>
                      <div>
                        <Label>Versão</Label>
                        <p className="text-muted-foreground">v{policy.version}</p>
                      </div>
                      <div>
                        <Label>Data de Expiração</Label>
                        <p className="text-orange-600 font-medium">
                          {policy.expiry_date ? formatDate(policy.expiry_date) : 'Não definida'}
                        </p>
                      </div>
                      <div>
                        <Label>Próxima Revisão</Label>
                        <p className="text-muted-foreground">
                          {policy.next_review_date ? formatDate(policy.next_review_date) : 'Não agendada'}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog open={showExtendDialog && selectedPolicy?.id === policy.id} onOpenChange={setShowExtendDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPolicy(policy)}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Estender
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Estender Validade</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Período de Extensão (meses)</Label>
                              <Input
                                type="number"
                                value={extensionMonths}
                                onChange={(e) => setExtensionMonths(parseInt(e.target.value) || 12)}
                                min="1"
                                max="36"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleExtendPolicy} disabled={loading}>
                                {loading ? 'Estendendo...' : 'Estender Validade'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showRenewalDialog && selectedPolicy?.id === policy.id} onOpenChange={setShowRenewalDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => setSelectedPolicy(policy)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Renovar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Renovar Política</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              A renovação criará uma nova versão da política que passará pelo processo de revisão e aprovação.
                            </p>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setShowRenewalDialog(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleRenewPolicy} disabled={loading}>
                                {loading ? 'Renovando...' : 'Iniciar Renovação'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArchivePolicy(policy.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {categorizedPolicies.expiring_soon.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Excelente!</h3>
                <p className="text-muted-foreground">Nenhuma política vencendo nos próximos 30 dias</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Políticas Expiradas */}
        <TabsContent value="expired" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categorizedPolicies.expired.map((policy) => {
              const expiryInfo = getExpiryStatus(policy);
              return (
                <Card key={policy.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{policy.title}</CardTitle>
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Expirada há {expiryInfo.days} dias
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Categoria</Label>
                        <p className="text-muted-foreground">{policy.category}</p>
                      </div>
                      <div>
                        <Label>Versão</Label>
                        <p className="text-muted-foreground">v{policy.version}</p>
                      </div>
                      <div>
                        <Label>Data de Expiração</Label>
                        <p className="text-red-600 font-medium">
                          {policy.expiry_date ? formatDate(policy.expiry_date) : 'Não definida'}
                        </p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge className={getStatusColor('expired')}>
                          Expirada
                        </Badge>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowRenewalDialog(true);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renovar Urgente
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArchivePolicy(policy.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {categorizedPolicies.expired.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Perfeito!</h3>
                <p className="text-muted-foreground">Nenhuma política expirada</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Políticas Ativas */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {categorizedPolicies.active.map((policy) => {
              const expiryInfo = getExpiryStatus(policy);
              return (
                <Card key={policy.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm truncate flex-1">{policy.title}</h4>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-3 w-3" />
                          <span>{policy.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {policy.expiry_date 
                              ? `Válida até ${formatDate(policy.expiry_date)}`
                              : 'Sem data de expiração'
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3" />
                          <span>v{policy.version}</span>
                        </div>
                      </div>

                      {policy.expiry_date && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Tempo restante</span>
                            <span className={expiryInfo.color}>
                              {expiryInfo.days} dias
                            </span>
                          </div>
                          <Progress 
                            value={Math.max(0, Math.min(100, (expiryInfo.days || 0) / 365 * 100))} 
                            className="h-1" 
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {categorizedPolicies.active.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">Nenhuma política ativa</h3>
                <p className="text-muted-foreground">Todas as políticas precisam de atenção</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Todas as Políticas */}
        <TabsContent value="all" className="space-y-4">
          <div className="space-y-3">
            {filteredPolicies.map((policy) => {
              const expiryInfo = getExpiryStatus(policy);
              return (
                <Card key={policy.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{policy.title}</h4>
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${expiryInfo.color}`}>
                            {expiryInfo.status === 'expired' ? `Expirada há ${expiryInfo.days} dias` :
                             expiryInfo.status === 'expiring_soon' ? `${expiryInfo.days} dias restantes` :
                             expiryInfo.status === 'active' ? `${expiryInfo.days} dias restantes` :
                             'Sem expiração'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>Categoria: {policy.category}</div>
                          <div>Versão: v{policy.version}</div>
                          <div>
                            Expiração: {policy.expiry_date ? formatDate(policy.expiry_date) : 'Não definida'}
                          </div>
                          <div>
                            Atualizada: {formatDate(policy.updated_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {expiryInfo.status === 'expiring_soon' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setShowExtendDialog(true);
                            }}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Estender
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setShowRenewalDialog(true);
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renovar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Alex Policy Insights */}
      {alexConfig.enabled && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Insights de Ciclo de Vida Alex Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Taxa de renovação dentro do esperado</span>
                </div>
                <Badge variant="outline" className="text-green-600">Saudável</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Considere automatizar lembretes de renovação</span>
                </div>
                <Badge variant="outline" className="text-yellow-600">Sugestão</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Padrão de renovação indica boa gestão</span>
                </div>
                <Badge variant="outline" className="text-blue-600">Insight</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyLifecycle;
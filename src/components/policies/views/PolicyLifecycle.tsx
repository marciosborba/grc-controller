import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  AlertTriangle,
  Clock,
  RefreshCw,
  Archive,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PolicyLifecycleProps {
  policies: any[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
}

const PolicyLifecycle: React.FC<PolicyLifecycleProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [newReviewDate, setNewReviewDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Calcular políticas por status de ciclo de vida
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoon = policies.filter(p => {
    if (!p.expiry_date) return false;
    const expiryDate = new Date(p.expiry_date);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
  });

  const needingReview = policies.filter(p => {
    if (!p.next_review_date) return false;
    const reviewDate = new Date(p.next_review_date);
    return reviewDate <= thirtyDaysFromNow && reviewDate >= today;
  });

  const expired = policies.filter(p => {
    if (!p.expiry_date) return false;
    const expiryDate = new Date(p.expiry_date);
    return expiryDate < today;
  });

  const active = policies.filter(p => p.status === 'published' && !expired.includes(p));

  const handleUpdateDates = async (policyId: string) => {
    if (!newReviewDate && !newExpiryDate) {
      toast({
        title: "Nenhuma alteração",
        description: "Por favor, defina pelo menos uma nova data",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (newReviewDate) {
        updateData.next_review_date = newReviewDate;
      }
      if (newExpiryDate) {
        updateData.expiry_date = newExpiryDate;
      }

      const { error } = await supabase
        .from('policies')
        .update(updateData)
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Datas atualizadas",
        description: "As datas da política foram atualizadas com sucesso",
      });

      setNewReviewDate('');
      setNewExpiryDate('');
      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao atualizar datas:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar datas da política",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchivePolicy = async (policyId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          status: 'archived',
          is_active: false,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Política arquivada",
        description: "A política foi arquivada com sucesso",
      });

      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao arquivar política:', error);
      toast({
        title: "Erro",
        description: "Erro ao arquivar política",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getLifecycleStatus = (policy: any) => {
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (policy.expiry_date) {
      const expiryDate = new Date(policy.expiry_date);
      if (expiryDate < today) {
        return { status: 'expired', label: 'Expirada', color: 'destructive', icon: XCircle };
      }
      if (expiryDate <= thirtyDays) {
        return { status: 'expiring', label: 'Expirando', color: 'destructive', icon: AlertTriangle };
      }
    }

    if (policy.next_review_date) {
      const reviewDate = new Date(policy.next_review_date);
      if (reviewDate <= thirtyDays) {
        return { status: 'review_due', label: 'Revisão Pendente', color: 'default', icon: Clock };
      }
    }

    if (policy.status === 'published') {
      return { status: 'active', label: 'Ativa', color: 'default', icon: CheckCircle };
    }

    return { status: 'draft', label: 'Rascunho', color: 'secondary', icon: Clock };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntil = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ciclo de Vida das Políticas</h2>
          <p className="text-muted-foreground">
            Gerencie validade, revisões e arquivamento de políticas
          </p>
        </div>
      </div>

      {/* Estatísticas do ciclo de vida */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{active.length}</div>
                <div className="text-sm text-muted-foreground">Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{needingReview.length}</div>
                <div className="text-sm text-muted-foreground">Precisam Revisão</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{expiringSoon.length}</div>
                <div className="text-sm text-muted-foreground">Expirando</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{expired.length}</div>
                <div className="text-sm text-muted-foreground">Expiradas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de políticas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Políticas por Status</h3>
          
          {/* Políticas expiradas */}
          {expired.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-red-600 mb-2">Expiradas ({expired.length})</h4>
              <div className="space-y-2">
                {expired.map((policy) => {
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card 
                      key={policy.id} 
                      className={`cursor-pointer transition-all hover:shadow-md border-red-200 ${
                        selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Expirou em: {formatDate(policy.expiry_date)}
                            </div>
                          </div>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {lifecycleStatus.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Políticas expirando */}
          {expiringSoon.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-orange-600 mb-2">Expirando em Breve ({expiringSoon.length})</h4>
              <div className="space-y-2">
                {expiringSoon.map((policy) => {
                  const daysUntil = getDaysUntil(policy.expiry_date);
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card 
                      key={policy.id} 
                      className={`cursor-pointer transition-all hover:shadow-md border-orange-200 ${
                        selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Expira em {daysUntil} dia(s) - {formatDate(policy.expiry_date)}
                            </div>
                          </div>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {daysUntil}d
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Políticas precisando revisão */}
          {needingReview.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-yellow-600 mb-2">Precisam Revisão ({needingReview.length})</h4>
              <div className="space-y-2">
                {needingReview.map((policy) => {
                  const daysUntil = getDaysUntil(policy.next_review_date);
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card 
                      key={policy.id} 
                      className={`cursor-pointer transition-all hover:shadow-md border-yellow-200 ${
                        selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Revisão em {daysUntil} dia(s) - {formatDate(policy.next_review_date)}
                            </div>
                          </div>
                          <Badge variant="default" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {daysUntil}d
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Políticas ativas */}
          {active.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-green-600 mb-2">Ativas ({active.length})</h4>
              <div className="space-y-2">
                {active.slice(0, 5).map((policy) => {
                  const lifecycleStatus = getLifecycleStatus(policy);
                  const Icon = lifecycleStatus.icon;
                  return (
                    <Card 
                      key={policy.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{policy.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Categoria: {policy.category}
                            </div>
                          </div>
                          <Badge variant="default" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {lifecycleStatus.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel de gestão */}
        <div className="space-y-4">
          {selectedPolicy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Gestão: {selectedPolicy.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Status atual */}
                  <div>
                    <label className="text-sm font-medium">Status Atual</label>
                    <div className="mt-1">
                      {(() => {
                        const lifecycleStatus = getLifecycleStatus(selectedPolicy);
                        const Icon = lifecycleStatus.icon;
                        return (
                          <Badge variant={lifecycleStatus.color as any} className="flex items-center gap-1 w-fit">
                            <Icon className="h-3 w-3" />
                            {lifecycleStatus.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Datas atuais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Data de Vigência</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedPolicy.effective_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data de Expiração</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedPolicy.expiry_date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Próxima Revisão</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedPolicy.next_review_date)}
                    </p>
                  </div>

                  {/* Atualizar datas */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Nova Data de Revisão</label>
                      <Input
                        type="date"
                        value={newReviewDate}
                        onChange={(e) => setNewReviewDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Nova Data de Expiração</label>
                      <Input
                        type="date"
                        value={newExpiryDate}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleUpdateDates(selectedPolicy.id)}
                      disabled={isUpdating || (!newReviewDate && !newExpiryDate)}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar Datas
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleArchivePolicy(selectedPolicy.id)}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar Política
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas e notificações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Alertas Configurados
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Alerta 30 dias antes da expiração</span>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Alerta 15 dias antes da revisão</span>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Notificação de expiração</span>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Política</h3>
                <p className="text-muted-foreground">
                  Clique em uma política na lista para gerenciar seu ciclo de vida
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyLifecycle;
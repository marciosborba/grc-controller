import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  AlertTriangle, 
  Clock,
  FileText,
  RefreshCw,
  Archive,
  CheckCircle,
  Bell,
  TrendingUp,
  Eye,
  Settings,
  Target
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { PolicyV2 } from '@/types/policy-management-v2';

interface PolicyValidityViewProps {
  onValidityUpdated: (policy: PolicyV2) => void;
}

const PolicyValidityView: React.FC<PolicyValidityViewProps> = ({
  onValidityUpdated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [policies, setPolicies] = useState<PolicyV2[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyV2 | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newReviewDate, setNewReviewDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'expiring' | 'expired' | 'review_due'>('expiring');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    // Mock data
    const mockPolicies: PolicyV2[] = [
      {
        id: '1',
        tenant_id: user?.tenant?.id || '',
        title: 'Política de Backup e Recuperação',
        description: 'Procedimentos para backup e recuperação de dados',
        category: 'security',
        policy_type: 'procedure',
        priority: 'high',
        status: 'published',
        workflow_stage: 'validity_management',
        version: '1.2',
        is_current_version: true,
        created_by: 'user-1',
        requires_acknowledgment: true,
        is_mandatory: true,
        applies_to_all_users: true,
        ai_generated: false,
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 dias
        review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 dias
      },
      {
        id: '2',
        tenant_id: user?.tenant?.id || '',
        title: 'Manual de Procedimentos Financeiros',
        description: 'Procedimentos para gestão financeira',
        category: 'finance',
        policy_type: 'manual',
        priority: 'medium',
        status: 'expired',
        workflow_stage: 'validity_management',
        version: '2.1',
        is_current_version: true,
        created_by: 'user-2',
        requires_acknowledgment: false,
        is_mandatory: true,
        applies_to_all_users: false,
        ai_generated: false,
        created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        expiry_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expirada há 5 dias
        review_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: '3',
        tenant_id: user?.tenant?.id || '',
        title: 'Política de Gestão de Fornecedores',
        description: 'Diretrizes para seleção e gestão de fornecedores',
        category: 'operations',
        policy_type: 'policy',
        priority: 'medium',
        status: 'published',
        workflow_stage: 'validity_management',
        version: '1.0',
        is_current_version: true,
        created_by: 'user-3',
        requires_acknowledgment: true,
        is_mandatory: true,
        applies_to_all_users: false,
        ai_generated: true,
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 dias
        review_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 dias
      }
    ];

    setPolicies(mockPolicies);
    if (mockPolicies.length > 0) {
      setSelectedPolicy(mockPolicies[0]);
      setNewExpiryDate(mockPolicies[0].expiry_date || '');
      setNewReviewDate(mockPolicies[0].review_date || '');
    }
  };

  const updateValidity = async () => {
    if (!selectedPolicy) return;

    setIsUpdating(true);
    
    try {
      // Simular atualização
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedPolicy: PolicyV2 = {
        ...selectedPolicy,
        expiry_date: newExpiryDate,
        review_date: newReviewDate,
        updated_at: new Date().toISOString()
      };

      onValidityUpdated(updatedPolicy);

      // Atualizar lista local
      setPolicies(prev => prev.map(p => p.id === selectedPolicy.id ? updatedPolicy : p));
      setSelectedPolicy(updatedPolicy);

      toast({
        title: '✅ Validade Atualizada',
        description: 'Datas de validade e revisão foram atualizadas com sucesso',
      });

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar validade',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renewPolicy = async (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

    try {
      // Simular renovação automática
      const newExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +1 ano
      const newReviewDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +6 meses

      const updatedPolicy: PolicyV2 = {
        ...policy,
        expiry_date: newExpiryDate,
        review_date: newReviewDate,
        status: 'published',
        updated_at: new Date().toISOString()
      };

      setPolicies(prev => prev.map(p => p.id === policyId ? updatedPolicy : p));

      toast({
        title: '🔄 Política Renovada',
        description: `${policy.title} foi renovada automaticamente`,
      });

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao renovar política',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (policy: PolicyV2) => {
    if (policy.status === 'expired') return 'bg-red-100 text-red-800';
    
    if (policy.expiry_date) {
      const daysToExpiry = differenceInDays(new Date(policy.expiry_date), new Date());
      if (daysToExpiry <= 0) return 'bg-red-100 text-red-800';
      if (daysToExpiry <= 30) return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (policy: PolicyV2) => {
    if (policy.status === 'expired') return 'Expirada';
    
    if (policy.expiry_date) {
      const daysToExpiry = differenceInDays(new Date(policy.expiry_date), new Date());
      if (daysToExpiry <= 0) return 'Expirada';
      if (daysToExpiry <= 30) return `Expira em ${daysToExpiry} dias`;
    }
    
    return 'Vigente';
  };

  const filteredPolicies = policies.filter(policy => {
    switch (filter) {
      case 'expiring':
        if (policy.expiry_date) {
          const daysToExpiry = differenceInDays(new Date(policy.expiry_date), new Date());
          return daysToExpiry > 0 && daysToExpiry <= 30;
        }
        return false;
      case 'expired':
        return policy.status === 'expired' || (policy.expiry_date && differenceInDays(new Date(policy.expiry_date), new Date()) <= 0);
      case 'review_due':
        if (policy.review_date) {
          const daysToReview = differenceInDays(new Date(policy.review_date), new Date());
          return daysToReview <= 7;
        }
        return false;
      default:
        return true;
    }
  });

  const stats = {
    total: policies.length,
    expiring: policies.filter(p => {
      if (p.expiry_date) {
        const days = differenceInDays(new Date(p.expiry_date), new Date());
        return days > 0 && days <= 30;
      }
      return false;
    }).length,
    expired: policies.filter(p => p.status === 'expired' || (p.expiry_date && differenceInDays(new Date(p.expiry_date), new Date()) <= 0)).length,
    reviewDue: policies.filter(p => {
      if (p.review_date) {
        const days = differenceInDays(new Date(p.review_date), new Date());
        return days <= 7;
      }
      return false;
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Gestão da Validade</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Controle de vigência e renovação de políticas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.expiring}</div>
                <p className="text-xs text-muted-foreground">Expirando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.expired}</div>
                <p className="text-xs text-muted-foreground">Expiradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.reviewDue}</div>
                <p className="text-xs text-muted-foreground">Revisão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({stats.total})
            </Button>
            <Button
              variant={filter === 'expiring' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('expiring')}
            >
              Expirando ({stats.expiring})
            </Button>
            <Button
              variant={filter === 'expired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('expired')}
            >
              Expiradas ({stats.expired})
            </Button>
            <Button
              variant={filter === 'review_due' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('review_due')}
            >
              Revisão ({stats.reviewDue})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Policy List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Políticas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPolicies.length > 0 ? (
                <div className="space-y-1">
                  {filteredPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                        selectedPolicy?.id === policy.id 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'border-transparent'
                      }`}
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setNewExpiryDate(policy.expiry_date || '');
                        setNewReviewDate(policy.review_date || '');
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm">{policy.title}</h3>
                          <Badge className={`text-xs ${getStatusColor(policy)}`}>
                            {getStatusText(policy)}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {policy.description}
                        </p>
                        
                        <div className="space-y-1">
                          {policy.expiry_date && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Expira: {new Date(policy.expiry_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                          {policy.review_date && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>Revisão: {new Date(policy.review_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>

                        {(policy.status === 'expired' || (policy.expiry_date && differenceInDays(new Date(policy.expiry_date), new Date()) <= 0)) && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              renewPolicy(policy.id);
                            }}
                            className="w-full text-xs h-6"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Renovar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma política encontrada
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Validity Management */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPolicy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>{selectedPolicy.title}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedPolicy.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Versão:</span> {selectedPolicy.version}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {getStatusText(selectedPolicy)}
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span> {selectedPolicy.category}
                    </div>
                    <div>
                      <span className="font-medium">Prioridade:</span> {selectedPolicy.priority}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Atualizar Validade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Expiração</label>
                      <Input
                        type="date"
                        value={newExpiryDate}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                      />
                      {selectedPolicy.expiry_date && (
                        <p className="text-xs text-muted-foreground">
                          Atual: {new Date(selectedPolicy.expiry_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Revisão</label>
                      <Input
                        type="date"
                        value={newReviewDate}
                        onChange={(e) => setNewReviewDate(e.target.value)}
                      />
                      {selectedPolicy.review_date && (
                        <p className="text-xs text-muted-foreground">
                          Atual: {new Date(selectedPolicy.review_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={updateValidity} 
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Atualizar Validade
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => renewPolicy(selectedPolicy.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renovar Automaticamente
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Validity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Cronograma de Validade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Criada</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(selectedPolicy.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    
                    {selectedPolicy.review_date && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Próxima Revisão</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedPolicy.review_date), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    )}
                    
                    {selectedPolicy.expiry_date && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        differenceInDays(new Date(selectedPolicy.expiry_date), new Date()) <= 30 
                          ? 'bg-red-50' 
                          : 'bg-yellow-50'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            differenceInDays(new Date(selectedPolicy.expiry_date), new Date()) <= 30 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                          }`} />
                          <span className="text-sm font-medium">Expiração</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedPolicy.expiry_date), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Política</h3>
                <p className="text-muted-foreground text-center">
                  Escolha uma política da lista para gerenciar sua validade
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyValidityView;
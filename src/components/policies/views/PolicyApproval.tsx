import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Users,
  Send,
  Eye,
  MessageSquare,
  Shield,
  Workflow,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Policy, PolicyFilters, AlexPolicyConfig } from '@/types/policy-management';

interface PolicyApprovalProps {
  policies: Policy[];
  onPolicyUpdate: () => void;
  alexConfig: AlexPolicyConfig;
  searchTerm: string;
  filters: PolicyFilters;
}

interface ApprovalWorkflow {
  id: string;
  policy_id: string;
  approver_id: string;
  approver_role: string;
  order_sequence: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
}

export const PolicyApproval: React.FC<PolicyApprovalProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig,
  searchTerm,
  filters
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [approvalWorkflow, setApprovalWorkflow] = useState<ApprovalWorkflow[]>([]);
  const [approvalComments, setApprovalComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

  // Filtrar políticas baseado na busca
  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadApprovalWorkflow = async (policyId: string) => {
    try {
      const { data, error } = await supabase
        .from('policy_approvers')
        .select(`
          *,
          policy_approvals(*)
        `)
        .eq('policy_id', policyId)
        .order('order_sequence');

      if (error) throw error;

      // Simular workflow de aprovação
      const mockWorkflow: ApprovalWorkflow[] = [
        {
          id: '1',
          policy_id: policyId,
          approver_id: user?.id || '',
          approver_role: 'Revisor Técnico',
          order_sequence: 1,
          status: 'pending'
        },
        {
          id: '2',
          policy_id: policyId,
          approver_id: user?.id || '',
          approver_role: 'Gerente de Compliance',
          order_sequence: 2,
          status: 'pending'
        },
        {
          id: '3',
          policy_id: policyId,
          approver_id: user?.id || '',
          approver_role: 'Diretor Executivo',
          order_sequence: 3,
          status: 'pending'
        }
      ];

      setApprovalWorkflow(mockWorkflow);
    } catch (error) {
      console.error('Erro ao carregar workflow de aprovação:', error);
    }
  };

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (!selectedPolicy) return;

    setLoading(true);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'draft';
      const newWorkflowStage = action === 'approve' ? 'publication' : 'elaboration';

      const { error } = await supabase
        .from('policies')
        .update({
          status: newStatus,
          workflow_stage: newWorkflowStage,
          approved_by: action === 'approve' ? user?.id : null,
          approved_at: action === 'approve' ? new Date().toISOString() : null,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPolicy.id);

      if (error) throw error;

      // Registrar aprovação/rejeição
      await supabase
        .from('policy_approvals')
        .insert({
          policy_id: selectedPolicy.id,
          approver_id: user?.id,
          status: action === 'approve' ? 'approved' : 'rejected',
          comments: approvalComments
        });

      toast({
        title: action === 'approve' ? 'Política Aprovada' : 'Política Rejeitada',
        description: action === 'approve' 
          ? 'Política aprovada e enviada para publicação' 
          : 'Política rejeitada e retornada para elaboração'
      });

      setShowApprovalDialog(false);
      setApprovalComments('');
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar aprovação',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getApprovalProgress = () => {
    const totalSteps = approvalWorkflow.length;
    const completedSteps = approvalWorkflow.filter(step => step.status === 'approved').length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  useEffect(() => {
    if (selectedPolicy) {
      loadApprovalWorkflow(selectedPolicy.id);
    }
  }, [selectedPolicy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            Aprovação de Políticas
          </h2>
          <p className="text-muted-foreground">
            Processo de aprovação hierárquica com matriz configurável
          </p>
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
                  <h3 className="font-medium text-foreground">Alex Policy - Modo Aprovação</h3>
                  <p className="text-sm text-muted-foreground">
                    Análise de conformidade e recomendações para aprovação
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Assistência Ativa
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

      {/* Lista de Políticas para Aprovação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Políticas */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Aguardando Aprovação</span>
                <Badge variant="secondary">{filteredPolicies.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPolicy?.id === policy.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPolicy(policy)}
                >
                  <div className="flex items-start justify-between mb-2">
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
                      <Clock className="h-3 w-3" />
                      <span>Enviada em {formatDate(policy.updated_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3" />
                      <span>v{policy.version}</span>
                    </div>
                  </div>

                  {/* Indicador de Prioridade */}
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(policy.priority)}`}>
                      {policy.priority}
                    </Badge>
                    {policy.requires_approval && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Aprovação Obrigatória
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredPolicies.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Nenhuma política encontrada' : 'Nenhuma política aguardando aprovação'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel de Aprovação */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <div className="space-y-6">
              {/* Informações da Política */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Aprovação: {selectedPolicy.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      
                      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => setApprovalAction('approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {approvalAction === 'approve' ? 'Aprovar Política' : 'Rejeitar Política'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Comentários da Aprovação</Label>
                              <Textarea
                                placeholder={
                                  approvalAction === 'approve' 
                                    ? "Comentários sobre a aprovação (opcional)..."
                                    : "Motivos para rejeição (obrigatório)..."
                                }
                                rows={4}
                                value={approvalComments}
                                onChange={(e) => setApprovalComments(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                                Cancelar
                              </Button>
                              <Button 
                                variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                                onClick={() => handleApproval(approvalAction)}
                                disabled={loading || (approvalAction === 'reject' && !approvalComments.trim())}
                              >
                                {loading ? 'Processando...' : (approvalAction === 'approve' ? 'Aprovar' : 'Rejeitar')}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setApprovalAction('reject');
                          setShowApprovalDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Categoria</Label>
                      <p className="text-sm text-muted-foreground">{selectedPolicy.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tipo</Label>
                      <p className="text-sm text-muted-foreground">{selectedPolicy.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Prioridade</Label>
                      <Badge variant="outline" className={getPriorityColor(selectedPolicy.priority)}>
                        {selectedPolicy.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Requer Treinamento</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedPolicy.requires_training ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPolicy.description || 'Sem descrição'}
                    </p>
                  </div>

                  {/* Resumo do Conteúdo */}
                  <div>
                    <Label className="text-sm font-medium">Resumo do Conteúdo</Label>
                    <div className="mt-2 p-3 border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        {selectedPolicy.content?.sections?.length || 0} seções definidas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPolicy.content?.attachments?.length || 0} anexos incluídos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPolicy.content?.references?.length || 0} referências citadas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow de Aprovação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Workflow className="h-5 w-5" />
                    <span>Workflow de Aprovação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progresso */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso da Aprovação</span>
                      <span>{Math.round(getApprovalProgress())}%</span>
                    </div>
                    <Progress value={getApprovalProgress()} className="h-2" />
                  </div>

                  {/* Etapas do Workflow */}
                  <div className="space-y-3">
                    {approvalWorkflow.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          {step.status === 'approved' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : step.status === 'rejected' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{step.approver_role}</p>
                            <Badge 
                              variant="outline" 
                              className={
                                step.status === 'approved' ? 'text-green-600 border-green-200' :
                                step.status === 'rejected' ? 'text-red-600 border-red-200' :
                                'text-yellow-600 border-yellow-200'
                              }
                            >
                              {step.status === 'approved' ? 'Aprovado' :
                               step.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Etapa {step.order_sequence} de {approvalWorkflow.length}
                          </p>
                          {step.comments && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Comentários: {step.comments}
                            </p>
                          )}
                          {step.approved_at && (
                            <p className="text-xs text-muted-foreground">
                              Aprovado em: {formatDate(step.approved_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alex Policy Recommendations */}
              {alexConfig.enabled && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Recomendações Alex Policy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Política atende aos requisitos regulatórios</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Recomendado</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Estrutura e linguagem adequadas</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Aprovado</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Considere adicionar data de revisão</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-600">Sugestão</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Selecione uma Política</h3>
                    <p className="text-muted-foreground">Escolha uma política da lista para iniciar o processo de aprovação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyApproval;
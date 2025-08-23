import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Stamp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PolicyApprovalProps {
  policies: any[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
}

const PolicyApproval: React.FC<PolicyApprovalProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar políticas que precisam de aprovação
  const policiesForApproval = policies.filter(p => 
    p.status === 'pending_approval' || p.workflow_stage === 'approval'
  );

  const handleApprovalAction = async (policyId: string, action: 'approve' | 'reject') => {
    if (!approvalComment.trim() && action === 'reject') {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, adicione um comentário para rejeição",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const updateData: any = {
        status: newStatus,
        workflow_stage: action === 'approve' ? 'publication' : 'elaboration',
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (action === 'approve') {
        updateData.approved_by = user?.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('policies')
        .update(updateData)
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: action === 'approve' ? "Política aprovada" : "Política rejeitada",
        description: `A política foi ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });

      setApprovalComment('');
      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar aprovação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { label: 'Aguardando Aprovação', variant: 'default' as const, icon: Clock },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle },
      published: { label: 'Aprovado e Publicado', variant: 'default' as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.approved;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (policiesForApproval.length === 0) {
    return (
      <div className="text-center py-12">
        <Stamp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma política para aprovação</h3>
        <p className="text-muted-foreground">
          Não há políticas aguardando aprovação final no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aprovação de Políticas</h2>
          <p className="text-muted-foreground">
            {policiesForApproval.length} política(s) aguardando aprovação final
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1 border-orange-300 text-orange-800 bg-orange-50 dark:border-orange-600 dark:text-orange-200 dark:bg-orange-950/20">
            <Stamp className="h-3 w-3" />
            Pendentes: {policiesForApproval.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de políticas para aprovação */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Políticas Pendentes</h3>
          
          {policiesForApproval.map((policy) => (
            <Card 
              key={policy.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPolicy(policy)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{policy.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {policy.description}
                    </p>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Categoria:</span>
                      <span>{policy.category}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(policy.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  {policy.priority && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        policy.priority === 'high' 
                          ? 'border-red-300 text-red-800 bg-red-50 dark:border-red-600 dark:text-red-200 dark:bg-red-950/20'
                          : policy.priority === 'medium'
                          ? 'border-yellow-300 text-yellow-800 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-200 dark:bg-yellow-950/20'
                          : 'border-green-300 text-green-800 bg-green-50 dark:border-green-600 dark:text-green-200 dark:bg-green-950/20'
                      }`}
                    >
                      Prioridade: {policy.priority === 'high' ? 'Alta' :
                                  policy.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Painel de aprovação */}
        <div className="space-y-4">
          {selectedPolicy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stamp className="h-5 w-5" />
                    Aprovação: {selectedPolicy.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Informações da política */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPolicy.description || 'Sem descrição'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Categoria</label>
                        <p className="text-sm text-muted-foreground">{selectedPolicy.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Versão</label>
                        <p className="text-sm text-muted-foreground">{selectedPolicy.version}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Status Atual</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedPolicy.status)}
                      </div>
                    </div>

                    {/* Histórico de aprovações */}
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Histórico de Revisões</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Revisão técnica concluída</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-yellow-600" />
                          <span>Aguardando aprovação final</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comentário de aprovação */}
                  <div>
                    <label className="text-sm font-medium">Comentário da Aprovação</label>
                    <Textarea
                      placeholder="Adicione comentários sobre a aprovação (opcional para aprovação, obrigatório para rejeição)..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Ações de aprovação */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => handleApprovalAction(selectedPolicy.id, 'approve')}
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar e Enviar para Publicação
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => handleApprovalAction(selectedPolicy.id, 'reject')}
                      disabled={isSubmitting || !approvalComment.trim()}
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar Política
                    </Button>
                  </div>

                  {/* Aviso sobre rejeição */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/20 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 dark:text-yellow-400" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Importante:</strong> Políticas rejeitadas retornarão para a fase de elaboração 
                        e precisarão passar novamente por todo o processo de revisão.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checklist de aprovação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Checklist de Aprovação</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Conteúdo revisado tecnicamente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Compliance verificado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Estrutura adequada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Aprovação final pendente</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Stamp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Política</h3>
                <p className="text-muted-foreground">
                  Clique em uma política na lista para iniciar o processo de aprovação
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyApproval;
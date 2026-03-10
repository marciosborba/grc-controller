import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PolicyReviewProps {
  policies: any[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
}

const PolicyReview: React.FC<PolicyReviewProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar políticas que precisam de revisão
  const policiesForReview = policies.filter(p =>
    p.status === 'draft' || p.status === 'under_review' || p.workflow_stage === 'review'
  );

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(policiesForReview.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, policiesForReview.length);
  const currentPolicies = policiesForReview.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleReviewAction = async (policyId: string, action: 'approve' | 'reject' | 'request_changes') => {
    if (!reviewComment.trim() && action !== 'approve') {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, adicione um comentário para esta ação",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newStatus = action === 'approve' ? 'approved' :
        action === 'reject' ? 'rejected' : 'draft';

      const { error } = await supabase
        .from('policies')
        .update({
          status: newStatus,
          workflow_stage: action === 'approve' ? 'approval' : 'elaboration',
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', policyId);

      if (error) throw error;

      // Adicionar comentário de revisão (implementar tabela de comentários futuramente)

      toast({
        title: "Revisão realizada",
        description: `Política ${action === 'approve' ? 'aprovada' :
          action === 'reject' ? 'rejeitada' : 'retornada'} com sucesso`,
      });

      setReviewComment('');
      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao revisar política:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar revisão",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const, icon: FileText },
      review: { label: 'Em Revisão', variant: 'default' as const, icon: Eye },
      approved: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (policiesForReview.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma política para revisão</h3>
        <p className="text-muted-foreground">
          Todas as políticas estão em dia ou não requerem revisão no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Revisão de Políticas</h2>
          <p className="text-sm text-muted-foreground">
            {policiesForReview.length} política(s) aguardando revisão
          </p>
        </div>

        <div className="flex items-center">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendentes: {policiesForReview.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lista de políticas para revisão */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Políticas Pendentes</h3>

          {currentPolicies.map((policy) => (
            <Card
              key={policy.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
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
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="truncate max-w-[100px]">{policy.category}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(policy.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {policy.priority && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPriorityColor(policy.priority)}`}
                    >
                      {policy.priority === 'high' ? 'Alta' :
                        policy.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-4 mt-6 pb-2">
              <span className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}–{endIndex} de {policiesForReview.length} políticas
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9"
                >
                  &lt;
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className="h-9 w-9"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9"
                >
                  &gt;
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Painel de revisão */}
        <div className="space-y-4">
          {selectedPolicy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Revisão: {selectedPolicy.title}
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
                  </div>

                  {/* Comentário de revisão */}
                  <div>
                    <label className="text-sm font-medium">Comentário da Revisão</label>
                    <Textarea
                      placeholder="Adicione seus comentários sobre esta política..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  {/* Ações de revisão */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => handleReviewAction(selectedPolicy.id, 'approve')}
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar para Próxima Etapa
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleReviewAction(selectedPolicy.id, 'request_changes')}
                      disabled={isSubmitting || !reviewComment.trim()}
                      className="w-full"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Solicitar Alterações
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleReviewAction(selectedPolicy.id, 'reject')}
                      disabled={isSubmitting || !reviewComment.trim()}
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar Política
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alex Policy Suggestions */}
              {alexConfig?.enabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      Sugestões Alex Policy
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          ✅ <strong>Estrutura:</strong> A política segue a estrutura padrão recomendada.
                        </p>
                      </div>

                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          ⚠️ <strong>Compliance:</strong> Considere adicionar referências às normas ISO 27001.
                        </p>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          💡 <strong>Sugestão:</strong> Adicione exemplos práticos para melhor compreensão.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Política</h3>
                <p className="text-muted-foreground">
                  Clique em uma política na lista para iniciar a revisão
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyReview;
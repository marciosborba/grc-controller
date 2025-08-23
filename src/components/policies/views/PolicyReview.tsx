import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Send,
  History,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Policy, PolicyFilters, AlexPolicyConfig } from '@/types/policy-management';

interface PolicyReviewProps {
  policies: Policy[];
  onPolicyUpdate: () => void;
  alexConfig: AlexPolicyConfig;
  searchTerm: string;
  filters: PolicyFilters;
}

interface ReviewComment {
  id: string;
  section: string;
  comment: string;
  type: 'suggestion' | 'issue' | 'approval';
  reviewer: string;
  created_at: string;
}

export const PolicyReview: React.FC<PolicyReviewProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig,
  searchTerm,
  filters
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedSection, setSelectedSection] = useState('general');
  const [commentType, setCommentType] = useState<'suggestion' | 'issue' | 'approval'>('suggestion');
  const [loading, setLoading] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

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

  const handleApprovePolicy = async (policyId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          status: 'approved',
          workflow_stage: 'approval',
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (error) throw error;

      // Registrar aprovação
      await supabase
        .from('policy_approvals')
        .insert({
          policy_id: policyId,
          approver_id: user?.id,
          status: 'approved',
          comments: 'Aprovado na revisão técnica'
        });

      toast({
        title: 'Sucesso',
        description: 'Política aprovada com sucesso'
      });

      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao aprovar política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao aprovar política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPolicy = async (policyId: string, reason: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          status: 'draft',
          workflow_stage: 'elaboration',
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (error) throw error;

      // Registrar rejeição
      await supabase
        .from('policy_approvals')
        .insert({
          policy_id: policyId,
          approver_id: user?.id,
          status: 'rejected',
          comments: reason
        });

      toast({
        title: 'Política Rejeitada',
        description: 'Política retornada para elaboração'
      });

      setShowReviewDialog(false);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao rejeitar política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao rejeitar política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addReviewComment = () => {
    if (!newComment.trim() || !selectedPolicy) return;

    const comment: ReviewComment = {
      id: Date.now().toString(),
      section: selectedSection,
      comment: newComment,
      type: commentType,
      reviewer: user?.email || 'Revisor',
      created_at: new Date().toISOString()
    };

    setReviewComments(prev => [...prev, comment]);
    setNewComment('');
    
    toast({
      title: 'Comentário Adicionado',
      description: 'Seu comentário foi registrado'
    });
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Edit3 className="h-4 w-4 text-blue-500" />;
      case 'issue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'approval': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Revisão de Políticas
          </h2>
          <p className="text-muted-foreground">
            Processo de revisão técnica e de compliance com assistência Alex Policy
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
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Alex Policy - Modo Revisão</h3>
                  <p className="text-sm text-muted-foreground">
                    Análise automática de conformidade e sugestões de melhoria
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Eye className="h-3 w-3 mr-1" />
                  Análise Ativa
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

      {/* Lista de Políticas em Revisão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Políticas */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Políticas em Revisão</span>
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
                  <div className="mt-2">
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(policy.priority)}`}>
                      Prioridade: {policy.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {filteredPolicies.length === 0 && (
                <div className="text-center py-8">
                  <Eye className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Nenhuma política encontrada' : 'Nenhuma política aguardando revisão'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel de Revisão */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Revisando: {selectedPolicy.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApprovePolicy(selectedPolicy.id)}
                      disabled={loading}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    
                    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rejeitar Política</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Motivo da Rejeição</Label>
                            <Textarea
                              placeholder="Descreva os motivos para rejeição da política..."
                              rows={4}
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                              Cancelar
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleRejectPolicy(selectedPolicy.id, newComment)}
                              disabled={loading || !newComment.trim()}
                            >
                              Rejeitar Política
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="comments">Comentários</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4">
                    {/* Informações da Política */}
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

                    {/* Conteúdo da Política */}
                    <div>
                      <Label className="text-sm font-medium">Conteúdo</Label>
                      <div className="mt-2 p-4 border rounded-lg bg-muted/20">
                        {selectedPolicy.content?.sections?.map((section, index) => (
                          <div key={section.id} className="mb-4">
                            <h4 className="font-medium text-sm mb-2">{section.title}</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {section.content}
                            </p>
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground">Conteúdo não disponível</p>
                        )}
                      </div>
                    </div>

                    {/* Alex Policy Analysis */}
                    {alexConfig.enabled && (
                      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span>Análise Alex Policy</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Estrutura adequada</span>
                              </div>
                              <Badge variant="outline" className="text-green-600">95%</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">Linguagem técnica pode ser melhorada</span>
                              </div>
                              <Badge variant="outline" className="text-yellow-600">78%</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Conformidade regulatória</span>
                              </div>
                              <Badge variant="outline" className="text-green-600">92%</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="space-y-4">
                    {/* Adicionar Comentário */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Adicionar Comentário de Revisão</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Seção</Label>
                            <select 
                              className="w-full mt-1 p-2 border rounded"
                              value={selectedSection}
                              onChange={(e) => setSelectedSection(e.target.value)}
                            >
                              <option value="general">Geral</option>
                              <option value="objective">Objetivo</option>
                              <option value="scope">Escopo</option>
                              <option value="responsibilities">Responsabilidades</option>
                              <option value="content">Conteúdo</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm">Tipo</Label>
                            <select 
                              className="w-full mt-1 p-2 border rounded"
                              value={commentType}
                              onChange={(e) => setCommentType(e.target.value as any)}
                            >
                              <option value="suggestion">Sugestão</option>
                              <option value="issue">Problema</option>
                              <option value="approval">Aprovação</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Comentário</Label>
                          <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Digite seu comentário de revisão..."
                            rows={3}
                          />
                        </div>
                        <Button onClick={addReviewComment} disabled={!newComment.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Adicionar Comentário
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Lista de Comentários */}
                    <div className="space-y-3">
                      {reviewComments.map((comment) => (
                        <Card key={comment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              {getCommentIcon(comment.type)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">{comment.reviewer}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {comment.section}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {comment.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {reviewComments.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Nenhum comentário de revisão</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <History className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Política enviada para revisão</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedPolicy.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Edit3 className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Política criada</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedPolicy.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Selecione uma Política</h3>
                    <p className="text-muted-foreground">Escolha uma política da lista para iniciar a revisão</p>
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

export default PolicyReview;
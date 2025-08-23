import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Edit,
  Plus,
  FileText,
  Save,
  Eye,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Zap,
  Clock,
  User,
  Trash2,
  Copy,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Policy, PolicyFilters, AlexPolicyConfig } from '@/types/policy-management';

interface PolicyElaborationProps {
  policies: Policy[];
  onPolicyUpdate: () => void;
  alexConfig: AlexPolicyConfig;
  searchTerm: string;
  filters: PolicyFilters;
}

interface NewPolicyForm {
  title: string;
  description: string;
  category: string;
  type: string;
  priority: string;
  requires_training: boolean;
  requires_approval: boolean;
}

export const PolicyElaboration: React.FC<PolicyElaborationProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig,
  searchTerm,
  filters
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newPolicyForm, setNewPolicyForm] = useState<NewPolicyForm>({
    title: '',
    description: '',
    category: 'governance',
    type: 'policy',
    priority: 'medium',
    requires_training: false,
    requires_approval: true
  });

  const [editContent, setEditContent] = useState('');

  // Filtrar políticas baseado na busca
  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCreatePolicy = async () => {
    if (!user?.tenant?.id || !newPolicyForm.title.trim()) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('policies')
        .insert({
          title: newPolicyForm.title,
          description: newPolicyForm.description,
          category: newPolicyForm.category,
          type: newPolicyForm.type,
          priority: newPolicyForm.priority,
          requires_training: newPolicyForm.requires_training,
          requires_approval: newPolicyForm.requires_approval,
          status: 'draft',
          tenant_id: user.tenant.id,
          created_by: user.id,
          updated_by: user.id,
          content: {
            sections: [
              {
                id: '1',
                title: 'Objetivo',
                content: 'Defina o objetivo desta política...'
              },
              {
                id: '2',
                title: 'Escopo',
                content: 'Defina o escopo de aplicação...'
              },
              {
                id: '3',
                title: 'Responsabilidades',
                content: 'Defina as responsabilidades...'
              }
            ]
          },
          metadata: {
            tags: [],
            departments: [],
            compliance_frameworks: []
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Política criada com sucesso'
      });

      setIsCreating(false);
      setNewPolicyForm({
        title: '',
        description: '',
        category: 'governance',
        type: 'policy',
        priority: 'medium',
        requires_training: false,
        requires_approval: true
      });
      
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao criar política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    if (!selectedPolicy) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          content: {
            ...selectedPolicy.content,
            sections: selectedPolicy.content?.sections?.map(section => 
              section.id === '1' ? { ...section, content: editContent } : section
            ) || []
          },
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPolicy.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Política salva com sucesso'
      });

      setIsEditing(false);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao salvar política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendForReview = async (policyId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          status: 'review',
          workflow_stage: 'review',
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Política enviada para revisão'
      });

      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao enviar para revisão:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar política para revisão',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta política?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Política excluída com sucesso'
      });

      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao excluir política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir política',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPolicy && selectedPolicy.content?.sections?.[0]) {
      setEditContent(selectedPolicy.content.sections[0].content || '');
    }
  }, [selectedPolicy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Edit className="h-6 w-6 text-primary" />
            Elaboração de Políticas
          </h2>
          <p className="text-muted-foreground">
            Crie e edite políticas estruturadas com assistência Alex Policy IA
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Templates
          </Button>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Política
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Política</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newPolicyForm.title}
                      onChange={(e) => setNewPolicyForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Política de Segurança da Informação"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newPolicyForm.category} onValueChange={(value) => setNewPolicyForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="governance">Governança</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="operational">Operacional</SelectItem>
                        <SelectItem value="hr">Recursos Humanos</SelectItem>
                        <SelectItem value="it">Tecnologia</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                        <SelectItem value="quality">Qualidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newPolicyForm.description}
                    onChange={(e) => setNewPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o objetivo e escopo desta política..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={newPolicyForm.type} onValueChange={(value) => setNewPolicyForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policy">Política</SelectItem>
                        <SelectItem value="procedure">Procedimento</SelectItem>
                        <SelectItem value="guideline">Diretriz</SelectItem>
                        <SelectItem value="standard">Padrão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newPolicyForm.priority} onValueChange={(value) => setNewPolicyForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Opções</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newPolicyForm.requires_training}
                          onChange={(e) => setNewPolicyForm(prev => ({ ...prev, requires_training: e.target.checked }))}
                        />
                        <span className="text-sm">Requer Treinamento</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newPolicyForm.requires_approval}
                          onChange={(e) => setNewPolicyForm(prev => ({ ...prev, requires_approval: e.target.checked }))}
                        />
                        <span className="text-sm">Requer Aprovação</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePolicy} disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Política'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  <h3 className="font-medium text-foreground">Alex Policy Ativo</h3>
                  <p className="text-sm text-muted-foreground">
                    Pronto para ajudar na elaboração de políticas estruturadas
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Sugestões Ativas
                </Badge>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Conversar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Políticas em Elaboração */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Políticas */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Políticas em Elaboração</span>
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
                      <span>Atualizada em {formatDate(policy.updated_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3" />
                      <span>v{policy.version}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPolicies.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Nenhuma política encontrada' : 'Nenhuma política em elaboração'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Política
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor de Política */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="h-5 w-5" />
                    <span>Editando: {selectedPolicy.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeletePolicy(selectedPolicy.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                    <Button size="sm" onClick={handleSavePolicy} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título da Política</label>
                    <Input value={selectedPolicy.title} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Input value={selectedPolicy.category} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea 
                    value={selectedPolicy.description || ''} 
                    placeholder="Descreva o objetivo e escopo desta política..."
                    rows={3}
                    readOnly
                  />
                </div>

                {/* Conteúdo da Política */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Conteúdo da Política</label>
                    <div className="flex space-x-2">
                      {alexConfig.enabled && (
                        <Button variant="outline" size="sm">
                          <Zap className="h-4 w-4 mr-2" />
                          Gerar com Alex Policy
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancelar' : 'Editar'}
                      </Button>
                    </div>
                  </div>
                  <Textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Digite o conteúdo da política ou use Alex Policy para gerar automaticamente"
                    rows={12}
                    className="font-mono"
                    readOnly={!isEditing}
                  />
                </div>

                {/* Ações */}
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    {selectedPolicy.status === 'draft' && (
                      <Button 
                        onClick={() => handleSendForReview(selectedPolicy.id)}
                        disabled={loading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar para Revisão
                      </Button>
                    )}
                  </div>
                </div>

                {/* Alex Policy Suggestions */}
                {alexConfig.enabled && alexConfig.auto_suggestions && (
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span>Sugestões Alex Policy</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                          <span className="text-sm">Adicionar seção de "Responsabilidades"</span>
                          <Button variant="outline" size="sm">
                            Aplicar
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                          <span className="text-sm">Incluir referências regulatórias</span>
                          <Button variant="outline" size="sm">
                            Aplicar
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                          <span className="text-sm">Melhorar linguagem técnica</span>
                          <Button variant="outline" size="sm">
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Selecione uma Política</h3>
                    <p className="text-muted-foreground">Escolha uma política da lista para começar a editar</p>
                  </div>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Política
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyElaboration;
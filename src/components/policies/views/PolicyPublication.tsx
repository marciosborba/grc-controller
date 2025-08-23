import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Send,
  Globe,
  Mail,
  Bell,
  Calendar,
  FileText,
  Clock,
  User,
  Eye,
  Download,
  Share2,
  MessageSquare,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Policy, PolicyFilters, AlexPolicyConfig } from '@/types/policy-management';

interface PolicyPublicationProps {
  policies: Policy[];
  onPolicyUpdate: () => void;
  alexConfig: AlexPolicyConfig;
  searchTerm: string;
  filters: PolicyFilters;
}

interface PublicationSettings {
  effective_date: string;
  notification_channels: string[];
  target_audiences: string[];
  training_required: boolean;
  acknowledgment_required: boolean;
  auto_reminder: boolean;
  reminder_frequency: number;
}

export const PolicyPublication: React.FC<PolicyPublicationProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig,
  searchTerm,
  filters
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showPublicationDialog, setShowPublicationDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [publicationSettings, setPublicationSettings] = useState<PublicationSettings>({
    effective_date: new Date().toISOString().split('T')[0],
    notification_channels: ['email', 'in_app'],
    target_audiences: ['all_users'],
    training_required: false,
    acknowledgment_required: true,
    auto_reminder: true,
    reminder_frequency: 7
  });

  // Filtrar políticas baseado na busca
  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400';
      case 'published': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
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
      year: 'numeric'
    });
  };

  const handlePublishPolicy = async () => {
    if (!selectedPolicy) return;

    setLoading(true);
    try {
      // Atualizar status da política
      const { error: policyError } = await supabase
        .from('policies')
        .update({
          status: 'published',
          workflow_stage: 'published',
          effective_date: publicationSettings.effective_date,
          published_by: user?.id,
          published_at: new Date().toISOString(),
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPolicy.id);

      if (policyError) throw policyError;

      // Criar notificações para os usuários
      const notifications = publicationSettings.target_audiences.map(audience => ({
        policy_id: selectedPolicy.id,
        notification_type: 'policy_published',
        title: `Nova Política Publicada: ${selectedPolicy.title}`,
        message: `A política "${selectedPolicy.title}" foi oficialmente publicada e está em vigor a partir de ${formatDate(publicationSettings.effective_date)}.`,
        priority: selectedPolicy.priority === 'critical' ? 'urgent' : 'high',
        recipient_role: audience,
        action_required: publicationSettings.acknowledgment_required,
        action_url: `/policies/${selectedPolicy.id}`,
        tenant_id: user?.tenant?.id,
        channels: JSON.stringify(publicationSettings.notification_channels)
      }));

      const { error: notificationError } = await supabase
        .from('policy_notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      // Se treinamento é obrigatório, criar notificação adicional
      if (publicationSettings.training_required) {
        await supabase
          .from('policy_notifications')
          .insert({
            policy_id: selectedPolicy.id,
            notification_type: 'training_required',
            title: `Treinamento Obrigatório: ${selectedPolicy.title}`,
            message: `É obrigatório completar o treinamento sobre a política "${selectedPolicy.title}". Acesse o portal de treinamentos.`,
            priority: 'urgent',
            recipient_role: 'all_users',
            action_required: true,
            action_url: `/training/policy-${selectedPolicy.id}`,
            tenant_id: user?.tenant?.id,
            channels: JSON.stringify(['email', 'in_app'])
          });
      }

      toast({
        title: 'Política Publicada',
        description: 'Política publicada com sucesso e notificações enviadas'
      });

      setShowPublicationDialog(false);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao publicar política:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao publicar política',
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

  const getPublicationStats = (policy: Policy) => {
    // Simular estatísticas de publicação
    return {
      views: Math.floor(Math.random() * 500) + 50,
      acknowledgments: Math.floor(Math.random() * 200) + 20,
      training_completions: policy.requires_training ? Math.floor(Math.random() * 150) + 10 : 0
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Publicação de Políticas
          </h2>
          <p className="text-muted-foreground">
            Distribuição controlada e gestão de comunicação
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
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Alex Policy - Modo Publicação</h3>
                  <p className="text-sm text-muted-foreground">
                    Otimização de distribuição e análise de impacto
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Globe className="h-3 w-3 mr-1" />
                  Distribuição Inteligente
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

      {/* Lista de Políticas para Publicação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Políticas */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Políticas para Publicação</span>
                <Badge variant="secondary">{filteredPolicies.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPolicies.map((policy) => {
                const stats = getPublicationStats(policy);
                return (
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
                        <span>
                          {policy.status === 'published' 
                            ? `Publicada em ${formatDate(policy.published_at || policy.updated_at)}`
                            : `Aprovada em ${formatDate(policy.updated_at)}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>v{policy.version}</span>
                      </div>
                    </div>

                    {/* Estatísticas de Publicação */}
                    {policy.status === 'published' && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{stats.views} visualizações</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{stats.acknowledgments} confirmações</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Indicador de Prioridade */}
                    <div className="mt-2">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(policy.priority)}`}>
                        {policy.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {filteredPolicies.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Nenhuma política encontrada' : 'Nenhuma política pronta para publicação'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel de Publicação */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <div className="space-y-6">
              {/* Informações da Política */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>
                        {selectedPolicy.status === 'published' ? 'Gerenciar' : 'Publicar'}: {selectedPolicy.title}
                      </span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </Button>
                      
                      {selectedPolicy.status === 'approved' && (
                        <Dialog open={showPublicationDialog} onOpenChange={setShowPublicationDialog}>
                          <DialogTrigger asChild>
                            <Button>
                              <Send className="h-4 w-4 mr-2" />
                              Publicar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Configurações de Publicação</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Data de Vigência */}
                              <div className="space-y-2">
                                <Label>Data de Vigência</Label>
                                <Input
                                  type="date"
                                  value={publicationSettings.effective_date}
                                  onChange={(e) => setPublicationSettings(prev => ({
                                    ...prev,
                                    effective_date: e.target.value
                                  }))}
                                />
                              </div>

                              {/* Canais de Notificação */}
                              <div className="space-y-2">
                                <Label>Canais de Notificação</Label>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="email"
                                      checked={publicationSettings.notification_channels.includes('email')}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setPublicationSettings(prev => ({
                                            ...prev,
                                            notification_channels: [...prev.notification_channels, 'email']
                                          }));
                                        } else {
                                          setPublicationSettings(prev => ({
                                            ...prev,
                                            notification_channels: prev.notification_channels.filter(c => c !== 'email')
                                          }));
                                        }
                                      }}
                                    />
                                    <Label htmlFor="email" className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4" />
                                      <span>E-mail</span>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="in_app"
                                      checked={publicationSettings.notification_channels.includes('in_app')}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setPublicationSettings(prev => ({
                                            ...prev,
                                            notification_channels: [...prev.notification_channels, 'in_app']
                                          }));
                                        } else {
                                          setPublicationSettings(prev => ({
                                            ...prev,
                                            notification_channels: prev.notification_channels.filter(c => c !== 'in_app')
                                          }));
                                        }
                                      }}
                                    />
                                    <Label htmlFor="in_app" className="flex items-center space-x-2">
                                      <Bell className="h-4 w-4" />
                                      <span>Notificação no App</span>
                                    </Label>
                                  </div>
                                </div>
                              </div>

                              {/* Público-Alvo */}
                              <div className="space-y-2">
                                <Label>Público-Alvo</Label>
                                <Select 
                                  value={publicationSettings.target_audiences[0]} 
                                  onValueChange={(value) => setPublicationSettings(prev => ({
                                    ...prev,
                                    target_audiences: [value]
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all_users">Todos os Usuários</SelectItem>
                                    <SelectItem value="managers">Gestores</SelectItem>
                                    <SelectItem value="employees">Colaboradores</SelectItem>
                                    <SelectItem value="contractors">Terceiros</SelectItem>
                                    <SelectItem value="specific_department">Departamento Específico</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Opções Adicionais */}
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="training_required"
                                    checked={publicationSettings.training_required}
                                    onCheckedChange={(checked) => setPublicationSettings(prev => ({
                                      ...prev,
                                      training_required: checked as boolean
                                    }))}
                                  />
                                  <Label htmlFor="training_required">Treinamento Obrigatório</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="acknowledgment_required"
                                    checked={publicationSettings.acknowledgment_required}
                                    onCheckedChange={(checked) => setPublicationSettings(prev => ({
                                      ...prev,
                                      acknowledgment_required: checked as boolean
                                    }))}
                                  />
                                  <Label htmlFor="acknowledgment_required">Confirmação de Leitura Obrigatória</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="auto_reminder"
                                    checked={publicationSettings.auto_reminder}
                                    onCheckedChange={(checked) => setPublicationSettings(prev => ({
                                      ...prev,
                                      auto_reminder: checked as boolean
                                    }))}
                                  />
                                  <Label htmlFor="auto_reminder">Lembretes Automáticos</Label>
                                </div>
                              </div>

                              {publicationSettings.auto_reminder && (
                                <div className="space-y-2">
                                  <Label>Frequência de Lembretes (dias)</Label>
                                  <Input
                                    type="number"
                                    value={publicationSettings.reminder_frequency}
                                    onChange={(e) => setPublicationSettings(prev => ({
                                      ...prev,
                                      reminder_frequency: parseInt(e.target.value) || 7
                                    }))}
                                    min="1"
                                    max="30"
                                  />
                                </div>
                              )}

                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowPublicationDialog(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handlePublishPolicy} disabled={loading}>
                                  {loading ? 'Publicando...' : 'Publicar Política'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {selectedPolicy.status === 'published' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleArchivePolicy(selectedPolicy.id)}
                        >
                          Arquivar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusColor(selectedPolicy.status)}>
                        {selectedPolicy.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Prioridade</Label>
                      <Badge variant="outline" className={getPriorityColor(selectedPolicy.priority)}>
                        {selectedPolicy.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data de Vigência</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedPolicy.effective_date ? formatDate(selectedPolicy.effective_date) : 'Não definida'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data de Expiração</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedPolicy.expiry_date ? formatDate(selectedPolicy.expiry_date) : 'Não definida'}
                      </p>
                    </div>
                  </div>

                  {/* Estatísticas de Publicação */}
                  {selectedPolicy.status === 'published' && (
                    <div>
                      <Label className="text-sm font-medium">Estatísticas de Publicação</Label>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        {(() => {
                          const stats = getPublicationStats(selectedPolicy);
                          return (
                            <>
                              <div className="text-center p-3 border rounded-lg">
                                <Eye className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                                <p className="text-lg font-bold">{stats.views}</p>
                                <p className="text-xs text-muted-foreground">Visualizações</p>
                              </div>
                              <div className="text-center p-3 border rounded-lg">
                                <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-500" />
                                <p className="text-lg font-bold">{stats.acknowledgments}</p>
                                <p className="text-xs text-muted-foreground">Confirmações</p>
                              </div>
                              <div className="text-center p-3 border rounded-lg">
                                <Target className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                                <p className="text-lg font-bold">{stats.training_completions}</p>
                                <p className="text-xs text-muted-foreground">Treinamentos</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alex Policy Insights */}
              {alexConfig.enabled && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>Insights de Publicação Alex Policy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Público-alvo adequado para o conteúdo</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Otimizado</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Considere treinamento para políticas críticas</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-600">Sugestão</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Canais de comunicação apropriados</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Aprovado</Badge>
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
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Selecione uma Política</h3>
                    <p className="text-muted-foreground">Escolha uma política da lista para gerenciar sua publicação</p>
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

export default PolicyPublication;
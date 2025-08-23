import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Send,
  Users,
  Calendar,
  Globe,
  Download,
  Mail,
  Bell,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PolicyPublicationProps {
  policies: any[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
}

const PolicyPublication: React.FC<PolicyPublicationProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [publicationDate, setPublicationDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Filtrar políticas aprovadas para publicação
  const policiesForPublication = policies.filter(p => 
    p.status === 'approved' && p.workflow_stage === 'publication'
  );

  // Políticas já publicadas
  const publishedPolicies = policies.filter(p => p.status === 'published');

  const handlePublish = async (policyId: string) => {
    if (!publicationDate || !effectiveDate) {
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, defina as datas de publicação e vigência",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('policies')
        .update({
          status: 'published',
          workflow_stage: 'published',
          effective_date: effectiveDate,
          published_by: user?.id,
          published_at: publicationDate,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Política publicada",
        description: "A política foi publicada com sucesso",
      });

      setPublicationDate('');
      setEffectiveDate('');
      setNotificationMessage('');
      setSelectedPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Erro ao publicar política:', error);
      toast({
        title: "Erro",
        description: "Erro ao publicar política",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { label: 'Pronto para Publicar', variant: 'default' as const, icon: Clock },
      published: { label: 'Publicado', variant: 'default' as const, icon: CheckCircle }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Publicação de Políticas</h2>
          <p className="text-muted-foreground">
            Gerencie a publicação e distribuição de políticas aprovadas
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Para publicar: {policiesForPublication.length}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Publicadas: {publishedPolicies.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de políticas */}
        <div className="space-y-4">
          {/* Políticas para publicar */}
          {policiesForPublication.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Prontas para Publicação</h3>
              <div className="space-y-3">
                {policiesForPublication.map((policy) => (
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
                        <span className="text-muted-foreground">Categoria: {policy.category}</span>
                        <span className="text-muted-foreground">v{policy.version}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Políticas publicadas */}
          {publishedPolicies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Políticas Publicadas</h3>
              <div className="space-y-3">
                {publishedPolicies.slice(0, 5).map((policy) => (
                  <Card key={policy.id} className="opacity-75">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{policy.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Publicado em: {policy.published_at ? 
                              new Date(policy.published_at).toLocaleDateString('pt-BR') : 
                              'Data não informada'}
                          </p>
                        </div>
                        {getStatusBadge(policy.status)}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {policiesForPublication.length === 0 && publishedPolicies.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma política para publicação</h3>
              <p className="text-muted-foreground">
                Não há políticas aprovadas aguardando publicação.
              </p>
            </div>
          )}
        </div>

        {/* Painel de publicação */}
        <div className="space-y-4">
          {selectedPolicy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Publicar: {selectedPolicy.title}
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
                  </div>

                  {/* Configurações de publicação */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Data de Publicação</label>
                      <Input
                        type="datetime-local"
                        value={publicationDate}
                        onChange={(e) => setPublicationDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Data de Vigência</label>
                      <Input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Mensagem de Notificação</label>
                      <Textarea
                        placeholder="Mensagem que será enviada junto com a notificação de publicação..."
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Ações de publicação */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handlePublish(selectedPolicy.id)}
                      disabled={isPublishing || !publicationDate || !effectiveDate}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Publicar Política
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Canais de distribuição */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Canais de Distribuição</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Portal Interno</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Ativo</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Email Corporativo</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Ativo</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Notificações Push</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Ativo</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Grupos de Trabalho</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Configurar</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Política</h3>
                <p className="text-muted-foreground">
                  Clique em uma política na lista para configurar a publicação
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyPublication;
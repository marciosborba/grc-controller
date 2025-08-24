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
    p.status === 'approved' || p.status === 'under_review' || p.status === 'pending_approval'
  );

  // Políticas já publicadas
  const publishedPolicies = policies.filter(p => p.status === 'published');

  const handlePublish = async (policyId: string) => {
    console.log('🚀 Tentando publicar política:', policyId);
    console.log('📅 Data de publicação:', publicationDate);
    console.log('📅 Data de vigência:', effectiveDate);
    
    if (!publicationDate || !effectiveDate) {
      console.log('❌ Datas não preenchidas');
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, defina as datas de publicação e vigência",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Converter datetime-local para ISO string
      const publicationDateISO = new Date(publicationDate).toISOString();
      const effectiveDateISO = new Date(effectiveDate).toISOString();
      
      console.log('📅 Data de publicação (ISO):', publicationDateISO);
      console.log('📅 Data de vigência (ISO):', effectiveDateISO);
      
      const updateData = {
        status: 'published',
        workflow_stage: 'published',
        effective_date: effectiveDateISO,
        published_by: user?.id,
        published_at: publicationDateISO,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };
      
      console.log('📊 Dados para atualização:', updateData);
      
      const { error } = await supabase
        .from('policies')
        .update(updateData)
        .eq('id', policyId);

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Política publicada com sucesso!');

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
      console.error('❌ Erro ao publicar política:', error);
      toast({
        title: "Erro",
        description: `Erro ao publicar política: ${error.message || error}`,
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
              <div className="space-y-1.5">
                {policiesForPublication.map((policy) => (
                  <Card 
                    key={policy.id} 
                    className={`cursor-pointer transition-all hover:shadow-md rounded-[5px] ${
                      selectedPolicy?.id === policy.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate leading-tight">{policy.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {policy.description}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(policy.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate">Categoria: {policy.category}</span>
                        <span className="text-muted-foreground ml-2">v{policy.version}</span>
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
              <div className="space-y-1.5">
                {publishedPolicies.slice(0, 5).map((policy) => (
                  <Card key={policy.id} className="opacity-75 rounded-[5px]">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate leading-tight">{policy.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Publicado em: {policy.published_at ? 
                              new Date(policy.published_at).toLocaleDateString('pt-BR') : 
                              'Data não informada'}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(policy.status)}
                        </div>
                      </div>
                    </CardContent>
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
                      <label className="text-sm font-medium">Data de Publicação *</label>
                      <Input
                        type="datetime-local"
                        value={publicationDate}
                        onChange={(e) => {
                          console.log('📅 Data de publicação alterada:', e.target.value);
                          setPublicationDate(e.target.value);
                        }}
                        className="mt-1"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Data de Vigência *</label>
                      <Input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => {
                          console.log('📅 Data de vigência alterada:', e.target.value);
                          setEffectiveDate(e.target.value);
                        }}
                        className="mt-1"
                        min={new Date().toISOString().split('T')[0]}
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
                    {/* Debug info */}
                    <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                      <div>Data Publicação: {publicationDate || 'Não preenchida'}</div>
                      <div>Data Vigência: {effectiveDate || 'Não preenchida'}</div>
                      <div>Botão habilitado: {(!isPublishing && publicationDate && effectiveDate) ? 'Sim' : 'Não'}</div>
                      <div className="mt-2 space-x-2">
                        <button 
                          onClick={() => {
                            const now = new Date();
                            setPublicationDate(now.toISOString().slice(0, 16));
                            setEffectiveDate(now.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Preencher Datas Automaticamente
                        </button>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => {
                        console.log('🖱️ Botão clicado!');
                        console.log('📅 publicationDate:', publicationDate);
                        console.log('📅 effectiveDate:', effectiveDate);
                        console.log('🔄 isPublishing:', isPublishing);
                        handlePublish(selectedPolicy.id);
                      }}
                      disabled={isPublishing || !publicationDate.trim() || !effectiveDate.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isPublishing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publicar Política
                        </>
                      )}
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
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Send, 
  Calendar,
  FileText,
  Mail,
  Globe,
  MessageSquare,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Eye,
  Bell,
  Settings
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

import type { PolicyV2, PolicyPublication, PublicationChannel } from '@/types/policy-management-v2';

interface PolicyPublicationViewProps {
  onPublicationScheduled: (publication: PolicyPublication) => void;
}

const PolicyPublicationView: React.FC<PolicyPublicationViewProps> = ({
  onPublicationScheduled
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [approvedPolicies, setApprovedPolicies] = useState<PolicyV2[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyV2 | null>(null);
  const [publicationData, setPublicationData] = useState({
    publication_date: '',
    effective_date: '',
    channels: [] as PublicationChannel[],
    target_audience: [] as string[],
    acknowledgment_required: false,
    training_required: false,
    announcement_title: '',
    announcement_content: ''
  });
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    loadApprovedPolicies();
  }, []);

  const loadApprovedPolicies = async () => {
    // Mock data
    const mockPolicies: PolicyV2[] = [
      {
        id: '1',
        tenant_id: user?.tenant?.id || '',
        title: 'Política de Segurança da Informação v2.0',
        description: 'Versão atualizada com novos controles de segurança',
        category: 'security',
        policy_type: 'policy',
        priority: 'high',
        status: 'approved',
        workflow_stage: 'publication',
        version: '2.0',
        is_current_version: true,
        created_by: 'user-1',
        approved_by: 'approver-1',
        approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        requires_acknowledgment: true,
        is_mandatory: true,
        applies_to_all_users: true,
        ai_generated: false,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setApprovedPolicies(mockPolicies);
    if (mockPolicies.length > 0) {
      setSelectedPolicy(mockPolicies[0]);
      setPublicationData(prev => ({
        ...prev,
        announcement_title: `Nova versão: ${mockPolicies[0].title}`,
        announcement_content: `A ${mockPolicies[0].title} foi atualizada e está disponível para consulta. Esta política é obrigatória para todos os colaboradores.`
      }));
    }
  };

  const schedulePublication = async () => {
    if (!selectedPolicy) return;

    setIsScheduling(true);
    
    try {
      // Validações
      if (!publicationData.publication_date) {
        throw new Error('Data de publicação é obrigatória');
      }
      if (!publicationData.effective_date) {
        throw new Error('Data de vigência é obrigatória');
      }
      if (publicationData.channels.length === 0) {
        throw new Error('Selecione pelo menos um canal de comunicação');
      }

      const publication: PolicyPublication = {
        id: Date.now().toString(),
        policy_id: selectedPolicy.id,
        tenant_id: selectedPolicy.tenant_id,
        publication_date: publicationData.publication_date,
        effective_date: publicationData.effective_date,
        channels: publicationData.channels,
        target_audience: publicationData.target_audience,
        acknowledgment_required: publicationData.acknowledgment_required,
        training_required: publicationData.training_required,
        total_recipients: 150, // Mock
        acknowledgments_received: 0,
        read_receipts: 0,
        announcement_title: publicationData.announcement_title,
        announcement_content: publicationData.announcement_content,
        status: 'scheduled',
        published_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onPublicationScheduled(publication);

      // Reset
      setApprovedPolicies(prev => prev.filter(p => p.id !== selectedPolicy.id));
      const remaining = approvedPolicies.filter(p => p.id !== selectedPolicy.id);
      setSelectedPolicy(remaining.length > 0 ? remaining[0] : null);

    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao agendar publicação',
        variant: 'destructive'
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const channels = [
    { value: 'email' as PublicationChannel, label: 'E-mail', icon: Mail },
    { value: 'intranet' as PublicationChannel, label: 'Intranet', icon: Globe },
    { value: 'portal' as PublicationChannel, label: 'Portal', icon: FileText },
    { value: 'meeting' as PublicationChannel, label: 'Reunião', icon: Users },
    { value: 'training' as PublicationChannel, label: 'Treinamento', icon: Target }
  ];

  const toggleChannel = (channel: PublicationChannel) => {
    setPublicationData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Publicação de Políticas</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestão de publicação e comunicação das políticas aprovadas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{approvedPolicies.length}</div>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Publicadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Taxa Leitura</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Policy List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Políticas Aprovadas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {approvedPolicies.length > 0 ? (
                <div className="space-y-1">
                  {approvedPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                        selectedPolicy?.id === policy.id 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm">{policy.title}</h3>
                        <p className="text-xs text-muted-foreground">{policy.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Aprovada
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Ontem</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma política aprovada para publicação
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Publication Form */}
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
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Agendamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Publicação *</label>
                      <Input
                        type="datetime-local"
                        value={publicationData.publication_date}
                        onChange={(e) => setPublicationData(prev => ({ ...prev, publication_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Vigência *</label>
                      <Input
                        type="date"
                        value={publicationData.effective_date}
                        onChange={(e) => setPublicationData(prev => ({ ...prev, effective_date: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Canais de Comunicação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {channels.map((channel) => {
                      const IconComponent = channel.icon;
                      const isSelected = publicationData.channels.includes(channel.value);
                      
                      return (
                        <Button
                          key={channel.value}
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => toggleChannel(channel.value)}
                          className="justify-start h-auto p-3"
                        >
                          <IconComponent className="h-4 w-4 mr-2" />
                          {channel.label}
                        </Button>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="acknowledgment_required"
                        checked={publicationData.acknowledgment_required}
                        onChange={(e) => setPublicationData(prev => ({ ...prev, acknowledgment_required: e.target.checked }))}
                      />
                      <label htmlFor="acknowledgment_required" className="text-sm font-medium">
                        Requer confirmação de leitura
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="training_required"
                        checked={publicationData.training_required}
                        onChange={(e) => setPublicationData(prev => ({ ...prev, training_required: e.target.checked }))}
                      />
                      <label htmlFor="training_required" className="text-sm font-medium">
                        Requer treinamento obrigatório
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Comunicação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título do Anúncio</label>
                    <Input
                      value={publicationData.announcement_title}
                      onChange={(e) => setPublicationData(prev => ({ ...prev, announcement_title: e.target.value }))}
                      placeholder="Título que aparecerá na comunicação"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conteúdo do Anúncio</label>
                    <Textarea
                      value={publicationData.announcement_content}
                      onChange={(e) => setPublicationData(prev => ({ ...prev, announcement_content: e.target.value }))}
                      placeholder="Mensagem que será enviada aos colaboradores"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Button 
                    onClick={schedulePublication} 
                    disabled={isScheduling}
                    className="w-full"
                  >
                    {isScheduling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Agendando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Agendar Publicação
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Política</h3>
                <p className="text-muted-foreground text-center">
                  Escolha uma política aprovada para configurar a publicação
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyPublicationView;
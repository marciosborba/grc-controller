import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell,
  Send,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Brain,
  Zap,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  Settings,
  Phone,
  Smartphone,
  Globe,
  Link
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'assessment_invitation' | 'reminder' | 'deadline_warning' | 'completion_confirmation' | 'escalation' | 'custom';
  channels: ('email' | 'sms' | 'portal')[];
  variables: string[];
  is_active: boolean;
  created_at: string;
}

interface NotificationSchedule {
  id: string;
  vendor_id: string;
  template_id: string;
  trigger_type: 'immediate' | 'scheduled' | 'recurring' | 'event_based';
  trigger_data: any;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduled_for?: string;
  sent_at?: string;
  delivery_status: any;
}

interface VendorCommunication {
  id: string;
  vendor_id: string;
  subject: string;
  content: string;
  channel: 'email' | 'sms' | 'portal' | 'phone';
  direction: 'outbound' | 'inbound';
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  metadata: any;
  created_at: string;
  vendor_registry?: {
    name: string;
    primary_contact_email: string;
  };
}

interface VendorNotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VendorNotificationSystem: React.FC<VendorNotificationSystemProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [communications, setCommunications] = useState<VendorCommunication[]>([]);
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Load data
  const loadNotificationData = async () => {
    if (!user?.tenantId) return;

    try {
      setLoading(true);

      // Load communication history
      const { data: commsData, error: commsError } = await supabase
        .from('vendor_communications')
        .select(`
          *,
          vendor_registry:vendor_id (
            name,
            primary_contact_email
          )
        `)
        .eq('tenant_id', user.tenantId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (commsError) {
        console.error('Erro ao carregar comunicações:', commsError);
      } else {
        setCommunications(commsData || []);
      }

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de notificação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotificationData();
      loadDefaultTemplates();
    }
  }, [isOpen, user?.tenantId]);

  // Load default notification templates
  const loadDefaultTemplates = () => {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'assessment_invitation',
        name: 'Convite para Assessment',
        subject: 'Convite para Assessment de Fornecedor - {{vendor_name}}',
        content: `Prezado(a) {{contact_name}},

Esperamos que esteja bem! Como parte do nosso processo de gestão de riscos de fornecedores, gostaríamos de convidá-lo(a) a participar de um assessment de segurança e compliance.

**Detalhes do Assessment:**
- Fornecedor: {{vendor_name}}
- Tipo: {{assessment_type}}
- Prazo: {{due_date}}
- Tempo estimado: {{estimated_time}}

**Como participar:**
1. Acesse o link seguro: {{public_link}}
2. Preencha o questionário online
3. Anexe as evidências solicitadas
4. Confirme o envio

**Suporte ALEX VENDOR:**
Nossa IA especialista está disponível 24/7 para tirar dúvidas durante o preenchimento. Basta clicar no ícone de ajuda no formulário.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe de Vendor Risk Management

---
🤖 Esta mensagem foi otimizada por ALEX VENDOR AI`,
        type: 'assessment_invitation',
        channels: ['email', 'portal'],
        variables: ['vendor_name', 'contact_name', 'assessment_type', 'due_date', 'estimated_time', 'public_link'],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'reminder',
        name: 'Lembrete de Prazo',
        subject: 'Lembrete: Assessment {{vendor_name}} - {{days_remaining}} dias restantes',
        content: `Prezado(a) {{contact_name}},

Este é um lembrete amigável sobre o assessment de fornecedor pendente.

**Status Atual:**
- Progresso: {{progress}}% concluído
- Prazo: {{due_date}} ({{days_remaining}} dias restantes)
- Link de acesso: {{public_link}}

**ALEX VENDOR - Insights:**
{{alex_recommendations}}

Caso precise de assistência, nossa IA está disponível no portal do assessment.

Atenciosamente,
Equipe de Vendor Risk Management`,
        type: 'reminder',
        channels: ['email', 'sms'],
        variables: ['vendor_name', 'contact_name', 'days_remaining', 'progress', 'due_date', 'public_link', 'alex_recommendations'],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'deadline_warning',
        name: 'Alerta de Prazo Vencendo',
        subject: '🚨 URGENTE: Assessment {{vendor_name}} vence em {{hours_remaining}} horas',
        content: `Prezado(a) {{contact_name}},

⚠️ **AÇÃO NECESSÁRIA IMEDIATA**

Seu assessment de fornecedor vence em {{hours_remaining}} horas!

**Detalhes:**
- Assessment: {{assessment_name}}
- Vencimento: {{due_date}} às {{due_time}}
- Progresso atual: {{progress}}%
- Acesso direto: {{public_link}}

**Status de pendências:**
{{pending_sections}}

Para evitar reprocessamento e garantir continuidade da parceria, complete o assessment até o prazo.

**Suporte Urgente:**
- WhatsApp: {{support_phone}}
- Email: {{support_email}}
- ALEX VENDOR AI: Disponível 24h no portal

Atenciosamente,
Equipe de Vendor Risk Management`,
        type: 'deadline_warning',
        channels: ['email', 'sms', 'portal'],
        variables: ['vendor_name', 'contact_name', 'hours_remaining', 'assessment_name', 'due_date', 'due_time', 'progress', 'public_link', 'pending_sections', 'support_phone', 'support_email'],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'completion_confirmation',
        name: 'Confirmação de Conclusão',
        subject: '✅ Assessment Concluído - {{vendor_name}}',
        content: `Prezado(a) {{contact_name}},

Parabéns! Seu assessment foi concluído com sucesso.

**Resumo da Submissão:**
- Data/hora: {{submission_date}}
- Progresso: 100% concluído
- Questões respondidas: {{questions_answered}}/{{total_questions}}
- Evidências anexadas: {{attachments_count}}

**Próximos Passos:**
1. Nossa equipe irá revisar as respostas (prazo: {{review_timeline}})
2. Você receberá o resultado por email
3. Se necessário, entraremos em contato para esclarecimentos

**ALEX VENDOR - Análise Preliminar:**
{{alex_preliminary_analysis}}

Agradecemos sua colaboração no processo de gestão de riscos.

Atenciosamente,
Equipe de Vendor Risk Management`,
        type: 'completion_confirmation',
        channels: ['email', 'portal'],
        variables: ['vendor_name', 'contact_name', 'submission_date', 'questions_answered', 'total_questions', 'attachments_count', 'review_timeline', 'alex_preliminary_analysis'],
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    setTemplates(defaultTemplates);
  };

  // Send notification
  const sendNotification = async (
    vendorId: string,
    templateId: string,
    variables: Record<string, string>,
    channels: string[] = ['email']
  ) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      // Replace variables in content
      let subject = template.subject;
      let content = template.content;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        content = content.replace(new RegExp(placeholder, 'g'), value);
      });

      // Save communication record
      const communicationData = {
        tenant_id: user?.tenantId,
        vendor_id: vendorId,
        subject,
        content,
        channel: channels[0],
        direction: 'outbound',
        status: 'sent',
        metadata: {
          template_id: templateId,
          channels,
          variables,
          sent_by: user?.id,
          alex_generated: true
        }
      };

      const { error } = await supabase
        .from('vendor_communications')
        .insert(communicationData);

      if (error) throw error;

      // Here would integrate with actual email/SMS service
      console.log('Notification sent:', {
        subject,
        content,
        channels,
        vendorId
      });

      toast({
        title: "Notificação Enviada",
        description: `Notificação enviada com sucesso via ${channels.join(', ')}`
      });

      await loadNotificationData();

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação",
        variant: "destructive"
      });
    }
  };

  // Get communication stats
  const getCommunicationStats = () => {
    const total = communications.length;
    const sent = communications.filter(c => c.status === 'sent').length;
    const delivered = communications.filter(c => c.status === 'delivered').length;
    const failed = communications.filter(c => c.status === 'failed').length;
    const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return { total, sent, delivered, failed, deliveryRate };
  };

  const stats = getCommunicationStats();

  // Filter communications
  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = !searchTerm || 
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.vendor_registry?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || comm.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            ALEX VENDOR - Sistema de Notificações
          </DialogTitle>
          <DialogDescription>
            Gestão centralizada de comunicações com fornecedores
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comunicações
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automação
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-4 space-y-4 overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Enviadas
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Entregues
                      </p>
                      <p className="text-2xl font-bold">{stats.delivered}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Taxa de Entrega
                      </p>
                      <p className="text-2xl font-bold">{stats.deliveryRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Falhas
                      </p>
                      <p className="text-2xl font-bold">{stats.failed}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ALEX Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  ALEX VENDOR - Insights de Comunicação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-primary mb-2">
                      📊 Análise de Performance
                    </h4>
                    <p className="text-sm text-primary/80">
                      Taxa de entrega de {stats.deliveryRate}% está {stats.deliveryRate >= 95 ? 'excelente' : stats.deliveryRate >= 85 ? 'boa' : 'abaixo do ideal'}. 
                      {stats.deliveryRate < 85 && ' Recomendo revisar lista de contatos e templates.'}
                    </p>
                  </div>

                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      🎯 Recomendações Inteligentes
                    </h4>
                    <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                      <li>• Implementar lembretes automáticos 7, 3 e 1 dia antes do vencimento</li>
                      <li>• Personalizar templates baseados no perfil do fornecedor</li>
                      <li>• Integrar notificações SMS para assessments críticos</li>
                      <li>• Setup de escalação automática para fornecedores não responsivos</li>
                    </ul>
                  </div>

                  {stats.failed > 0 && (
                    <div className="bg-yellow-500/10 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        ⚠️ Atenção Necessária
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        {stats.failed} notificações falharam. Verificar endereços de email e configurações SMTP.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Communications */}
            <Card>
              <CardHeader>
                <CardTitle>Comunicações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {communications.slice(0, 10).map(comm => (
                    <div key={comm.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium">{comm.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {comm.vendor_registry?.name} • {new Date(comm.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={comm.status === 'delivered' ? 'default' : comm.status === 'failed' ? 'destructive' : 'secondary'}>
                          {comm.status}
                        </Badge>
                        {comm.channel === 'email' && <Mail className="h-4 w-4 text-muted-foreground" />}
                        {comm.channel === 'sms' && <Smartphone className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="mt-4 space-y-4 overflow-y-auto">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar comunicações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="failed">Falharam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Communications Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommunications.map(comm => (
                      <TableRow key={comm.id}>
                        <TableCell className="font-medium">{comm.subject}</TableCell>
                        <TableCell>{comm.vendor_registry?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {comm.channel === 'email' && <Mail className="h-4 w-4" />}
                            {comm.channel === 'sms' && <Smartphone className="h-4 w-4" />}
                            {comm.channel === 'portal' && <Globe className="h-4 w-4" />}
                            <span className="capitalize">{comm.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            comm.status === 'delivered' ? 'default' :
                            comm.status === 'failed' ? 'destructive' :
                            'secondary'
                          }>
                            {comm.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-4 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {template.type.replace('_', ' ')}
                        </Badge>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => {
                            setTemplates(prev => prev.map(t => 
                              t.id === template.id ? { ...t, is_active: checked } : t
                            ));
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">ASSUNTO</Label>
                        <p className="text-sm">{template.subject}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">CONTEÚDO</Label>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {template.content}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">CANAIS</Label>
                        <div className="flex gap-1 mt-1">
                          {template.channels.map(channel => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">VARIÁVEIS</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.slice(0, 3).map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="mt-4 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Automações Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      ALEX VENDOR - Automações Disponíveis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {[
                        {
                          title: 'Lembretes Automáticos',
                          description: 'Envia lembretes 7, 3 e 1 dias antes do vencimento',
                          active: true
                        },
                        {
                          title: 'Escalação Inteligente',
                          description: 'Escalação automática para gestores após X dias sem resposta',
                          active: false
                        },
                        {
                          title: 'Personalização por Perfil',
                          description: 'Templates personalizados baseados no tipo de fornecedor',
                          active: true
                        },
                        {
                          title: 'Follow-up Pós-Assessment',
                          description: 'Comunicação automática após conclusão do assessment',
                          active: true
                        }
                      ].map((automation, index) => (
                        <div key={index} className="bg-card p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{automation.title}</h5>
                            <Switch checked={automation.active} />
                          </div>
                          <p className="text-sm text-muted-foreground">{automation.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-medium mb-4">Configurações de Automação</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-reminders">Lembretes Automáticos</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar lembretes automáticos antes do vencimento
                          </p>
                        </div>
                        <Switch id="auto-reminders" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="smart-escalation">Escalação Inteligente</Label>
                          <p className="text-sm text-muted-foreground">
                            Escalar automaticamente para gestores após prazo
                          </p>
                        </div>
                        <Switch id="smart-escalation" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="ai-optimization">Otimização por IA</Label>
                          <p className="text-sm text-muted-foreground">
                            ALEX VENDOR otimiza horários e conteúdo automaticamente
                          </p>
                        </div>
                        <Switch id="ai-optimization" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
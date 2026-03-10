import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare,
  Send,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Archive,
  Star,
  Flag,
  Paperclip,
  Download,
  Bell,
  Settings,
  User,
  Building,
  Shield,
  Target,
  Brain,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Risk } from '@/types/risk-management';

interface CommunicationMessage {
  id: string;
  type: 'notification' | 'alert' | 'update' | 'approval_request' | 'escalation' | 'reminder';
  title: string;
  content: string;
  sender: string;
  recipients: string[];
  riskId: string;
  riskName: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'archived';
  sentAt?: string;
  readAt?: string;
  channel: 'email' | 'sms' | 'push' | 'internal' | 'teams' | 'slack';
  attachments: Attachment[];
  tags: string[];
  isStarred: boolean;
  requiresResponse: boolean;
  responseDeadline?: string;
  responses: Response[];
  template?: string;
  automatedBy?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Response {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'reply' | 'acknowledgment' | 'approval' | 'rejection';
}

interface CommunicationCenterIntegratedProps {
  risks: Risk[];
  onSendMessage: (message: CommunicationMessage) => void;
}

export const CommunicationCenterIntegrated: React.FC<CommunicationCenterIntegratedProps> = ({
  risks,
  onSendMessage
}) => {
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showStarred, setShowStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [newMessage, setNewMessage] = useState<Partial<CommunicationMessage>>({
    type: 'notification',
    priority: 'medium',
    channel: 'email',
    recipients: [],
    attachments: [],
    tags: [],
    requiresResponse: false
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    
    // Simular carregamento
    setTimeout(() => {
      const mockMessages: CommunicationMessage[] = [
        {
          id: 'msg-001',
          type: 'alert',
          title: 'Risco Crítico Identificado - Ação Imediata Necessária',
          content: 'Um novo risco crítico de segurança cibernética foi identificado pelo Alex Risk. Vulnerabilidade crítica detectada que requer ação imediata da equipe de TI.',
          sender: 'Alex Risk IA',
          recipients: ['Diretor de TI', 'CISO', 'Gerente de Segurança'],
          riskId: 'risk-001',
          riskName: 'Vulnerabilidade Crítica de Segurança',
          priority: 'high',
          status: 'sent',
          sentAt: '2024-12-15T10:30:00Z',
          channel: 'email',
          attachments: [
            {
              id: 'att-001',
              name: 'Relatório_Vulnerabilidade.pdf',
              type: 'application/pdf',
              size: 2048576,
              url: '/attachments/vuln-report.pdf'
            }
          ],
          tags: ['crítico', 'segurança', 'urgente'],
          isStarred: true,
          requiresResponse: true,
          responseDeadline: '2024-12-16T18:00:00Z',
          responses: [
            {
              id: 'resp-001',
              author: 'Diretor de TI',
              content: 'Recebido. Equipe já mobilizada para análise e correção.',
              timestamp: '2024-12-15T11:15:00Z',
              type: 'acknowledgment'
            }
          ],
          automatedBy: 'Alex Risk'
        },
        {
          id: 'msg-002',
          type: 'approval_request',
          title: 'Solicitação de Aprovação - Plano de Ação',
          content: 'Solicitação de aprovação para implementação do plano de ação de continuidade de negócios. Orçamento estimado: R$ 200.000.',
          sender: 'Maria Santos',
          recipients: ['CEO', 'CFO', 'Diretor de Operações'],
          riskId: 'risk-002',
          riskName: 'Falha de Sistema Crítico',
          priority: 'high',
          status: 'delivered',
          sentAt: '2024-12-14T15:45:00Z',
          readAt: '2024-12-14T16:30:00Z',
          channel: 'internal',
          attachments: [],
          tags: ['aprovação', 'orçamento', 'continuidade'],
          isStarred: false,
          requiresResponse: true,
          responseDeadline: '2024-12-18T23:59:59Z',
          responses: [
            {
              id: 'resp-002',
              author: 'CEO',
              content: 'Aprovado. Prossiga com a implementação.',
              timestamp: '2024-12-14T17:15:00Z',
              type: 'approval'
            }
          ]
        },
        {
          id: 'msg-003',
          type: 'update',
          title: 'Atualização de Status - Conformidade LGPD',
          content: 'Progresso do projeto de adequação LGPD: 75% concluído. Próximas etapas incluem treinamento da equipe e auditoria final.',
          sender: 'Pedro Costa',
          recipients: ['Jurídico', 'Compliance', 'RH'],
          riskId: 'risk-003',
          riskName: 'Não Conformidade LGPD',
          priority: 'medium',
          status: 'read',
          sentAt: '2024-12-13T09:15:00Z',
          readAt: '2024-12-13T14:22:00Z',
          channel: 'email',
          attachments: [],
          tags: ['lgpd', 'progresso', 'compliance'],
          isStarred: false,
          requiresResponse: false,
          responses: []
        },
        {
          id: 'msg-004',
          type: 'reminder',
          title: 'Lembrete: Revisão Mensal de Riscos',
          content: 'Lembrete automático: A revisão mensal de riscos está agendada para amanhã às 14h. Por favor, prepare os relatórios de status.',
          sender: 'Sistema GRC',
          recipients: ['Todos os Gestores de Risco'],
          riskId: '',
          riskName: 'Revisão Geral',
          priority: 'low',
          status: 'sent',
          sentAt: '2024-12-12T08:00:00Z',
          channel: 'push',
          attachments: [],
          tags: ['lembrete', 'revisão', 'mensal'],
          isStarred: false,
          requiresResponse: false,
          responses: [],
          automatedBy: 'Sistema'
        },
        {
          id: 'msg-005',
          type: 'escalation',
          title: 'Escalação: Risco Não Tratado no Prazo',
          content: 'O risco "Falha de Backup" não foi tratado dentro do prazo estabelecido. Escalando para a diretoria conforme política de governança.',
          sender: 'Alex Risk IA',
          recipients: ['CEO', 'CTO', 'Diretor de TI'],
          riskId: 'risk-004',
          riskName: 'Falha de Sistema de Backup',
          priority: 'high',
          status: 'delivered',
          sentAt: '2024-12-11T16:30:00Z',
          channel: 'email',
          attachments: [],
          tags: ['escalação', 'prazo', 'backup'],
          isStarred: true,
          requiresResponse: true,
          responseDeadline: '2024-12-13T23:59:59Z',
          responses: [],
          automatedBy: 'Alex Risk'
        }
      ];
      
      setMessages(mockMessages);
      setIsLoading(false);
    }, 1000);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.riskName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || message.type === filterType;
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;
    const matchesStarred = !showStarred || message.isStarred;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesStarred;
  });

  const handleSendMessage = () => {
    if (!newMessage.title || !newMessage.content || !newMessage.recipients?.length) {
      toast({
        title: '❌ Campos Obrigatórios',
        description: 'Preencha título, conteúdo e destinatários',
        variant: 'destructive'
      });
      return;
    }

    const message: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      type: newMessage.type as any,
      title: newMessage.title,
      content: newMessage.content,
      sender: 'Usuário Atual',
      recipients: newMessage.recipients || [],
      riskId: newMessage.riskId || '',
      riskName: newMessage.riskName || '',
      priority: newMessage.priority as any,
      status: 'sent',
      sentAt: new Date().toISOString(),
      channel: newMessage.channel as any,
      attachments: newMessage.attachments || [],
      tags: newMessage.tags || [],
      isStarred: false,
      requiresResponse: newMessage.requiresResponse || false,
      responseDeadline: newMessage.responseDeadline,
      responses: []
    };

    setMessages(prev => [message, ...prev]);
    onSendMessage(message);
    
    setShowComposer(false);
    setNewMessage({
      type: 'notification',
      priority: 'medium',
      channel: 'email',
      recipients: [],
      attachments: [],
      tags: [],
      requiresResponse: false
    });

    toast({
      title: '✅ Mensagem Enviada',
      description: 'Comunicação enviada com sucesso',
    });
  };

  const handleToggleStar = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const handleAddResponse = (messageId: string, content: string, type: 'reply' | 'acknowledgment' | 'approval' | 'rejection') => {
    const response: Response = {
      id: `resp-${Date.now()}`,
      author: 'Usuário Atual',
      content,
      timestamp: new Date().toISOString(),
      type
    };

    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { 
        ...msg, 
        responses: [...msg.responses, response],
        status: 'read'
      } : msg
    ));

    toast({
      title: '💬 Resposta Enviada',
      description: 'Sua resposta foi registrada',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notification': return Bell;
      case 'alert': return AlertTriangle;
      case 'update': return MessageSquare;
      case 'approval_request': return CheckCircle;
      case 'escalation': return Flag;
      case 'reminder': return Clock;
      default: return MessageSquare;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'notification': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'update': return 'bg-green-100 text-green-800';
      case 'approval_request': return 'bg-purple-100 text-purple-800';
      case 'escalation': return 'bg-orange-100 text-orange-800';
      case 'reminder': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando central de comunicações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span>Central de Comunicações Integrada</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {messages.filter(m => m.status === 'sent' || m.status === 'delivered').length} ativas
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Gestão centralizada de comunicações, notificações e aprovações relacionadas a riscos
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Mensagens */}
        <div className="lg:col-span-2">
          {/* Controles */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => setShowComposer(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova Mensagem
                  </Button>
                  
                  <Button 
                    variant={showStarred ? "default" : "outline"}
                    onClick={() => setShowStarred(!showStarred)}
                    size="sm"
                  >
                    <Star className={`h-4 w-4 mr-1 ${showStarred ? 'fill-current' : ''}`} />
                    Favoritas
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {messages.filter(m => m.priority === 'high').length} urgentes
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {messages.filter(m => m.requiresResponse && isOverdue(m.responseDeadline)).length} vencidas
                  </Badge>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar mensagens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="notification">Notificação</option>
                  <option value="alert">Alerta</option>
                  <option value="update">Atualização</option>
                  <option value="approval_request">Aprovação</option>
                  <option value="escalation">Escalação</option>
                  <option value="reminder">Lembrete</option>
                </select>
                
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="draft">Rascunho</option>
                  <option value="sent">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="read">Lido</option>
                  <option value="archived">Arquivado</option>
                </select>
                
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">Todas as Prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Mais
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Lista */}
          <div className="space-y-4">
            {filteredMessages.map((message) => {
              const TypeIcon = getTypeIcon(message.type);
              const isUrgent = message.priority === 'high';
              const hasOverdueResponse = message.requiresResponse && isOverdue(message.responseDeadline);
              
              return (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                  } ${isUrgent ? 'border-red-200 bg-red-50' : ''} ${hasOverdueResponse ? 'border-orange-200 bg-orange-50' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Ícone do tipo */}
                      <div className="p-2 rounded-lg bg-blue-100">
                        <TypeIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{message.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {message.content}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge className={`text-xs ${getTypeColor(message.type)}`}>
                              {message.type}
                            </Badge>
                            
                            <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </Badge>
                            
                            <Badge className={`text-xs ${getStatusColor(message.status)}`}>
                              {message.status}
                            </Badge>
                            
                            {message.automatedBy && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                <Brain className="h-3 w-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Metadados */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <span>De: {message.sender}</span>
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{message.recipients.length} destinatários</span>
                            </span>
                            {message.riskName && (
                              <span className="flex items-center space-x-1">
                                <Shield className="h-3 w-3" />
                                <span>{message.riskName}</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {message.requiresResponse && hasOverdueResponse && (
                              <Badge variant="destructive" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Vencido
                              </Badge>
                            )}
                            
                            {message.isStarred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                            
                            {message.attachments.length > 0 && (
                              <Paperclip className="h-3 w-3" />
                            )}
                            
                            <span>{message.sentAt ? formatDate(message.sentAt) : 'Rascunho'}</span>
                          </div>
                        </div>
                        
                        {/* Respostas */}
                        {message.responses.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              <span>{message.responses.length} resposta(s)</span>
                              <span>•</span>
                              <span>Última: {formatDate(message.responses[message.responses.length - 1].timestamp)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredMessages.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma mensagem encontrada</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou criar uma nova mensagem
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Painel de Detalhes */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="space-y-4">
              {/* Detalhes da Mensagem */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{selectedMessage.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(selectedMessage.id)}
                    >
                      <Star className={`h-4 w-4 ${selectedMessage.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Conteúdo */}
                  <div className="text-sm">
                    {selectedMessage.content}
                  </div>
                  
                  {/* Metadados */}
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">De:</span>
                      <span>{selectedMessage.sender}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Para:</span>
                      <span className="text-right">{selectedMessage.recipients.join(', ')}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Canal:</span>
                      <span>{selectedMessage.channel}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enviado:</span>
                      <span>{selectedMessage.sentAt ? formatDate(selectedMessage.sentAt) : 'Não enviado'}</span>
                    </div>
                    
                    {selectedMessage.requiresResponse && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prazo:</span>
                        <span className={isOverdue(selectedMessage.responseDeadline) ? 'text-red-600 font-medium' : ''}>
                          {selectedMessage.responseDeadline ? formatDate(selectedMessage.responseDeadline) : 'Sem prazo'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Anexos */}
                  {selectedMessage.attachments.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Anexos ({selectedMessage.attachments.length})</h4>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm">{attachment.name}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {selectedMessage.tags.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMessage.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Respostas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Respostas ({selectedMessage.responses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de Respostas */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedMessage.responses.map((response) => (
                      <div key={response.id} className="border-l-2 border-gray-200 pl-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{response.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{response.content}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {response.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  {/* Nova Resposta */}
                  {selectedMessage.requiresResponse && (
                    <div className="border-t pt-4">
                      <Textarea
                        placeholder="Digite sua resposta..."
                        rows={3}
                      />
                      <div className="flex space-x-2 mt-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAddResponse(selectedMessage.id, 'Resposta de exemplo', 'reply')}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Responder
                        </Button>
                        
                        {selectedMessage.type === 'approval_request' && (
                          <>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleAddResponse(selectedMessage.id, 'Aprovado', 'approval')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovar
                            </Button>
                            
                            <Button 
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleAddResponse(selectedMessage.id, 'Rejeitado', 'rejection')}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma Mensagem</h3>
                <p className="text-muted-foreground">
                  Clique em uma mensagem para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nova Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <select 
                    value={newMessage.type} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="notification">Notificação</option>
                    <option value="alert">Alerta</option>
                    <option value="update">Atualização</option>
                    <option value="approval_request">Solicitação de Aprovação</option>
                    <option value="reminder">Lembrete</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select 
                    value={newMessage.priority} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={newMessage.title || ''}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da mensagem"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Conteúdo</label>
                <Textarea
                  value={newMessage.content || ''}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Conteúdo da mensagem"
                  rows={6}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Destinatários</label>
                <Input
                  value={newMessage.recipients?.join(', ') || ''}
                  onChange={(e) => setNewMessage(prev => ({ 
                    ...prev, 
                    recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r) 
                  }))}
                  placeholder="Digite os destinatários separados por vírgula"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newMessage.requiresResponse || false}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, requiresResponse: e.target.checked }))}
                  />
                  <span className="text-sm">Requer resposta</span>
                </label>
                
                {newMessage.requiresResponse && (
                  <Input
                    type="datetime-local"
                    value={newMessage.responseDeadline || ''}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, responseDeadline: e.target.value }))}
                    className="w-auto"
                  />
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowComposer(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
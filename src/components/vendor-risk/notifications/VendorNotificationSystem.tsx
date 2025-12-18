import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  Mail,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  History,
  LayoutTemplate,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Plus,
  Inbox,
  MessageSquare,
  FilePlus,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VendorRegistry, VendorAssessment } from '@/hooks/useVendorRiskManagement';
import { supabase } from '@/integrations/supabase/client';

export interface VendorNotificationSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: VendorRegistry[];
  assessments: VendorAssessment[];
}

export const VendorNotificationSystem: React.FC<VendorNotificationSystemProps> = ({
  open,
  onOpenChange,
  vendors,
  assessments
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Email Composer State
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    assessmentId: '',
    vendorId: ''
  });

  // Template Editor State
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', type: 'custom', content: '' });

  // Message State
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // Assessment Filter State
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState('all');

  // Filter data for notifications
  const pendingReminders = assessments.filter(a => a.status === 'sent');
  const overdueAssessments = assessments.filter(a =>
    new Date(a.due_date) < new Date() && !['completed', 'approved'].includes(a.status)
  );

  // Expanded Assessment List (All Statuses)
  const allAssessments = assessments.filter(a => {
    if (assessmentStatusFilter === 'all') return true;
    return a.status === assessmentStatusFilter;
  });

  const completedAssessments = assessments.filter(a => ['completed', 'approved'].includes(a.status));

  // Messages State with DB integration
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_risk_messages')
        .select(`
          id,
          content,
          created_at,
          sender_type,
          vendor_registry:vendor_id (name),
          vendor_id,
          assessment_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map((msg: any) => ({
          id: msg.id,
          vendor: msg.vendor_registry?.name || 'Fornecedor',
          subject: 'Nova Mensagem',
          date: msg.created_at,
          status: msg.sender_type === 'vendor' ? 'received' : 'sent',
          preview: msg.content.substring(0, 50) + '...',
          content: msg.content,
          vendorId: msg.vendor_id,
          assessmentId: msg.assessment_id
        }));
        setMessages(formatted);
        console.log("📨 Messages loaded:", formatted);
      } else {
        console.log("📨 No messages found or data is null");
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mensagens.",
        variant: "destructive"
      });
    }
  };

  // Filter Messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.vendor.toLowerCase().includes(messageSearch.toLowerCase()) ||
      msg.subject.toLowerCase().includes(messageSearch.toLowerCase());
    const matchesFilter = messageFilter === 'all' || msg.status === messageFilter;
    return matchesSearch && matchesFilter;
  });

  // Mock Templates
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Lembrete Padrão',
      subject: 'Lembrete: Assessment de Segurança Pendente',
      type: 'reminder',
      content: 'Olá,\n\nEste é um lembrete amigável de que o assessment ainda está pendente.\n\nPor favor, complete-o assim que possível.\n\nAtenciosamente,\nEquipe de Compliance'
    },
    {
      id: 2,
      name: 'Cobrança de Atraso',
      subject: 'URGENTE: Assessment de Segurança em Atraso',
      type: 'overdue',
      content: 'Prezados,\n\nNotamos que o assessment está atrasado.\n\nPor favor, regularize a situação imediatamente.\n\nAtenciosamente,\nEquipe de Compliance'
    },
    {
      id: 3,
      name: 'Convite Inicial',
      subject: 'Convite para Avaliação de Fornecedor',
      type: 'invite',
      content: 'Olá,\n\nVocê foi convidado para participar de nosso processo de avaliação de fornecedores.\n\nClique no link para iniciar.\n\nAtenciosamente,\nEquipe de Compliance'
    },
    {
      id: 4,
      name: 'Agradecimento',
      subject: 'Obrigado por completar o Assessment',
      type: 'thank_you',
      content: 'Olá,\n\nRecebemos suas respostas. Nossa equipe irá analisá-las em breve.\n\nObrigado pela colaboração.\n\nAtenciosamente,\nEquipe de Compliance'
    },
  ]);

  const handleOpenComposer = (type: 'reminder' | 'overdue' | 'custom' | 'reply', assessment?: VendorAssessment, replyContext?: any) => {
    let subject = '';
    let message = '';
    let to = '';
    let assessmentId = '';
    let vendorId = '';

    if (assessment) {
      const vendorName = assessment.vendor_registry?.name || 'Fornecedor';
      const assessmentName = assessment.assessment_name;
      const link = `${window.location.origin}/vendor-assessment/${assessment.public_link}`;
      const dueDate = new Date(assessment.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

      to = assessment.vendor_registry?.primary_contact_email || '';
      assessmentId = assessment.id;
      vendorId = assessment.vendor_id;

      if (type === 'reminder') {
        subject = `Lembrete: Assessment de Segurança - ${assessmentName}`;
        message = `Olá,\n\nEste é um lembrete amigável de que o assessment "${assessmentName}" ainda está pendente.\n\nPrazo: ${dueDate}\nLink: ${link}\n\nPor favor, complete-o assim que possível.\n\nAtenciosamente,\nEquipe de Compliance`;
      } else if (type === 'overdue') {
        subject = `URGENTE: Assessment em Atraso - ${assessmentName}`;
        message = `Prezados,\n\nNotamos que o assessment "${assessmentName}" está atrasado (Vencimento: ${dueDate}).\n\nPor favor, regularize a situação imediatamente acessando o link abaixo:\n${link}\n\nCaso tenha dificuldades, entre em contato conosco.\n\nAtenciosamente,\nEquipe de Compliance`;
      } else {
        subject = `Contato sobre Assessment - ${assessmentName}`;
        message = `Olá,\n\nGostaríamos de falar sobre o assessment "${assessmentName}".\n\n...\n\nAtenciosamente,\nEquipe de Compliance`;
      }
    } else if (type === 'reply' && replyContext) {
      // Reply mode using context from selected message
      subject = `Re: ${replyContext.subject}`;
      message = '\n\nAtenciosamente,\nEquipe de Compliance';
      assessmentId = replyContext.assessmentId;
      vendorId = replyContext.vendorId;
      to = replyContext.vendor; // Just for display
    } else {
      // Generic
      subject = 'Re: Assessment de Segurança';
      message = '\n\nAtenciosamente,\nEquipe de Compliance';
    }

    setEmailData({
      to,
      subject,
      message,
      assessmentId,
      vendorId
    });
    setShowEmailComposer(true);
  };

  const handleSendEmail = async () => {
    if (!emailData.vendorId) {
      toast({
        title: "Erro de Destinatário",
        description: "Fornecedor não identificado para envio.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('vendor_risk_messages').insert({
        vendor_id: emailData.vendorId,
        assessment_id: emailData.assessmentId || null,
        sender_type: 'internal',
        content: emailData.message
      });

      if (error) throw error;

      setShowEmailComposer(false);

      toast({
        title: "Mensagem Enviada",
        description: `Mensagem enviada com sucesso.`,
      });

      await fetchMessages(); // Refresh list
      setEmailData({ to: '', subject: '', message: '', assessmentId: '', vendorId: '' });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao Enviar",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
    }
  };

  const handleSendAll = (type: string) => {
    toast({
      title: "Processando Envio em Massa",
      description: "Os emails estão sendo colocados na fila de envio.",
    });
  };

  const handleNewAssessment = () => {
    onOpenChange(false); // Close modal
    // In a real app, this would trigger the "New Assessment" flow in the parent
    toast({
      title: "Redirecionando",
      description: "Abrindo assistente de criação de assessment...",
    });
  };

  // Template Actions
  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      type: template.type,
      content: template.content || ''
    });
    setShowTemplateEditor(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', subject: '', type: 'custom', content: '' });
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateForm } : t));
      toast({ title: "Modelo Atualizado", description: "As alterações foram salvas com sucesso." });
    } else {
      setTemplates(prev => [...prev, { id: Date.now(), ...templateForm }]);
      toast({ title: "Modelo Criado", description: "Novo modelo adicionado à biblioteca." });
    }
    setShowTemplateEditor(false);
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({ title: "Modelo Removido", description: "O modelo foi excluído com sucesso." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <div className="p-6 border-b bg-muted/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-semibold">Central de Comunicação</span>
                <span className="text-muted-foreground font-normal ml-2 text-base">Vendor Risk</span>
              </div>
            </DialogTitle>
            <DialogDescription className="ml-11">
              Hub central de relacionamento com fornecedores.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex-1 flex">
            {/* Sidebar */}
            <div className="w-72 border-r bg-muted/30 flex-shrink-0">
              <div className="p-4">
                <TabsList className="flex flex-col h-auto w-full gap-1.5 bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-border transition-all"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-3" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-border transition-all"
                  >
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Mensagens
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-[20px] justify-center bg-primary/10 text-primary">
                      {messages.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="assessments"
                    className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-border transition-all"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Assessments
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-[20px] justify-center bg-muted text-muted-foreground">
                      {assessments.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-border transition-all"
                  >
                    <Clock className="h-4 w-4 mr-3" />
                    Ações Pendentes
                    {(pendingReminders.length + overdueAssessments.length) > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-[20px] justify-center bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        {pendingReminders.length + overdueAssessments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="templates"
                    className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent data-[state=active]:border-border transition-all"
                  >
                    <Copy className="h-4 w-4 mr-3" />
                    Modelos
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-background/50">
              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 p-8 space-y-8 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-red-500/5 border-red-200/50 dark:border-red-900/50 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Em Atraso</p>
                        <h3 className="text-3xl font-bold text-red-700 dark:text-red-300">{overdueAssessments.length}</h3>
                      </div>
                      <div className="p-3 bg-red-100/50 dark:bg-red-900/20 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/5 border-blue-200/50 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Mensagens</p>
                        <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-300">{messages.length}</h3>
                      </div>
                      <div className="p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-full">
                        <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/5 border-green-200/50 dark:border-green-900/50 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Concluídos</p>
                        <h3 className="text-3xl font-bold text-green-700 dark:text-green-300">{completedAssessments.length}</h3>
                      </div>
                      <div className="p-3 bg-green-100/50 dark:bg-green-900/20 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Sugestões de Ação
                    </h3>
                  </div>

                  {overdueAssessments.length > 0 && (
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            Cobrar Assessments Atrasados
                            <Badge variant="destructive" className="ml-2">{overdueAssessments.length}</Badge>
                          </span>
                          <Button size="sm" onClick={() => handleSendAll('overdue')} className="bg-red-600 hover:bg-red-700 text-white">
                            Cobrar Todos
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Existem avaliações que passaram da data de vencimento e requerem atenção imediata.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

                  {pendingReminders.length > 0 && (
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            Enviar Lembretes de Preenchimento
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{pendingReminders.length}</Badge>
                          </span>
                          <Button size="sm" variant="outline" onClick={() => handleSendAll('reminder')} className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                            Enviar Todos
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Fornecedores que receberam o link mas ainda não iniciaram ou concluíram o processo.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

                  {overdueAssessments.length === 0 && pendingReminders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 bg-muted/10 rounded-xl border border-dashed">
                      <div className="p-4 bg-green-100/50 dark:bg-green-900/20 rounded-full mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Tudo em dia!</h3>
                      <p className="text-muted-foreground text-center max-w-sm">
                        Não há ações pendentes de comunicação no momento.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="m-0 focus-visible:outline-none">
                <div className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                  <div>
                    <h3 className="text-lg font-semibold">Mensagens</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Histórico de interações com fornecedores.
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={fetchMessages} title="Atualizar">
                      <Clock className="h-4 w-4 mr-1" />
                      Atualizar
                    </Button>
                    <Select value={messageFilter} onValueChange={setMessageFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="received">Recebidas</SelectItem>
                        <SelectItem value="sent">Enviadas</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar mensagens..."
                        className="pl-9 w-64"
                        value={messageSearch}
                        onChange={(e) => setMessageSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map(msg => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className="group flex items-start gap-4 p-4 bg-card border rounded-xl hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${msg.status === 'received'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                          {msg.vendor.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold truncate pr-2">{msg.vendor}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(msg.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {msg.status === 'received' ? (
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Recebida</Badge>
                            ) : (
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">Enviada</Badge>
                            )}
                            <div className="font-medium text-sm truncate">{msg.subject}</div>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                            {msg.preview}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <Inbox className="h-12 w-12 mb-4 opacity-20" />
                      <p>Nenhuma mensagem encontrada.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Assessments Tab (Expanded) */}
              <TabsContent value="assessments" className="m-0 focus-visible:outline-none">
                <div className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                  <div>
                    <h3 className="text-lg font-semibold">Gerenciar Assessments</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visão completa de todos os processos de avaliação.
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Select value={assessmentStatusFilter} onValueChange={setAssessmentStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="sent">Enviado</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="gap-2" onClick={handleNewAssessment}>
                      <FilePlus className="h-4 w-4" />
                      Novo Assessment
                    </Button>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  {allAssessments.length > 0 ? (
                    allAssessments.map(assessment => (
                      <div key={assessment.id} className="group flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">
                              {assessment.vendor_registry?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{assessment.assessment_name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                              </Badge>
                              <Badge variant={
                                assessment.status === 'completed' ? 'default' :
                                  assessment.status === 'sent' ? 'secondary' :
                                    assessment.status === 'draft' ? 'outline' : 'destructive'
                              } className="text-xs capitalize">
                                {assessment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenComposer('custom', assessment)}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 bg-muted/30 rounded-full mb-4">
                        <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium">Nenhum assessment encontrado</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Tente ajustar os filtros de busca.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Pending Actions Tab */}
              <TabsContent value="pending" className="m-0 focus-visible:outline-none">
                <div className="px-8 py-6 border-b bg-muted/5 sticky top-0 bg-background/95 backdrop-blur z-10">
                  <h3 className="text-lg font-semibold">Ações Pendentes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lista detalhada de itens que requerem sua atenção ou comunicação.
                  </p>
                </div>
                <div className="p-8 space-y-8">
                  {/* Overdue Section */}
                  {overdueAssessments.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2 uppercase tracking-wider">
                        <AlertTriangle className="h-4 w-4" />
                        Atrasados ({overdueAssessments.length})
                      </h4>
                      <div className="grid gap-3">
                        {overdueAssessments.map(assessment => (
                          <div key={assessment.id} className="group flex items-center justify-between p-4 bg-card border rounded-xl hover:border-red-200 dark:hover:border-red-900 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-red-100/50 dark:bg-red-900/20 rounded-lg mt-0.5">
                                <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                                  {assessment.vendor_registry?.name}
                                </div>
                                <div className="text-sm text-muted-foreground">{assessment.assessment_name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                                    Venceu: {new Date(assessment.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm" onClick={() => handleOpenComposer('overdue', assessment)}>
                              <Send className="h-3 w-3" />
                              Cobrar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reminders Section */}
                  {pendingReminders.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                        <Clock className="h-4 w-4" />
                        Aguardando Resposta ({pendingReminders.length})
                      </h4>
                      <div className="grid gap-3">
                        {pendingReminders.map(assessment => (
                          <div key={assessment.id} className="group flex items-center justify-between p-4 bg-card border rounded-xl hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg mt-0.5">
                                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                  {assessment.vendor_registry?.name}
                                </div>
                                <div className="text-sm text-muted-foreground">{assessment.assessment_name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    Enviado: {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800" onClick={() => handleOpenComposer('reminder', assessment)}>
                              <Bell className="h-3 w-3" />
                              Lembrar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {overdueAssessments.length === 0 && pendingReminders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 bg-muted/30 rounded-full mb-4">
                        <CheckCircle2 className="h-10 w-10 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium">Nenhuma ação pendente</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Você está em dia com todas as comunicações.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="m-0 focus-visible:outline-none">
                <div className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                  <div>
                    <h3 className="text-lg font-semibold">Modelos de Email</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gerencie os templates de notificação padrão.
                    </p>
                  </div>
                  <Button size="sm" className="gap-2" onClick={handleNewTemplate}>
                    <Plus className="h-4 w-4" />
                    Novo Modelo
                  </Button>
                </div>
                <div className="p-8">
                  {templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map(template => (
                        <Card key={template.id} className="group hover:shadow-md transition-all">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                              {template.name}
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditTemplate(template)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteTemplate(template.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                              {template.subject}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs capitalize">
                                {template.type}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 bg-muted/30 rounded-full mb-4">
                        <Copy className="h-10 w-10 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium">Nenhum modelo encontrado</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Crie seu primeiro modelo de email para agilizar suas comunicações.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>

      {/* Nested Email Composer Dialog */}
      <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
        <DialogContent className="max-w-2xl z-[60]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Enviar Email
            </DialogTitle>
            <DialogDescription>
              Personalize a mensagem antes de enviar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Para</Label>
              <Input value={emailData.to} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailComposer(false)}>Cancelar</Button>
            <Button onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested Template Editor Dialog */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-2xl z-[60]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {editingTemplate ? 'Editar Modelo' : 'Novo Modelo'}
            </DialogTitle>
            <DialogDescription>
              Defina o nome e o assunto padrão do modelo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome do Modelo</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Cobrança Padrão"
              />
            </div>
            <div className="space-y-2">
              <Label>Assunto do Email</Label>
              <Input
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ex: Lembrete de Assessment"
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo da Mensagem</Label>
              <Textarea
                value={templateForm.content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Digite o corpo do email..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateEditor(false)}>Cancelar</Button>
            <Button onClick={handleSaveTemplate}>
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Details Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl z-[60]">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={selectedMessage.status === 'received' ? 'default' : 'secondary'}>
                    {selectedMessage.status === 'received' ? 'Recebida' : 'Enviada'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedMessage.date).toLocaleString('pt-BR')}
                  </span>
                </div>
                <DialogTitle className="text-xl">{selectedMessage.subject}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-2">
                  <span className="font-medium text-foreground">{selectedMessage.vendor}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 border-y my-2">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedMessage.content}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  const replyContext = selectedMessage;
                  setSelectedMessage(null);
                  handleOpenComposer('reply', undefined, replyContext);
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Responder
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
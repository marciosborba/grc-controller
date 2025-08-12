import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  User,
  Building2,
  AlertCircle,
  CheckCircle,
  Eye,
  Archive,
  Filter,
  Download,
  Upload,
  FileText,
  Users,
  Zap,
  Shield,
  Target,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendorCommunication {
  id: string;
  vendor_id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  sent_at?: string;
  created_by: string;
  created_at: string;
  recipients?: Array<{
    name: string;
    email: string;
    role: string;
    organization: 'Internal' | 'Vendor';
  }>;
}

interface VendorCommunicationPanelProps {
  vendors: any[];
  communications: VendorCommunication[];
  onSendCommunication: (data: any) => void;
}

const VendorCommunicationPanel = ({ 
  vendors, 
  communications, 
  onSendCommunication 
}: VendorCommunicationPanelProps) => {
  const [isNewCommunicationOpen, setIsNewCommunicationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newCommunication, setNewCommunication] = useState({
    vendor_id: '',
    type: 'General Communication',
    subject: '',
    message: '',
    priority: 'Medium',
    recipients: [] as Array<{
      name: string;
      email: string;
      role: string;
      organization: 'Internal' | 'Vendor';
    }>
  });

  const communicationTypes = [
    { value: 'Onboarding', label: 'Onboarding', icon: Users },
    { value: 'Assessment Request', label: 'Solicitação de Assessment', icon: FileText },
    { value: 'Issue Notification', label: 'Notificação de Problema', icon: AlertCircle },
    { value: 'Performance Review', label: 'Revisão de Performance', icon: Target },
    { value: 'Contract Renewal', label: 'Renovação de Contrato', icon: Calendar },
    { value: 'Termination Notice', label: 'Aviso de Rescisão', icon: Archive },
    { value: 'General Communication', label: 'Comunicação Geral', icon: MessageSquare },
    { value: 'Escalation', label: 'Escalação', icon: Zap }
  ];

  const priorities = [
    { value: 'Low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
    { value: 'Medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'High', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'Urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
  ];

  const statuses = [
    { value: 'Draft', label: 'Rascunho', icon: FileText, color: 'bg-gray-100 text-gray-800' },
    { value: 'Sent', label: 'Enviado', icon: Send, color: 'bg-blue-100 text-blue-800' },
    { value: 'Delivered', label: 'Entregue', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'Read', label: 'Lido', icon: Eye, color: 'bg-purple-100 text-purple-800' },
    { value: 'Responded', label: 'Respondido', icon: MessageSquare, color: 'bg-teal-100 text-teal-800' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setNewCommunication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRecipient = (type: 'internal' | 'vendor') => {
    const newRecipient = {
      name: '',
      email: '',
      role: '',
      organization: type === 'internal' ? 'Internal' as const : 'Vendor' as const
    };
    
    setNewCommunication(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient]
    }));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    const updatedRecipients = [...newCommunication.recipients];
    updatedRecipients[index] = { ...updatedRecipients[index], [field]: value };
    setNewCommunication(prev => ({
      ...prev,
      recipients: updatedRecipients
    }));
  };

  const removeRecipient = (index: number) => {
    const updatedRecipients = newCommunication.recipients.filter((_, i) => i !== index);
    setNewCommunication(prev => ({
      ...prev,
      recipients: updatedRecipients
    }));
  };

  const handleSubmit = () => {
    onSendCommunication(newCommunication);
    setNewCommunication({
      vendor_id: '',
      type: 'General Communication',
      subject: '',
      message: '',
      priority: 'Medium',
      recipients: []
    });
    setIsNewCommunicationOpen(false);
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'sent') return matchesSearch && comm.status === 'Sent';
    if (activeTab === 'pending') return matchesSearch && comm.status === 'Draft';
    if (activeTab === 'delivered') return matchesSearch && comm.status === 'Delivered';
    
    return matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    const typeObj = communicationTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : MessageSquare;
  };

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-800';
  };

  // Métricas das comunicações
  const metrics = {
    total: communications.length,
    sent: communications.filter(c => c.status === 'Sent').length,
    pending: communications.filter(c => c.status === 'Draft').length,
    highPriority: communications.filter(c => c.priority === 'High' || c.priority === 'Urgent').length,
  };

  return (
    <div className="space-y-6">
      {/* Header com métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Send className="h-5 w-5 text-green-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Enviadas</p>
                <p className="text-lg font-bold">{metrics.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Pendentes</p>
                <p className="text-lg font-bold">{metrics.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-red-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Alta Prioridade</p>
                <p className="text-lg font-bold">{metrics.highPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar comunicações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              
              <Dialog open={isNewCommunicationOpen} onOpenChange={setIsNewCommunicationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Comunicação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Comunicação com Fornecedor</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fornecedor *</Label>
                        <Select 
                          value={newCommunication.vendor_id} 
                          onValueChange={(value) => handleInputChange('vendor_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  {vendor.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de Comunicação *</Label>
                        <Select 
                          value={newCommunication.type} 
                          onValueChange={(value) => handleInputChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {communicationTypes.map((type) => {
                              const IconComponent = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select 
                          value={newCommunication.priority} 
                          onValueChange={(value) => handleInputChange('priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Assunto *</Label>
                      <Input
                        value={newCommunication.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Assunto da comunicação..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mensagem *</Label>
                      <Textarea
                        value={newCommunication.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Digite sua mensagem aqui..."
                        rows={6}
                      />
                    </div>

                    {/* Destinatários */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Destinatários</Label>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addRecipient('internal')}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Adicionar Interno
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addRecipient('vendor')}
                          >
                            <Building2 className="mr-2 h-4 w-4" />
                            Adicionar Fornecedor
                          </Button>
                        </div>
                      </div>

                      {newCommunication.recipients.map((recipient, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <Input
                              placeholder="Nome"
                              value={recipient.name}
                              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                            />
                            <Input
                              placeholder="Email"
                              type="email"
                              value={recipient.email}
                              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            />
                            <Input
                              placeholder="Cargo"
                              value={recipient.role}
                              onChange={(e) => updateRecipient(index, 'role', e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {recipient.organization === 'Internal' ? 'Interno' : 'Fornecedor'}
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRecipient(index)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsNewCommunicationOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleSubmit}
                      >
                        Salvar Rascunho
                      </Button>
                      <Button onClick={handleSubmit}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comunicações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comunicações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todas ({communications.length})</TabsTrigger>
              <TabsTrigger value="sent">Enviadas ({metrics.sent})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({metrics.pending})</TabsTrigger>
              <TabsTrigger value="delivered">Entregues ({communications.filter(c => c.status === 'Delivered').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {filteredCommunications.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Nenhuma comunicação encontrada
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === 'all' 
                      ? 'Comece criando sua primeira comunicação com fornecedores.'
                      : `Nenhuma comunicação encontrada para o filtro "${activeTab}".`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCommunications.map((communication) => {
                    const TypeIcon = getTypeIcon(communication.type);
                    const selectedVendor = vendors.find(v => v.id === communication.vendor_id);
                    
                    return (
                      <Card key={communication.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="flex-shrink-0">
                                <TypeIcon className="h-8 w-8 text-blue-500" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-medium truncate">
                                    {communication.subject}
                                  </h3>
                                  <Badge className={`text-xs ${getPriorityColor(communication.priority)}`}>
                                    {communication.priority}
                                  </Badge>
                                  <Badge className={`text-xs ${getStatusColor(communication.status)}`}>
                                    {communication.status}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{selectedVendor?.name || 'Fornecedor não encontrado'}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {formatDistanceToNow(new Date(communication.created_at), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {communication.type}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {communication.message}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Archive className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCommunicationPanel;
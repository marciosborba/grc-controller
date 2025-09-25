import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Scale,
  Shield,
  Send,
  Plus,
  Edit,
  Save,
  X,
  ExternalLink,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface RegulatoryNotification {
  id: string;
  ethics_report_id: string;
  regulatory_body: string;
  notification_type: string;
  notification_trigger: string;
  notification_deadline?: string;
  notification_status: string;
  notification_content?: string;
  submission_method?: string;
  submission_date?: string;
  submission_reference?: string;
  regulator_response?: string;
  response_date?: string;
  follow_up_required: boolean;
  follow_up_deadline?: string;
  legal_counsel_involved: boolean;
  outside_counsel_id?: string;
  privilege_concerns: boolean;
  confidentiality_requested: boolean;
  public_disclosure_risk: string;
  business_impact_assessment?: string;
  communication_restrictions?: string;
  created_at: string;
  updated_at: string;
  ethics_reports?: {
    title: string;
    protocol_number: string;
  };
}

interface RegulatoryNotificationManagerProps {
  reportId?: string;
  onUpdate?: () => void;
}

const REGULATORY_BODIES = {
  'SEC': {
    name: 'Securities and Exchange Commission',
    description: 'Securities violations, public company compliance',
    urgency: 'high',
    typical_deadline_days: 4
  },
  'CFTC': {
    name: 'Commodity Futures Trading Commission',
    description: 'Derivatives, commodities, futures trading',
    urgency: 'high',
    typical_deadline_days: 3
  },
  'DOJ': {
    name: 'Department of Justice',
    description: 'Criminal matters, bribery, corruption, antitrust',
    urgency: 'critical',
    typical_deadline_days: 2
  },
  'FTC': {
    name: 'Federal Trade Commission',
    description: 'Consumer protection, competition, mergers',
    urgency: 'medium',
    typical_deadline_days: 10
  },
  'OSHA': {
    name: 'Occupational Safety and Health Administration',
    description: 'Workplace safety, occupational health violations',
    urgency: 'high',
    typical_deadline_days: 1
  },
  'EPA': {
    name: 'Environmental Protection Agency',
    description: 'Environmental violations, pollution incidents',
    urgency: 'high',
    typical_deadline_days: 1
  },
  'STATE_AG': {
    name: 'State Attorney General',
    description: 'State-level violations, consumer protection',
    urgency: 'medium',
    typical_deadline_days: 7
  }
};

const RegulatoryNotificationManager: React.FC<RegulatoryNotificationManagerProps> = ({ 
  reportId,
  onUpdate 
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RegulatoryNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<RegulatoryNotification | null>(null);
  const [formData, setFormData] = useState<Partial<RegulatoryNotification>>({
    regulatory_body: 'SEC',
    notification_type: 'mandatory',
    notification_status: 'pending',
    follow_up_required: false,
    legal_counsel_involved: false,
    privilege_concerns: false,
    confidentiality_requested: false,
    public_disclosure_risk: 'low'
  });

  useEffect(() => {
    if (user && (user.tenantId || user.isPlatformAdmin)) {
      fetchRegulatoryNotifications();
    }
  }, [reportId, user]);

  const fetchRegulatoryNotifications = async () => {
    if (!user?.tenantId && !user?.isPlatformAdmin) {
      setIsLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from('ethics_regulatory_notifications')
        .select('*');
      
      if (reportId) {
        query = query.eq('ethics_report_id', reportId);
      } else if (!user.isPlatformAdmin && user.tenantId) {
        query = query.eq('tenant_id', user.tenantId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching regulatory notifications:', error);
      toast.error('Erro ao carregar notificações regulatórias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.regulatory_body || !formData.notification_trigger) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      // Auto-calculate deadline if not provided
      if (!formData.notification_deadline && formData.regulatory_body) {
        const body = REGULATORY_BODIES[formData.regulatory_body as keyof typeof REGULATORY_BODIES];
        if (body) {
          const deadline = addDays(new Date(), body.typical_deadline_days);
          formData.notification_deadline = deadline.toISOString().split('T')[0];
        }
      }

      const notificationData = {
        ...formData,
        ethics_report_id: reportId,
        tenant_id: user?.tenant_id,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (editingNotification) {
        const { error } = await supabase
          .from('ethics_regulatory_notifications')
          .update(notificationData)
          .eq('id', editingNotification.id);
        
        if (error) throw error;
        toast.success('Notificação regulatória atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('ethics_regulatory_notifications')
          .insert(notificationData);
        
        if (error) throw error;
        toast.success('Notificação regulatória criada com sucesso');
      }

      setIsCreateDialogOpen(false);
      setEditingNotification(null);
      setFormData({
        regulatory_body: 'SEC',
        notification_type: 'mandatory',
        notification_status: 'pending',
        follow_up_required: false,
        legal_counsel_involved: false,
        privilege_concerns: false,
        confidentiality_requested: false,
        public_disclosure_risk: 'low'
      });
      fetchRegulatoryNotifications();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving regulatory notification:', error);
      toast.error('Erro ao salvar notificação regulatória');
    }
  };

  const handleEdit = (notification: RegulatoryNotification) => {
    setEditingNotification(notification);
    setFormData(notification);
    setIsCreateDialogOpen(true);
  };

  const updateStatus = async (notificationId: string, newStatus: string) => {
    try {
      const updateData: any = {
        notification_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'submitted') {
        updateData.submission_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ethics_regulatory_notifications')
        .update(updateData)
        .eq('id', notificationId);

      if (error) throw error;
      
      toast.success('Status da notificação atualizado');
      fetchRegulatoryNotifications();
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      'prepared': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'submitted': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'acknowledged': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      'closed': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      'critical': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-blue-500'
    };
    return colors[urgency] || 'bg-gray-500';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      'certain': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      'high': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
      'medium': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      'low': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'none': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando notificações regulatórias...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Notificações Regulatórias</h3>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Notificação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? 'Editar Notificação Regulatória' : 'Nova Notificação Regulatória'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="submission">Submissão</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="impact">Impacto</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="regulatory_body">Órgão Regulador</Label>
                    <Select 
                      value={formData.regulatory_body} 
                      onValueChange={(value) => setFormData({...formData, regulatory_body: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REGULATORY_BODIES).map(([key, body]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-2 h-2 rounded-full ${getUrgencyColor(body.urgency)}`}
                              />
                              {body.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.regulatory_body && (
                      <p className="text-xs text-gray-500 mt-1">
                        {REGULATORY_BODIES[formData.regulatory_body as keyof typeof REGULATORY_BODIES]?.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notification_type">Tipo de Notificação</Label>
                    <Select 
                      value={formData.notification_type} 
                      onValueChange={(value) => setFormData({...formData, notification_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mandatory">Obrigatória</SelectItem>
                        <SelectItem value="voluntary">Voluntária</SelectItem>
                        <SelectItem value="whistleblower">Whistleblower</SelectItem>
                        <SelectItem value="cooperation">Cooperação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notification_status">Status</Label>
                    <Select 
                      value={formData.notification_status} 
                      onValueChange={(value) => setFormData({...formData, notification_status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="prepared">Preparada</SelectItem>
                        <SelectItem value="submitted">Submetida</SelectItem>
                        <SelectItem value="acknowledged">Reconhecida</SelectItem>
                        <SelectItem value="closed">Fechada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notification_deadline">Prazo Limite</Label>
                    <Input
                      id="notification_deadline"
                      type="date"
                      value={formData.notification_deadline}
                      onChange={(e) => setFormData({...formData, notification_deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notification_trigger">Motivo da Notificação *</Label>
                  <Input
                    id="notification_trigger"
                    value={formData.notification_trigger}
                    onChange={(e) => setFormData({...formData, notification_trigger: e.target.value})}
                    placeholder="Evento ou circunstância que requer a notificação"
                  />
                </div>

                <div>
                  <Label htmlFor="notification_content">Conteúdo da Notificação</Label>
                  <Textarea
                    id="notification_content"
                    value={formData.notification_content}
                    onChange={(e) => setFormData({...formData, notification_content: e.target.value})}
                    rows={4}
                    placeholder="Conteúdo detalhado da notificação..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="submission" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="submission_method">Método de Submissão</Label>
                    <Select 
                      value={formData.submission_method} 
                      onValueChange={(value) => setFormData({...formData, submission_method: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online_portal">Portal Online</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="mail">Correio</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="in_person">Pessoalmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="submission_date">Data de Submissão</Label>
                    <Input
                      id="submission_date"
                      type="datetime-local"
                      value={formData.submission_date?.substring(0, 16)}
                      onChange={(e) => setFormData({...formData, submission_date: e.target.value + ':00.000Z'})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="submission_reference">Referência da Submissão</Label>
                    <Input
                      id="submission_reference"
                      value={formData.submission_reference}
                      onChange={(e) => setFormData({...formData, submission_reference: e.target.value})}
                      placeholder="Número de protocolo ou referência"
                    />
                  </div>

                  <div>
                    <Label htmlFor="response_date">Data da Resposta</Label>
                    <Input
                      id="response_date"
                      type="datetime-local"
                      value={formData.response_date?.substring(0, 16)}
                      onChange={(e) => setFormData({...formData, response_date: e.target.value + ':00.000Z'})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="regulator_response">Resposta do Regulador</Label>
                  <Textarea
                    id="regulator_response"
                    value={formData.regulator_response}
                    onChange={(e) => setFormData({...formData, regulator_response: e.target.value})}
                    rows={4}
                    placeholder="Resposta recebida do órgão regulador..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="follow_up_required"
                      checked={formData.follow_up_required}
                      onCheckedChange={(checked) => setFormData({...formData, follow_up_required: checked as boolean})}
                    />
                    <Label htmlFor="follow_up_required">Follow-up Necessário</Label>
                  </div>

                  {formData.follow_up_required && (
                    <div>
                      <Label htmlFor="follow_up_deadline">Prazo para Follow-up</Label>
                      <Input
                        id="follow_up_deadline"
                        type="date"
                        value={formData.follow_up_deadline}
                        onChange={(e) => setFormData({...formData, follow_up_deadline: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="legal" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="legal_counsel_involved"
                      checked={formData.legal_counsel_involved}
                      onCheckedChange={(checked) => setFormData({...formData, legal_counsel_involved: checked as boolean})}
                    />
                    <Label htmlFor="legal_counsel_involved">Advogado Envolvido</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privilege_concerns"
                      checked={formData.privilege_concerns}
                      onCheckedChange={(checked) => setFormData({...formData, privilege_concerns: checked as boolean})}
                    />
                    <Label htmlFor="privilege_concerns">Preocupações com Privilégio Legal</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confidentiality_requested"
                      checked={formData.confidentiality_requested}
                      onCheckedChange={(checked) => setFormData({...formData, confidentiality_requested: checked as boolean})}
                    />
                    <Label htmlFor="confidentiality_requested">Confidencialidade Solicitada</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="communication_restrictions">Restrições de Comunicação</Label>
                  <Textarea
                    id="communication_restrictions"
                    value={formData.communication_restrictions}
                    onChange={(e) => setFormData({...formData, communication_restrictions: e.target.value})}
                    rows={3}
                    placeholder="Quaisquer restrições na comunicação com o regulador..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="impact" className="space-y-4">
                <div>
                  <Label htmlFor="public_disclosure_risk">Risco de Divulgação Pública</Label>
                  <Select 
                    value={formData.public_disclosure_risk} 
                    onValueChange={(value) => setFormData({...formData, public_disclosure_risk: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="certain">Certo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="business_impact_assessment">Avaliação de Impacto nos Negócios</Label>
                  <Textarea
                    id="business_impact_assessment"
                    value={formData.business_impact_assessment}
                    onChange={(e) => setFormData({...formData, business_impact_assessment: e.target.value})}
                    rows={4}
                    placeholder="Análise do potencial impacto nos negócios..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Notificação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overdue Alerts */}
      {notifications.some(n => isOverdue(n.notification_deadline) && n.notification_status === 'pending') && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Atenção:</strong> Existem notificações regulatórias em atraso que requerem ação imediata.
          </AlertDescription>
        </Alert>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação regulatória registrada ainda.</p>
            <p>Clique em "Nova Notificação" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const regulatoryBody = REGULATORY_BODIES[notification.regulatory_body as keyof typeof REGULATORY_BODIES];
            const overdue = isOverdue(notification.notification_deadline);
            
            return (
              <Card key={notification.id} className={`hover:shadow-md transition-shadow ${overdue ? 'border-red-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">
                          {regulatoryBody?.name || notification.regulatory_body}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {notification.notification_type === 'mandatory' ? 'Obrigatória' :
                           notification.notification_type === 'voluntary' ? 'Voluntária' :
                           notification.notification_type === 'whistleblower' ? 'Whistleblower' :
                           notification.notification_type === 'cooperation' ? 'Cooperação' :
                           notification.notification_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {overdue && (
                        <Badge className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Atrasado
                        </Badge>
                      )}
                      {notification.privilege_concerns && (
                        <Badge className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Privilegiado
                        </Badge>
                      )}
                      <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(notification.notification_status)}`}>
                        {notification.notification_status === 'pending' ? 'Pendente' :
                         notification.notification_status === 'prepared' ? 'Preparada' :
                         notification.notification_status === 'submitted' ? 'Submetida' :
                         notification.notification_status === 'acknowledged' ? 'Reconhecida' :
                         notification.notification_status === 'closed' ? 'Fechada' :
                         notification.notification_status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(notification)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Motivo da Notificação:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.notification_trigger}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {notification.notification_deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            {format(new Date(notification.notification_deadline), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      {notification.submission_date && (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4 text-gray-500" />
                          <span>Submetida: {format(new Date(notification.submission_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                        <span>Risco: </span>
                        <Badge className={`text-xs px-1 py-0.5 ${getRiskColor(notification.public_disclosure_risk)}`}>
                          {notification.public_disclosure_risk === 'none' ? 'Nenhum' :
                           notification.public_disclosure_risk === 'low' ? 'Baixo' :
                           notification.public_disclosure_risk === 'medium' ? 'Médio' :
                           notification.public_disclosure_risk === 'high' ? 'Alto' :
                           notification.public_disclosure_risk === 'certain' ? 'Certo' :
                           notification.public_disclosure_risk}
                        </Badge>
                      </div>
                      {regulatoryBody && (
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getUrgencyColor(regulatoryBody.urgency)}`}
                          />
                          <span>Urgência: {regulatoryBody.urgency}</span>
                        </div>
                      )}
                    </div>

                    {notification.submission_reference && (
                      <div className="border-t pt-2">
                        <span className="font-medium text-sm">Referência: </span>
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                          {notification.submission_reference}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      {notification.notification_status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateStatus(notification.id, 'prepared')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Preparar
                        </Button>
                      )}
                      {notification.notification_status === 'prepared' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateStatus(notification.id, 'submitted')}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Submeter
                        </Button>
                      )}
                      {notification.notification_status === 'submitted' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateStatus(notification.id, 'acknowledged')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconhecer
                        </Button>
                      )}
                      {notification.follow_up_required && (
                        <Button size="sm" variant="outline">
                          <Clock className="h-4 w-4 mr-1" />
                          Follow-up
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RegulatoryNotificationManager;
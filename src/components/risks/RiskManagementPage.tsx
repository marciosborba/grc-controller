import React, { useState, useEffect, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Plus, Search, Calendar as CalendarIcon, Edit, Trash2, Brain, Shield, Target, Users, Mail, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';

import { AIContentGenerator } from '@/components/ai/AIContentGenerator';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';
import { cn } from '@/lib/utils';
import { useRisks, useCreateRisk, useUpdateRisk, useDeleteRisk, useRiskDetails } from '@/hooks/useRisks';
import RiskTableRow from './RiskTableRow';
import VirtualizedTable from '@/components/ui/VirtualizedTable';

const RiskManagementPage = React.memo(() => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [dueDate, setDueDate] = useState<Date>();
  
  // Estados para plano de ação
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [newActivity, setNewActivity] = useState({
    description: '',
    responsible_person: '',
    deadline: '',
    status: 'Pendente'
  });
  
  // Estados para comunicação
  const [communications, setCommunications] = useState<any[]>([]);
  const [newCommunication, setNewCommunication] = useState({
    person_name: '',
    person_email: '',
    decision: '',
    justification: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Use optimized hooks
  const { risks, isLoading } = useRisks();
  const createRiskMutation = useCreateRisk();
  const updateRiskMutation = useUpdateRisk();
  const deleteRiskMutation = useDeleteRisk();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    risk_category: '',
    severity: 'medium',
    probability: 'medium',
    impact_score: 5,
    likelihood_score: 5,
    status: 'open',
    assigned_to: '',
    treatment_type: 'Mitigar'
  });

  // Optimized filtering with useMemo
  const filteredRisks = useMemo(() => {
    let filtered = risks;
    
    if (searchTerm) {
      filtered = filtered.filter(risk => 
        risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.risk_category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (riskLevelFilter !== 'all') {
      filtered = filtered.filter(risk => risk.risk_level === riskLevelFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(risk => risk.status === statusFilter);
    }
    
    return filtered;
  }, [risks, searchTerm, riskLevelFilter, statusFilter]);

  // Hook for editing specific risk details 
  const { data: riskDetails, isLoading: isLoadingDetails } = useRiskDetails(editingRisk?.id || '');

  // Update local state when risk details are loaded
  useEffect(() => {
    if (riskDetails && editingRisk) {
      setActionPlan(riskDetails.actionPlan);
      setActivities(riskDetails.activities);
      setCommunications(riskDetails.communications);
      if (riskDetails.actionPlan) {
        setFormData(prev => ({ ...prev, treatment_type: riskDetails.actionPlan.treatment_type }));
      }
    }
  }, [riskDetails, editingRisk]);

  const sendRiskNotification = async (recipientEmail: string, recipientName: string, riskData: any) => {
    try {
      const response = await fetch(`https://myxvxponlmulnjstbjwd.supabase.co/functions/v1/risk-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4`,
        },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          riskTitle: riskData.title,
          riskDescription: riskData.description,
          riskLevel: riskData.risk_level || 'Médio',
          riskCategory: riskData.risk_category,
          senderName: (user as any)?.full_name || 'Sistema'
        }),
      });

      if (!response.ok) throw new Error('Erro ao enviar notificação');
      
      toast({
        title: 'Sucesso',
        description: `Notificação enviada para ${recipientEmail}`,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: 'Aviso',
        description: 'Risco criado, mas falha ao enviar notificação por e-mail',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const riskData = {
        title: formData.title,
        description: formData.description,
        risk_category: formData.risk_category,
        severity: formData.severity,
        probability: formData.probability,
        impact_score: formData.impact_score,
        likelihood_score: formData.likelihood_score,
        status: formData.status,
        assigned_to: formData.assigned_to || null,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        created_by: user?.id,
        // Calculate risk level and score
        risk_score: formData.impact_score * formData.likelihood_score,
        risk_level: formData.impact_score * formData.likelihood_score >= 75 ? 'Muito Alto' :
                   formData.impact_score * formData.likelihood_score >= 50 ? 'Alto' :
                   formData.impact_score * formData.likelihood_score >= 25 ? 'Médio' : 'Baixo'
      };

      let savedRisk;
      
      if (editingRisk) {
        savedRisk = await updateRiskMutation.mutateAsync({ id: editingRisk.id, ...riskData });
      } else {
        savedRisk = await createRiskMutation.mutateAsync(riskData);
      }

      // TODO: Implement action plans and communications optimization in future iterations
      // For now, keeping the modal simple and focusing on core risk management
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      // Error handling is now handled by the mutations
    }
  };

  const handleEdit = (risk: any) => {
    setEditingRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description || '',
      risk_category: risk.risk_category,
      severity: risk.severity,
      probability: risk.probability,
      impact_score: risk.impact_score,
      likelihood_score: risk.likelihood_score,
      status: risk.status,
      assigned_to: risk.assigned_to || '',
      treatment_type: 'Mitigar'
    });
    setDueDate(risk.due_date ? new Date(risk.due_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este risco?')) return;
    await deleteRiskMutation.mutateAsync(id);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      risk_category: '',
      severity: 'medium',
      probability: 'medium',
      impact_score: 5,
      likelihood_score: 5,
      status: 'open',
      assigned_to: '',
      treatment_type: 'Mitigar'
    });
    setDueDate(undefined);
    setEditingRisk(null);
    setActionPlan(null);
    setActivities([]);
    setCommunications([]);
    setNewActivity({
      description: '',
      responsible_person: '',
      deadline: '',
      status: 'Pendente'
    });
    setNewCommunication({
      person_name: '',
      person_email: '',
      decision: '',
      justification: ''
    });
  };

  const getRiskLevelColor = useMemo(() => (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Médio': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mitigated': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const addActivity = () => {
    if (newActivity.description && newActivity.responsible_person) {
      setActivities([...activities, {
        id: '',
        action_plan_id: '',
        ...newActivity,
        deadline: newActivity.deadline || null,
        evidence_url: null,
        evidence_description: null
      }]);
      setNewActivity({
        description: '',
        responsible_person: '',
        deadline: '',
        status: 'Pendente'
      });
    }
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const addCommunication = () => {
    if (newCommunication.person_name && newCommunication.person_email) {
      setCommunications([...communications, {
        id: '',
        risk_id: '',
        ...newCommunication,
        communication_date: new Date().toISOString(),
        notified_at: null
      }]);
      setNewCommunication({
        person_name: '',
        person_email: '',
        decision: '',
        justification: ''
      });
    }
  };

  const removeCommunication = (index: number) => {
    setCommunications(communications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Riscos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Monitore e avalie riscos corporativos</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <ImprovedAIChatDialog 
            type="risk"
            context={{ risks: filteredRisks }}
            trigger={
              <Button variant="outline" className="flex items-center space-x-2 hover:bg-red-50 transition-colors">
                <div className="p-1 rounded-full bg-red-500">
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <span>Chat com ALEX RISK</span>
                <Badge variant="secondary" className="text-xs">
                  IA
                </Badge>
              </Button>
            }
          />
          
          <AIContentGenerator 
            type="risk_assessment"
            trigger={
              <Button variant="outline" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Gerar com IA</span>
              </Button>
            }
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Risco
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{editingRisk ? 'Editar Risco' : 'Novo Risco'}</span>
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Informações Básicas</span>
                  </TabsTrigger>
                  <TabsTrigger value="action" className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Plano de Ação</span>
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Comunicação</span>
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required
                          placeholder="Ex: Vulnerabilidade crítica no sistema de pagamentos"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={3}
                          placeholder="Descreva detalhadamente o risco identificado..."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <Select
                          value={formData.risk_category}
                          onValueChange={(value) => setFormData({...formData, risk_category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cyber Security">Segurança Cibernética</SelectItem>
                            <SelectItem value="Data Privacy">Privacidade de Dados</SelectItem>
                            <SelectItem value="Operational">Operacional</SelectItem>
                            <SelectItem value="Financial">Financeiro</SelectItem>
                            <SelectItem value="Compliance">Conformidade</SelectItem>
                            <SelectItem value="Strategic">Estratégico</SelectItem>
                            <SelectItem value="Reputational">Reputacional</SelectItem>
                            <SelectItem value="Third Party">Terceiros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) => setFormData({...formData, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="in_progress">Em Progresso</SelectItem>
                            <SelectItem value="mitigated">Mitigado</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Impacto (1-10) *</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.impact_score}
                          onChange={(e) => setFormData({...formData, impact_score: parseInt(e.target.value)})}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">1 = Insignificante, 10 = Catastrófico</p>
                      </div>
                      
                      <div>
                        <Label>Probabilidade (1-10) *</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.likelihood_score}
                          onChange={(e) => setFormData({...formData, likelihood_score: parseInt(e.target.value)})}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">1 = Raro, 10 = Quase Certo</p>
                      </div>
                      
                      <div className="col-span-2">
                        <Label>Data de Vencimento</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dueDate}
                              onSelect={setDueDate}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="col-span-2">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <Label className="text-sm font-medium">Nível de Risco Calculado</Label>
                          <div className="mt-2">
                            <Badge className={getRiskLevelColor(
                              formData.impact_score * formData.likelihood_score >= 75 ? 'Muito Alto' :
                              formData.impact_score * formData.likelihood_score >= 50 ? 'Alto' :
                              formData.impact_score * formData.likelihood_score >= 25 ? 'Médio' : 'Baixo'
                            )}>
                              {formData.impact_score * formData.likelihood_score >= 75 ? 'Muito Alto' :
                               formData.impact_score * formData.likelihood_score >= 50 ? 'Alto' :
                               formData.impact_score * formData.likelihood_score >= 25 ? 'Médio' : 'Baixo'}
                            </Badge>
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Score: {formData.impact_score * formData.likelihood_score})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="action" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Tipo de Tratamento *</Label>
                        <Select
                          value={formData.treatment_type}
                          onValueChange={(value) => setFormData({...formData, treatment_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mitigar">Mitigar - Reduzir impacto/probabilidade</SelectItem>
                            <SelectItem value="Transferir">Transferir - Compartilhar o risco</SelectItem>
                            <SelectItem value="Evitar">Evitar - Eliminar a atividade</SelectItem>
                            <SelectItem value="Aceitar">Aceitar - Assumir o risco</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-lg font-medium">Atividades do Plano de Ação</Label>
                        <div className="space-y-3 mt-2">
                          <div className="grid grid-cols-4 gap-2">
                            <Input
                              placeholder="Descrição da atividade"
                              value={newActivity.description}
                              onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                            />
                            <Input
                              placeholder="Responsável"
                              value={newActivity.responsible_person}
                              onChange={(e) => setNewActivity({...newActivity, responsible_person: e.target.value})}
                            />
                            <Input
                              type="date"
                              value={newActivity.deadline}
                              onChange={(e) => setNewActivity({...newActivity, deadline: e.target.value})}
                            />
                            <div className="flex space-x-2">
                              <Select
                                value={newActivity.status}
                                onValueChange={(value) => setNewActivity({...newActivity, status: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pendente">Pendente</SelectItem>
                                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                  <SelectItem value="Concluída">Concluída</SelectItem>
                                  <SelectItem value="Atrasada">Atrasada</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button type="button" onClick={addActivity} size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {activities.length > 0 && (
                            <div className="border rounded-lg">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Atividade</TableHead>
                                    <TableHead className="text-xs">Responsável</TableHead>
                                    <TableHead className="text-xs">Prazo</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                    <TableHead className="text-xs">Ações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {activities.map((activity, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="text-xs">{activity.description}</TableCell>
                                      <TableCell className="text-xs">{activity.responsible_person}</TableCell>
                                      <TableCell className="text-xs">
                                        {activity.deadline ? format(new Date(activity.deadline), 'dd/MM/yyyy') : '-'}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        <Badge variant={activity.status === 'Concluída' ? 'default' : 'secondary'}>
                                          {activity.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeActivity(index)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="communication" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg font-medium">Comunicação e Aceitação do Risco</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label>Nome da Pessoa</Label>
                            <Input
                              placeholder="Nome completo"
                              value={newCommunication.person_name}
                              onChange={(e) => setNewCommunication({...newCommunication, person_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>E-mail</Label>
                            <Input
                              type="email"
                              placeholder="email@empresa.com"
                              value={newCommunication.person_email}
                              onChange={(e) => setNewCommunication({...newCommunication, person_email: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Decisão</Label>
                            <Select
                              value={newCommunication.decision}
                              onValueChange={(value) => setNewCommunication({...newCommunication, decision: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aprovar">Aprovar</SelectItem>
                                <SelectItem value="Rejeitar">Rejeitar</SelectItem>
                                <SelectItem value="Aceitar">Aceitar</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Justificativa</Label>
                            <Input
                              placeholder="Justificativa da decisão"
                              value={newCommunication.justification}
                              onChange={(e) => setNewCommunication({...newCommunication, justification: e.target.value})}
                            />
                          </div>
                          <div className="col-span-2">
                            <Button type="button" onClick={addCommunication} className="w-full">
                              <Mail className="mr-2 h-4 w-4" />
                              Adicionar Pessoa para Comunicação
                            </Button>
                          </div>
                        </div>

                        {communications.length > 0 && (
                          <div className="border rounded-lg mt-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Nome</TableHead>
                                  <TableHead className="text-xs">E-mail</TableHead>
                                  <TableHead className="text-xs">Decisão</TableHead>
                                  <TableHead className="text-xs">Justificativa</TableHead>
                                  <TableHead className="text-xs">Status</TableHead>
                                  <TableHead className="text-xs">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {communications.map((comm, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="text-xs">{comm.person_name}</TableCell>
                                    <TableCell className="text-xs">{comm.person_email}</TableCell>
                                    <TableCell className="text-xs">
                                      {comm.decision && (
                                        <Badge variant={comm.decision === 'Aprovar' ? 'default' : 'secondary'}>
                                          {comm.decision}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-xs">{comm.justification || '-'}</TableCell>
                                    <TableCell className="text-xs">
                                      {comm.notified_at ? (
                                        <Badge variant="default">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Notificado
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">Pendente</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeCommunication(index)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <div className="flex justify-end space-x-2 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingRisk ? 'Atualizar Risco' : 'Criar Risco'}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar riscos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Nível de Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Baixo">Baixo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="mitigated">Mitigado</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Muito Alto</p>
                <p className="text-2xl font-bold">
                  {risks.filter(r => r.risk_level === 'Muito Alto').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Alto</p>
                <p className="text-2xl font-bold">
                  {risks.filter(r => r.risk_level === 'Alto').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {risks.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{risks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Table - Optimized with Virtualization */}
      <Card>
        <CardHeader>
          <CardTitle>Riscos Identificados {filteredRisks.length > 20 && <span className="text-sm text-muted-foreground">({filteredRisks.length} riscos - usando virtualização)</span>}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRisks.length > 0 ? (
            <VirtualizedTable
              data={filteredRisks}
              headers={['Título', 'Categoria', 'Risco', 'Status', 'Score', 'Vencimento', 'Ações']}
              maxHeight={600}
              itemHeight={80}
              renderRow={(risk) => (
                <RiskTableRow
                  key={risk.id}
                  risk={risk}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getRiskLevelColor={getRiskLevelColor}
                  getStatusColor={getStatusColor}
                />
              )}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum risco encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
      

    </div>
  );
});

RiskManagementPage.displayName = 'RiskManagementPage';

export default RiskManagementPage;
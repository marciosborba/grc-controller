import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Calendar,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Shield,
  Target,
  FileText,
  Mail,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  User,
  Building,
  Activity,
  Send,
  Eye,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRiskManagement } from '@/hooks/useRiskManagement';
import { useRiskPDF } from '@/hooks/useRiskPDF';
import { toast } from 'sonner';
import type { 
  Risk, 
  Activity as RiskActivity, 
  RiskCommunication,
  TreatmentType,
  ActivityStatus,
  CommunicationDecision,
  RiskCategory
} from '@/types/risk-management';
import { RISK_CATEGORIES, TREATMENT_TYPES, ACTIVITY_STATUSES } from '@/types/risk-management';

interface RiskCardProps {
  risk: Risk;
  onUpdate?: (riskId: string, updates: any) => void;
  onDelete?: (riskId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const RiskCard: React.FC<RiskCardProps> = ({
  risk,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  canEdit = true,
  canDelete = true
}) => {
  const { user } = useAuth();
  const { addActivity, updateActivity, createAcceptanceLetter } = useRiskManagement();
  const { generateAcceptanceLetter, generateActionPlan, isGenerating } = useRiskPDF();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'action' | 'acceptance' | 'communication'>('general');
  
  // Estados para edição de informações gerais
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [generalData, setGeneralData] = useState({
    name: risk.name,
    description: risk.description || '',
    executiveSummary: risk.executiveSummary || '',
    technicalDetails: risk.technicalDetails || '',
    category: risk.category,
    treatmentType: risk.treatmentType,
    probability: risk.probability,
    impact: risk.impact,
    owner: risk.owner,
    assignedTo: risk.assignedTo || '',
    dueDate: risk.dueDate?.toISOString().split('T')[0] || ''
  });

  // Estados para plano de ação
  const [activities, setActivities] = useState<RiskActivity[]>(risk.actionPlan?.activities || []);
  const [newActivity, setNewActivity] = useState({
    name: '',
    details: '',
    responsible: '',
    dueDate: '',
    priority: 'Média' as const,
    status: 'TBD' as ActivityStatus
  });

  // Estados para carta de aceitação
  const [acceptanceData, setAcceptanceData] = useState({
    justification: '',
    compensatingControls: '',
    businessJustification: '',
    approver: '',
    approverTitle: '',
    reviewConditions: ''
  });

  // Estados para comunicação
  const [communications, setCommunications] = useState<RiskCommunication[]>(risk.communications || []);
  const [newCommunication, setNewCommunication] = useState({
    type: 'Apontamento' as const,
    recipientName: '',
    recipientEmail: '',
    recipientTitle: '',
    subject: '',
    message: '',
    isUrgent: false
  });

  // Calcular nível de risco
  const calculateRiskLevel = () => {
    const score = generalData.probability * generalData.impact;
    if (score >= 20) return 'Muito Alto';
    if (score >= 15) return 'Alto';
    if (score >= 8) return 'Médio';
    if (score >= 4) return 'Baixo';
    return 'Muito Baixo';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identificado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Tratamento': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Monitorado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Fechado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Atrasado': return 'bg-red-100 text-red-800';
      case 'Aguardando': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const handleSaveGeneral = async () => {
    if (onUpdate) {
      const updates = {
        name: generalData.name,
        description: generalData.description,
        executiveSummary: generalData.executiveSummary,
        technicalDetails: generalData.technicalDetails,
        category: generalData.category,
        treatmentType: generalData.treatmentType,
        probability: generalData.probability,
        impact: generalData.impact,
        owner: generalData.owner,
        assignedTo: generalData.assignedTo,
        dueDate: generalData.dueDate ? new Date(generalData.dueDate) : undefined
      };
      
      await onUpdate(risk.id, updates);
      setIsEditingGeneral(false);
    }
  };

  const handleAddActivity = () => {
    if (newActivity.name && newActivity.responsible) {
      const activity: RiskActivity = {
        id: `temp-${Date.now()}`,
        actionPlanId: risk.actionPlan?.id || '',
        name: newActivity.name,
        details: newActivity.details,
        responsible: newActivity.responsible,
        status: newActivity.status,
        priority: newActivity.priority,
        dueDate: newActivity.dueDate ? new Date(newActivity.dueDate) : undefined,
        completionPercentage: 0,
        createdBy: user?.id || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setActivities([...activities, activity]);
      setNewActivity({
        name: '',
        details: '',
        responsible: '',
        dueDate: '',
        priority: 'Média',
        status: 'TBD'
      });
    }
  };

  const handleUpdateActivity = (activityId: string, updates: Partial<RiskActivity>) => {
    setActivities(activities.map(activity => 
      activity.id === activityId ? { ...activity, ...updates } : activity
    ));
  };

  const handleRemoveActivity = (activityId: string) => {
    setActivities(activities.filter(activity => activity.id !== activityId));
  };

  const handleCreateAcceptanceLetter = async () => {
    if (acceptanceData.justification && acceptanceData.approver) {
      await createAcceptanceLetter({
        riskId: risk.id,
        justification: acceptanceData.justification,
        compensatingControls: acceptanceData.compensatingControls,
        businessJustification: acceptanceData.businessJustification,
        approver: acceptanceData.approver,
        approverTitle: acceptanceData.approverTitle,
        approvalDate: new Date(),
        reviewConditions: acceptanceData.reviewConditions,
        isActive: true
      });
    }
  };

  const handleAddCommunication = () => {
    if (newCommunication.recipientName && newCommunication.recipientEmail) {
      const communication: RiskCommunication = {
        id: `temp-${Date.now()}`,
        riskId: risk.id,
        type: newCommunication.type,
        recipientName: newCommunication.recipientName,
        recipientEmail: newCommunication.recipientEmail,
        recipientTitle: newCommunication.recipientTitle,
        subject: newCommunication.subject,
        message: newCommunication.message,
        isUrgent: newCommunication.isUrgent,
        createdBy: user?.id || '',
        createdAt: new Date()
      };

      setCommunications([...communications, communication]);
      setNewCommunication({
        type: 'Apontamento',
        recipientName: '',
        recipientEmail: '',
        recipientTitle: '',
        subject: '',
        message: '',
        isUrgent: false
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      if (generalData.treatmentType === 'Aceitar') {
        const result = await generateAcceptanceLetter(risk, risk.acceptanceLetter);
        if (result.success) {
          toast.success(`PDF gerado com sucesso: ${result.fileName}`);
        } else {
          toast.error(result.error || 'Erro ao gerar PDF');
        }
      } else {
        const result = await generateActionPlan(risk);
        if (result.success) {
          toast.success(`PDF do plano de ação gerado: ${result.fileName}`);
        } else {
          toast.error(result.error || 'Erro ao gerar PDF do plano de ação');
        }
      }
    } catch (error) {
      toast.error('Erro inesperado ao gerar PDF');
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const currentRiskLevel = calculateRiskLevel();
  const showAcceptanceSection = generalData.treatmentType === 'Aceitar';
  const showActionSection = generalData.treatmentType !== 'Aceitar';

  return (
    <Card className={`w-full transition-all duration-300 ${isExpanded ? 'bg-gray-200 dark:bg-gray-700 shadow-xl ring-2 ring-gray-400 dark:ring-gray-500 border-gray-400 dark:border-gray-500' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors py-3 px-4 ${isExpanded ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{risk.name}</CardTitle>
                    <Badge className={getRiskLevelColor(risk.riskLevel)}>
                      {risk.riskLevel}
                    </Badge>
                    <Badge className={getStatusColor(risk.status)}>
                      {risk.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{risk.category}</span>
                    <span>•</span>
                    <span className="truncate">Score: {risk.riskScore}</span>
                    {risk.owner && (
                      <>
                        <span>•</span>
                        <span className="truncate">Proprietário: {risk.owner}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Treatment */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {risk.treatmentType}
                </Badge>
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                {risk.dueDate && (
                  <div className="text-xs text-muted-foreground">
                    <div>Vencimento:</div>
                    <div className="font-medium">
                      {format(risk.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'general' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Informações Gerais
                </button>
                
                {showActionSection && (
                  <button
                    onClick={() => setActiveSection('action')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'action' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <Target className="h-4 w-4" />
                    Plano de Ação
                  </button>
                )}
                
                {showAcceptanceSection && (
                  <button
                    onClick={() => setActiveSection('acceptance')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'acceptance' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Carta de Risco
                  </button>
                )}
                
                <button
                  onClick={() => setActiveSection('communication')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'communication' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Comunicação
                </button>
              </div>

              {/* Section Content */}
              {/* 1. INFORMAÇÕES GERAIS */}
              {activeSection === 'general' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">INFORMAÇÕES GERAIS</h4>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingGeneral(!isEditingGeneral)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditingGeneral ? 'Cancelar' : 'Editar'}
                      </Button>
                    )}
                  </div>

                  {isEditingGeneral ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="name">Nome do Risco</Label>
                        <Input
                          id="name"
                          value={generalData.name}
                          onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Tipo do Risco</Label>
                        <Select
                          value={generalData.category}
                          onValueChange={(value) => setGeneralData({ ...generalData, category: value as RiskCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RISK_CATEGORIES).map(([key, description]) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="treatmentType">Tipo de Tratamento</Label>
                        <Select
                          value={generalData.treatmentType}
                          onValueChange={(value) => setGeneralData({ ...generalData, treatmentType: value as TreatmentType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TREATMENT_TYPES).map(([key, description]) => (
                              <SelectItem key={key} value={key} title={description}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="probability">Probabilidade (1-5)</Label>
                        <Input
                          id="probability"
                          type="number"
                          min="1"
                          max="5"
                          value={generalData.probability}
                          onChange={(e) => setGeneralData({ ...generalData, probability: parseInt(e.target.value) })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="impact">Impacto (1-5)</Label>
                        <Input
                          id="impact"
                          type="number"
                          min="1"
                          max="5"
                          value={generalData.impact}
                          onChange={(e) => setGeneralData({ ...generalData, impact: parseInt(e.target.value) })}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label htmlFor="description">Detalhes Técnicos do Risco</Label>
                        <Textarea
                          id="description"
                          value={generalData.description}
                          onChange={(e) => setGeneralData({ ...generalData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label htmlFor="executiveSummary">Sumário Executivo do Risco</Label>
                        <Textarea
                          id="executiveSummary"
                          value={generalData.executiveSummary}
                          onChange={(e) => setGeneralData({ ...generalData, executiveSummary: e.target.value })}
                          rows={2}
                        />
                      </div>
                      
                      <div className="col-span-2 bg-muted/50 p-4 rounded-lg">
                        <Label className="text-sm font-medium">Nível de Risco Calculado</Label>
                        <div className="mt-2">
                          <Badge className={getRiskLevelColor(currentRiskLevel)}>
                            {currentRiskLevel}
                          </Badge>
                          <span className="ml-2 text-sm text-muted-foreground">
                            (Score: {generalData.probability * generalData.impact})
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-span-2 flex gap-2">
                        <Button onClick={handleSaveGeneral} disabled={isUpdating}>
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Nome:</span> {risk.name}
                      </div>
                      <div>
                        <span className="font-medium">Categoria:</span> {risk.category}
                      </div>
                      <div>
                        <span className="font-medium">Tratamento:</span> {risk.treatmentType}
                      </div>
                      <div>
                        <span className="font-medium">Nível:</span> 
                        <Badge className={getRiskLevelColor(risk.riskLevel)} size="sm">
                          {risk.riskLevel} (Score: {risk.riskScore})
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Descrição:</span> {risk.description || 'Não informado'}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Sumário Executivo:</span> {risk.executiveSummary || 'Não informado'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. PLANO DE AÇÃO */}
              {activeSection === 'action' && showActionSection && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">PLANO DE AÇÃO</h4>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Estratégia de Tratamento: {generalData.treatmentType}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {TREATMENT_TYPES[generalData.treatmentType]}
                    </p>
                  </div>

                  {/* Adicionar Nova Atividade */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h5 className="font-medium">Adicionar Nova Atividade</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Nome da Atividade</Label>
                        <Input
                          value={newActivity.name}
                          onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                          placeholder="Ex: Implementar controle de acesso"
                        />
                      </div>
                      <div>
                        <Label>Responsável</Label>
                        <Input
                          value={newActivity.responsible}
                          onChange={(e) => setNewActivity({ ...newActivity, responsible: e.target.value })}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div>
                        <Label>Prazo</Label>
                        <Input
                          type="date"
                          value={newActivity.dueDate}
                          onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Detalhes da Atividade</Label>
                        <Textarea
                          value={newActivity.details}
                          onChange={(e) => setNewActivity({ ...newActivity, details: e.target.value })}
                          placeholder="Descreva os detalhes da atividade..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label>Prioridade</Label>
                          <Select
                            value={newActivity.priority}
                            onValueChange={(value) => setNewActivity({ ...newActivity, priority: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Baixa">Baixa</SelectItem>
                              <SelectItem value="Média">Média</SelectItem>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Crítica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddActivity} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Atividade
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Atividades */}
                  {activities.length > 0 && (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Atividade</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Prazo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activities.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{activity.name}</p>
                                  {activity.details && (
                                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{activity.responsible}</TableCell>
                              <TableCell>
                                {activity.dueDate ? format(activity.dueDate, 'dd/MM/yyyy') : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className={getActivityStatusColor(activity.status)}>
                                  {activity.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newStatus = activity.status === 'Concluído' ? 'Em Andamento' : 'Concluído';
                                      handleUpdateActivity(activity.id, { status: newStatus });
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveActivity(activity.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* 3. CARTA DE RISCO */}
              {activeSection === 'acceptance' && showAcceptanceSection && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">CARTA DE ACEITAÇÃO DE RISCO</h4>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">
                        Aceitação de Risco
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Este risco será aceito pela organização. Preencha as informações abaixo para documentar formalmente a decisão.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="justification">Justificativa para Aceitação *</Label>
                      <Textarea
                        id="justification"
                        value={acceptanceData.justification}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, justification: e.target.value })}
                        placeholder="Descreva por que este risco está sendo aceito..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="compensatingControls">Controles Compensatórios</Label>
                      <Textarea
                        id="compensatingControls"
                        value={acceptanceData.compensatingControls}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, compensatingControls: e.target.value })}
                        placeholder="Liste os controles que serão implementados para mitigar parcialmente o risco..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="businessJustification">Justificativa de Negócio</Label>
                      <Textarea
                        id="businessJustification"
                        value={acceptanceData.businessJustification}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, businessJustification: e.target.value })}
                        placeholder="Explique o valor ou necessidade de negócio que justifica aceitar este risco..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="approver">Aprovador Responsável *</Label>
                        <Input
                          id="approver"
                          value={acceptanceData.approver}
                          onChange={(e) => setAcceptanceData({ ...acceptanceData, approver: e.target.value })}
                          placeholder="Nome do executivo aprovador"
                        />
                      </div>
                      <div>
                        <Label htmlFor="approverTitle">Cargo do Aprovador</Label>
                        <Input
                          id="approverTitle"
                          value={acceptanceData.approverTitle}
                          onChange={(e) => setAcceptanceData({ ...acceptanceData, approverTitle: e.target.value })}
                          placeholder="Ex: CEO, CTO, CISO"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="reviewConditions">Condições para Revisão</Label>
                      <Textarea
                        id="reviewConditions"
                        value={acceptanceData.reviewConditions}
                        onChange={(e) => setAcceptanceData({ ...acceptanceData, reviewConditions: e.target.value })}
                        placeholder="Defina quando e sob quais condições este risco deve ser revisado..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleCreateAcceptanceLetter}>
                        <FileText className="h-4 w-4 mr-2" />
                        Criar Carta de Aceitação
                      </Button>
                      <Button variant="outline" onClick={handleGeneratePDF} disabled={isGenerating}>
                        <Download className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Gerando...' : 'Gerar PDF com Matriz de Risco'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. COMUNICAÇÃO */}
              {activeSection === 'communication' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">COMUNICAÇÃO DO RISCO</h4>
                  
                  {/* Adicionar Nova Comunicação */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h5 className="font-medium">Nova Comunicação</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nome do Destinatário</Label>
                        <Input
                          value={newCommunication.recipientName}
                          onChange={(e) => setNewCommunication({ ...newCommunication, recipientName: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={newCommunication.recipientEmail}
                          onChange={(e) => setNewCommunication({ ...newCommunication, recipientEmail: e.target.value })}
                          placeholder="email@empresa.com"
                        />
                      </div>
                      <div>
                        <Label>Cargo/Função</Label>
                        <Input
                          value={newCommunication.recipientTitle}
                          onChange={(e) => setNewCommunication({ ...newCommunication, recipientTitle: e.target.value })}
                          placeholder="Ex: Gerente de TI"
                        />
                      </div>
                      <div>
                        <Label>Tipo de Comunicação</Label>
                        <Select
                          value={newCommunication.type}
                          onValueChange={(value) => setNewCommunication({ ...newCommunication, type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Apontamento">Apontamento de Risco</SelectItem>
                            <SelectItem value="Carta de Risco">Carta de Risco</SelectItem>
                            <SelectItem value="Plano de Ação">Plano de Ação</SelectItem>
                            <SelectItem value="Notificação">Notificação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Assunto</Label>
                      <Input
                        value={newCommunication.subject}
                        onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                        placeholder="Assunto da comunicação"
                      />
                    </div>
                    <div>
                      <Label>Mensagem</Label>
                      <Textarea
                        value={newCommunication.message}
                        onChange={(e) => setNewCommunication({ ...newCommunication, message: e.target.value })}
                        placeholder="Detalhe a comunicação..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newCommunication.isUrgent}
                          onChange={(e) => setNewCommunication({ ...newCommunication, isUrgent: e.target.checked })}
                        />
                        <span className="text-sm">Comunicação urgente</span>
                      </label>
                      <Button onClick={handleAddCommunication}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Comunicação
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Comunicações */}
                  {communications.length > 0 && (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Destinatário</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {communications.map((comm) => (
                            <TableRow key={comm.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{comm.recipientName}</p>
                                  <p className="text-xs text-muted-foreground">{comm.recipientEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{comm.type}</Badge>
                              </TableCell>
                              <TableCell>{comm.subject}</TableCell>
                              <TableCell>
                                <Badge className={
                                  comm.respondedAt ? 'bg-green-100 text-green-800' :
                                  comm.sentAt ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {comm.respondedAt ? 'Respondido' :
                                   comm.sentAt ? 'Enviado' : 'Pendente'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {comm.createdAt ? format(comm.createdAt, 'dd/MM/yyyy HH:mm') : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Send className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Histórico de Mudanças
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(risk.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Risco
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RiskCard;
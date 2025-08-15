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
  Building2,
  Activity,
  Send,
  Eye,
  Users,
  BarChart3,
  TrendingUp,
  Zap,
  Save,
  X,
  MessageSquare,
  Phone
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VendorRisk {
  id: string;
  vendor_id: string;
  vendor: {
    name: string;
    category: string;
    status: string;
    risk_level: string;
    contact_person: string;
    email: string;
    phone: string;
  };
  title: string;
  description: string;
  risk_category: string;
  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;
  status: string;
  risk_owner: string;
  identified_date: string;
  next_review_date?: string;
  mitigation_actions: VendorRiskAction[];
  created_at: string;
  updated_at: string;
}

interface VendorRiskAction {
  id: string;
  title: string;
  description: string;
  responsible_party: string;
  target_completion_date: string;
  status: string;
  progress_percentage: number;
}

interface VendorCommunication {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  sent_at?: string;
  recipient_name: string;
  recipient_email: string;
}

interface VendorAssessment {
  id: string;
  title: string;
  assessment_type: string;
  status: string;
  overall_score?: number;
  completed_at?: string;
}

interface VendorRiskCardProps {
  risk: VendorRisk;
  onUpdate?: (riskId: string, updates: Partial<VendorRisk>) => void;
  onDelete?: (riskId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const VendorRiskCard: React.FC<VendorRiskCardProps> = ({
  risk,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  canEdit = true,
  canDelete = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'assessment' | 'actions' | 'communication'>('general');
  
  // Estados para edição
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [generalData, setGeneralData] = useState({
    title: risk.title,
    description: risk.description,
    risk_category: risk.risk_category,
    likelihood: risk.likelihood,
    impact: risk.impact,
    status: risk.status
  });

  // Estados para ações
  const [actions, setActions] = useState<VendorRiskAction[]>([]);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    responsible_party: '',
    target_completion_date: '',
    status: 'Planned',
    progress_percentage: 0
  });

  // Estados para comunicações
  const [communications, setCommunications] = useState<VendorCommunication[]>([]);
  const [newCommunication, setNewCommunication] = useState({
    type: 'General Communication',
    subject: '',
    message: '',
    recipient_name: '',
    recipient_email: '',
    status: 'Draft'
  });

  // Estados para assessments
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    assessment_type: 'Risk Assessment',
    status: 'Not Started'
  });

  useEffect(() => {
    setGeneralData({
      title: risk.title,
      description: risk.description,
      risk_category: risk.risk_category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      status: risk.status
    });
  }, [risk]);

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'in_treatment':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'monitored':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'closed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleSaveGeneral = async () => {
    if (onUpdate) {
      await onUpdate(risk.id, generalData);
      setIsEditingGeneral(false);
      toast({
        title: 'Sucesso',
        description: 'Informações gerais atualizadas com sucesso',
      });
    }
  };

  const handleAddAction = () => {
    if (!newAction.title.trim()) return;
    
    const action: VendorRiskAction = {
      id: Date.now().toString(),
      ...newAction
    };
    
    setActions([...actions, action]);
    setNewAction({
      title: '',
      description: '',
      responsible_party: '',
      target_completion_date: '',
      status: 'Planned',
      progress_percentage: 0
    });
  };

  const handleAddCommunication = () => {
    if (!newCommunication.subject.trim()) return;
    
    const communication: VendorCommunication = {
      id: Date.now().toString(),
      ...newCommunication
    };
    
    setCommunications([...communications, communication]);
    setNewCommunication({
      type: 'General Communication',
      subject: '',
      message: '',
      recipient_name: '',
      recipient_email: '',
      status: 'Draft'
    });
  };

  const handleAddAssessment = () => {
    if (!newAssessment.title.trim()) return;
    
    const assessment: VendorAssessment = {
      id: Date.now().toString(),
      ...newAssessment
    };
    
    setAssessments([...assessments, assessment]);
    setNewAssessment({
      title: '',
      assessment_type: 'Risk Assessment',
      status: 'Not Started'
    });
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'general':
        return <Shield className="h-4 w-4" />;
      case 'assessment':
        return <FileText className="h-4 w-4" />;
      case 'actions':
        return <Target className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case 'general':
        return 'Informações Gerais';
      case 'assessment':
        return 'Assessment';
      case 'actions':
        return 'Plano de Ação';
      case 'communication':
        return 'Comunicação';
      default:
        return section;
    }
  };

  const isOverdue = risk.next_review_date && new Date(risk.next_review_date) < new Date();

  return (
    <Card className={`w-full transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-gray-200 dark:bg-gray-700 shadow-xl ring-2 ring-gray-400 dark:ring-gray-500 border-gray-400 dark:border-gray-500' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors py-3 px-4 rounded-t-lg ${isExpanded ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`} title={isExpanded ? "Clique para recolher" : "Clique para expandir"}>
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  risk.risk_level === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                  risk.risk_level === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
                  risk.risk_level === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  'bg-green-100 dark:bg-green-900'
                }`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    risk.risk_level === 'critical' ? 'text-red-600 dark:text-red-400' :
                    risk.risk_level === 'high' ? 'text-orange-600 dark:text-orange-400' :
                    risk.risk_level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{risk.title}</CardTitle>
                    <Badge className={`text-xs border ${getRiskLevelColor(risk.risk_level)}`}>
                      {risk.risk_level.toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs border ${getStatusColor(risk.status)}`}>
                      {risk.status}
                    </Badge>
                  </div>
                
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{risk.risk_category}</span>
                    <span>•</span>
                    <span className="truncate">Score: {risk.risk_score}/25</span>
                    <span>•</span>
                    <span className="truncate">Fornecedor: {risk.vendor.name}</span>
                    {risk.risk_owner && (
                      <>
                        <span>•</span>
                        <span className="truncate">Proprietário: {risk.risk_owner}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Risk Category */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {risk.risk_category}
                </Badge>
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                {risk.next_review_date && (
                  <div className="text-xs text-muted-foreground">
                    <div>Próxima Revisão:</div>
                    <div className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {format(new Date(risk.next_review_date), "dd/MM/yyyy", { locale: ptBR })}
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
                {['general', 'assessment', 'actions', 'communication'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section as 'general' | 'assessment' | 'actions' | 'communication')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {getSectionIcon(section)}
                    {getSectionLabel(section)}
                  </button>
                ))}
              </div>

            <Separator className="mb-6" />

            {/* Section Content */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Informações Gerais</h3>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingGeneral(!isEditingGeneral)}
                    >
                      {isEditingGeneral ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {isEditingGeneral ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={generalData.title}
                          onChange={(e) => setGeneralData({...generalData, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select
                          value={generalData.risk_category}
                          onValueChange={(value) => setGeneralData({...generalData, risk_category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Operational Risk">Risco Operacional</SelectItem>
                            <SelectItem value="Financial Risk">Risco Financeiro</SelectItem>
                            <SelectItem value="Security Risk">Risco de Segurança</SelectItem>
                            <SelectItem value="Compliance Risk">Risco de Conformidade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={generalData.description}
                        onChange={(e) => setGeneralData({...generalData, description: e.target.value})}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Probabilidade</Label>
                        <Select
                          value={generalData.likelihood}
                          onValueChange={(value) => setGeneralData({...generalData, likelihood: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Very Low">Muito Baixa</SelectItem>
                            <SelectItem value="Low">Baixa</SelectItem>
                            <SelectItem value="Medium">Média</SelectItem>
                            <SelectItem value="High">Alta</SelectItem>
                            <SelectItem value="Very High">Muito Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Impacto</Label>
                        <Select
                          value={generalData.impact}
                          onValueChange={(value) => setGeneralData({...generalData, impact: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Very Low">Muito Baixo</SelectItem>
                            <SelectItem value="Low">Baixo</SelectItem>
                            <SelectItem value="Medium">Médio</SelectItem>
                            <SelectItem value="High">Alto</SelectItem>
                            <SelectItem value="Very High">Muito Alto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={generalData.status}
                          onValueChange={(value) => setGeneralData({...generalData, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Em Aberto</SelectItem>
                            <SelectItem value="in_treatment">Em Tratamento</SelectItem>
                            <SelectItem value="monitored">Monitorado</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingGeneral(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveGeneral} disabled={isUpdating}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Detalhes do Fornecedor</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nome:</span>
                            <span>{risk.vendor.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Categoria:</span>
                            <span>{risk.vendor.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Contato:</span>
                            <span>{risk.vendor.contact_person}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{risk.vendor.email}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Avaliação de Risco</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Score:</span>
                            <span>{risk.risk_score}/25</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Categoria:</span>
                            <span>{risk.risk_category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Probabilidade:</span>
                            <span>{risk.likelihood}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Impacto:</span>
                            <span>{risk.impact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'assessment' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Assessments do Fornecedor</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Assessment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Assessment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={newAssessment.title}
                            onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                            placeholder="Título do assessment"
                          />
                        </div>
                        <div>
                          <Label>Tipo</Label>
                          <Select
                            value={newAssessment.assessment_type}
                            onValueChange={(value) => setNewAssessment({...newAssessment, assessment_type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Risk Assessment">Avaliação de Riscos</SelectItem>
                              <SelectItem value="Security Assessment">Avaliação de Segurança</SelectItem>
                              <SelectItem value="Compliance Assessment">Avaliação de Conformidade</SelectItem>
                              <SelectItem value="Financial Assessment">Avaliação Financeira</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddAssessment}>
                          Criar Assessment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {assessments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Nenhum assessment encontrado</p>
                    </div>
                  ) : (
                    assessments.map((assessment) => (
                      <Card key={assessment.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{assessment.title}</h4>
                              <p className="text-sm text-muted-foreground">{assessment.assessment_type}</p>
                            </div>
                            <Badge variant="outline">{assessment.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === 'actions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Plano de Ação</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Ação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Ação de Mitigação</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={newAction.title}
                            onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                            placeholder="Título da ação"
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={newAction.description}
                            onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Responsável</Label>
                          <Input
                            value={newAction.responsible_party}
                            onChange={(e) => setNewAction({...newAction, responsible_party: e.target.value})}
                            placeholder="Nome do responsável"
                          />
                        </div>
                        <div>
                          <Label>Data Limite</Label>
                          <Input
                            type="date"
                            value={newAction.target_completion_date}
                            onChange={(e) => setNewAction({...newAction, target_completion_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddAction}>
                          Adicionar Ação
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {actions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4" />
                      <p>Nenhuma ação de mitigação encontrada</p>
                    </div>
                  ) : (
                    actions.map((action) => (
                      <Card key={action.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{action.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Responsável: {action.responsible_party}</span>
                                <span>Data: {format(new Date(action.target_completion_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                              </div>
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progresso</span>
                                  <span>{action.progress_percentage}%</span>
                                </div>
                                <Progress value={action.progress_percentage} className="h-2" />
                              </div>
                            </div>
                            <Badge variant="outline">{action.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === 'communication' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Comunicações</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Comunicação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Comunicação</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Tipo</Label>
                          <Select
                            value={newCommunication.type}
                            onValueChange={(value) => setNewCommunication({...newCommunication, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General Communication">Comunicação Geral</SelectItem>
                              <SelectItem value="Issue Notification">Notificação de Problema</SelectItem>
                              <SelectItem value="Assessment Request">Solicitação de Assessment</SelectItem>
                              <SelectItem value="Contract Renewal">Renovação de Contrato</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Assunto</Label>
                          <Input
                            value={newCommunication.subject}
                            onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
                            placeholder="Assunto da comunicação"
                          />
                        </div>
                        <div>
                          <Label>Destinatário</Label>
                          <Input
                            value={newCommunication.recipient_name}
                            onChange={(e) => setNewCommunication({...newCommunication, recipient_name: e.target.value})}
                            placeholder="Nome do destinatário"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newCommunication.recipient_email}
                            onChange={(e) => setNewCommunication({...newCommunication, recipient_email: e.target.value})}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label>Mensagem</Label>
                          <Textarea
                            value={newCommunication.message}
                            onChange={(e) => setNewCommunication({...newCommunication, message: e.target.value})}
                            rows={4}
                            placeholder="Conteúdo da mensagem"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddCommunication}>
                          Enviar Comunicação
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {communications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                      <p>Nenhuma comunicação encontrada</p>
                    </div>
                  ) : (
                    communications.map((communication) => (
                      <Card key={communication.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{communication.subject}</h4>
                              <p className="text-sm text-muted-foreground">Para: {communication.recipient_name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {communication.message}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{communication.status}</Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {communication.type}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
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

export default VendorRiskCard;
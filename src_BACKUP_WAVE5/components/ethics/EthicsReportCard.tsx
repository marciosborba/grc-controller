import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDown,
  ChevronRight,
  Shield,
  CheckCircle,
  Activity,
  Archive,
  AlertTriangle,
  Eye,
  EyeOff,
  MessageSquare,
  History,
  FileText,
  Search,
  Phone,
  Mail,
  Plus,
  Clock,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Paperclip,
  Send,
  Save,
  Edit,
  Trash2,
  User,
  Building2,
  Gavel,
  Scale
} from 'lucide-react';

export interface EthicsReport {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  is_anonymous: boolean;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Investigation {
  id: string;
  step: string;
  description: string;
  assignee: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  completion_date?: string;
  findings: string;
  evidence_files: string[];
}

interface Communication {
  id: string;
  type: 'internal' | 'external' | 'legal';
  direction: 'inbound' | 'outbound';
  recipient: string;
  subject: string;
  message: string;
  sent_at: string;
  method: 'email' | 'phone' | 'meeting' | 'letter';
  status: 'sent' | 'delivered' | 'read' | 'replied';
}

interface ActionPlan {
  id: string;
  type: 'corrective' | 'preventive' | 'disciplinary';
  action: string;
  responsible: string;
  due_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  completion_percentage: number;
  impact_assessment: string;
  resources_needed: string;
}

interface Analysis {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  business_impact: string;
  legal_implications: string;
  reputational_risk: string;
  financial_impact: number;
  stakeholders_affected: string[];
  root_cause: string;
  similar_incidents: number;
}

interface EthicsReportCardProps {
  report: EthicsReport;
  onEdit?: (report: EthicsReport) => void;
  onResolve?: (report: EthicsReport) => void;
  onDelete?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800';
    case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800';
    case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700';
    default: return 'bg-muted text-foreground/80';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open': return <AlertTriangle className="h-4 w-4" />;
    case 'investigating': return <Activity className="h-4 w-4" />;
    case 'in_review': return <Eye className="h-4 w-4" />;
    case 'resolved': return <CheckCircle className="h-4 w-4" />;
    case 'closed': return <Archive className="h-4 w-4" />;
    default: return <Shield className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'text-blue-600 dark:text-blue-300';
    case 'medium': return 'text-yellow-600 dark:text-yellow-300';
    case 'high': return 'text-orange-600 dark:text-orange-300';
    case 'critical': return 'text-red-600 dark:text-red-300';
    default: return 'text-muted-foreground';
  }
};

const EthicsReportCard: React.FC<EthicsReportCardProps> = ({ report, onEdit, onResolve, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'investigation' | 'communication' | 'analysis' | 'actions' | 'monitoring'>('general');
  
  // Estados para os dados expandidos (simulados - em produção viriam do backend)
  const [investigations, setInvestigations] = useState<Investigation[]>([
    {
      id: '1',
      step: 'Coleta de Evidências Iniciais',
      description: 'Reunir documentos, e-mails e depoimentos preliminares relacionados ao caso',
      assignee: 'Auditor Interno',
      due_date: '2024-08-15',
      status: 'completed',
      completion_date: '2024-08-14',
      findings: 'Coletados 15 documentos relevantes e 3 depoimentos iniciais',
      evidence_files: ['doc1.pdf', 'email_thread.pdf', 'witness_statement.pdf']
    },
    {
      id: '2',
      step: 'Entrevistas com Envolvidos',
      description: 'Conduzir entrevistas estruturadas com todas as partes envolvidas',
      assignee: 'Comitê de Ética',
      due_date: '2024-08-20',
      status: 'in_progress',
      findings: 'Entrevistas em andamento - 2 de 4 realizadas',
      evidence_files: ['interview_1.pdf', 'interview_2.pdf']
    }
  ]);

  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: '1',
      type: 'internal',
      direction: 'outbound',
      recipient: 'Comitê de Ética',
      subject: 'Notificação de Nova Denúncia - Caso #' + report.id.slice(0, 8),
      message: 'Nova denúncia registrada no sistema requer avaliação imediata.',
      sent_at: '2024-08-12T09:00:00Z',
      method: 'email',
      status: 'delivered'
    }
  ]);

  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  
  const [analysis, setAnalysis] = useState<Analysis>({
    risk_level: 'medium',
    business_impact: 'Impacto moderado na moral da equipe e produtividade',
    legal_implications: 'Possível violação de políticas internas, sem implicações legais diretas',
    reputational_risk: 'Risco baixo se tratado adequadamente e com confidencialidade',
    financial_impact: 5000,
    stakeholders_affected: ['Equipe do departamento', 'RH', 'Gestão'],
    root_cause: 'Falta de treinamento adequado sobre políticas de conduta',
    similar_incidents: 2
  });

  // Estados para novos itens
  const [newInvestigation, setNewInvestigation] = useState({
    step: '',
    description: '',
    assignee: '',
    due_date: ''
  });

  const [newCommunication, setNewCommunication] = useState({
    type: 'internal' as const,
    direction: 'outbound' as const,
    recipient: '',
    subject: '',
    message: '',
    method: 'email' as const
  });

  const [newAction, setNewAction] = useState({
    type: 'corrective' as const,
    action: '',
    responsible: '',
    due_date: '',
    impact_assessment: '',
    resources_needed: ''
  });

  return (
    <Card className={`rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden cursor-pointer ${
      isExpanded
        ? 'shadow-lg border-primary/30'
        : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-border'
    }`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 relative z-10 group/header" title={isExpanded ? 'Clique para recolher' : 'Clique para expandir'}>
            {/* Hover Effect Gradient for Header */}
            <div 
              className="absolute inset-0 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300 pointer-events-none" 
              style={{
                background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)'
              }}
            />
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}

                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{report.title}</CardTitle>
                    <Badge className={`${getStatusColor(report.status)} border`}> 
                      <div className="flex items-center gap-1">
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{report.category}</span>
                    <span>•</span>
                    <span className={`truncate ${getSeverityColor(report.severity)}`}>{report.severity}</span>
                    <span>•</span>
                    <span className="truncate flex items-center gap-1">
                      {report.is_anonymous ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {report.is_anonymous ? 'Anônima' : 'Identificada'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs text-muted-foreground">
                  <div>Registrado:</div>
                  <div className="font-medium">
                    {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
                {report.resolved_at && (
                  <div className="text-xs mt-1 text-green-600 dark:text-green-300">
                    <div>Resolvido:</div>
                    <div className="font-medium">
                      {format(new Date(report.resolved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 relative z-10">
            <div className="space-y-6">
              {/* Navigation Tabs - 6 Abas Robustas */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                    activeSection === 'general' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Informações Gerais
                </button>

                <button
                  onClick={() => setActiveSection('investigation')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                    activeSection === 'investigation' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  Investigação
                </button>

                <button
                  onClick={() => setActiveSection('communication')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                    activeSection === 'communication' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Comunicação
                </button>

                <button
                  onClick={() => setActiveSection('analysis')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                    activeSection === 'analysis' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Análise
                </button>

                <button
                  onClick={() => setActiveSection('actions')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                    activeSection === 'actions' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Plano de Ação
                </button>

                <button
                  onClick={() => setActiveSection('monitoring')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                    activeSection === 'monitoring' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Monitoramento
                </button>
              </div>

              {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Detalhes do Caso */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-muted-foreground">DETALHES DO CASO</h4>
                      
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">ID do Caso:</span>
                            <span className="text-sm font-mono">#{report.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Data de Registro:</span>
                            <span className="text-sm">{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Última Atualização:</span>
                            <span className="text-sm">{format(new Date(report.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tipo de Denúncia:</span>
                            <div className="flex items-center gap-1">
                              {report.is_anonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              <span className="text-sm">{report.is_anonymous ? 'Anônima' : 'Identificada'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Descrição Completa:</Label>
                        <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted/30 p-3 rounded-lg">
                          {report.description}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Categoria</Label>
                          <Badge className="w-full justify-center mt-1" variant="outline">
                            {report.category}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm">Gravidade</Label>
                          <Badge className={`w-full justify-center mt-1 ${getSeverityColor(report.severity)}`} variant="outline">
                            {report.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Informações do Denunciante */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-muted-foreground">INFORMAÇÕES DO DENUNCIANTE</h4>
                      
                      {!report.is_anonymous ? (
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800 dark:text-green-200">Denúncia Identificada</span>
                            </div>
                            {report.reporter_name && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Nome:</span>
                                <span className="text-sm font-medium">{report.reporter_name}</span>
                              </div>
                            )}
                            {report.reporter_email && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">E-mail:</span>
                                <span className="text-sm">{report.reporter_email}</span>
                              </div>
                            )}
                            {report.reporter_phone && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Telefone:</span>
                                <span className="text-sm">{report.reporter_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <EyeOff className="h-4 w-4" />
                            <span className="font-medium">Denúncia Anônima</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            A identidade do denunciante está protegida conforme políticas de confidencialidade.
                          </p>
                        </div>
                      )}

                      {/* Status e Responsável */}
                      <div className="space-y-3">
                        <h5 className="font-medium">Gestão do Caso</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Status Atual:</span>
                            <Badge className={`${getStatusColor(report.status)} border`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(report.status)}
                                <span className="capitalize">{report.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                          </div>
                          {report.assigned_to && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Responsável:</span>
                              <span className="text-sm font-medium">{report.assigned_to}</span>
                            </div>
                          )}
                          {report.resolved_at && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Resolução:</span>
                              <span className="text-sm text-green-600">
                                {format(new Date(report.resolved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-2" />
                        Ver Histórico Completo
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar Relatório PDF
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(report)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      )}
                      {onResolve && (
                        <Button size="sm" onClick={() => onResolve(report)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Atualizar Status
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 2: INVESTIGAÇÃO */}
              {activeSection === 'investigation' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-muted-foreground">PROCESSO DE INVESTIGAÇÃO</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Etapa
                      </Button>
                      <Button size="sm" variant="outline">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Upload Evidência
                      </Button>
                    </div>
                  </div>

                  {/* Status da Investigação */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Status da Investigação
                      </h5>
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
                        Em Andamento
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investigador Principal:</span>
                        <span className="font-medium">Comitê de Ética</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Início:</span>
                        <span className="font-medium">12/08/2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prazo Estimado:</span>
                        <span className="font-medium">30/08/2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prioridade:</span>
                        <span className="font-medium text-orange-600">Alta</span>
                      </div>
                    </div>
                  </div>

                  {/* Etapas da Investigação */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Etapas da Investigação</h5>
                    {investigations.map((investigation, index) => (
                      <Card key={investigation.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                investigation.status === 'completed' ? 'bg-green-100 text-green-600' :
                                investigation.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {investigation.status === 'completed' ? 
                                  <CheckCircle className="h-4 w-4" /> :
                                  investigation.status === 'in_progress' ?
                                  <Clock className="h-4 w-4" /> :
                                  <Target className="h-4 w-4" />
                                }
                              </div>
                              <div>
                                <h6 className="font-medium text-sm">{investigation.step}</h6>
                                <p className="text-xs text-muted-foreground">Etapa {index + 1}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`${
                              investigation.status === 'completed' ? 'text-green-700 border-green-300' :
                              investigation.status === 'in_progress' ? 'text-blue-700 border-blue-300' :
                              'text-gray-700 border-gray-300'
                            }`}>
                              {investigation.status === 'completed' ? 'Concluída' :
                               investigation.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{investigation.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Responsável:</span>
                              <span className="font-medium">{investigation.assignee}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prazo:</span>
                              <span className="font-medium">{format(new Date(investigation.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                          </div>

                          {investigation.findings && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md mb-3">
                              <Label className="text-xs font-medium text-muted-foreground">Descobertas:</Label>
                              <p className="text-sm mt-1">{investigation.findings}</p>
                            </div>
                          )}

                          {investigation.evidence_files.length > 0 && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Evidências ({investigation.evidence_files.length}):</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {investigation.evidence_files.map((file, fileIndex) => (
                                  <Badge key={fileIndex} variant="outline" className="text-xs">
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    {file}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* SEÇÃO 3: COMUNICAÇÃO */}
              {activeSection === 'communication' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-muted-foreground">HISTÓRICO DE COMUNICAÇÃO</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Nova Comunicação
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Registrar Ligação
                      </Button>
                    </div>
                  </div>

                  {/* Métricas de Comunicação */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{communications.length}</p>
                          <p className="text-xs text-muted-foreground">Total de Comunicações</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">1</p>
                          <p className="text-xs text-muted-foreground">Entregues</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">0</p>
                          <p className="text-xs text-muted-foreground">Pendentes</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline de Comunicação */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Timeline de Comunicação</h5>
                    {communications.map((comm) => (
                      <Card key={comm.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                comm.type === 'internal' ? 'bg-blue-100 text-blue-600' :
                                comm.type === 'external' ? 'bg-green-100 text-green-600' :
                                'bg-orange-100 text-orange-600'
                              }`}>
                                {comm.method === 'email' ? <Mail className="h-4 w-4" /> :
                                 comm.method === 'phone' ? <Phone className="h-4 w-4" /> :
                                 <MessageSquare className="h-4 w-4" />}
                              </div>
                              <div>
                                <h6 className="font-medium text-sm">{comm.subject}</h6>
                                <p className="text-xs text-muted-foreground">Para: {comm.recipient}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {comm.status === 'delivered' ? 'Entregue' : 'Enviado'}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(comm.sent_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                            <p className="text-sm">{comm.message}</p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                            <span>Tipo: {comm.type === 'internal' ? 'Comunicação Interna' : 
                                      comm.type === 'external' ? 'Comunicação Externa' : 'Legal'}</span>
                            <span>Via: {comm.method === 'email' ? 'E-mail' : 
                                      comm.method === 'phone' ? 'Telefone' : 'Reunião'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* SEÇÃO 4: ANÁLISE */}
              {activeSection === 'analysis' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-muted-foreground">ANÁLISE DE RISCOS E IMPACTOS</h4>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Atualizar Análise
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Avaliação de Riscos */}
                    <div className="space-y-4">
                      <h5 className="font-medium">Avaliação de Riscos</h5>
                      
                      <Card className={`border-2 ${
                        analysis.risk_level === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                        analysis.risk_level === 'high' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20' :
                        analysis.risk_level === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                        'border-green-200 bg-green-50 dark:bg-green-950/20'
                      }`}>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className={`text-3xl font-bold mb-2 ${
                              analysis.risk_level === 'critical' ? 'text-red-600' :
                              analysis.risk_level === 'high' ? 'text-orange-600' :
                              analysis.risk_level === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {analysis.risk_level === 'critical' ? 'CRÍTICO' :
                               analysis.risk_level === 'high' ? 'ALTO' :
                               analysis.risk_level === 'medium' ? 'MÉDIO' : 'BAIXO'}
                            </div>
                            <p className="text-sm text-muted-foreground">Nível de Risco</p>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border">
                          <Label className="text-sm font-medium">Causa Raiz:</Label>
                          <p className="text-sm text-muted-foreground mt-1">{analysis.root_cause}</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border">
                          <Label className="text-sm font-medium">Incidentes Similares:</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{analysis.similar_incidents}</Badge>
                            <span className="text-sm text-muted-foreground">casos identificados</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Análise de Impactos */}
                    <div className="space-y-4">
                      <h5 className="font-medium">Análise de Impactos</h5>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Impacto nos Negócios</Label>
                            <Badge className="bg-blue-100 text-blue-800">Moderado</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.business_impact}</p>
                        </div>
                        
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Impacto Financeiro</Label>
                            <Badge className="bg-orange-100 text-orange-800">R$ {analysis.financial_impact.toLocaleString()}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Estimativa de custos diretos e indiretos</p>
                        </div>
                        
                        <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Risco Reputacional</Label>
                            <Badge className="bg-red-100 text-red-800">Baixo</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.reputational_risk}</p>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Implicações Legais</Label>
                            <Badge className="bg-purple-100 text-purple-800">Mínimas</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.legal_implications}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stakeholders Afetados */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Stakeholders Afetados</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.stakeholders_affected.map((stakeholder, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {stakeholder}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 5: PLANO DE AÇÃO */}
              {activeSection === 'actions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-muted-foreground">PLANO DE AÇÃO E MEDIDAS</h4>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Ação
                    </Button>
                  </div>

                  {/* Resumo de Ações */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{actionPlans.length}</p>
                        <p className="text-xs text-muted-foreground">Total de Ações</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">0</p>
                        <p className="text-xs text-muted-foreground">Concluídas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">0</p>
                        <p className="text-xs text-muted-foreground">Em Andamento</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">0</p>
                        <p className="text-xs text-muted-foreground">Atrasadas</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lista de Ações */}
                  <div className="space-y-4">
                    {actionPlans.length === 0 ? (
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <CardContent className="p-8 text-center">
                          <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h6 className="font-medium text-gray-600 dark:text-gray-300 mb-2">Nenhuma ação definida</h6>
                          <p className="text-sm text-muted-foreground mb-4">
                            Defina ações corretivas, preventivas ou disciplinares para tratar este caso.
                          </p>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Ação
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      actionPlans.map((action) => (
                        <Card key={action.id} className={`border-l-4 ${
                          action.type === 'corrective' ? 'border-l-blue-500' :
                          action.type === 'preventive' ? 'border-l-green-500' :
                          'border-l-orange-500'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  action.type === 'corrective' ? 'bg-blue-100 text-blue-600' :
                                  action.type === 'preventive' ? 'bg-green-100 text-green-600' :
                                  'bg-orange-100 text-orange-600'
                                }`}>
                                  {action.type === 'corrective' ? <Target className="h-4 w-4" /> :
                                   action.type === 'preventive' ? <Shield className="h-4 w-4" /> :
                                   <Gavel className="h-4 w-4" />}
                                </div>
                                <div>
                                  <h6 className="font-medium text-sm">{action.action}</h6>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {action.type === 'corrective' ? 'Ação Corretiva' :
                                     action.type === 'preventive' ? 'Ação Preventiva' : 'Ação Disciplinar'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className={`${
                                action.status === 'completed' ? 'text-green-700 border-green-300' :
                                action.status === 'in_progress' ? 'text-blue-700 border-blue-300' :
                                action.status === 'delayed' ? 'text-red-700 border-red-300' :
                                'text-gray-700 border-gray-300'
                              }`}>
                                {action.status === 'completed' ? 'Concluída' :
                                 action.status === 'in_progress' ? 'Em Andamento' :
                                 action.status === 'delayed' ? 'Atrasada' : 'Planejada'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Responsável:</span>
                                <span className="font-medium">{action.responsible}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Prazo:</span>
                                <span className="font-medium">{format(new Date(action.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Progresso</span>
                                <span className="text-sm text-muted-foreground">{action.completion_percentage}%</span>
                              </div>
                              <Progress value={action.completion_percentage} className="h-2" />
                            </div>

                            <div className="space-y-2">
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-sm">
                                <Label className="text-xs font-medium text-muted-foreground">Avaliação de Impacto:</Label>
                                <p className="mt-1">{action.impact_assessment}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-sm">
                                <Label className="text-xs font-medium text-muted-foreground">Recursos Necessários:</Label>
                                <p className="mt-1">{action.resources_needed}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SEÇÃO 6: MONITORAMENTO */}
              {activeSection === 'monitoring' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-muted-foreground">MONITORAMENTO E KPIS</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Relatório
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar Revisão
                      </Button>
                    </div>
                  </div>

                  {/* KPIs Principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
                        <p className="text-xs text-muted-foreground">Taxa de Resolução</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">7</div>
                        <p className="text-xs text-muted-foreground">Dias Médios</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
                        <p className="text-xs text-muted-foreground">Satisfação</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">3.2</div>
                        <p className="text-xs text-muted-foreground">Score Qualidade</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline de Progresso */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Timeline de Progresso</h5>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Caso registrado e atribuído</p>
                              <p className="text-xs text-muted-foreground">12/08/2024 09:00</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Evidências iniciais coletadas</p>
                              <p className="text-xs text-muted-foreground">14/08/2024 16:30</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Entrevistas em andamento</p>
                              <p className="text-xs text-muted-foreground">Em progresso</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Clock className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground">Análise final pendente</p>
                              <p className="text-xs text-muted-foreground">Próxima etapa</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Métricas de Efetividade */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">Efetividade das Ações</h5>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Ações Corretivas</span>
                              <div className="flex items-center gap-2">
                                <Progress value={75} className="w-20 h-2" />
                                <span className="text-sm font-medium">75%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Ações Preventivas</span>
                              <div className="flex items-center gap-2">
                                <Progress value={60} className="w-20 h-2" />
                                <span className="text-sm font-medium">60%</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Conformidade</span>
                              <div className="flex items-center gap-2">
                                <Progress value={90} className="w-20 h-2" />
                                <span className="text-sm font-medium">90%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="font-medium">Próximas Revisões</h5>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span>Revisão de Progresso</span>
                              <Badge variant="outline">20/08/2024</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Avaliação de Efetividade</span>
                              <Badge variant="outline">30/08/2024</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Fechamento do Caso</span>
                              <Badge variant="outline">05/09/2024</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default EthicsReportCard;

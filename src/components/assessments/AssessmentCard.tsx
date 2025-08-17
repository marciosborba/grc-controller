import React, { useState, useEffect, useCallback } from 'react';
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
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Shield,
  Users,
  History,
  BookOpen,
  Upload,
  Download,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Eye,
  Plus,
  Trash2,
  Archive,
  UserPlus,
  MessageSquare,
  Calendar as CalendarDays,
  FileText,
  Target,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessmentManagement } from '@/hooks/useAssessmentManagement';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  Assessment, 
  AssessmentStatus, 
  AssessmentPriority,
  AssessmentType,
  AssessmentFrequency
} from '@/types/assessment-management';
import { ASSESSMENT_STATUSES, ASSESSMENT_PRIORITIES, ASSESSMENT_TYPES, ASSESSMENT_FREQUENCIES } from '@/types/assessment-management';

interface AssessmentCardProps {
  assessment: Assessment;
  onUpdate?: (assessmentId: string, updates: any) => void;
  onDelete?: (assessmentId: string) => void;
  onDuplicate?: (assessmentId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  onUpdate,
  onDelete,
  onDuplicate,
  isUpdating = false,
  isDeleting = false,
  canEdit = true,
  canDelete = true,
  canApprove = true
}) => {
  const { user } = useAuth();
  const { 
    profiles, 
    frameworks
  } = useAssessmentManagement();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'progress' | 'users' | 'controls' | 'history'>('general');

  // Helper function to safely format dates for input fields
  const formatDateForInput = useCallback((date: string | Date | undefined): string => {
    if (!date) return '';
    
    try {
      if (typeof date === 'string') {
        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        // Try to parse the string as a date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return '';
        }
        return parsedDate.toISOString().split('T')[0];
      } else {
        // It's a Date object
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return '';
    }
  }, []);

  // Estados para edição de informações gerais
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [generalData, setGeneralData] = useState({
    name: assessment.name,
    description: assessment.description || '',
    type: assessment.type || 'internal_audit',
    priority: assessment.priority || 'medium',
    frequency: assessment.frequency || 'annual',
    start_date: formatDateForInput(assessment.start_date),
    due_date: formatDateForInput(assessment.due_date),
    status: assessment.status,
    framework_id: assessment.framework_id || ''
  });

  // Sincronizar estado local com as mudanças do prop assessment
  useEffect(() => {
    setGeneralData({
      name: assessment.name,
      description: assessment.description || '',
      type: assessment.type || 'internal_audit',
      priority: assessment.priority || 'medium',
      frequency: assessment.frequency || 'annual',
      start_date: formatDateForInput(assessment.start_date),
      due_date: formatDateForInput(assessment.due_date),
      status: assessment.status,
      framework_id: assessment.framework_id || ''
    });
  }, [assessment, formatDateForInput]);

  // ============================================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // ============================================================================

  const handleSaveGeneral = async () => {
    if (onUpdate) {
      const updates = {
        name: generalData.name,
        description: generalData.description,
        type: generalData.type as AssessmentType,
        priority: generalData.priority as AssessmentPriority,
        frequency: generalData.frequency as AssessmentFrequency,
        start_date: generalData.start_date ? new Date(generalData.start_date) : undefined,
        due_date: generalData.due_date ? new Date(generalData.due_date) : undefined,
        status: generalData.status as AssessmentStatus,
        framework_id: generalData.framework_id || undefined
      };
      
      try {
        await onUpdate(assessment.id, updates);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsEditingGeneral(false);
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Tem certeza que deseja excluir este assessment?')) {
      try {
        await onDelete(assessment.id);
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const handleDuplicate = async () => {
    if (onDuplicate) {
      try {
        await onDuplicate(assessment.id);
      } catch (error) {
        console.error('Erro ao duplicar:', error);
      }
    }
  };

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const getStatusColor = (status: AssessmentStatus) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'not_started': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: AssessmentStatus) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'not_started': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <BarChart3 className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <Archive className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: AssessmentPriority) => {
    switch (priority) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = (date: string | undefined | null) => {
    return date && new Date(date) < new Date();
  };

  const getFrameworkName = () => {
    const framework = frameworks.find(f => f.id === assessment.framework_id);
    return framework?.short_name || 'N/A';
  };

  return (
    <Card className={cn(
      "rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden cursor-pointer",
      isExpanded 
        ? "shadow-lg border-primary/30" 
        : "hover:bg-muted/50 border-border"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{assessment.name}</CardTitle>
                    <Badge className={getStatusColor(assessment.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(assessment.status)}
                        {ASSESSMENT_STATUSES[assessment.status]?.split(' - ')[0] || assessment.status}
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{ASSESSMENT_TYPES[assessment.type]?.split(' - ')[0] || assessment.type}</span>
                    <span>•</span>
                    <span className={`truncate ${getPriorityColor(assessment.priority)}`}>
                      {ASSESSMENT_PRIORITIES[assessment.priority]?.split(' - ')[0] || assessment.priority}
                    </span>
                    <span>•</span>
                    <span className="truncate">{getFrameworkName()}</span>
                    {assessment.progress !== undefined && (
                      <>
                        <span>•</span>
                        <span className="truncate">{assessment.progress}% completo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                {assessment.due_date && (
                  <div className={`text-xs ${isOverdue(assessment.due_date) ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                    <div>Prazo:</div>
                    <div className="font-medium">
                      {format(new Date(assessment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      {isOverdue(assessment.due_date) && ' (Atrasado)'}
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
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'general' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Informações Gerais
                </button>
                
                <button
                  onClick={() => setActiveSection('progress')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'progress' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Progresso
                  {assessment.progress !== undefined && (
                    <Badge variant="outline" className="ml-1 h-5 text-xs">
                      {assessment.progress}%
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('users')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'users' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Usuários
                  {assessment.assigned_users && assessment.assigned_users.length > 0 && (
                    <Badge variant="outline" className="ml-1 h-5 text-xs">
                      {assessment.assigned_users.length}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('controls')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'controls' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Controles
                  {assessment.total_controls && (
                    <Badge variant="outline" className="ml-1 h-5 text-xs">
                      {assessment.completed_controls || 0}/{assessment.total_controls}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('history')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'history' 
                      ? 'bg-background shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Histórico
                </button>
              </div>

              {/* 1. INFORMAÇÕES GERAIS */}
              {activeSection === 'general' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">INFORMAÇÕES GERAIS</h4>
                    {canEdit && (
                      <Button
                        variant={isEditingGeneral ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isEditingGeneral) {
                            handleSaveGeneral();
                          } else {
                            setIsEditingGeneral(true);
                          }
                        }}
                        disabled={isUpdating}
                      >
                        {isEditingGeneral ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primeira Coluna */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome do Assessment</Label>
                        {isEditingGeneral ? (
                          <Input
                            id="name"
                            value={generalData.name}
                            onChange={(e) => setGeneralData({...generalData, name: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">{assessment.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="type">Tipo</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.type} 
                            onValueChange={(value) => setGeneralData({...generalData, type: value as AssessmentType})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ASSESSMENT_TYPES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label.split(' - ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {ASSESSMENT_TYPES[assessment.type]?.split(' - ')[0] || assessment.type}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.priority} 
                            onValueChange={(value) => setGeneralData({...generalData, priority: value as AssessmentPriority})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ASSESSMENT_PRIORITIES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label.split(' - ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {ASSESSMENT_PRIORITIES[assessment.priority]?.split(' - ')[0] || assessment.priority}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="start_date">Data de Início</Label>
                        {isEditingGeneral ? (
                          <Input
                            id="start_date"
                            type="date"
                            value={generalData.start_date}
                            onChange={(e) => setGeneralData({...generalData, start_date: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.start_date ? format(new Date(assessment.start_date), "dd/MM/yyyy", { locale: ptBR }) : 'Não definida'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Segunda Coluna */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        {isEditingGeneral ? (
                          <Textarea
                            id="description"
                            value={generalData.description}
                            onChange={(e) => setGeneralData({...generalData, description: e.target.value})}
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.description || 'Nenhuma descrição fornecida'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="frequency">Frequência</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.frequency} 
                            onValueChange={(value) => setGeneralData({...generalData, frequency: value as AssessmentFrequency})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ASSESSMENT_FREQUENCIES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {ASSESSMENT_FREQUENCIES[assessment.frequency] || assessment.frequency}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.status} 
                            onValueChange={(value) => setGeneralData({...generalData, status: value as AssessmentStatus})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ASSESSMENT_STATUSES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label.split(' - ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {ASSESSMENT_STATUSES[assessment.status]?.split(' - ')[0] || assessment.status}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="due_date">Data de Vencimento</Label>
                        {isEditingGeneral ? (
                          <Input
                            id="due_date"
                            type="date"
                            value={generalData.due_date}
                            onChange={(e) => setGeneralData({...generalData, due_date: e.target.value})}
                          />
                        ) : (
                          <p className={`text-sm mt-1 ${isOverdue(assessment.due_date) ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                            {assessment.due_date ? format(new Date(assessment.due_date), "dd/MM/yyyy", { locale: ptBR }) : 'Não definida'}
                            {isOverdue(assessment.due_date) && ' (Atrasado)'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditingGeneral && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingGeneral(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. PROGRESSO */}
              {activeSection === 'progress' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">PROGRESSO DO ASSESSMENT</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">{assessment.progress || 0}%</div>
                      <div className="text-sm text-muted-foreground">Progresso Geral</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <div className="text-2xl font-bold">{assessment.completed_controls || 0}/{assessment.total_controls || 0}</div>
                      <div className="text-sm text-muted-foreground">Controles Avaliados</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <div className="text-2xl font-bold">{assessment.compliance_score || 0}%</div>
                      <div className="text-sm text-muted-foreground">Score de Conformidade</div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Detalhamento do progresso em desenvolvimento.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. USUÁRIOS */}
              {activeSection === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">USUÁRIOS ATRIBUÍDOS</h4>
                    {canEdit && (
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Usuário
                      </Button>
                    )}
                  </div>

                  {assessment.assigned_users && assessment.assigned_users.length > 0 ? (
                    <div className="space-y-2">
                      {assessment.assigned_users.map((userRole) => (
                        <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{userRole.user?.full_name || userRole.user_id}</div>
                              <div className="text-xs text-muted-foreground">{userRole.role}</div>
                            </div>
                          </div>
                          {canEdit && (
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Nenhum usuário atribuído a este assessment.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. CONTROLES */}
              {activeSection === 'controls' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">CONTROLES DO FRAMEWORK</h4>
                  </div>

                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Módulo de controles em desenvolvimento.
                    </p>
                  </div>
                </div>
              )}

              {/* 5. HISTÓRICO */}
              {activeSection === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">HISTÓRICO DE MUDANÇAS</h4>
                  </div>

                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Histórico de mudanças em desenvolvimento.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDuplicate}>
                    <Download className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                </div>
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
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

export default AssessmentCard;
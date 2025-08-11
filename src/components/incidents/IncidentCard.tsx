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
  AlertCircle,
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
  Send,
  Eye,
  Plus,
  Trash2,
  Archive,
  UserPlus,
  MessageSquare,
  Calendar as CalendarDays,
  FileCheck,
  Activity,
  Target,
  Gauge,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidentManagement } from '@/hooks/useIncidentManagement';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  Incident, 
  IncidentStatus, 
  IncidentSeverity,
  IncidentPriority,
  IncidentType,
  IncidentCategory
} from '@/types/incident-management';
import { 
  INCIDENT_TYPES, 
  INCIDENT_CATEGORIES, 
  INCIDENT_STATUSES,
  INCIDENT_SEVERITIES,
  INCIDENT_PRIORITIES
} from '@/types/incident-management';

interface IncidentCardProps {
  incident: Incident;
  onUpdate?: (incidentId: string, updates: any) => void;
  onDelete?: (incidentId: string) => void;
  onDuplicate?: (incidentId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
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
    updateStatus,
    assignIncident,
    getProfileName
  } = useIncidentManagement();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'response' | 'evidence' | 'analysis' | 'history'>('general');

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
    title: incident.title,
    description: incident.description || '',
    type: incident.type,
    category: incident.category,
    severity: incident.severity,
    priority: incident.priority,
    status: incident.status,
    detection_date: formatDateForInput(incident.detection_date),
    resolution_date: formatDateForInput(incident.resolution_date),
    assigned_to: incident.assigned_to || '',
    affected_systems: incident.affected_systems?.join(', ') || '',
    business_impact: incident.business_impact || ''
  });

  // Estados para resposta ao incidente
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseData, setResponseData] = useState({
    action_taken: '',
    next_steps: '',
    status: incident.status,
    comments: ''
  });

  // Estados para atribuição
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    assigned_to: incident.assigned_to || '',
    role: 'responder' as const,
    comments: ''
  });

  // Sincronizar estado local com as mudanças do prop incident
  useEffect(() => {
    setGeneralData({
      title: incident.title,
      description: incident.description || '',
      type: incident.type,
      category: incident.category,
      severity: incident.severity,
      priority: incident.priority,
      status: incident.status,
      detection_date: formatDateForInput(incident.detection_date),
      resolution_date: formatDateForInput(incident.resolution_date),
      assigned_to: incident.assigned_to || '',
      affected_systems: incident.affected_systems?.join(', ') || '',
      business_impact: incident.business_impact || ''
    });
  }, [incident, formatDateForInput]);

  // ============================================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // ============================================================================

  const handleSaveGeneral = async () => {
    if (onUpdate) {
      const updates = {
        title: generalData.title,
        description: generalData.description,
        type: generalData.type as IncidentType,
        category: generalData.category as IncidentCategory,
        severity: generalData.severity as IncidentSeverity,
        priority: generalData.priority as IncidentPriority,
        status: generalData.status as IncidentStatus,
        detection_date: generalData.detection_date ? new Date(generalData.detection_date) : undefined,
        resolution_date: generalData.resolution_date ? new Date(generalData.resolution_date) : undefined,
        assigned_to: generalData.assigned_to || undefined,
        affected_systems: generalData.affected_systems ? 
          generalData.affected_systems.split(',').map(s => s.trim()).filter(s => s) : undefined,
        business_impact: generalData.business_impact || undefined
      };
      
      try {
        await onUpdate(incident.id, updates);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsEditingGeneral(false);
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Tem certeza que deseja excluir este incidente?')) {
      try {
        await onDelete(incident.id);
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const handleDuplicate = async () => {
    if (onDuplicate) {
      try {
        await onDuplicate(incident.id);
      } catch (error) {
        console.error('Erro ao duplicar:', error);
      }
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateStatus({
        incidentId: incident.id,
        status: responseData.status as any,
        comments: responseData.comments
      });
      setIsResponseDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleAssignIncident = async () => {
    try {
      await assignIncident({
        incidentId: incident.id,
        assigneeId: assignmentData.assigned_to
      });
      setIsAssignmentDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atribuir incidente:', error);
    }
  };

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'contained': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'investigating': return <Activity className="h-4 w-4" />;
      case 'contained': return <Shield className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = (date: Date | undefined) => {
    return date && date < new Date();
  };

  return (
    <Card className={`w-full transition-all duration-300 overflow-hidden ${
      isExpanded 
        ? 'bg-gray-200 dark:bg-gray-700 shadow-xl ring-2 ring-gray-400 dark:ring-gray-500 border-gray-400 dark:border-gray-500' 
        : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors py-3 px-4 rounded-t-lg ${
            isExpanded 
              ? 'bg-stone-300 dark:bg-gray-600' 
              : 'hover:bg-stone-50 dark:hover:bg-gray-800'
          }`} title={isExpanded ? "Clique para recolher" : "Clique para expandir"}>
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300 font-bold" /> : 
                    <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300 font-bold" />
                  }
                </div>
                
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{incident.title}</CardTitle>
                    <Badge className={getStatusColor(incident.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(incident.status)}
                        {INCIDENT_STATUSES[incident.status]?.split(' - ')[0] || incident.status}
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{INCIDENT_TYPES[incident.type]?.split(' - ')[0] || incident.type}</span>
                    <span>•</span>
                    <span className={`truncate ${getSeverityColor(incident.severity)}`}>
                      {INCIDENT_SEVERITIES[incident.severity]?.split(' - ')[0] || incident.severity}
                    </span>
                    <span>•</span>
                    <span className={`truncate ${getPriorityColor(incident.priority)}`}>
                      {INCIDENT_PRIORITIES[incident.priority]?.split(' - ')[0] || incident.priority}
                    </span>
                    {incident.assigned_to && (
                      <>
                        <span>•</span>
                        <span className="truncate">{getProfileName(incident.assigned_to)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-muted-foreground">
                  <div>Detectado:</div>
                  <div className="font-medium">
                    {format(incident.detection_date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                </div>
                {incident.resolution_date && (
                  <div className={`text-xs mt-1 ${
                    isOverdue(incident.resolution_date) ? 'text-red-600 font-semibold' : 'text-green-600'
                  }`}>
                    <div>Resolvido:</div>
                    <div className="font-medium">
                      {format(incident.resolution_date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
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
                
                <button
                  onClick={() => setActiveSection('response')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'response' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Resposta
                </button>
                
                <button
                  onClick={() => setActiveSection('evidence')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'evidence' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileCheck className="h-4 w-4" />
                  Evidências
                </button>
                
                <button
                  onClick={() => setActiveSection('analysis')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'analysis' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Análise
                </button>
                
                <button
                  onClick={() => setActiveSection('history')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'history' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
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
                        <Label htmlFor="title">Título do Incidente</Label>
                        {isEditingGeneral ? (
                          <Input
                            id="title"
                            value={generalData.title}
                            onChange={(e) => setGeneralData({...generalData, title: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">{incident.title}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="type">Tipo</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.type} 
                            onValueChange={(value) => setGeneralData({...generalData, type: value as IncidentType})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label.split(' - ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {INCIDENT_TYPES[incident.type]?.split(' - ')[0] || incident.type}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="severity">Severidade</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.severity} 
                            onValueChange={(value) => setGeneralData({...generalData, severity: value as IncidentSeverity})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(INCIDENT_SEVERITIES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label.split(' - ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {INCIDENT_SEVERITIES[incident.severity]?.split(' - ')[0] || incident.severity}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="detection_date">Data de Detecção</Label>
                        {isEditingGeneral ? (
                          <Input
                            id="detection_date"
                            type="datetime-local"
                            value={generalData.detection_date + 'T00:00'}
                            onChange={(e) => setGeneralData({...generalData, detection_date: e.target.value.split('T')[0]})}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(incident.detection_date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
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
                            {incident.description || 'Nenhuma descrição fornecida'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.priority} 
                            onValueChange={(value) => setGeneralData({...generalData, priority: value as IncidentPriority})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(INCIDENT_PRIORITIES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label.split(' - ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {INCIDENT_PRIORITIES[incident.priority]?.split(' - ')[0] || incident.priority}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.status} 
                            onValueChange={(value) => setGeneralData({...generalData, status: value as IncidentStatus})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(INCIDENT_STATUSES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label.split(' - ')[0]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {INCIDENT_STATUSES[incident.status]?.split(' - ')[0] || incident.status}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="assigned_to">Atribuído para</Label>
                        {isEditingGeneral ? (
                          <Select 
                            value={generalData.assigned_to} 
                            onValueChange={(value) => setGeneralData({...generalData, assigned_to: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar usuário" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Não atribuído</SelectItem>
                              {profiles.map((profile) => (
                                <SelectItem key={profile.user_id} value={profile.user_id}>
                                  {profile.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {incident.assigned_to ? getProfileName(incident.assigned_to) : 'Não atribuído'}
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

              {/* 2. RESPOSTA */}
              {activeSection === 'response' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">RESPOSTA AO INCIDENTE</h4>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsResponseDialogOpen(true)}>
                          <Activity className="h-4 w-4 mr-2" />
                          Atualizar Status
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsAssignmentDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Atribuir
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Módulo de resposta ao incidente em desenvolvimento.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. EVIDÊNCIAS */}
              {activeSection === 'evidence' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">EVIDÊNCIAS</h4>
                    {canEdit && (
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar Evidência
                      </Button>
                    )}
                  </div>

                  <div className="text-center py-8">
                    <FileCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Módulo de evidências em desenvolvimento.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. ANÁLISE */}
              {activeSection === 'analysis' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-muted-foreground">ANÁLISE DE CAUSA RAIZ</h4>
                  </div>

                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Módulo de análise de causa raiz em desenvolvimento.
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

      {/* Dialog para Atualização de Status */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status do Incidente</DialogTitle>
            <DialogDescription>
              Atualize o status e adicione comentários sobre a resposta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="response_status">Novo Status</Label>
              <Select 
                value={responseData.status} 
                onValueChange={(value) => setResponseData({...responseData, status: value as IncidentStatus})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="response_comments">Comentários</Label>
              <Textarea
                id="response_comments"
                value={responseData.comments}
                onChange={(e) => setResponseData({...responseData, comments: e.target.value})}
                rows={4}
                placeholder="Descreva as ações tomadas..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus}>
              <Send className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Atribuição */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Incidente</DialogTitle>
            <DialogDescription>
              Atribua este incidente a um responsável.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignment_user">Usuário</Label>
              <Select 
                value={assignmentData.assigned_to} 
                onValueChange={(value) => setAssignmentData({...assignmentData, assigned_to: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.full_name} - {profile.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assignment_comments">Comentários</Label>
              <Textarea
                id="assignment_comments"
                value={assignmentData.comments}
                onChange={(e) => setAssignmentData({...assignmentData, comments: e.target.value})}
                rows={3}
                placeholder="Instruções adicionais..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignIncident}>
              <UserPlus className="h-4 w-4 mr-2" />
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default IncidentCard;
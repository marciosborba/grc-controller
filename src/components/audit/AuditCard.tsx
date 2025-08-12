import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Upload,
  Target,
  Users,
  History,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  Eye,
  Building,
  Database,
  BarChart3,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  Audit, 
  AuditStatus, 
  AuditType,
  AuditPriority,
  AuditPhase
} from '@/types/audit-management';

interface AuditCardProps {
  audit: Audit;
  onUpdate?: (auditId: string, updates: any) => void;
  onDelete?: (auditId: string) => void;
  canEdit?: boolean;
}

const AuditCard: React.FC<AuditCardProps> = ({
  audit,
  onUpdate,
  onDelete,
  canEdit = true
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'findings' | 'recommendations' | 'evidence' | 'workingpapers' | 'team' | 'history'>('general');
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [generalData, setGeneralData] = useState({
    title: audit.title,
    description: audit.description || '',
    auditType: audit.audit_type,
    scope: audit.audit_scope,
    status: audit.status,
    priority: audit.priority,
    phase: audit.current_phase,
    leadAuditor: audit.lead_auditor || '',
    plannedStart: audit.planned_start_date ? format(audit.planned_start_date, 'yyyy-MM-dd') : '',
    plannedEnd: audit.planned_end_date ? format(audit.planned_end_date, 'yyyy-MM-dd') : '',
    budgetedHours: audit.budgeted_hours || 0,
    actualHours: audit.actual_hours || 0
  });

  const handleSaveGeneral = useCallback(() => {
    if (onUpdate) {
      const updates = {
        title: generalData.title,
        description: generalData.description,
        audit_type: generalData.auditType,
        audit_scope: generalData.scope,
        status: generalData.status,
        priority: generalData.priority,
        current_phase: generalData.phase,
        lead_auditor: generalData.leadAuditor,
        planned_start_date: generalData.plannedStart ? new Date(generalData.plannedStart) : null,
        planned_end_date: generalData.plannedEnd ? new Date(generalData.plannedEnd) : null,
        budgeted_hours: generalData.budgetedHours,
        actual_hours: generalData.actualHours,
        updated_by: user?.id,
        updated_at: new Date()
      };
      onUpdate(audit.id, updates);
      setIsEditingGeneral(false);
      toast.success('Auditoria atualizada com sucesso');
    }
  }, [generalData, audit.id, onUpdate, user?.id]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(audit.id);
      toast.success('Auditoria excluída com sucesso');
    }
    setShowDeleteDialog(false);
  }, [audit.id, onDelete]);

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'Planning': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Fieldwork': return <PlayCircle className="h-4 w-4 text-orange-600" />;
      case 'Review': return <Eye className="h-4 w-4 text-purple-600" />;
      case 'Reporting': return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'Closed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <ClipboardList className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case 'Planning': return 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-200';
      case 'Fieldwork': return 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-600 dark:bg-orange-900 dark:text-orange-200';
      case 'Review': return 'border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-600 dark:bg-purple-900 dark:text-purple-200';
      case 'Reporting': return 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-600 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Closed': return 'border-green-300 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900 dark:text-green-200';
      case 'Cancelled': return 'border-red-300 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900 dark:text-red-200';
      default: return 'border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: AuditPriority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 dark:text-red-400';
      case 'High': return 'text-orange-600 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: AuditType) => {
    switch (type) {
      case 'Internal Audit': return <Building className="h-5 w-5" />;
      case 'External Audit': return <Users className="h-5 w-5" />;
      case 'Regulatory Audit': return <FileCheck className="h-5 w-5" />;
      case 'IT Audit': return <Database className="h-5 w-5" />;
      case 'Financial Audit': return <BarChart3 className="h-5 w-5" />;
      default: return <ClipboardList className="h-5 w-5" />;
    }
  };

  const calculateProgress = () => {
    // Simple progress calculation based on phase
    const phases = ['Planning', 'Risk Assessment', 'Control Testing', 'Substantive Testing', 'Reporting', 'Follow-up', 'Closure'];
    const currentIndex = phases.indexOf(audit.current_phase);
    return currentIndex >= 0 ? ((currentIndex + 1) / phases.length) * 100 : 0;
  };

  const findingsCount = audit.findings?.length || 0;

  return (
    <Card className={cn(
      "w-full transition-all duration-300 overflow-hidden cursor-pointer",
      isExpanded 
        ? "bg-gray-50 dark:bg-gray-800 shadow-lg ring-2 ring-primary/20" 
        : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
                
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(audit.audit_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {audit.title}
                    </h3>
                    {audit.priority === 'Critical' && (
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{audit.audit_type}</span>
                    <span>•</span>
                    <span className="truncate">{audit.audit_scope}</span>
                    {audit.lead_auditor && (
                      <>
                        <span>•</span>
                        <span className="truncate">Auditor: {audit.lead_auditor}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Progress */}
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Progresso</div>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateProgress()} className="w-16" />
                    <span className="text-xs font-medium">{Math.round(calculateProgress())}%</span>
                  </div>
                </div>
                
                {findingsCount > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Achados</div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-xs font-medium">{findingsCount}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(audit.status)}
                  <Badge className={cn("text-xs", getStatusColor(audit.status))}>
                    {audit.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className={cn("font-medium", getPriorityColor(audit.priority))}>
                    {audit.priority}
                  </span>
                  {audit.planned_end_date && (
                    <>
                      <span className="mx-1">•</span>
                      <span>
                        {format(audit.planned_end_date, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </>
                  )}
                </div>
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
                  <ClipboardList className="h-4 w-4" />
                  Geral
                </button>
                
                <button
                  onClick={() => setActiveSection('findings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'findings' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Achados
                  {findingsCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {findingsCount}
                    </Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSection('recommendations')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'recommendations' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Recomendações
                </button>
                
                <button
                  onClick={() => setActiveSection('evidence')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'evidence' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Evidências
                </button>
                
                <button
                  onClick={() => setActiveSection('workingpapers')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'workingpapers' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Papéis
                </button>
                
                <button
                  onClick={() => setActiveSection('team')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'team' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Equipe
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
                        <Label htmlFor="title">Título da Auditoria</Label>
                        <Input
                          id="title"
                          value={generalData.title}
                          onChange={(e) => setGeneralData({ ...generalData, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="auditType">Tipo de Auditoria</Label>
                        <Select
                          value={generalData.auditType}
                          onValueChange={(value) => setGeneralData({ ...generalData, auditType: value as AuditType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Internal Audit">Internal Audit</SelectItem>
                            <SelectItem value="External Audit">External Audit</SelectItem>
                            <SelectItem value="Regulatory Audit">Regulatory Audit</SelectItem>
                            <SelectItem value="IT Audit">IT Audit</SelectItem>
                            <SelectItem value="Financial Audit">Financial Audit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="scope">Escopo</Label>
                        <Input
                          id="scope"
                          value={generalData.scope}
                          onChange={(e) => setGeneralData({ ...generalData, scope: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={generalData.status}
                          onValueChange={(value) => setGeneralData({ ...generalData, status: value as AuditStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="Fieldwork">Fieldwork</SelectItem>
                            <SelectItem value="Review">Review</SelectItem>
                            <SelectItem value="Reporting">Reporting</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select
                          value={generalData.priority}
                          onValueChange={(value) => setGeneralData({ ...generalData, priority: value as AuditPriority })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="phase">Fase Atual</Label>
                        <Select
                          value={generalData.phase}
                          onValueChange={(value) => setGeneralData({ ...generalData, phase: value as AuditPhase })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                            <SelectItem value="Control Testing">Control Testing</SelectItem>
                            <SelectItem value="Substantive Testing">Substantive Testing</SelectItem>
                            <SelectItem value="Reporting">Reporting</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                            <SelectItem value="Closure">Closure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="leadAuditor">Auditor Líder</Label>
                        <Input
                          id="leadAuditor"
                          value={generalData.leadAuditor}
                          onChange={(e) => setGeneralData({ ...generalData, leadAuditor: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="plannedStart">Data Início Planejado</Label>
                        <Input
                          id="plannedStart"
                          type="date"
                          value={generalData.plannedStart}
                          onChange={(e) => setGeneralData({ ...generalData, plannedStart: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="plannedEnd">Data Fim Planejado</Label>
                        <Input
                          id="plannedEnd"
                          type="date"
                          value={generalData.plannedEnd}
                          onChange={(e) => setGeneralData({ ...generalData, plannedEnd: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="budgetedHours">Horas Orçadas</Label>
                        <Input
                          id="budgetedHours"
                          type="number"
                          value={generalData.budgetedHours}
                          onChange={(e) => setGeneralData({ ...generalData, budgetedHours: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="actualHours">Horas Reais</Label>
                        <Input
                          id="actualHours"
                          type="number"
                          value={generalData.actualHours}
                          onChange={(e) => setGeneralData({ ...generalData, actualHours: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={generalData.description}
                          onChange={(e) => setGeneralData({ ...generalData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="col-span-2 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingGeneral(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveGeneral}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Título</Label>
                          <p className="text-sm font-medium">{audit.title}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Tipo</Label>
                          <p className="text-sm">{audit.audit_type}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Escopo</Label>
                          <p className="text-sm">{audit.audit_scope}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(audit.status)}
                            <Badge className={cn("text-xs", getStatusColor(audit.status))}>
                              {audit.status}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Progresso</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={calculateProgress()} className="flex-1" />
                            <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Prioridade</Label>
                          <p className={cn("text-sm font-medium", getPriorityColor(audit.priority))}>
                            {audit.priority}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Fase Atual</Label>
                          <p className="text-sm">{audit.current_phase}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Auditor Líder</Label>
                          <p className="text-sm">{audit.lead_auditor || 'Não definido'}</p>
                        </div>

                        {audit.planned_start_date && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Início Planejado</Label>
                            <p className="text-sm">
                              {format(audit.planned_start_date, "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        )}

                        {audit.planned_end_date && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Fim Planejado</Label>
                            <p className="text-sm">
                              {format(audit.planned_end_date, "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        )}
                      </div>

                      {audit.description && (
                        <div className="col-span-2">
                          <Label className="text-xs text-muted-foreground">Descrição</Label>
                          <p className="text-sm mt-1">{audit.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Other sections would be implemented similarly */}
              {activeSection === 'findings' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">ACHADOS</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum achado registrado</p>
                    <p className="text-xs">Clique para adicionar achados</p>
                  </div>
                </div>
              )}

              {activeSection === 'recommendations' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">RECOMENDAÇÕES</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma recomendação cadastrada</p>
                    <p className="text-xs">Clique para adicionar recomendações</p>
                  </div>
                </div>
              )}

              {activeSection === 'evidence' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">EVIDÊNCIAS</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma evidência coletada</p>
                    <p className="text-xs">Clique para adicionar evidências</p>
                  </div>
                </div>
              )}

              {activeSection === 'workingpapers' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">PAPÉIS DE TRABALHO</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum papel de trabalho criado</p>
                    <p className="text-xs">Clique para adicionar papéis</p>
                  </div>
                </div>
              )}

              {activeSection === 'team' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">EQUIPE DE AUDITORIA</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Equipe não definida</p>
                    <p className="text-xs">Clique para definir a equipe</p>
                  </div>
                </div>
              )}

              {activeSection === 'history' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">HISTÓRICO</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma alteração registrada</p>
                    <p className="text-xs">Histórico será exibido aqui</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta auditoria? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AuditCard;
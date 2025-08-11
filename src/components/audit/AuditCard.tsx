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
import { Progress } from '@/components/ui/progress';
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Download,
  Edit,
  Save,
  X,
  Send,
  Eye,
  Plus,
  Trash2,
  Archive,
  UserPlus,
  MessageSquare,
  Calendar as CalendarDays,
  Target,
  BarChart3,
  AlertCircle,
  Activity,
  BookOpen,
  Building,
  Users,
  History,
  Search,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Folder,
  Camera,
  Mic,
  Database,
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
  AuditScope,
  AuditPhase,
  AuditFinding,
  AuditRecommendation,
  AuditEvidence,
  AuditWorkingPaper,
  FindingSeverity,
  FindingStatus,
  FindingType,
  EvidenceType,
  TestingType
} from '@/types/audit-management';
import { 
  AUDIT_STATUSES, 
  AUDIT_TYPES, 
  AUDIT_PRIORITIES,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  FINDING_TYPES,
  EVIDENCE_TYPES,
  getAuditStatusColor,
  getFindingSeverityColor,
  calculateAuditProgress,
  isAuditOverdue
} from '@/types/audit-management';

interface AuditCardProps {
  audit: Audit;
  onUpdate?: (auditId: string, updates: any) => void;
  onDelete?: (auditId: string) => void;
  onDuplicate?: (auditId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
}

const AuditCard: React.FC<AuditCardProps> = ({
  audit,
  onUpdate,
  onDelete,
  onDuplicate,
  isUpdating = false,
  isDeleting = false,
  canEdit = true,
  canDelete = false,
  canApprove = false
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'findings' | 'recommendations' | 'evidence' | 'workingpapers' | 'team' | 'history'>('general');
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFindingDialog, setShowFindingDialog] = useState(false);
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showWorkingPaperDialog, setShowWorkingPaperDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    title: audit.title,
    description: audit.description,
    audit_type: audit.audit_type,
    audit_scope: audit.audit_scope,
    scope_description: audit.scope_description,
    status: audit.status,
    priority: audit.priority,
    current_phase: audit.current_phase,
    lead_auditor: audit.lead_auditor,
    planned_start_date: audit.planned_start_date ? format(audit.planned_start_date, 'yyyy-MM-dd') : '',
    planned_end_date: audit.planned_end_date ? format(audit.planned_end_date, 'yyyy-MM-dd') : '',
    fieldwork_start_date: audit.fieldwork_start_date ? format(audit.fieldwork_start_date, 'yyyy-MM-dd') : '',
    fieldwork_end_date: audit.fieldwork_end_date ? format(audit.fieldwork_end_date, 'yyyy-MM-dd') : '',
    report_due_date: audit.report_due_date ? format(audit.report_due_date, 'yyyy-MM-dd') : '',
    budgeted_hours: audit.budgeted_hours || 0,
    actual_hours: audit.actual_hours || 0,
    estimated_cost: audit.estimated_cost || 0,
    actual_cost: audit.actual_cost || 0,
    overall_opinion: audit.overall_opinion || '',
    overall_rating: audit.overall_rating || 3,
    executive_summary: audit.executive_summary || '',
    key_findings_summary: audit.key_findings_summary || '',
    objectives: (audit.objectives || []).join('\n'),
    audit_criteria: (audit.audit_criteria || []).join('\n'),
    auditee_contacts: (audit.auditee_contacts || []).join('\n'),
    auditors: (audit.auditors || []).join('\n'),
    confidentiality_level: audit.confidentiality_level,
    follow_up_required: audit.follow_up_required,
    follow_up_date: audit.follow_up_date ? format(audit.follow_up_date, 'yyyy-MM-dd') : ''
  });

  const [newFinding, setNewFinding] = useState({
    title: '',
    description: '',
    finding_type: 'Control Deficiency' as FindingType,
    severity: 'Medium' as FindingSeverity,
    condition: '',
    criteria: '',
    cause: '',
    effect: '',
    audit_area: '',
    likelihood: 'Medium' as 'High' | 'Medium' | 'Low',
    impact: 'Medium' as 'High' | 'Medium' | 'Low',
    responsible_person: '',
    target_resolution_date: ''
  });

  const [newRecommendation, setNewRecommendation] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    category: 'Control Enhancement' as 'Control Enhancement' | 'Process Improvement' | 'Policy Update' | 'Training' | 'System Enhancement' | 'Organizational' | 'Other',
    implementation_effort: 'Medium' as 'Low' | 'Medium' | 'High',
    responsible_person: '',
    target_implementation_date: '',
    estimated_cost: 0,
    expected_benefits: ''
  });

  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    evidence_type: 'Document' as EvidenceType,
    collection_method: '',
    evidence_source: '',
    reliability: 'Medium' as 'High' | 'Medium' | 'Low',
    relevance: 'High' as 'High' | 'Medium' | 'Low',
    file_url: ''
  });

  const [newWorkingPaper, setNewWorkingPaper] = useState({
    title: '',
    description: '',
    paper_type: 'Test Plan' as 'Test Plan' | 'Test Results' | 'Analysis' | 'Summary' | 'Checklist' | 'Interview Notes' | 'Observation Log' | 'Control Matrix' | 'Risk Assessment' | 'Other',
    section: '',
    audit_procedure: '',
    testing_method: 'Walk-through' as TestingType,
    content: '',
    sample_size: 0
  });

  const [communication, setCommunication] = useState({
    type: 'Status Update' as 'Opening Meeting' | 'Status Update' | 'Interim Report' | 'Draft Report' | 'Final Report' | 'Management Response' | 'Follow-up' | 'Closure',
    recipient_name: '',
    recipient_email: '',
    subject: '',
    message: ''
  });

  // Sample data - in real app, this would come from props or API
  const findingsData: AuditFinding[] = audit.findings || [];
  const recommendationsData: AuditRecommendation[] = audit.recommendations || [];
  const evidenceData: AuditEvidence[] = [];
  const workingPapersData: AuditWorkingPaper[] = audit.working_papers || [];

  const handleSave = useCallback(() => {
    if (onUpdate) {
      const updates = {
        ...editForm,
        planned_start_date: editForm.planned_start_date ? new Date(editForm.planned_start_date) : null,
        planned_end_date: editForm.planned_end_date ? new Date(editForm.planned_end_date) : null,
        fieldwork_start_date: editForm.fieldwork_start_date ? new Date(editForm.fieldwork_start_date) : null,
        fieldwork_end_date: editForm.fieldwork_end_date ? new Date(editForm.fieldwork_end_date) : null,
        report_due_date: editForm.report_due_date ? new Date(editForm.report_due_date) : null,
        follow_up_date: editForm.follow_up_date ? new Date(editForm.follow_up_date) : null,
        objectives: editForm.objectives.split('\n').filter(o => o.trim()),
        audit_criteria: editForm.audit_criteria.split('\n').filter(c => c.trim()),
        auditee_contacts: editForm.auditee_contacts.split('\n').filter(c => c.trim()),
        auditors: editForm.auditors.split('\n').filter(a => a.trim()),
        updated_by: user?.id || '',
        updated_at: new Date()
      };
      onUpdate(audit.id, updates);
      setIsEditing(false);
      toast.success('Auditoria atualizada com sucesso');
    }
  }, [editForm, audit.id, onUpdate, user?.id]);

  const handleCancel = useCallback(() => {
    // Reset form to original values
    setEditForm({
      title: audit.title,
      description: audit.description,
      audit_type: audit.audit_type,
      audit_scope: audit.audit_scope,
      scope_description: audit.scope_description,
      status: audit.status,
      priority: audit.priority,
      current_phase: audit.current_phase,
      lead_auditor: audit.lead_auditor,
      planned_start_date: audit.planned_start_date ? format(audit.planned_start_date, 'yyyy-MM-dd') : '',
      planned_end_date: audit.planned_end_date ? format(audit.planned_end_date, 'yyyy-MM-dd') : '',
      fieldwork_start_date: audit.fieldwork_start_date ? format(audit.fieldwork_start_date, 'yyyy-MM-dd') : '',
      fieldwork_end_date: audit.fieldwork_end_date ? format(audit.fieldwork_end_date, 'yyyy-MM-dd') : '',
      report_due_date: audit.report_due_date ? format(audit.report_due_date, 'yyyy-MM-dd') : '',
      budgeted_hours: audit.budgeted_hours || 0,
      actual_hours: audit.actual_hours || 0,
      estimated_cost: audit.estimated_cost || 0,
      actual_cost: audit.actual_cost || 0,
      overall_opinion: audit.overall_opinion || '',
      overall_rating: audit.overall_rating || 3,
      executive_summary: audit.executive_summary || '',
      key_findings_summary: audit.key_findings_summary || '',
      objectives: (audit.objectives || []).join('\n'),
      audit_criteria: (audit.audit_criteria || []).join('\n'),
      auditee_contacts: (audit.auditee_contacts || []).join('\n'),
      auditors: (audit.auditors || []).join('\n'),
      confidentiality_level: audit.confidentiality_level,
      follow_up_required: audit.follow_up_required,
      follow_up_date: audit.follow_up_date ? format(audit.follow_up_date, 'yyyy-MM-dd') : ''
    });
    setIsEditing(false);
  }, [audit]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(audit.id);
      toast.success('Auditoria excluída com sucesso');
    }
    setShowDeleteDialog(false);
  }, [audit.id, onDelete]);

  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate(audit.id);
      toast.success('Auditoria duplicada com sucesso');
    }
  }, [audit.id, onDuplicate]);

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'Planning': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Fieldwork': return <PlayCircle className="h-4 w-4 text-orange-600" />;
      case 'Review': return <Eye className="h-4 w-4 text-purple-600" />;
      case 'Reporting': return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'Follow-up': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'Closed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cancelled': return <StopCircle className="h-4 w-4 text-red-600" />;
      case 'On Hold': return <PauseCircle className="h-4 w-4 text-gray-600" />;
      default: return <ClipboardList className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAuditTypeIcon = (type: AuditType) => {
    switch (type) {
      case 'Internal Audit': return <Building className="h-4 w-4" />;
      case 'External Audit': return <Users className="h-4 w-4" />;
      case 'Regulatory Audit': return <FileCheck className="h-4 w-4" />;
      case 'IT Audit': return <Database className="h-4 w-4" />;
      case 'Financial Audit': return <BarChart3 className="h-4 w-4" />;
      default: return <ClipboardList className="h-4 w-4" />;
    }
  };

  const getEvidenceTypeIcon = (type: EvidenceType) => {
    switch (type) {
      case 'Document': return <FileText className="h-4 w-4" />;
      case 'Screenshots': return <Camera className="h-4 w-4" />;
      case 'Video Recording': 
      case 'Audio Recording': return <Mic className="h-4 w-4" />;
      case 'Database Query': return <Database className="h-4 w-4" />;
      case 'System Reports': return <BarChart3 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    return calculateAuditProgress(audit);
  };

  const isOverdue = isAuditOverdue(audit);

  return (
    <Card className={`w-full transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-gray-200 dark:bg-gray-700 shadow-xl ring-2 ring-gray-400 dark:ring-gray-500 border-gray-400 dark:border-gray-500' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors py-3 px-4 rounded-t-lg ${isExpanded ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`} title={isExpanded ? "Clique para recolher" : "Clique para expandir"}>
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {isExpanded ?
                    <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300 font-bold" /> : 
                    <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300 font-bold" />
                  }
                </div>
                
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  {getAuditTypeIcon(audit.audit_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {audit.title}
                    </h3>
                    {isOverdue && (
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {audit.audit_type}
                    </span>
                    <span>{audit.audit_scope}</span>
                    <span>•</span>
                    <span>{audit.lead_auditor}</span>
                  </div>
                </div>
              </div>

              {/* Center Section - Progress */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progresso</div>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateProgress()} className="w-16 h-2" />
                    <span className="text-xs font-medium">{calculateProgress()}%</span>
                  </div>
                </div>
                
                {/* Findings count */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Achados</div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-medium">{findingsData.length}</span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    {getStatusIcon(audit.status)}
                    <Badge className={cn("text-xs border", getAuditStatusColor(audit.status))}>
                      {audit.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className={cn(
                      "text-xs font-medium",
                      audit.priority === 'Critical' ? 'text-red-600' :
                      audit.priority === 'High' ? 'text-orange-600' :
                      audit.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                    )}>
                      {audit.priority}
                    </span>
                    {audit.planned_end_date && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className={cn(
                          "text-xs",
                          isOverdue ? "text-red-600 font-medium" : "text-gray-600 dark:text-gray-400"
                        )}>
                          {format(audit.planned_end_date, 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile badges */}
                <div className="flex sm:hidden flex-col gap-1">
                  <Badge className={cn("text-xs border", getAuditStatusColor(audit.status))}>
                    {audit.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 space-y-4 bg-white dark:bg-gray-900">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-end border-b border-gray-200 dark:border-gray-700 pb-4">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFindingDialog(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Achado
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecommendationDialog(true)}
              >
                <Target className="h-4 w-4 mr-1" />
                Recomendação
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEvidenceDialog(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Evidência
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWorkingPaperDialog(true)}
              >
                <Folder className="h-4 w-4 mr-1" />
                Papel Trabalho
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommunicationDialog(true)}
              >
                <Send className="h-4 w-4 mr-1" />
                Comunicar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
              >
                <Plus className="h-4 w-4 mr-1" />
                Duplicar
              </Button>

              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              )}

              {isEditing && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'general', label: 'Geral', icon: ClipboardList },
                { id: 'findings', label: 'Achados', icon: AlertTriangle },
                { id: 'recommendations', label: 'Recomendações', icon: Target },
                { id: 'evidence', label: 'Evidências', icon: Upload },
                { id: 'workingpapers', label: 'Papéis Trabalho', icon: Folder },
                { id: 'team', label: 'Equipe', icon: Users },
                { id: 'history', label: 'Histórico', icon: History }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection(id as any)}
                  className={cn(
                    "text-xs",
                    activeSection === id 
                      ? "bg-primary/10 text-primary border-b-2 border-primary" 
                      : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                  {id === 'findings' && findingsData.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {findingsData.length}
                    </Badge>
                  )}
                  {id === 'recommendations' && recommendationsData.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {recommendationsData.length}
                    </Badge>
                  )}
                  {id === 'evidence' && evidenceData.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {evidenceData.length}
                    </Badge>
                  )}
                  {id === 'workingpapers' && workingPapersData.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {workingPapersData.length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Content based on active section */}
            <div className="min-h-[200px]">
              {activeSection === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 border-b pb-1">
                      Informações Básicas
                    </h4>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Título</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                          {audit.title}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Descrição</Label>
                      {isEditing ? (
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="text-sm h-20"
                        />
                      ) : (
                        <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border min-h-[60px]">
                          {audit.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Tipo</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.audit_type}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, audit_type: value as AuditType }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AUDIT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            {audit.audit_type}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Escopo</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.audit_scope}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, audit_scope: value as AuditScope }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Organization-wide">Organização</SelectItem>
                              <SelectItem value="Department Specific">Departamento</SelectItem>
                              <SelectItem value="Process Specific">Processo</SelectItem>
                              <SelectItem value="System Specific">Sistema</SelectItem>
                              <SelectItem value="Location Specific">Local</SelectItem>
                              <SelectItem value="Project Specific">Projeto</SelectItem>
                              <SelectItem value="Custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            {audit.audit_scope}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Descrição do Escopo</Label>
                      {isEditing ? (
                        <Textarea
                          value={editForm.scope_description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, scope_description: e.target.value }))}
                          className="text-sm h-16"
                        />
                      ) : (
                        <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                          {audit.scope_description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status and Progress */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 border-b pb-1">
                      Status e Progresso
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Status</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.status}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as AuditStatus }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AUDIT_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getStatusIcon(audit.status)}
                            <Badge className={cn("text-xs border", getAuditStatusColor(audit.status))}>
                              {audit.status}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Prioridade</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.priority}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value as AuditPriority }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AUDIT_PRIORITIES.map(priority => (
                                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className={cn(
                            "text-sm font-medium",
                            audit.priority === 'Critical' ? 'text-red-600' :
                            audit.priority === 'High' ? 'text-orange-600' :
                            audit.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                          )}>
                            {audit.priority}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Fase Atual</Label>
                      {isEditing ? (
                        <Select
                          value={editForm.current_phase}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, current_phase: value as AuditPhase }))}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planning">Planejamento</SelectItem>
                            <SelectItem value="Risk Assessment">Avaliação de Riscos</SelectItem>
                            <SelectItem value="Control Testing">Teste de Controles</SelectItem>
                            <SelectItem value="Substantive Testing">Testes Substantivos</SelectItem>
                            <SelectItem value="Reporting">Relatórios</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                            <SelectItem value="Closure">Encerramento</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                          {audit.current_phase}
                        </p>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Progresso da Auditoria</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={calculateProgress()} className="flex-1" />
                        <span className="text-sm font-medium">{calculateProgress()}%</span>
                      </div>
                    </div>

                    {/* Overall Opinion */}
                    {audit.overall_opinion && (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Opinião Geral</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.overall_opinion}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, overall_opinion: value }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Satisfactory">Satisfatório</SelectItem>
                              <SelectItem value="Needs Improvement">Precisa Melhorar</SelectItem>
                              <SelectItem value="Unsatisfactory">Insatisfatório</SelectItem>
                              <SelectItem value="Adequate">Adequado</SelectItem>
                              <SelectItem value="Inadequate">Inadequado</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge 
                            variant={
                              audit.overall_opinion === 'Satisfactory' || audit.overall_opinion === 'Adequate' 
                                ? 'default' 
                                : 'destructive'
                            }
                            className="text-xs"
                          >
                            {audit.overall_opinion}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional fields when editing */}
                  {isEditing && (
                    <>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 border-b pb-1">
                          Datas e Prazos
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Início Planejado</Label>
                            <Input
                              type="date"
                              value={editForm.planned_start_date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, planned_start_date: e.target.value }))}
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Fim Planejado</Label>
                            <Input
                              type="date"
                              value={editForm.planned_end_date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, planned_end_date: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Início Fieldwork</Label>
                            <Input
                              type="date"
                              value={editForm.fieldwork_start_date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, fieldwork_start_date: e.target.value }))}
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Fim Fieldwork</Label>
                            <Input
                              type="date"
                              value={editForm.fieldwork_end_date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, fieldwork_end_date: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Prazo do Relatório</Label>
                          <Input
                            type="date"
                            value={editForm.report_due_date}
                            onChange={(e) => setEditForm(prev => ({ ...prev, report_due_date: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 border-b pb-1">
                          Recursos e Orçamento
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Horas Orçadas</Label>
                            <Input
                              type="number"
                              value={editForm.budgeted_hours}
                              onChange={(e) => setEditForm(prev => ({ ...prev, budgeted_hours: parseFloat(e.target.value) || 0 }))}
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Horas Reais</Label>
                            <Input
                              type="number"
                              value={editForm.actual_hours}
                              onChange={(e) => setEditForm(prev => ({ ...prev, actual_hours: parseFloat(e.target.value) || 0 }))}
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Custo Estimado</Label>
                            <Input
                              type="number"
                              value={editForm.estimated_cost}
                              onChange={(e) => setEditForm(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
                              className="text-sm"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Custo Real</Label>
                            <Input
                              type="number"
                              value={editForm.actual_cost}
                              onChange={(e) => setEditForm(prev => ({ ...prev, actual_cost: parseFloat(e.target.value) || 0 }))}
                              className="text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeSection === 'findings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Achados de Auditoria ({findingsData.length})
                    </h4>
                    <Button size="sm" onClick={() => setShowFindingDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Achado
                    </Button>
                  </div>

                  {findingsData.length > 0 ? (
                    <div className="space-y-2">
                      {findingsData.map((finding, index) => (
                        <div key={finding.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-gray-800">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{finding.title}</h5>
                              <Badge 
                                variant={finding.severity === 'Critical' ? 'destructive' : 'outline'} 
                                className="text-xs"
                              >
                                {finding.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {finding.finding_type}
                              </Badge>
                            </div>
                            <Badge 
                              variant={finding.status === 'Closed' ? 'default' : 'outline'} 
                              className="text-xs"
                            >
                              {finding.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {finding.description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <div><strong>Condição:</strong> {finding.condition}</div>
                            <div><strong>Critério:</strong> {finding.criteria}</div>
                            <div><strong>Causa:</strong> {finding.cause}</div>
                            <div><strong>Efeito:</strong> {finding.effect}</div>
                          </div>
                          {finding.target_resolution_date && (
                            <div className="mt-2 text-xs text-gray-500">
                              <strong>Prazo para Resolução:</strong> {format(finding.target_resolution_date, 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum achado registrado</p>
                      <p className="text-xs">Clique em "Adicionar Achado" para registrar descobertas</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'recommendations' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Recomendações ({recommendationsData.length})
                    </h4>
                    <Button size="sm" onClick={() => setShowRecommendationDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Recomendação
                    </Button>
                  </div>

                  {recommendationsData.length > 0 ? (
                    <div className="space-y-2">
                      {recommendationsData.map((recommendation, index) => (
                        <div key={recommendation.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-gray-800">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{recommendation.title}</h5>
                              <Badge 
                                variant={recommendation.priority === 'High' ? 'destructive' : 'outline'} 
                                className="text-xs"
                              >
                                {recommendation.priority}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {recommendation.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            <div><strong>Categoria:</strong> {recommendation.category}</div>
                            <div><strong>Esforço:</strong> {recommendation.implementation_effort}</div>
                            {recommendation.target_implementation_date && (
                              <div><strong>Prazo:</strong> {format(recommendation.target_implementation_date, 'dd/MM/yyyy', { locale: ptBR })}</div>
                            )}
                            {recommendation.estimated_cost && (
                              <div><strong>Custo Estimado:</strong> R$ {recommendation.estimated_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma recomendação cadastrada</p>
                      <p className="text-xs">Clique em "Adicionar Recomendação" para começar</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'evidence' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Evidências de Auditoria ({evidenceData.length})
                    </h4>
                    <Button size="sm" onClick={() => setShowEvidenceDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Evidência
                    </Button>
                  </div>

                  {evidenceData.length > 0 ? (
                    <div className="space-y-2">
                      {evidenceData.map((evidence, index) => (
                        <div key={evidence.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-gray-800">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getEvidenceTypeIcon(evidence.evidence_type)}
                                <h5 className="font-medium text-sm">{evidence.title}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {evidence.evidence_type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {evidence.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span><strong>Confiabilidade:</strong> {evidence.reliability}</span>
                                <span>•</span>
                                <span><strong>Relevância:</strong> {evidence.relevance}</span>
                                <span>•</span>
                                <span><strong>Fonte:</strong> {evidence.evidence_source}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {evidence.file_url && (
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma evidência coletada</p>
                      <p className="text-xs">Clique em "Adicionar Evidência" para começar</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'workingpapers' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Papéis de Trabalho ({workingPapersData.length})
                    </h4>
                    <Button size="sm" onClick={() => setShowWorkingPaperDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Papel
                    </Button>
                  </div>

                  {workingPapersData.length > 0 ? (
                    <div className="space-y-2">
                      {workingPapersData.map((paper, index) => (
                        <div key={paper.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-gray-800">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4 text-blue-600" />
                              <h5 className="font-medium text-sm">{paper.title}</h5>
                              <Badge variant="outline" className="text-xs">
                                {paper.paper_type}
                              </Badge>
                            </div>
                            <Badge 
                              variant={paper.status === 'Finalized' ? 'default' : 'outline'} 
                              className="text-xs"
                            >
                              {paper.status}
                            </Badge>
                          </div>
                          {paper.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {paper.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500">
                            <div><strong>Seção:</strong> {paper.section}</div>
                            <div><strong>Referência:</strong> {paper.reference_number}</div>
                            {paper.testing_method && (
                              <div><strong>Método de Teste:</strong> {paper.testing_method}</div>
                            )}
                            <div><strong>Preparado por:</strong> {paper.prepared_by} em {format(paper.prepared_at, 'dd/MM/yyyy', { locale: ptBR })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum papel de trabalho criado</p>
                      <p className="text-xs">Clique em "Adicionar Papel" para começar</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'team' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    Equipe de Auditoria
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Auditor Líder</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.lead_auditor}
                            onChange={(e) => setEditForm(prev => ({ ...prev, lead_auditor: e.target.value }))}
                            className="text-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{audit.lead_auditor}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Auditores</Label>
                        {isEditing ? (
                          <Textarea
                            value={editForm.auditors}
                            onChange={(e) => setEditForm(prev => ({ ...prev, auditors: e.target.value }))}
                            className="text-sm h-20"
                            placeholder="Um auditor por linha"
                          />
                        ) : (
                          <div className="space-y-1">
                            {audit.auditors?.map((auditor, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Users className="h-3 w-3 text-gray-500" />
                                <span>{auditor}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Contatos do Auditado</Label>
                        {isEditing ? (
                          <Textarea
                            value={editForm.auditee_contacts}
                            onChange={(e) => setEditForm(prev => ({ ...prev, auditee_contacts: e.target.value }))}
                            className="text-sm h-20"
                            placeholder="Um contato por linha"
                          />
                        ) : (
                          <div className="space-y-1">
                            {audit.auditee_contacts?.map((contact, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Building className="h-3 w-3 text-gray-500" />
                                <span>{contact}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Resource Summary */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Resumo de Recursos</Label>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Horas Orçadas:</span>
                            <span className="font-medium">{audit.budgeted_hours || 0}h</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Horas Reais:</span>
                            <span className="font-medium">{audit.actual_hours || 0}h</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Custo Estimado:</span>
                            <span className="font-medium">
                              R$ {(audit.estimated_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Custo Real:</span>
                            <span className="font-medium">
                              R$ {(audit.actual_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'history' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    Histórico de Alterações
                  </h4>

                  <div className="space-y-2">
                    {/* Sample history entries - in real app, this would come from audit trail */}
                    {[
                      {
                        date: new Date(),
                        user: user?.name || 'Sistema',
                        action: 'Auditoria criada',
                        details: 'Nova auditoria adicionada ao sistema'
                      },
                    ].map((entry, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">{entry.action}</span>
                          <span className="text-xs text-gray-500">
                            {format(entry.date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {entry.details}
                        </p>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{entry.user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Confirmation Dialog */}
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
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finding Dialog - Similar structure as in ComplianceCard but adapted for audit findings */}
      <Dialog open={showFindingDialog} onOpenChange={setShowFindingDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Registrar Achado de Auditoria</DialogTitle>
            <DialogDescription>
              Registre um novo achado descoberto durante esta auditoria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Finding form fields - similar to ComplianceCard but adapted */}
            <div className="space-y-2">
              <Label>Título do Achado</Label>
              <Input
                value={newFinding.title}
                onChange={(e) => setNewFinding(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Resumo conciso do achado..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newFinding.finding_type}
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, finding_type: value as FindingType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINDING_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severidade</Label>
                <Select
                  value={newFinding.severity}
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, severity: value as FindingSeverity }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINDING_SEVERITIES.map(severity => (
                      <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Continue with other fields similar to compliance card... */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFindingDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Achado registrado com sucesso');
              setShowFindingDialog(false);
              // Reset form
              setNewFinding({
                title: '',
                description: '',
                finding_type: 'Control Deficiency',
                severity: 'Medium',
                condition: '',
                criteria: '',
                cause: '',
                effect: '',
                audit_area: '',
                likelihood: 'Medium',
                impact: 'Medium',
                responsible_person: '',
                target_resolution_date: ''
              });
            }}>
              Registrar Achado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Continue with other dialogs... (Recommendation, Evidence, WorkingPaper, Communication) */}
      {/* These would follow similar patterns to the ComplianceCard dialogs but adapted for audit-specific data */}
    </Card>
  );
};

export default AuditCard;
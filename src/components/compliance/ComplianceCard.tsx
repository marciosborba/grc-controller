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
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
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
  FileText,
  Target,
  BarChart3,
  AlertCircle,
  Activity,
  BookOpen,
  Building,
  Users,
  History
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  ComplianceRequirement, 
  ComplianceStatus, 
  CompliancePriority,
  ComplianceFramework,
  ComplianceCategory,
  ComplianceEvidence,
  ComplianceFinding,
  EvidenceType,
  RemediationStatus
} from '@/types/compliance-management';
import { 
  COMPLIANCE_STATUSES, 
  COMPLIANCE_PRIORITIES, 
  COMPLIANCE_FRAMEWORKS,
  COMPLIANCE_CATEGORIES,
  EVIDENCE_TYPES,
  getStatusColor,
  getPriorityColor
} from '@/types/compliance-management';

interface ComplianceCardProps {
  requirement: ComplianceRequirement;
  onUpdate?: (requirementId: string, updates: any) => void;
  onDelete?: (requirementId: string) => void;
  onDuplicate?: (requirementId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
}

const ComplianceCard: React.FC<ComplianceCardProps> = ({
  requirement,
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
  const [activeSection, setActiveSection] = useState<'general' | 'evidence' | 'findings' | 'remediation' | 'history'>('general');
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showFindingDialog, setShowFindingDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    title: requirement.title,
    description: requirement.description,
    framework: requirement.framework,
    control_id: requirement.control_id,
    category: requirement.category,
    status: requirement.status,
    priority: requirement.priority,
    owner: requirement.owner,
    assignedTo: requirement.assignedTo || '',
    due_date: requirement.due_date ? format(requirement.due_date, 'yyyy-MM-dd') : '',
    target_maturity_level: requirement.target_maturity_level || 3,
    current_maturity_level: requirement.current_maturity_level || 1,
    compliance_score: requirement.compliance_score || 0,
    business_justification: requirement.business_justification || '',
    testing_procedures: requirement.testing_procedures || '',
    control_frequency: requirement.control_frequency || 'Annual',
    automated_control: requirement.automated_control || false,
    remediation_plan: requirement.remediation_plan || '',
    remediation_status: requirement.remediation_status || 'Open',
    remediation_due_date: requirement.remediation_due_date ? format(requirement.remediation_due_date, 'yyyy-MM-dd') : '',
    cost_of_compliance: requirement.cost_of_compliance || 0,
    risk_if_non_compliant: requirement.risk_if_non_compliant || ''
  });

  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    evidence_type: 'Document' as EvidenceType,
    file_url: '',
    valid_from: '',
    valid_until: ''
  });

  const [newFinding, setNewFinding] = useState({
    title: '',
    description: '',
    finding_type: 'Gap' as 'Gap' | 'Weakness' | 'Non-Compliance' | 'Best Practice' | 'Observation',
    severity: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational',
    current_state: '',
    expected_state: '',
    business_impact: '',
    remediation_plan: '',
    remediation_owner: '',
    remediation_due_date: ''
  });

  const [communication, setCommunication] = useState({
    type: 'Status Update' as 'Status Update' | 'Non-Compliance Alert' | 'Assessment Report' | 'Remediation Plan' | 'Executive Summary',
    recipient_name: '',
    recipient_email: '',
    subject: '',
    message: ''
  });

  // Sample data for demonstration - in real app, this would come from props or API
  const evidenceData: ComplianceEvidence[] = requirement.evidence || [];
  const findingsData: ComplianceFinding[] = [];

  const handleSave = useCallback(() => {
    if (onUpdate) {
      const updates = {
        ...editForm,
        due_date: editForm.due_date ? new Date(editForm.due_date) : null,
        remediation_due_date: editForm.remediation_due_date ? new Date(editForm.remediation_due_date) : null,
        updated_by: user?.id || '',
        updated_at: new Date()
      };
      onUpdate(requirement.id, updates);
      setIsEditing(false);
      toast.success('Requisito de conformidade atualizado com sucesso');
    }
  }, [editForm, requirement.id, onUpdate, user?.id]);

  const handleCancel = useCallback(() => {
    setEditForm({
      title: requirement.title,
      description: requirement.description,
      framework: requirement.framework,
      control_id: requirement.control_id,
      category: requirement.category,
      status: requirement.status,
      priority: requirement.priority,
      owner: requirement.owner,
      assignedTo: requirement.assignedTo || '',
      due_date: requirement.due_date ? format(requirement.due_date, 'yyyy-MM-dd') : '',
      target_maturity_level: requirement.target_maturity_level || 3,
      current_maturity_level: requirement.current_maturity_level || 1,
      compliance_score: requirement.compliance_score || 0,
      business_justification: requirement.business_justification || '',
      testing_procedures: requirement.testing_procedures || '',
      control_frequency: requirement.control_frequency || 'Annual',
      automated_control: requirement.automated_control || false,
      remediation_plan: requirement.remediation_plan || '',
      remediation_status: requirement.remediation_status || 'Open',
      remediation_due_date: requirement.remediation_due_date ? format(requirement.remediation_due_date, 'yyyy-MM-dd') : '',
      cost_of_compliance: requirement.cost_of_compliance || 0,
      risk_if_non_compliant: requirement.risk_if_non_compliant || ''
    });
    setIsEditing(false);
  }, [requirement]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(requirement.id);
      toast.success('Requisito de conformidade excluído com sucesso');
    }
    setShowDeleteDialog(false);
  }, [requirement.id, onDelete]);

  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate(requirement.id);
      toast.success('Requisito de conformidade duplicado com sucesso');
    }
  }, [requirement.id, onDuplicate]);

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'Compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Non-Compliant': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Partially Compliant': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'In Progress': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'Under Review': return <Eye className="h-4 w-4 text-purple-600" />;
      case 'Remediation Required': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFrameworkIcon = (framework: ComplianceFramework) => {
    switch (framework) {
      case 'ISO 27001':
      case 'ISO 27002': return <Shield className="h-4 w-4" />;
      case 'SOX': return <Building className="h-4 w-4" />;
      case 'LGPD':
      case 'GDPR': return <FileCheck className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    if (requirement.compliance_score !== undefined) {
      return requirement.compliance_score;
    }
    
    // Fallback calculation based on status
    switch (requirement.status) {
      case 'Compliant': return 100;
      case 'Partially Compliant': return 75;
      case 'In Progress': return 50;
      case 'Under Review': return 25;
      default: return 0;
    }
  };

  const isOverdue = requirement.due_date && new Date(requirement.due_date) < new Date();

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
                  {getFrameworkIcon(requirement.framework)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {requirement.title}
                    </h3>
                    {isOverdue && (
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {requirement.control_id}
                    </span>
                    <span>{requirement.framework}</span>
                    <span>•</span>
                    <span>{requirement.category}</span>
                  </div>
                </div>
              </div>

              {/* Center Section - Progress */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Conformidade</div>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateProgress()} className="w-16 h-2" />
                    <span className="text-xs font-medium">{calculateProgress()}%</span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    {getStatusIcon(requirement.status)}
                    <Badge className={cn("text-xs border", getStatusColor(requirement.status))}>
                      {requirement.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className={cn("text-xs font-medium", getPriorityColor(requirement.priority))}>
                      {requirement.priority}
                    </span>
                    {requirement.due_date && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className={cn(
                          "text-xs",
                          isOverdue ? "text-red-600 font-medium" : "text-gray-600 dark:text-gray-400"
                        )}>
                          {format(requirement.due_date, 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile badges */}
                <div className="flex sm:hidden flex-col gap-1">
                  <Badge className={cn("text-xs border", getStatusColor(requirement.status))}>
                    {requirement.status}
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
                onClick={() => setShowEvidenceDialog(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Evidência
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFindingDialog(true)}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Achado
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
                { id: 'general', label: 'Geral', icon: FileCheck },
                { id: 'evidence', label: 'Evidências', icon: Upload },
                { id: 'findings', label: 'Achados', icon: AlertTriangle },
                { id: 'remediation', label: 'Remediação', icon: Target },
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
                  {id === 'evidence' && evidenceData.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {evidenceData.length}
                    </Badge>
                  )}
                  {id === 'findings' && findingsData.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {findingsData.length}
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
                          {requirement.title}
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
                        <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                          {requirement.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Framework</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.framework}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, framework: value as ComplianceFramework }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPLIANCE_FRAMEWORKS.map(fw => (
                                <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            {requirement.framework}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">ID do Controle</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.control_id}
                            onChange={(e) => setEditForm(prev => ({ ...prev, control_id: e.target.value }))}
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            {requirement.control_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Priority */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 border-b pb-1">
                      Status e Avaliação
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Status</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.status}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as ComplianceStatus }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPLIANCE_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getStatusIcon(requirement.status)}
                            <Badge className={cn("text-xs border", getStatusColor(requirement.status))}>
                              {requirement.status}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Prioridade</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.priority}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value as CompliancePriority }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPLIANCE_PRIORITIES.map(priority => (
                                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className={cn("text-sm font-medium", getPriorityColor(requirement.priority))}>
                            {requirement.priority}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Maturity Levels */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Maturidade Atual</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.current_maturity_level.toString()}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, current_maturity_level: parseInt(value) }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(level => (
                                <SelectItem key={level} value={level.toString()}>
                                  Nível {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            Nível {requirement.current_maturity_level || 1}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Meta de Maturidade</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.target_maturity_level.toString()}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, target_maturity_level: parseInt(value) }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(level => (
                                <SelectItem key={level} value={level.toString()}>
                                  Nível {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            Nível {requirement.target_maturity_level || 3}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Compliance Score */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Score de Conformidade</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={requirement.compliance_score || 0} className="flex-1" />
                        <span className="text-sm font-medium">{requirement.compliance_score || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional fields for editing */}
                  {isEditing && (
                    <>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 border-b pb-1">
                          Responsabilidade e Prazos
                        </h4>

                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Proprietário</Label>
                          <Input
                            value={editForm.owner}
                            onChange={(e) => setEditForm(prev => ({ ...prev, owner: e.target.value }))}
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Responsável</Label>
                          <Input
                            value={editForm.assignedTo}
                            onChange={(e) => setEditForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Data de Vencimento</Label>
                          <Input
                            type="date"
                            value={editForm.due_date}
                            onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 border-b pb-1">
                          Controles e Testes
                        </h4>

                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Frequência do Controle</Label>
                          <Select
                            value={editForm.control_frequency}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, control_frequency: value }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Continuous">Contínuo</SelectItem>
                              <SelectItem value="Daily">Diário</SelectItem>
                              <SelectItem value="Weekly">Semanal</SelectItem>
                              <SelectItem value="Monthly">Mensal</SelectItem>
                              <SelectItem value="Quarterly">Trimestral</SelectItem>
                              <SelectItem value="Semi-Annual">Semestral</SelectItem>
                              <SelectItem value="Annual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Procedimentos de Teste</Label>
                          <Textarea
                            value={editForm.testing_procedures}
                            onChange={(e) => setEditForm(prev => ({ ...prev, testing_procedures: e.target.value }))}
                            className="text-sm h-16"
                            placeholder="Descreva como este controle deve ser testado..."
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="automated_control"
                            checked={editForm.automated_control}
                            onChange={(e) => setEditForm(prev => ({ ...prev, automated_control: e.target.checked }))}
                          />
                          <Label htmlFor="automated_control" className="text-xs text-gray-600 dark:text-gray-400">
                            Controle Automatizado
                          </Label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeSection === 'evidence' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Evidências de Conformidade ({evidenceData.length})
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
                              <h5 className="font-medium text-sm">{evidence.title}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {evidence.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {evidence.evidence_type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Coletado em {format(evidence.collected_at, 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                                {evidence.valid_until && (
                                  <span className={cn(
                                    "text-xs",
                                    new Date(evidence.valid_until) < new Date() 
                                      ? "text-red-600" 
                                      : "text-gray-500"
                                  )}>
                                    Válido até {format(evidence.valid_until, 'dd/MM/yyyy', { locale: ptBR })}
                                  </span>
                                )}
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
                      <p className="text-sm">Nenhuma evidência cadastrada</p>
                      <p className="text-xs">Clique em "Adicionar Evidência" para começar</p>
                    </div>
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
                        <div key={finding.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{finding.title}</h5>
                              <Badge 
                                variant={finding.severity === 'Critical' ? 'destructive' : 'outline'} 
                                className="text-xs"
                              >
                                {finding.severity}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {finding.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {finding.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            <div><strong>Estado Atual:</strong> {finding.current_state}</div>
                            <div><strong>Estado Esperado:</strong> {finding.expected_state}</div>
                            {finding.remediation_due_date && (
                              <div><strong>Remediação até:</strong> {format(finding.remediation_due_date, 'dd/MM/yyyy', { locale: ptBR })}</div>
                            )}
                          </div>
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

              {activeSection === 'remediation' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    Plano de Remediação
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Status da Remediação</Label>
                        {isEditing ? (
                          <Select
                            value={editForm.remediation_status}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, remediation_status: value as RemediationStatus }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Aberto</SelectItem>
                              <SelectItem value="In Progress">Em Progresso</SelectItem>
                              <SelectItem value="Completed">Concluído</SelectItem>
                              <SelectItem value="Verified">Verificado</SelectItem>
                              <SelectItem value="Closed">Fechado</SelectItem>
                              <SelectItem value="Overdue">Atrasado</SelectItem>
                              <SelectItem value="On Hold">Em Espera</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {requirement.remediation_status || 'Não definido'}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Data de Vencimento</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editForm.remediation_due_date}
                            onChange={(e) => setEditForm(prev => ({ ...prev, remediation_due_date: e.target.value }))}
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            {requirement.remediation_due_date 
                              ? format(requirement.remediation_due_date, 'dd/MM/yyyy', { locale: ptBR })
                              : 'Não definida'
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Custo de Conformidade</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.cost_of_compliance}
                            onChange={(e) => setEditForm(prev => ({ ...prev, cost_of_compliance: parseFloat(e.target.value) || 0 }))}
                            className="text-sm"
                            placeholder="0.00"
                          />
                        ) : (
                          <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            {requirement.cost_of_compliance 
                              ? `R$ ${requirement.cost_of_compliance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : 'Não informado'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Plano de Ação</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.remediation_plan}
                        onChange={(e) => setEditForm(prev => ({ ...prev, remediation_plan: e.target.value }))}
                        className="text-sm h-24"
                        placeholder="Descreva as ações necessárias para alcançar a conformidade..."
                      />
                    ) : (
                      <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border min-h-[60px]">
                        {requirement.remediation_plan || 'Nenhum plano de remediação definido'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Risco se Não Conforme</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.risk_if_non_compliant}
                        onChange={(e) => setEditForm(prev => ({ ...prev, risk_if_non_compliant: e.target.value }))}
                        className="text-sm h-20"
                        placeholder="Descreva os riscos associados à não conformidade..."
                      />
                    ) : (
                      <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                        {requirement.risk_if_non_compliant || 'Riscos não documentados'}
                      </p>
                    )}
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
                        action: 'Requisito criado',
                        details: 'Novo requisito de conformidade adicionado ao sistema'
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
              Tem certeza que deseja excluir este requisito de conformidade? Esta ação não pode ser desfeita.
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

      {/* Evidence Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Evidência</DialogTitle>
            <DialogDescription>
              Adicione uma nova evidência de conformidade para este requisito.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Título da Evidência</Label>
              <Input
                value={newEvidence.title}
                onChange={(e) => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Certificado ISO 27001, Relatório de Auditoria..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Evidência</Label>
              <Select
                value={newEvidence.evidence_type}
                onValueChange={(value) => setNewEvidence(prev => ({ ...prev, evidence_type: value as EvidenceType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={newEvidence.description}
                onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva brevemente esta evidência..."
                className="h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Válido de</Label>
                <Input
                  type="date"
                  value={newEvidence.valid_from}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, valid_from: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Válido até</Label>
                <Input
                  type="date"
                  value={newEvidence.valid_until}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL do Arquivo (opcional)</Label>
              <Input
                type="url"
                value={newEvidence.file_url}
                onChange={(e) => setNewEvidence(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvidenceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Evidência adicionada com sucesso');
              setShowEvidenceDialog(false);
              setNewEvidence({
                title: '',
                description: '',
                evidence_type: 'Document',
                file_url: '',
                valid_from: '',
                valid_until: ''
              });
            }}>
              Adicionar Evidência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finding Dialog */}
      <Dialog open={showFindingDialog} onOpenChange={setShowFindingDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Registrar Achado</DialogTitle>
            <DialogDescription>
              Registre um novo achado de auditoria relacionado a este requisito de conformidade.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, finding_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gap">Gap/Lacuna</SelectItem>
                    <SelectItem value="Weakness">Fraqueza</SelectItem>
                    <SelectItem value="Non-Compliance">Não Conformidade</SelectItem>
                    <SelectItem value="Best Practice">Boa Prática</SelectItem>
                    <SelectItem value="Observation">Observação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severidade</Label>
                <Select
                  value={newFinding.severity}
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, severity: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Crítica</SelectItem>
                    <SelectItem value="High">Alta</SelectItem>
                    <SelectItem value="Medium">Média</SelectItem>
                    <SelectItem value="Low">Baixa</SelectItem>
                    <SelectItem value="Informational">Informativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={newFinding.description}
                onChange={(e) => setNewFinding(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição detalhada do achado..."
                className="h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado Atual</Label>
                <Textarea
                  value={newFinding.current_state}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, current_state: e.target.value }))}
                  placeholder="Como está atualmente..."
                  className="h-16"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado Esperado</Label>
                <Textarea
                  value={newFinding.expected_state}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, expected_state: e.target.value }))}
                  placeholder="Como deveria estar..."
                  className="h-16"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Impacto no Negócio</Label>
              <Textarea
                value={newFinding.business_impact}
                onChange={(e) => setNewFinding(prev => ({ ...prev, business_impact: e.target.value }))}
                placeholder="Qual o impacto deste achado para o negócio..."
                className="h-16"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsável pela Remediação</Label>
                <Input
                  value={newFinding.remediation_owner}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, remediation_owner: e.target.value }))}
                  placeholder="Nome do responsável..."
                />
              </div>

              <div className="space-y-2">
                <Label>Data Limite para Remediação</Label>
                <Input
                  type="date"
                  value={newFinding.remediation_due_date}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, remediation_due_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plano de Remediação</Label>
              <Textarea
                value={newFinding.remediation_plan}
                onChange={(e) => setNewFinding(prev => ({ ...prev, remediation_plan: e.target.value }))}
                placeholder="Ações planejadas para resolver este achado..."
                className="h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFindingDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Achado registrado com sucesso');
              setShowFindingDialog(false);
              setNewFinding({
                title: '',
                description: '',
                finding_type: 'Gap',
                severity: 'Medium',
                current_state: '',
                expected_state: '',
                business_impact: '',
                remediation_plan: '',
                remediation_owner: '',
                remediation_due_date: ''
              });
            }}>
              Registrar Achado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comunicar Status</DialogTitle>
            <DialogDescription>
              Envie uma comunicação sobre este requisito de conformidade.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Comunicação</Label>
              <Select
                value={communication.type}
                onValueChange={(value) => setCommunication(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Status Update">Atualização de Status</SelectItem>
                  <SelectItem value="Non-Compliance Alert">Alerta de Não Conformidade</SelectItem>
                  <SelectItem value="Assessment Report">Relatório de Avaliação</SelectItem>
                  <SelectItem value="Remediation Plan">Plano de Remediação</SelectItem>
                  <SelectItem value="Executive Summary">Resumo Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Destinatário</Label>
                <Input
                  value={communication.recipient_name}
                  onChange={(e) => setCommunication(prev => ({ ...prev, recipient_name: e.target.value }))}
                  placeholder="Nome completo..."
                />
              </div>

              <div className="space-y-2">
                <Label>Email do Destinatário</Label>
                <Input
                  type="email"
                  value={communication.recipient_email}
                  onChange={(e) => setCommunication(prev => ({ ...prev, recipient_email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={communication.subject}
                onChange={(e) => setCommunication(prev => ({ ...prev, subject: e.target.value }))}
                placeholder={`${communication.type} - ${requirement.title}`}
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={communication.message}
                onChange={(e) => setCommunication(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Digite sua mensagem..."
                className="h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommunicationDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Comunicação enviada com sucesso');
              setShowCommunicationDialog(false);
              setCommunication({
                type: 'Status Update',
                recipient_name: '',
                recipient_email: '',
                subject: '',
                message: ''
              });
            }}>
              <Send className="h-4 w-4 mr-1" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ComplianceCard;
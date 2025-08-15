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
  Shield,
  FileText,
  Upload,
  Target,
  Mail,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  ComplianceAssessment, 
  ComplianceStatus, 
  ComplianceFramework,
  CompliancePriority
} from '@/types/compliance-management';

// Tipo estendido para compatibilidade
type ExtendedComplianceAssessment = ComplianceAssessment & {
  compliance_framework?: ComplianceFramework;
  overall_maturity_level?: number;
  business_owner?: string;
  planned_completion_date?: Date;
};

interface ComplianceCardProps {
  compliance: ExtendedComplianceAssessment;
  onUpdate?: (complianceId: string, updates: any) => void;
  onDelete?: (complianceId: string) => void;
  canEdit?: boolean;
}

const ComplianceCard: React.FC<ComplianceCardProps> = ({
  compliance,
  onUpdate,
  onDelete,
  canEdit = true
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'evidence' | 'findings' | 'remediation' | 'communication'>('general');
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Verificação de segurança para evitar erros quando compliance é undefined
  if (!compliance) {
    return (
      <Card className="rounded-lg border text-card-foreground w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro: Dados de compliance não encontrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form states
  const [generalData, setGeneralData] = useState({
    title: compliance.title || '',
    description: compliance.description || '',
    framework: compliance.framework || compliance.compliance_framework || 'ISO 27001',
    status: compliance.status || 'Planning',
    priority: 'Medium' as CompliancePriority, // ComplianceAssessment não tem priority
    maturityLevel: compliance.overall_maturity_level || 1,
    assessor: compliance.lead_assessor || '',
    owner: compliance.business_owner || '',
    dueDate: compliance.planned_end_date ? format(compliance.planned_end_date, 'yyyy-MM-dd') : '',
    scope: compliance.scope_description || ''
  });

  const [evidenceData, setEvidenceData] = useState({
    evidenceTitle: '',
    evidenceDescription: '',
    evidenceType: 'document' as 'document' | 'screenshot' | 'report' | 'test_result',
    fileUrl: ''
  });

  const [findingData, setFindingData] = useState({
    findingTitle: '',
    findingDescription: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    recommendation: ''
  });

  const [communicationData, setCommunicationData] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  const handleSaveGeneral = useCallback(() => {
    if (onUpdate) {
      const updates = {
        title: generalData.title,
        description: generalData.description,
        compliance_framework: generalData.framework,
        status: generalData.status,
        priority: generalData.priority,
        overall_maturity_level: generalData.maturityLevel,
        lead_assessor: generalData.assessor,
        business_owner: generalData.owner,
        planned_completion_date: generalData.dueDate ? new Date(generalData.dueDate) : null,
        scope_description: generalData.scope,
        updated_by: user?.id,
        updated_at: new Date()
      };
      onUpdate(compliance.id, updates);
      setIsEditingGeneral(false);
      toast.success('Compliance atualizado com sucesso');
    }
  }, [generalData, compliance.id, onUpdate, user?.id]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(compliance.id);
      toast.success('Compliance excluído com sucesso');
    }
    setShowDeleteDialog(false);
  }, [compliance.id, onDelete]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Review': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Planning': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'border-green-300 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900 dark:text-green-200';
      case 'In Progress': return 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-200';
      case 'Review': return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Cancelled': return 'border-red-300 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900 dark:text-red-200';
      case 'Planning': return 'border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200';
      default: return 'border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: CompliancePriority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 dark:text-red-400';
      case 'High': return 'text-orange-600 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className={cn(
      "rounded-lg border text-card-foreground w-full transition-all duration-300 overflow-hidden cursor-pointer",
      isExpanded 
        ? "shadow-lg border-primary/30" 
        : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-border"
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
                
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {compliance.title || 'Título não definido'}
                    </h3>
                    {compliance.status === 'Cancelled' && (
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{compliance.framework || compliance.compliance_framework || 'Framework não definido'}</span>
                    <span>•</span>
                    <span className="truncate">Progresso: {compliance.progress_percentage || 0}%</span>
                    {compliance.lead_assessor && (
                      <>
                        <span>•</span>
                        <span className="truncate">Assessor: {compliance.lead_assessor}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Progress */}
              <div className="flex items-center gap-2">
                <Progress value={compliance.progress_percentage || 0} className="w-16" />
                <span className="text-xs font-medium">{compliance.progress_percentage || 0}%</span>
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(compliance.status || 'Planning')}
                  <Badge className={cn("text-xs", getStatusColor(compliance.status || 'Planning'))}>
                    {compliance.status || 'Planning'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className={cn("font-medium", getPriorityColor('Medium'))}>
                    {compliance.status || 'Planning'}
                  </span>
                  {compliance.planned_end_date && (
                    <>
                      <span className="mx-1">•</span>
                      <span>
                        {format(compliance.planned_end_date, "dd/MM/yyyy", { locale: ptBR })}
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
                  <Shield className="h-4 w-4" />
                  Informações Gerais
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
                  onClick={() => setActiveSection('findings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'findings' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Achados
                </button>
                
                <button
                  onClick={() => setActiveSection('remediation')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === 'remediation' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Remediação
                </button>
                
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
                        <Label htmlFor="title">Título da Avaliação</Label>
                        <Input
                          id="title"
                          value={generalData.title}
                          onChange={(e) => setGeneralData({ ...generalData, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="framework">Framework</Label>
                        <Select
                          value={generalData.framework}
                          onValueChange={(value) => setGeneralData({ ...generalData, framework: value as ComplianceFramework })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                            <SelectItem value="LGPD">LGPD</SelectItem>
                            <SelectItem value="SOX">SOX</SelectItem>
                            <SelectItem value="NIST">NIST</SelectItem>
                            <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={generalData.status}
                          onValueChange={(value) => setGeneralData({ ...generalData, status: value as ComplianceStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Compliant">Compliant</SelectItem>
                            <SelectItem value="Partially Compliant">Partially Compliant</SelectItem>
                            <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                            <SelectItem value="Not Assessed">Not Assessed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select
                          value={generalData.priority}
                          onValueChange={(value) => setGeneralData({ ...generalData, priority: value as CompliancePriority })}
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
                        <Label htmlFor="maturityLevel">Nível de Maturidade (1-5)</Label>
                        <Input
                          id="maturityLevel"
                          type="number"
                          min={1}
                          max={5}
                          value={generalData.maturityLevel}
                          onChange={(e) => setGeneralData({ ...generalData, maturityLevel: parseInt(e.target.value) || 1 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="assessor">Assessor</Label>
                        <Input
                          id="assessor"
                          value={generalData.assessor}
                          onChange={(e) => setGeneralData({ ...generalData, assessor: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="owner">Proprietário do Negócio</Label>
                        <Input
                          id="owner"
                          value={generalData.owner}
                          onChange={(e) => setGeneralData({ ...generalData, owner: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="dueDate">Data de Conclusão</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={generalData.dueDate}
                          onChange={(e) => setGeneralData({ ...generalData, dueDate: e.target.value })}
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

                      <div className="col-span-2">
                        <Label htmlFor="scope">Escopo</Label>
                        <Textarea
                          id="scope"
                          value={generalData.scope}
                          onChange={(e) => setGeneralData({ ...generalData, scope: e.target.value })}
                          rows={2}
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
                          <p className="text-sm font-medium">{compliance.title || 'Título não definido'}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Framework</Label>
                          <p className="text-sm">{compliance.compliance_framework || 'Framework não definido'}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(compliance.status || 'Not Assessed')}
                            <Badge className={cn("text-xs", getStatusColor(compliance.status || 'Not Assessed'))}>
                              {compliance.status || 'Not Assessed'}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Nível de Maturidade</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={(compliance.overall_maturity_level || 1) * 20} className="flex-1" />
                            <span className="text-sm font-medium">{compliance.overall_maturity_level || 1}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Prioridade</Label>
                          <p className={cn("text-sm font-medium", getPriorityColor(compliance.priority || 'Medium'))}>
                            {compliance.priority || 'Medium'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Assessor</Label>
                          <p className="text-sm">{compliance.lead_assessor || 'Não definido'}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Proprietário</Label>
                          <p className="text-sm">{compliance.business_owner || 'Não definido'}</p>
                        </div>

                        {compliance.planned_completion_date && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Data de Conclusão</Label>
                            <p className="text-sm">
                              {format(compliance.planned_completion_date, "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        )}
                      </div>

                      {compliance.description && (
                        <div className="col-span-2">
                          <Label className="text-xs text-muted-foreground">Descrição</Label>
                          <p className="text-sm mt-1">{compliance.description}</p>
                        </div>
                      )}

                      {compliance.scope_description && (
                        <div className="col-span-2">
                          <Label className="text-xs text-muted-foreground">Escopo</Label>
                          <p className="text-sm mt-1">{compliance.scope_description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Other sections would be implemented similarly */}
              {activeSection === 'evidence' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">EVIDÊNCIAS</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma evidência carregada</p>
                    <p className="text-xs">Clique para adicionar evidências</p>
                  </div>
                </div>
              )}

              {activeSection === 'findings' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">ACHADOS</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum achado registrado</p>
                    <p className="text-xs">Clique para adicionar achados</p>
                  </div>
                </div>
              )}

              {activeSection === 'remediation' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">REMEDIAÇÃO</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum plano de remediação definido</p>
                    <p className="text-xs">Clique para definir ações de remediação</p>
                  </div>
                </div>
              )}

              {activeSection === 'communication' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-muted-foreground">COMUNICAÇÃO</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma comunicação registrada</p>
                    <p className="text-xs">Clique para enviar comunicações</p>
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
              Tem certeza que deseja excluir esta avaliação de compliance? Esta ação não pode ser desfeita.
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

export default ComplianceCard;
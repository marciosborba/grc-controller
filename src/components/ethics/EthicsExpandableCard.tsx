import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InvestigationPlanManager from './investigation/InvestigationPlanManager';
import EvidenceManager from './evidence/EvidenceManager';
import CorrectiveActionManager from './corrective-actions/CorrectiveActionManager';
import RegulatoryNotificationManager from './regulatory/RegulatoryNotificationManager';
import { EthicsClassificationEngine, type CaseData } from '@/utils/ethicsClassification';
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  UserX, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Eye,
  Edit,
  Save,
  X,
  Calendar,
  Mail,
  Phone,
  Building,
  Shield,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Info,
  Database,
  Lock,
  Search,
  Target,
  Bell,
  TrendingUp,
  Activity
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface EthicsReport {
  id: string;
  protocol_number: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  priority: string;
  reporter_type: string;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  is_anonymous: boolean;
  assigned_to: string | null;
  resolution: string | null;
  investigation_summary: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  days_since_created: number;
  days_until_due: number | null;
  is_sla_breach: boolean;
  category?: string;
  business_unit_affected?: string;
  // Enhanced classification fields
  risk_score?: number;
  compliance_impact?: string;
  regulatory_risk?: string;
  reputational_risk?: string;
  litigation_risk?: string;
  financial_impact_estimate?: number;
  geographic_scope?: string;
  stakeholders_affected?: string[];
  media_attention_risk?: string;
  // Legal privilege fields
  legal_privilege_claimed?: boolean;
  legal_privilege_reason?: string;
  attorney_client_privileged?: boolean;
  work_product_privileged?: boolean;
  external_counsel_id?: string;
  legal_review_required?: boolean;
  legal_review_completed_at?: string;
  legal_reviewer_id?: string;
  // Metadata fields
  reporter_ip_address?: string | null;
  reporter_user_agent?: string | null;
  reporter_location?: string | null;
  reporter_device_info?: string | null;
  submission_source?: string | null;
  submission_timestamp?: string | null;
  reporter_department?: string | null;
  reporter_position?: string | null;
  reporter_employee_id?: string | null;
  reporter_relationship_to_subject?: string | null;
  investigation_notes?: string | null;
  confidentiality_level?: string | null;
  risk_assessment?: string | null;
  follow_up_required?: boolean | null;
  investigator_assigned_id?: string | null;
  metadata_collected_at?: string | null;
}

interface EthicsExpandableCardProps {
  report: EthicsReport;
  onUpdate: () => void;
}

const EthicsExpandableCard: React.FC<EthicsExpandableCardProps> = ({ report, onUpdate }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [classification, setClassification] = useState<any>(null);
  const [editData, setEditData] = useState({
    status: report.status,
    severity: report.severity,
    priority: report.priority || 'medium',
    assigned_to: report.assigned_to || '',
    investigation_summary: report.investigation_summary || '',
    resolution: report.resolution || ''
  });

  // Auto-classify case when expanded
  useEffect(() => {
    if (isExpanded && !classification) {
      const caseData: CaseData = {
        title: report.title,
        description: report.description,
        category: report.category || 'other',
        severity: report.severity,
        reporter_type: report.reporter_type,
        is_anonymous: report.is_anonymous,
        business_unit_affected: report.business_unit_affected,
        financial_exposure: report.financial_impact_estimate
      };
      
      const classificationResult = EthicsClassificationEngine.classifyCase(caseData);
      setClassification(classificationResult);
      
      // Update database with classification if significantly different
      updateClassificationIfNeeded(classificationResult);
    }
  }, [isExpanded, report]);

  const updateClassificationIfNeeded = async (classificationResult: any) => {
    try {
      const updates: any = {};
      
      if (report.risk_score !== classificationResult.risk_score) {
        updates.risk_score = classificationResult.risk_score;
      }
      if (report.compliance_impact !== classificationResult.compliance_impact) {
        updates.compliance_impact = classificationResult.compliance_impact;
      }
      if (report.regulatory_risk !== classificationResult.regulatory_risk) {
        updates.regulatory_risk = classificationResult.regulatory_risk;
      }
      if (report.reputational_risk !== classificationResult.reputational_risk) {
        updates.reputational_risk = classificationResult.reputational_risk;
      }
      
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('ethics_reports')
          .update(updates)
          .eq('id', report.id);
          
        if (error) {
          console.error('Error updating classification:', error);
        }
      }
    } catch (error) {
      console.error('Error in classification update:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'open': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      'investigating': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      'in_review': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'resolved': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'closed': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'medium': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      'high': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
      'critical': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'open': <XCircle className="h-4 w-4" />,
      'investigating': <Eye className="h-4 w-4" />,
      'in_review': <FileText className="h-4 w-4" />,
      'resolved': <CheckCircle className="h-4 w-4" />,
      'closed': <CheckCircle className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />;
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('ethics_reports')
        .update({
          status: editData.status,
          severity: editData.severity,
          priority: editData.priority,
          assigned_to: editData.assigned_to || null,
          investigation_summary: editData.investigation_summary || null,
          resolution: editData.resolution || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', report.id);

      if (error) {
        console.error('Erro ao atualizar caso:', error);
        toast.error('Erro ao salvar alterações');
        return;
      }

      toast.success('Caso atualizado com sucesso');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao salvar');
    }
  };

  const handleCancel = () => {
    setEditData({
      status: report.status,
      severity: report.severity,
      priority: report.priority || 'medium',
      assigned_to: report.assigned_to || '',
      investigation_summary: report.investigation_summary || '',
      resolution: report.resolution || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {report.is_anonymous ? (
                <UserX className="h-4 w-4 text-gray-500" />
              ) : (
                <User className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                {report.is_anonymous ? 'Anônimo' : 'Identificado'}
              </span>
            </div>
            <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(report.status)}`}>
              {getStatusIcon(report.status)}
              <span className="ml-1">
                {report.status === 'open' ? 'Aberto' :
                 report.status === 'investigating' ? 'Investigando' :
                 report.status === 'in_review' ? 'Em Revisão' :
                 report.status === 'resolved' ? 'Resolvido' :
                 report.status === 'closed' ? 'Fechado' :
                 report.status.replace('_', ' ')}
              </span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Gerenciar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {report.protocol_number}
            </Badge>
            <Badge className={`text-xs px-2 py-0.5 ${getSeverityColor(report.severity)}`}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {report.severity === 'low' ? 'BAIXA' :
               report.severity === 'medium' ? 'MÉDIA' :
               report.severity === 'high' ? 'ALTA' :
               report.severity === 'critical' ? 'CRÍTICA' :
               report.severity.toUpperCase()}
            </Badge>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">{report.title}</CardTitle>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
            {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 group-hover:text-primary transition-colors duration-200" />
            {report.days_since_created} dias
          </div>
          {report.is_sla_breach && (
            <Badge variant="destructive" className="text-xs px-2 py-0.5">
              SLA Vencido
            </Badge>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="investigation">Investigação</TabsTrigger>
              <TabsTrigger value="evidence">Evidências</TabsTrigger>
              <TabsTrigger value="actions">Ações</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatório</TabsTrigger>
              <TabsTrigger value="resolution">Resolução</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {/* Classification Results */}
              {classification && (
                <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Análise Automática de Risco</h4>
                    <Badge className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      Score: {classification.risk_score}/100
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Compliance</div>
                      <Badge className={`text-xs px-2 py-0.5 ${
                        classification.compliance_impact === 'critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                        classification.compliance_impact === 'high' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                        classification.compliance_impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      }`}>
                        {classification.compliance_impact === 'critical' ? 'Crítico' :
                         classification.compliance_impact === 'high' ? 'Alto' :
                         classification.compliance_impact === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Regulatório</div>
                      <Badge className={`text-xs px-2 py-0.5 ${
                        classification.regulatory_risk === 'critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                        classification.regulatory_risk === 'high' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                        classification.regulatory_risk === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      }`}>
                        {classification.regulatory_risk === 'critical' ? 'Crítico' :
                         classification.regulatory_risk === 'high' ? 'Alto' :
                         classification.regulatory_risk === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Reputacional</div>
                      <Badge className={`text-xs px-2 py-0.5 ${
                        classification.reputational_risk === 'critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                        classification.reputational_risk === 'high' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                        classification.reputational_risk === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      }`}>
                        {classification.reputational_risk === 'critical' ? 'Crítico' :
                         classification.reputational_risk === 'high' ? 'Alto' :
                         classification.reputational_risk === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Prioridade</div>
                      <Badge className={`text-xs px-2 py-0.5 ${
                        classification.recommended_priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                        classification.recommended_priority === 'critical' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                        classification.recommended_priority === 'high' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      }`}>
                        {classification.recommended_priority === 'urgent' ? 'Urgente' :
                         classification.recommended_priority === 'critical' ? 'Crítica' :
                         classification.recommended_priority === 'high' ? 'Alta' :
                         classification.recommended_priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                  
                  {classification.regulatory_notifications_required.length > 0 && (
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      <Bell className="h-3 w-3 inline mr-1" />
                      Notificações recomendadas: {classification.regulatory_notifications_required.join(', ')}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {report.description || 'Sem descrição disponível'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Informações do Denunciante</Label>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 mt-1 space-y-2">
                      {report.is_anonymous ? (
                        <p className="text-gray-600 dark:text-gray-400 italic">Denúncia anônima</p>
                      ) : (
                        <>
                          {report.reporter_name && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{report.reporter_name}</span>
                            </div>
                          )}
                          {report.reporter_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{report.reporter_email}</span>
                            </div>
                          )}
                          {report.reporter_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{report.reporter_phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{report.reporter_type === 'internal' ? 'Interno' : 'Externo'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>


            <TabsContent value="investigation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  {isEditing ? (
                    <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="investigating">Investigando</SelectItem>
                        <SelectItem value="in_review">Em Revisão</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(report.status)}`}>
                        {report.status === 'open' ? 'ABERTO' :
                         report.status === 'investigating' ? 'INVESTIGANDO' :
                         report.status === 'in_review' ? 'EM REVISÃO' :
                         report.status === 'resolved' ? 'RESOLVIDO' :
                         report.status === 'closed' ? 'FECHADO' :
                         report.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Severidade</Label>
                  {isEditing ? (
                    <Select value={editData.severity} onValueChange={(value) => setEditData({...editData, severity: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={`text-xs px-2 py-0.5 ${getSeverityColor(report.severity)}`}>
                        {report.severity === 'low' ? 'BAIXA' :
                         report.severity === 'medium' ? 'MÉDIA' :
                         report.severity === 'high' ? 'ALTA' :
                         report.severity === 'critical' ? 'CRÍTICA' :
                         report.severity.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Prioridade</Label>
                  {isEditing ? (
                    <Select value={editData.priority} onValueChange={(value) => setEditData({...editData, priority: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 text-sm">
                      {report.priority === 'low' ? 'BAIXA' :
                       report.priority === 'medium' ? 'MÉDIA' :
                       report.priority === 'high' ? 'ALTA' :
                       report.priority === 'urgent' ? 'URGENTE' :
                       report.priority ? report.priority.toUpperCase() : 'MÉDIA'}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Responsável</Label>
                  {isEditing ? (
                    <Input
                      value={editData.assigned_to}
                      onChange={(e) => setEditData({...editData, assigned_to: e.target.value})}
                      placeholder="Nome do responsável"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 text-sm">
                      {report.assigned_to || 'Não atribuído'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Resumo da Investigação</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.investigation_summary}
                    onChange={(e) => setEditData({...editData, investigation_summary: e.target.value})}
                    placeholder="Descreva o progresso da investigação..."
                    rows={4}
                    className="mt-1"
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {report.investigation_summary || 'Nenhum resumo de investigação disponível'}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Investigation Plans Tab */}
            <TabsContent value="investigation" className="space-y-4">
              <InvestigationPlanManager 
                reportId={report.id} 
                onUpdate={() => onUpdate()} 
              />
            </TabsContent>

            {/* Evidence Management Tab */}
            <TabsContent value="evidence" className="space-y-4">
              <EvidenceManager 
                reportId={report.id} 
                onUpdate={() => onUpdate()} 
              />
            </TabsContent>

            {/* Corrective Actions Tab */}
            <TabsContent value="actions" className="space-y-4">
              <CorrectiveActionManager 
                reportId={report.id} 
                onUpdate={() => onUpdate()} 
              />
            </TabsContent>

            {/* Regulatory Notifications Tab */}
            <TabsContent value="regulatory" className="space-y-4">
              <RegulatoryNotificationManager 
                reportId={report.id} 
                onUpdate={() => onUpdate()} 
              />
            </TabsContent>

            <TabsContent value="resolution" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Resolução/Ação Tomada</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.resolution}
                    onChange={(e) => setEditData({...editData, resolution: e.target.value})}
                    placeholder="Descreva a resolução final do caso..."
                    rows={4}
                    className="mt-1"
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {report.resolution || 'Ainda não resolvido'}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="bg-blue-500 rounded-full p-1">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Caso Criado</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <div className="bg-yellow-500 rounded-full p-1">
                    <Eye className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Última Atualização</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {format(new Date(report.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>

                {report.status === 'resolved' && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <div className="bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Caso Resolvido</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Tempo de resolução: {report.days_since_created} dias
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-6">
                {/* Technical Metadata Section */}
                <div className="border dark:border-gray-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Informações Técnicas</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">IP Address:</span>
                          <p className="text-gray-600 dark:text-gray-400 font-mono">{report.reporter_ip_address || 'Não disponível'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Localização:</span>
                          <p className="text-gray-600 dark:text-gray-400">{report.reporter_location || 'Não disponível'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        {report.reporter_device_info?.includes('iPhone') || report.reporter_device_info?.includes('Mobile') ? (
                          <Smartphone className="h-4 w-4 text-gray-500 mt-0.5" />
                        ) : (
                          <Monitor className="h-4 w-4 text-gray-500 mt-0.5" />
                        )}
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Dispositivo:</span>
                          <p className="text-gray-600 dark:text-gray-400">{report.reporter_device_info || 'Não disponível'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Database className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Fonte:</span>
                          <p className="text-gray-600 dark:text-gray-400 capitalize">
                            {report.submission_source?.replace('_', ' ') || 'Não especificado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Timestamp Submissão:</span>
                          <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                            {report.submission_timestamp 
                              ? format(new Date(report.submission_timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
                              : 'Não disponível'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="w-full">
                        <span className="font-medium text-gray-700 dark:text-gray-300">User Agent:</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 break-all">
                          {report.reporter_user_agent || 'Não disponível'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investigation Metadata Section */}
                <div className="border dark:border-gray-700 rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-amber-600" />
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Metadados Investigativos</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      {!report.is_anonymous && (
                        <>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Departamento:</span>
                            <p className="text-gray-600 dark:text-gray-400">{report.reporter_department || 'Não informado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Cargo:</span>
                            <p className="text-gray-600 dark:text-gray-400">{report.reporter_position || 'Não informado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">ID Funcionário:</span>
                            <p className="text-gray-600 dark:text-gray-400 font-mono">{report.reporter_employee_id || 'Não informado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Relação com o Denunciado:</span>
                            <p className="text-gray-600 dark:text-gray-400">{report.reporter_relationship_to_subject || 'Não especificado'}</p>
                          </div>
                        </>
                      )}
                      {report.is_anonymous && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-3">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Denúncia Anônima</span>
                          </div>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Informações pessoais do denunciante não coletadas por questões de confidencialidade.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Nível de Confidencialidade:</span>
                        <div className="mt-1">
                          <Badge className={`text-xs px-2 py-0.5 ${
                            report.confidentiality_level === 'maximum' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                            report.confidentiality_level === 'high' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                            'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                          }`}>
                            <Lock className="h-3 w-3 mr-1" />
                            {report.confidentiality_level === 'maximum' ? 'MÁXIMO' :
                             report.confidentiality_level === 'high' ? 'ALTO' : 'PADRÃO'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Follow-up Necessário:</span>
                        <p className="text-gray-600 dark:text-gray-400">{report.follow_up_required ? '✅ Sim' : '❌ Não'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Metadados Coletados:</span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          {report.metadata_collected_at 
                            ? format(new Date(report.metadata_collected_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                            : 'Não disponível'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment Section */}
                {report.risk_assessment && (
                  <div className="border dark:border-gray-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-red-600" />
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Avaliação de Risco</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{report.risk_assessment}</p>
                  </div>
                )}

                {/* Investigation Notes Section */}
                {report.investigation_notes && (
                  <div className="border dark:border-gray-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notas Investigativas</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{report.investigation_notes}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {isEditing && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Salvar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default EthicsExpandableCard;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle,
  Clock,
  X,
  User,
  Users,
  FileText,
  Send,
  Eye,
  MessageSquare,
  AlertTriangle,
  Shield,
  Target,
  Calendar,
  Filter,
  Search,
  Plus,
  ArrowRight,
  ArrowDown,
  CheckSquare,
  XSquare,
  Pause,
  Play,
  RotateCcw,
  Brain,
  Zap,
  Star,
  Flag,
  Archive,
  Download,
  Upload,
  Lock,
  Unlock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Risk } from '@/types/risk-management';

interface ApprovalRequest {
  id: string;
  type: 'risk_creation' | 'risk_update' | 'action_plan' | 'risk_acceptance' | 'treatment_change' | 'budget_approval';
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: string;
  riskId: string;
  riskName: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'escalated';
  currentApprover: string;
  approvalChain: ApprovalStep[];
  documents: Document[];
  comments: Comment[];
  dueDate: string;
  businessJustification: string;
  impactAssessment: string;
  riskLevel: string;
  estimatedCost: number;
  alexRiskRecommendation?: string;
  complianceRequirements: string[];
  stakeholders: string[];
  category: string;
}

interface ApprovalStep {
  id: string;
  approver: string;
  role: string;
  order: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: string;
  comments?: string;
  conditions?: string[];
  delegatedTo?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'approval' | 'rejection' | 'question';
}

interface ApprovalWorkflowIntegratedProps {
  risks: Risk[];
  onApprove: (requestId: string) => void;
  onReject?: (requestId: string, reason: string) => void;
}

export const ApprovalWorkflowIntegrated: React.FC<ApprovalWorkflowIntegratedProps> = ({
  risks,
  onApprove,
  onReject
}) => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showMyApprovals, setShowMyApprovals] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadApprovalRequests();
  }, []);

  const loadApprovalRequests = async () => {
    setIsLoading(true);
    
    // Simular carregamento
    setTimeout(() => {
      const mockRequests: ApprovalRequest[] = [
        {
          id: 'approval-001',
          type: 'risk_creation',
          title: 'Aprovação de Novo Risco Crítico',
          description: 'Solicitação de aprovação para registro de risco crítico de segurança cibernética identificado por Alex Risk',
          requestedBy: 'João Silva',
          requestedAt: '2024-12-15T10:30:00Z',
          riskId: 'risk-001',
          riskName: 'Vulnerabilidade Crítica de Segurança',
          priority: 'high',
          status: 'pending',
          currentApprover: 'Diretor de TI',
          approvalChain: [
            {
              id: 'step-001',
              approver: 'Gerente de Segurança',
              role: 'Security Manager',
              order: 1,
              status: 'approved',
              approvedAt: '2024-12-15T11:00:00Z',
              comments: 'Risco validado e classificação confirmada'
            },
            {
              id: 'step-002',
              approver: 'Diretor de TI',
              role: 'IT Director',
              order: 2,
              status: 'pending'
            },
            {
              id: 'step-003',
              approver: 'CEO',
              role: 'Chief Executive Officer',
              order: 3,
              status: 'pending'
            }
          ],
          documents: [
            {
              id: 'doc-001',
              name: 'Relatório de Vulnerabilidade.pdf',
              type: 'application/pdf',
              size: 2048576,
              uploadedAt: '2024-12-15T10:30:00Z',
              uploadedBy: 'João Silva'
            }
          ],
          comments: [
            {
              id: 'comment-001',
              author: 'Alex Risk IA',
              content: 'Baseado na análise de dados, este risco tem 87% de probabilidade de ocorrência e impacto financeiro estimado em R$ 2.3M. Recomendo aprovação imediata.',
              timestamp: '2024-12-15T10:35:00Z',
              type: 'comment'
            },
            {
              id: 'comment-002',
              author: 'Gerente de Segurança',
              content: 'Aprovado. Vulnerabilidade confirmada através de testes de penetração.',
              timestamp: '2024-12-15T11:00:00Z',
              type: 'approval'
            }
          ],
          dueDate: '2024-12-17T23:59:59Z',
          businessJustification: 'Vulnerabilidade crítica que pode comprometer dados de clientes e operações',
          impactAssessment: 'Alto impacto financeiro e reputacional. Possível violação de dados.',
          riskLevel: 'Muito Alto',
          estimatedCost: 150000,
          alexRiskRecommendation: 'Aprovação imediata recomendada. Risco crítico com alta probabilidade.',
          complianceRequirements: ['LGPD', 'ISO 27001', 'SOX'],
          stakeholders: ['TI', 'Segurança', 'Compliance', 'Jurídico'],
          category: 'security'
        },
        {
          id: 'approval-002',
          type: 'action_plan',
          title: 'Aprovação de Plano de Ação - Continuidade',
          description: 'Solicitação de aprovação para implementação de plano de continuidade de negócios',
          requestedBy: 'Maria Santos',
          requestedAt: '2024-12-14T15:45:00Z',
          riskId: 'risk-002',
          riskName: 'Falha de Sistema Crítico',
          priority: 'high',
          status: 'approved',
          currentApprover: 'CEO',
          approvalChain: [
            {
              id: 'step-004',
              approver: 'Diretor de Operações',
              role: 'Operations Director',
              order: 1,
              status: 'approved',
              approvedAt: '2024-12-14T16:30:00Z',
              comments: 'Plano bem estruturado e necessário'
            },
            {
              id: 'step-005',
              approver: 'CEO',
              role: 'Chief Executive Officer',
              order: 2,
              status: 'approved',
              approvedAt: '2024-12-14T17:15:00Z',
              comments: 'Aprovado. Orçamento autorizado.'
            }
          ],
          documents: [],
          comments: [],
          dueDate: '2024-12-20T23:59:59Z',
          businessJustification: 'Garantir continuidade das operações críticas',
          impactAssessment: 'Redução significativa do risco operacional',
          riskLevel: 'Alto',
          estimatedCost: 200000,
          complianceRequirements: ['ISO 22301'],
          stakeholders: ['Operações', 'TI', 'Financeiro'],
          category: 'operational'
        },
        {
          id: 'approval-003',
          type: 'budget_approval',
          title: 'Aprovação de Orçamento - Conformidade LGPD',
          description: 'Solicitação de aprovação de orçamento adicional para adequação LGPD',
          requestedBy: 'Pedro Costa',
          requestedAt: '2024-12-13T09:15:00Z',
          riskId: 'risk-003',
          riskName: 'Não Conformidade LGPD',
          priority: 'medium',
          status: 'escalated',
          currentApprover: 'CFO',
          approvalChain: [
            {
              id: 'step-006',
              approver: 'Gerente Financeiro',
              role: 'Finance Manager',
              order: 1,
              status: 'rejected',
              approvedAt: '2024-12-13T14:00:00Z',
              comments: 'Orçamento excede limite aprovado. Necessária revisão.'
            },
            {
              id: 'step-007',
              approver: 'CFO',
              role: 'Chief Financial Officer',
              order: 2,
              status: 'pending'
            }
          ],
          documents: [],
          comments: [],
          dueDate: '2024-12-25T23:59:59Z',
          businessJustification: 'Evitar multas e sanções regulatórias',
          impactAssessment: 'Conformidade regulatória obrigatória',
          riskLevel: 'Alto',
          estimatedCost: 80000,
          complianceRequirements: ['LGPD'],
          stakeholders: ['Jurídico', 'TI', 'Compliance'],
          category: 'compliance'
        }
      ];
      
      setApprovalRequests(mockRequests);
      setIsLoading(false);
    }, 1000);
  };

  const filteredRequests = approvalRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.riskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.type === filterType;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    
    // Filtro "Minhas Aprovações" - simular usuário atual
    const isMyApproval = !showMyApprovals || request.currentApprover === 'Diretor de TI';
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority && isMyApproval;
  });

  const handleApprove = (requestId: string) => {
    setApprovalRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' as const } : req
    ));
    
    onApprove(requestId);
    
    toast({
      title: '✅ Aprovação Concedida',
      description: 'Solicitação aprovada com sucesso',
    });
  };

  const handleReject = (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: '❌ Motivo Obrigatório',
        description: 'Por favor, informe o motivo da rejeição',
        variant: 'destructive'
      });
      return;
    }
    
    setApprovalRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    ));
    
    onReject?.(requestId, rejectionReason);
    
    setShowRejectionDialog(false);
    setRejectionReason('');
    
    toast({
      title: '❌ Solicitação Rejeitada',
      description: 'Rejeição registrada com motivo',
    });
  };

  const handleAddComment = (requestId: string) => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'Usuário Atual',
      content: newComment,
      timestamp: new Date().toISOString(),
      type: 'comment'
    };
    
    setApprovalRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        comments: [...req.comments, comment] 
      } : req
    ));
    
    setNewComment('');
    
    toast({
      title: '💬 Comentário Adicionado',
      description: 'Comentário registrado na solicitação',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk_creation': return Plus;
      case 'risk_update': return FileText;
      case 'action_plan': return Target;
      case 'risk_acceptance': return CheckCircle;
      case 'treatment_change': return ArrowRight;
      case 'budget_approval': return Zap;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'risk_creation': return 'Criação de Risco';
      case 'risk_update': return 'Atualização de Risco';
      case 'action_plan': return 'Plano de Ação';
      case 'risk_acceptance': return 'Aceitação de Risco';
      case 'treatment_change': return 'Mudança de Tratamento';
      case 'budget_approval': return 'Aprovação de Orçamento';
      default: return type;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando workflow de aprovações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-purple-600" />
            <span>Workflow de Aprovações Digitais</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {approvalRequests.filter(r => r.status === 'pending').length} pendentes
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Gestão completa de aprovações com assinatura digital e trilha de auditoria
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Solicitações */}
        <div className="lg:col-span-2">
          {/* Controles */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={showMyApprovals ? "default" : "outline"}
                    onClick={() => setShowMyApprovals(!showMyApprovals)}
                    size="sm"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Minhas Aprovações
                  </Button>
                  
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {approvalRequests.filter(r => calculateDaysRemaining(r.dueDate) <= 2).length} urgentes
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    {approvalRequests.filter(r => r.alexRiskRecommendation).length} com recomendação IA
                  </Badge>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar aprovações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                  <option value="escalated">Escalado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="risk_creation">Criação de Risco</option>
                  <option value="action_plan">Plano de Ação</option>
                  <option value="budget_approval">Orçamento</option>
                  <option value="risk_acceptance">Aceitação</option>
                </select>
                
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">Todas as Prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Mais
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Lista */}
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const TypeIcon = getTypeIcon(request.type);
              const daysRemaining = calculateDaysRemaining(request.dueDate);
              
              return (
                <Card 
                  key={request.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                  } ${daysRemaining <= 1 ? 'border-red-200 bg-red-50' : ''}`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Ícone do tipo */}
                      <div className="p-2 rounded-lg bg-purple-100">
                        <TypeIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{request.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {request.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </Badge>
                            
                            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                              {request.status}
                            </Badge>
                            
                            {request.alexRiskRecommendation && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                <Brain className="h-3 w-3 mr-1" />
                                IA
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Metadados */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <span>Por: {request.requestedBy}</span>
                            <span className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              <span>{request.riskName}</span>
                            </span>
                            <span>{getTypeLabel(request.type)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {daysRemaining <= 1 && (
                              <Badge variant="destructive" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Urgente
                              </Badge>
                            )}
                            
                            <span>{formatDate(request.requestedAt)}</span>
                          </div>
                        </div>
                        
                        {/* Cadeia de Aprovação */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            {request.approvalChain.map((step, index) => (
                              <div key={step.id} className="flex items-center space-x-1">
                                <div className={`w-3 h-3 rounded-full ${
                                  step.status === 'approved' ? 'bg-green-500' :
                                  step.status === 'rejected' ? 'bg-red-500' :
                                  step.status === 'pending' && step.approver === request.currentApprover ? 'bg-yellow-500' :
                                  'bg-gray-300'
                                }`}></div>
                                <span className="text-xs">{step.approver}</span>
                                {index < request.approvalChain.length - 1 && (
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma aprovação encontrada</h3>
                  <p className="text-muted-foreground">
                    {showMyApprovals ? 'Você não tem aprovações pendentes' : 'Tente ajustar os filtros'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Painel de Detalhes */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="space-y-4">
              {/* Detalhes da Solicitação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedRequest.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações Básicas */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span>{getTypeLabel(selectedRequest.type)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risco:</span>
                      <span className="font-medium">{selectedRequest.riskName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Solicitante:</span>
                      <span>{selectedRequest.requestedBy}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prazo:</span>
                      <span>{formatDate(selectedRequest.dueDate)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">{formatCurrency(selectedRequest.estimatedCost)}</span>
                    </div>
                  </div>
                  
                  {/* Justificativa */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Justificativa</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.businessJustification}
                    </p>
                  </div>
                  
                  {/* Recomendação Alex Risk */}
                  {selectedRequest.alexRiskRecommendation && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-purple-600" />
                        Recomendação Alex Risk
                      </h4>
                      <p className="text-sm text-muted-foreground bg-purple-50 p-3 rounded-lg">
                        {selectedRequest.alexRiskRecommendation}
                      </p>
                    </div>
                  )}
                  
                  {/* Ações de Aprovação */}
                  {selectedRequest.status === 'pending' && selectedRequest.currentApprover === 'Diretor de TI' && (
                    <div className="border-t pt-4 space-y-2">
                      <Button 
                        onClick={() => handleApprove(selectedRequest.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      
                      <Button 
                        onClick={() => setShowRejectionDialog(true)}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XSquare className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Comentários */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Comentários ({selectedRequest.comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de Comentários */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedRequest.comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-gray-200 pl-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Novo Comentário */}
                  <div className="border-t pt-4">
                    <Textarea
                      placeholder="Adicionar comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={() => handleAddComment(selectedRequest.id)}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="mt-2"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Comentar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma Aprovação</h3>
                <p className="text-muted-foreground">
                  Clique em uma solicitação para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Dialog de Rejeição */}
      {showRejectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Rejeitar Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Por favor, informe o motivo da rejeição:
              </p>
              
              <Textarea
                placeholder="Motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => selectedRequest && handleReject(selectedRequest.id)}
                  disabled={!rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  Rejeitar
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setRejectionReason('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
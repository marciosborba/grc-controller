import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  FileText,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Eye,
  Edit,
  Send,
  Download,
  RefreshCw,
  Brain,
  Shield,
  Target,
  Activity,
  Bell,
  UserCheck,
  FileCheck,
  BarChart3,
  Zap,
  Globe,
  Printer,
  FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRiskAcceptancePrint } from '@/hooks/useRiskAcceptancePrint';

// Interfaces
interface RiskAcceptance {
  id: string;
  risk_id: string;
  riskCode?: string; // ID sequencial no formato 001082025
  risk_title: string;
  risk_description: string;
  risk_category: string;
  risk_level: string;
  risk_score: number;
  residual_risk_score: number;
  acceptance_reason: string;
  accepted_by: string;
  accepted_by_role: string;
  accepted_by_email: string;
  acceptance_date: string;
  review_schedule: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  next_review_date: string;
  status: 'active' | 'under_review' | 'expired' | 'renewed';
  monitoring_frequency: string;
  created_at: string;
  updated_at: string;
  communications: RiskCommunication[];
  approvals: RiskApproval[];
  monitoring_records: RiskMonitoring[];
}

interface RiskCommunication {
  id: string;
  acceptance_id: string;
  stakeholder_name: string;
  stakeholder_email: string;
  stakeholder_role: string;
  message_content: string;
  communication_type: 'notification' | 'request' | 'update' | 'reminder';
  sent_date: string;
  response_date?: string;
  response_content?: string;
  status: 'sent' | 'delivered' | 'read' | 'responded';
}

interface RiskApproval {
  id: string;
  acceptance_id: string;
  approver_name: string;
  approver_email: string;
  approver_role: string;
  approval_level: number;
  approval_status: 'pending' | 'approved' | 'rejected' | 'conditional';
  approval_date?: string;
  comments?: string;
  conditions?: string;
  digital_signature?: string;
}

interface RiskMonitoring {
  id: string;
  acceptance_id: string;
  review_date: string;
  reviewer_name: string;
  reviewer_email: string;
  current_risk_score: number;
  residual_risk_score: number;
  monitoring_notes: string;
  recommendations: string;
  next_review_date: string;
  status: 'completed' | 'in_progress' | 'overdue';
}

const RiskAcceptanceManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { printRiskAcceptancePDF, printRiskAcceptanceDOC, isGenerating } = useRiskAcceptancePrint();

  // Estados principais
  const [riskAcceptances, setRiskAcceptances] = useState<RiskAcceptance[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');

  // Estados para modais e ações
  const [selectedRisk, setSelectedRisk] = useState<RiskAcceptance | null>(null);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);

  // Estados para formulários
  const [communicationForm, setCommunicationForm] = useState({
    stakeholder_name: '',
    stakeholder_email: '',
    stakeholder_role: '',
    message_content: '',
    communication_type: 'notification' as const
  });

  const [approvalForm, setApprovalForm] = useState({
    approver_name: '',
    approver_email: '',
    approver_role: '',
    approval_level: 1,
    comments: '',
    conditions: ''
  });

  const [monitoringForm, setMonitoringForm] = useState({
    current_risk_score: 0,
    residual_risk_score: 0,
    monitoring_notes: '',
    recommendations: '',
    next_review_date: ''
  });

  useEffect(() => {
    loadRiskAcceptances();
  }, []);

  const loadRiskAcceptances = async () => {
    try {
      setLoading(true);
      
      // Buscar riscos com tratamento de aceitação
      const { data: risks, error: risksError } = await supabase
        .from('risk_registrations')
        .select(`
          id,
          risk_title,
          risk_description,
          risk_category,
          risk_level,
          risk_score,
          treatment_strategy,
          created_at,
          updated_at
        `)
        .eq('treatment_strategy', 'accept')
        .order('created_at', { ascending: false });

      if (risksError) throw risksError;

      if (!risks || risks.length === 0) {
        setRiskAcceptances([]);
        setLoading(false);
        return;
      }

        // Para cada risco, buscar dados de aceitação, comunicações, aprovações e monitoramento
        const acceptancesData: RiskAcceptance[] = [];

        for (const risk of risks) {
          // Gerar riskCode sequencial simulado no formato correto
          const riskIndex = risks.indexOf(risk) + 1;
          const currentDate = new Date();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const year = currentDate.getFullYear();
          const sequentialCode = `${String(riskIndex).padStart(3, '0')}${month}${year}`;
          
          // Buscar dados de aceitação (simulado por enquanto)
          const mockAcceptance: RiskAcceptance = {
            id: `acceptance-${risk.id}`,
            risk_id: risk.id,
            riskCode: risk.riskCode,
            risk_title: risk.risk_title,
            risk_description: risk.risk_description,
            risk_category: risk.risk_category,
            risk_level: risk.risk_level,
            risk_score: risk.risk_score,
            residual_risk_score: Math.round(risk.risk_score * 0.7), // 30% de redução
            acceptance_reason: "Custo de mitigação superior ao impacto potencial",
            accepted_by: "João Silva",
            accepted_by_role: "Diretor de TI",
            accepted_by_email: "joao.silva@empresa.com",
            acceptance_date: risk.created_at,
            review_schedule: "quarterly" as const,
            next_review_date: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            status: "active" as const,
            monitoring_frequency: "Mensal",
            created_at: risk.created_at,
            updated_at: risk.updated_at,
            
            // Dados para matriz de risco - estimados de forma mais realista
            probability_score: Math.min(4, Math.max(1, Math.ceil((risk.risk_score || 1) / 4))), // Estimar probabilidade (1-4)
            impact_score: Math.min(4, Math.max(1, Math.ceil((risk.risk_score || 1) / 4))), // Estimar impacto (1-4)
          communications: [
            {
              id: `comm-${risk.id}-1`,
              acceptance_id: `acceptance-${risk.id}`,
              stakeholder_name: 'Maria Santos',
              stakeholder_email: 'maria.santos@empresa.com',
              stakeholder_role: 'Gerente de Segurança',
              message_content: 'Risco aceito conforme análise de custo-benefício',
              communication_type: 'notification',
              sent_date: risk.created_at,
              status: 'delivered'
            }
          ],
          approvals: [
            {
              id: `approval-${risk.id}-1`,
              acceptance_id: `acceptance-${risk.id}`,
              approver_name: 'Carlos Mendes',
              approver_email: 'carlos.mendes@empresa.com',
              approver_role: 'CEO',
              approval_level: 1,
              approval_status: 'approved',
              approval_date: risk.created_at,
              comments: 'Aprovado com base na análise de impacto'
            }
          ],
          monitoring_records: [
            {
              id: `monitoring-${risk.id}-1`,
              acceptance_id: `acceptance-${risk.id}`,
              review_date: risk.created_at,
              reviewer_name: 'Ana Costa',
              reviewer_email: 'ana.costa@empresa.com',
              current_risk_score: risk.risk_score || 0,
              residual_risk_score: (risk.risk_score || 0) * 0.7,
              monitoring_notes: 'Risco mantém-se dentro dos parâmetros aceitáveis',
              recommendations: 'Continuar monitoramento mensal',
              next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'completed'
            }
          ]
        };

        acceptancesData.push(mockAcceptance);
      }

      setRiskAcceptances(acceptancesData);
    } catch (error) {
      console.error('Erro ao carregar riscos aceitos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os riscos aceitos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpanded = (riskId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(riskId)) {
      newExpanded.delete(riskId);
    } else {
      newExpanded.add(riskId);
    }
    setExpandedCards(newExpanded);
  };

  const handleSendCommunication = async () => {
    if (!selectedRisk) return;

    try {
      // Aqui seria a integração real com o banco de dados
      const newCommunication: RiskCommunication = {
        id: `comm-${Date.now()}`,
        acceptance_id: selectedRisk.id,
        stakeholder_name: communicationForm.stakeholder_name,
        stakeholder_email: communicationForm.stakeholder_email,
        stakeholder_role: communicationForm.stakeholder_role,
        message_content: communicationForm.message_content,
        communication_type: communicationForm.communication_type,
        sent_date: new Date().toISOString(),
        status: 'sent'
      };

      // Atualizar estado local
      setRiskAcceptances(prev => 
        prev.map(risk => 
          risk.id === selectedRisk.id 
            ? { ...risk, communications: [...risk.communications, newCommunication] }
            : risk
        )
      );

      toast({
        title: 'Comunicação Enviada',
        description: `Mensagem enviada para ${communicationForm.stakeholder_name}`,
      });

      setShowCommunicationModal(false);
      setCommunicationForm({
        stakeholder_name: '',
        stakeholder_email: '',
        stakeholder_role: '',
        message_content: '',
        communication_type: 'notification'
      });
    } catch (error) {
      console.error('Erro ao enviar comunicação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a comunicação',
        variant: 'destructive',
      });
    }
  };

  const handleAddApproval = async () => {
    if (!selectedRisk) return;

    try {
      const newApproval: RiskApproval = {
        id: `approval-${Date.now()}`,
        acceptance_id: selectedRisk.id,
        approver_name: approvalForm.approver_name,
        approver_email: approvalForm.approver_email,
        approver_role: approvalForm.approver_role,
        approval_level: approvalForm.approval_level,
        approval_status: 'pending',
        comments: approvalForm.comments,
        conditions: approvalForm.conditions
      };

      setRiskAcceptances(prev => 
        prev.map(risk => 
          risk.id === selectedRisk.id 
            ? { ...risk, approvals: [...risk.approvals, newApproval] }
            : risk
        )
      );

      toast({
        title: 'Aprovação Solicitada',
        description: `Solicitação enviada para ${approvalForm.approver_name}`,
      });

      setShowApprovalModal(false);
      setApprovalForm({
        approver_name: '',
        approver_email: '',
        approver_role: '',
        approval_level: 1,
        comments: '',
        conditions: ''
      });
    } catch (error) {
      console.error('Erro ao solicitar aprovação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível solicitar a aprovação',
        variant: 'destructive',
      });
    }
  };

  const handleAddMonitoring = async () => {
    if (!selectedRisk) return;

    try {
      const newMonitoring: RiskMonitoring = {
        id: `monitoring-${Date.now()}`,
        acceptance_id: selectedRisk.id,
        review_date: new Date().toISOString(),
        reviewer_name: user?.name || 'Usuário Atual',
        reviewer_email: user?.email || '',
        current_risk_score: monitoringForm.current_risk_score,
        residual_risk_score: monitoringForm.residual_risk_score,
        monitoring_notes: monitoringForm.monitoring_notes,
        recommendations: monitoringForm.recommendations,
        next_review_date: monitoringForm.next_review_date,
        status: 'completed'
      };

      setRiskAcceptances(prev => 
        prev.map(risk => 
          risk.id === selectedRisk.id 
            ? { 
                ...risk, 
                monitoring_records: [...risk.monitoring_records, newMonitoring],
                residual_risk_score: monitoringForm.residual_risk_score,
                next_review_date: monitoringForm.next_review_date
              }
            : risk
        )
      );

      toast({
        title: 'Monitoramento Registrado',
        description: 'Registro de monitoramento adicionado com sucesso',
      });

      setShowMonitoringModal(false);
      setMonitoringForm({
        current_risk_score: 0,
        residual_risk_score: 0,
        monitoring_notes: '',
        recommendations: '',
        next_review_date: ''
      });
    } catch (error) {
      console.error('Erro ao registrar monitoramento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o monitoramento',
        variant: 'destructive',
      });
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200 !bg-red-100 !text-red-800 !border-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200 !bg-orange-100 !text-orange-800 !border-orange-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200 !bg-yellow-100 !text-yellow-800 !border-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200 !bg-green-100 !text-green-800 !border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 !bg-gray-100 !text-gray-800 !border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 !bg-green-100 !text-green-800 !border-green-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200 !bg-blue-100 !text-blue-800 !border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200 !bg-red-100 !text-red-800 !border-red-200';
      case 'renewed': return 'bg-purple-100 text-purple-800 border-purple-200 !bg-purple-100 !text-purple-800 !border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 !bg-gray-100 !text-gray-800 !border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cyber security':
      case 'segurança cibernética':
        return 'bg-red-100 text-red-800 border-red-200 !bg-red-100 !text-red-800 !border-red-200';
      case 'operational':
      case 'operacional':
        return 'bg-blue-100 text-blue-800 border-blue-200 !bg-blue-100 !text-blue-800 !border-blue-200';
      case 'financial':
      case 'financeiro':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 !bg-emerald-100 !text-emerald-800 !border-emerald-200';
      case 'compliance':
      case 'conformidade':
        return 'bg-purple-100 text-purple-800 border-purple-200 !bg-purple-100 !text-purple-800 !border-purple-200';
      case 'strategic':
      case 'estratégico':
        return 'bg-orange-100 text-orange-800 border-orange-200 !bg-orange-100 !text-orange-800 !border-orange-200';
      case 'legal':
      case 'jurídico':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 !bg-indigo-100 !text-indigo-800 !border-indigo-200';
      case 'reputational':
      case 'reputacional':
        return 'bg-pink-100 text-pink-800 border-pink-200 !bg-pink-100 !text-pink-800 !border-pink-200';
      case 'environmental':
      case 'ambiental':
        return 'bg-teal-100 text-teal-800 border-teal-200 !bg-teal-100 !text-teal-800 !border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 !bg-gray-100 !text-gray-800 !border-gray-200';
    }
  };

  const getResidualRiskReduction = (original: number, residual: number) => {
    const reduction = ((original - residual) / original) * 100;
    return Math.round(reduction);
  };

  const filteredRisks = riskAcceptances.filter(risk => {
    const matchesSearch = !searchTerm || 
      risk.risk_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.risk_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.accepted_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    const matchesRiskLevel = riskLevelFilter === 'all' || risk.risk_level === riskLevelFilter;
    const matchesCategory = categoryFilter === 'all' || risk.risk_category === categoryFilter;
    
    let matchesReview = true;
    if (reviewFilter === 'due_soon') {
      const reviewDate = new Date(risk.next_review_date);
      const today = new Date();
      const daysDiff = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      matchesReview = daysDiff <= 30;
    } else if (reviewFilter === 'overdue') {
      const reviewDate = new Date(risk.next_review_date);
      const today = new Date();
      matchesReview = reviewDate < today;
    }
    
    return matchesSearch && matchesStatus && matchesRiskLevel && matchesCategory && matchesReview;
  });

  // Métricas
  const metrics = {
    total: riskAcceptances.length,
    active: riskAcceptances.filter(r => r.status === 'active').length,
    underReview: riskAcceptances.filter(r => r.status === 'under_review').length,
    dueSoon: riskAcceptances.filter(r => {
      const reviewDate = new Date(r.next_review_date);
      const today = new Date();
      const daysDiff = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 30 && daysDiff >= 0;
    }).length,
    overdue: riskAcceptances.filter(r => {
      const reviewDate = new Date(r.next_review_date);
      const today = new Date();
      return reviewDate < today;
    }).length,
    avgResidualReduction: riskAcceptances.length > 0 
      ? Math.round(riskAcceptances.reduce((sum, r) => sum + getResidualRiskReduction(r.risk_score, r.residual_risk_score), 0) / riskAcceptances.length)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando gestão de riscos aceitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com Alex Risk Branding */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/risks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Gestão de Riscos Aceitos
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Monitoramento inteligente e gestão completa de riscos aceitos com comunicação e aprovação
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadRiskAcceptances} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Métricas em Tempo Real */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aceitos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">riscos em gestão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.active}</div>
            <p className="text-xs text-muted-foreground">monitoramento ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.underReview}</div>
            <p className="text-xs text-muted-foreground">sendo revisados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencimento Próximo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.dueSoon}</div>
            <p className="text-xs text-muted-foreground">próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.overdue}
            </div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redução Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.avgResidualReduction}%</div>
            <p className="text-xs text-muted-foreground">risco residual</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Avançados */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar riscos aceitos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="under_review">Em Revisão</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
                <SelectItem value="renewed">Renovados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nível de Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Níveis</SelectItem>
                <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Baixo">Baixo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="Cyber Security">Segurança Cibernética</SelectItem>
                <SelectItem value="Operational">Operacional</SelectItem>
                <SelectItem value="Financial">Financeiro</SelectItem>
                <SelectItem value="Compliance">Conformidade</SelectItem>
                <SelectItem value="Strategic">Estratégico</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reviewFilter} onValueChange={setReviewFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Revisão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Revisões</SelectItem>
                <SelectItem value="due_soon">Vencimento Próximo</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setRiskLevelFilter('all');
              setCategoryFilter('all');
              setReviewFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Riscos Aceitos - Cards Expansíveis */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Nenhum risco aceito encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Não há riscos aceitos para exibir.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRisks.map(risk => {
            const isExpanded = expandedCards.has(risk.id);
            const reductionPercentage = getResidualRiskReduction(risk.risk_score, risk.residual_risk_score);
            const reviewDate = new Date(risk.next_review_date);
            const today = new Date();
            const daysUntilReview = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            const isOverdue = daysUntilReview < 0;
            const isDueSoon = daysUntilReview <= 30 && daysUntilReview >= 0;
            
            return (
              <Card key={risk.id} className={`border-l-4 hover:shadow-md transition-all ${
                isOverdue ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' :
                isDueSoon ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20' :
                'border-l-green-500'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Badge com ID do Risco - usando riskCode se disponível */}
                        <Badge variant="secondary" className="text-xs font-mono bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700">
                          {risk.riskCode || `ID-${risk.risk_id.substring(0, 8).toUpperCase()}`}
                        </Badge>
                        <CardTitle className="text-lg truncate">{risk.risk_title}</CardTitle>
                        <Badge 
                          className="border text-xs font-medium px-2 py-1"
                          style={{
                            backgroundColor: (() => {
                              console.log('Risk level:', risk.risk_level);
                              switch(risk.risk_level) {
                                case 'Crítico':
                                case 'Muito Alto': return '#dc2626';
                                case 'Alto': return '#ea580c';
                                case 'Médio': return '#ca8a04';
                                case 'Baixo': return '#16a34a';
                                default: return '#6b7280';
                              }
                            })(),
                            color: '#ffffff',
                            borderColor: (() => {
                              switch(risk.risk_level) {
                                case 'Crítico':
                                case 'Muito Alto': return '#dc2626';
                                case 'Alto': return '#ea580c';
                                case 'Médio': return '#ca8a04';
                                case 'Baixo': return '#16a34a';
                                default: return '#6b7280';
                              }
                            })(),
                            borderWidth: '1px'
                          }}
                        >
                          {risk.risk_level}
                        </Badge>
                        <Badge 
                          className="border"
                          style={{
                            backgroundColor: risk.risk_category.toLowerCase().includes('cyber') || risk.risk_category.toLowerCase().includes('segurança') ? '#dc2626' :
                                           risk.risk_category.toLowerCase().includes('operational') || risk.risk_category.toLowerCase().includes('operacional') ? '#2563eb' :
                                           risk.risk_category.toLowerCase().includes('financial') || risk.risk_category.toLowerCase().includes('financeiro') ? '#059669' :
                                           risk.risk_category.toLowerCase().includes('compliance') || risk.risk_category.toLowerCase().includes('conformidade') ? '#7c3aed' :
                                           risk.risk_category.toLowerCase().includes('strategic') || risk.risk_category.toLowerCase().includes('estratégico') ? '#ea580c' : '#6b7280',
                            color: '#ffffff',
                            borderColor: risk.risk_category.toLowerCase().includes('cyber') || risk.risk_category.toLowerCase().includes('segurança') ? '#dc2626' :
                                        risk.risk_category.toLowerCase().includes('operational') || risk.risk_category.toLowerCase().includes('operacional') ? '#2563eb' :
                                        risk.risk_category.toLowerCase().includes('financial') || risk.risk_category.toLowerCase().includes('financeiro') ? '#059669' :
                                        risk.risk_category.toLowerCase().includes('compliance') || risk.risk_category.toLowerCase().includes('conformidade') ? '#7c3aed' :
                                        risk.risk_category.toLowerCase().includes('strategic') || risk.risk_category.toLowerCase().includes('estratégico') ? '#ea580c' : '#6b7280',
                            borderWidth: '1px'
                          }}
                        >
                          {risk.risk_category}
                        </Badge>
                        <Badge 
                          className="border"
                          style={{
                            backgroundColor: risk.status === 'active' ? '#16a34a' :
                                           risk.status === 'under_review' ? '#2563eb' :
                                           risk.status === 'expired' ? '#dc2626' :
                                           risk.status === 'renewed' ? '#7c3aed' : '#6b7280',
                            color: '#ffffff',
                            borderColor: risk.status === 'active' ? '#16a34a' :
                                        risk.status === 'under_review' ? '#2563eb' :
                                        risk.status === 'expired' ? '#dc2626' :
                                        risk.status === 'renewed' ? '#7c3aed' : '#6b7280',
                            borderWidth: '1px'
                          }}
                        >
                          {risk.status === 'active' ? 'Ativo' :
                           risk.status === 'under_review' ? 'Em Revisão' :
                           risk.status === 'expired' ? 'Expirado' : 'Renovado'}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="animate-pulse">
                            <Bell className="h-3 w-3 mr-1" />
                            Vencido
                          </Badge>
                        )}
                        {isDueSoon && !isOverdue && (
                          <Badge variant="outline" className="border-orange-500 text-orange-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysUntilReview} dias
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Risco Original</div>
                            <div className="text-xs text-muted-foreground">{risk.risk_score}/10</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="font-medium">Risco Residual</div>
                            <div className="text-xs text-green-600">{risk.residual_risk_score}/10</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <div>
                            <div className="font-medium">Redução</div>
                            <div className="text-xs text-purple-600">{reductionPercentage}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Próxima Revisão</div>
                            <div className={`text-xs ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-muted-foreground'}`}>
                              {format(reviewDate, 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Redução de Risco</span>
                          <span className="font-medium">{reductionPercentage}%</span>
                        </div>
                        <Progress value={reductionPercentage} className="h-2" />
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Aceito por:</span>
                          <span>{risk.accepted_by} ({risk.accepted_by_role})</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {risk.acceptance_reason}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{risk.communications.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          <span>{risk.approvals.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          <span>{risk.monitoring_records.length}</span>
                        </div>
                      </div>
                      

                      
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleCardExpanded(risk.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <Tabs defaultValue="communication" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="communication" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comunicação
                          </TabsTrigger>
                          <TabsTrigger value="approval" className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Aprovação
                          </TabsTrigger>
                          <TabsTrigger value="monitoring" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Monitoramento
                          </TabsTrigger>
                          <TabsTrigger value="risk-letter" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Carta de Risco
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="communication" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              Comunicações ({risk.communications.length})
                            </h4>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedRisk(risk);
                                setShowCommunicationModal(true);
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Nova Comunicação
                            </Button>
                          </div>
                          
                          {risk.communications.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                              <p>Nenhuma comunicação registrada</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {risk.communications.map(comm => (
                                <Card key={comm.id} className="border-l-4 border-l-blue-500">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="font-medium">{comm.stakeholder_name}</span>
                                          <Badge variant="outline">{comm.stakeholder_role}</Badge>
                                          <Badge 
                                            style={{
                                              backgroundColor: comm.status === 'responded' ? '#16a34a' :
                                                             comm.status === 'read' ? '#2563eb' :
                                                             comm.status === 'delivered' ? '#ca8a04' : '#6b7280',
                                              color: '#ffffff',
                                              borderWidth: '1px',
                                              borderColor: comm.status === 'responded' ? '#16a34a' :
                                                          comm.status === 'read' ? '#2563eb' :
                                                          comm.status === 'delivered' ? '#ca8a04' : '#6b7280'
                                            }}
                                          >
                                            {comm.status}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {comm.message_content}
                                        </p>
                                        <div className="text-xs text-muted-foreground">
                                          Enviado em {format(new Date(comm.sent_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        </div>
                                        {comm.response_content && (
                                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                                            <strong>Resposta:</strong> {comm.response_content}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="approval" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              <FileCheck className="h-4 w-4 text-green-500" />
                              Aprovações ({risk.approvals.length})
                            </h4>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedRisk(risk);
                                setShowApprovalModal(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Solicitar Aprovação
                            </Button>
                          </div>
                          
                          {risk.approvals.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <FileCheck className="mx-auto h-8 w-8 mb-2" />
                              <p>Nenhuma aprovação registrada</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {risk.approvals.map(approval => (
                                <Card key={approval.id} className="border-l-4 border-l-green-500">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="font-medium">{approval.approver_name}</span>
                                          <Badge variant="outline">{approval.approver_role}</Badge>
                                          <Badge 
                                            style={{
                                              backgroundColor: approval.approval_status === 'approved' ? '#16a34a' :
                                                             approval.approval_status === 'rejected' ? '#dc2626' :
                                                             approval.approval_status === 'conditional' ? '#ca8a04' : '#6b7280',
                                              color: '#ffffff',
                                              borderWidth: '1px',
                                              borderColor: approval.approval_status === 'approved' ? '#16a34a' :
                                                          approval.approval_status === 'rejected' ? '#dc2626' :
                                                          approval.approval_status === 'conditional' ? '#ca8a04' : '#6b7280'
                                            }}
                                          >
                                            {approval.approval_status}
                                          </Badge>
                                          <Badge variant="secondary">Nível {approval.approval_level}</Badge>
                                        </div>
                                        {approval.comments && (
                                          <p className="text-sm text-muted-foreground mb-2">
                                            {approval.comments}
                                          </p>
                                        )}
                                        {approval.conditions && (
                                          <div className="text-sm bg-yellow-50 p-2 rounded mb-2">
                                            <strong>Condições:</strong> {approval.conditions}
                                          </div>
                                        )}
                                        {approval.approval_date && (
                                          <div className="text-xs text-muted-foreground">
                                            Aprovado em {format(new Date(approval.approval_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="monitoring" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Activity className="h-4 w-4 text-purple-500" />
                              Monitoramento ({risk.monitoring_records.length})
                            </h4>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedRisk(risk);
                                setMonitoringForm({
                                  current_risk_score: risk.risk_score,
                                  residual_risk_score: risk.residual_risk_score,
                                  monitoring_notes: '',
                                  recommendations: '',
                                  next_review_date: ''
                                });
                                setShowMonitoringModal(true);
                              }}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Nova Revisão
                            </Button>
                          </div>
                          
                          {risk.monitoring_records.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <BarChart3 className="mx-auto h-8 w-8 mb-2" />
                              <p>Nenhum registro de monitoramento</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {risk.monitoring_records.map(monitoring => (
                                <Card key={monitoring.id} className="border-l-4 border-l-purple-500">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="font-medium">{monitoring.reviewer_name}</span>
                                          <Badge 
                                            style={{
                                              backgroundColor: monitoring.status === 'completed' ? '#16a34a' :
                                                             monitoring.status === 'in_progress' ? '#2563eb' : '#dc2626',
                                              color: '#ffffff',
                                              borderWidth: '1px',
                                              borderColor: monitoring.status === 'completed' ? '#16a34a' :
                                                          monitoring.status === 'in_progress' ? '#2563eb' : '#dc2626'
                                            }}
                                          >
                                            {monitoring.status}
                                          </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                          <div>
                                            <div className="text-xs text-muted-foreground">Risco Atual</div>
                                            <div className="font-medium">{monitoring.current_risk_score}/10</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground">Risco Residual</div>
                                            <div className="font-medium text-green-600">{monitoring.residual_risk_score}/10</div>
                                          </div>
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground mb-2">
                                          <strong>Observações:</strong> {monitoring.monitoring_notes}
                                        </p>
                                        
                                        {monitoring.recommendations && (
                                          <p className="text-sm text-muted-foreground mb-2">
                                            <strong>Recomendações:</strong> {monitoring.recommendations}
                                          </p>
                                        )}
                                        
                                        <div className="text-xs text-muted-foreground">
                                          Revisão em {format(new Date(monitoring.review_date), 'dd/MM/yyyy', { locale: ptBR })} • 
                                          Próxima revisão: {format(new Date(monitoring.next_review_date), 'dd/MM/yyyy', { locale: ptBR })}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="risk-letter" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              Carta de Aceitação de Risco
                            </h4>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                            <div className="text-center space-y-4">
                              <div className="flex justify-center">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                                  <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                  Gerar Carta de Aceitação de Risco
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Documento formal para registro da decisão de aceitar este risco específico
                                </p>
                              </div>
                              
                              <div className="flex justify-center space-x-3">
                                <Button
                                  onClick={() => {
                                    console.log('Botão Gerar PDF clicado!');
                                    console.log('Dados do risco:', risk);
                                    console.log('Estado isGenerating:', isGenerating);
                                    printRiskAcceptancePDF(risk);
                                  }}
                                  disabled={isGenerating}
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-2"
                                >
                                  {isGenerating ? (
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <FileDown className="h-4 w-4 mr-2" />
                                  )}
                                  Gerar PDF
                                </Button>
                                
                                <Button
                                  onClick={() => {
                                    console.log('Botão Gerar DOC clicado!');
                                    console.log('Dados do risco:', risk);
                                    console.log('Estado isGenerating:', isGenerating);
                                    printRiskAcceptanceDOC(risk);
                                  }}
                                  disabled={isGenerating}
                                  variant="outline"
                                  className="border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-6 py-2"
                                >
                                  {isGenerating ? (
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                  )}
                                  Gerar DOC
                                </Button>
                              </div>
                              
                              <div className="text-xs text-muted-foreground mt-4 space-y-1">
                                <p><span className="font-medium">Documento Nº:</span> RA-{risk.riskCode || risk.risk_id.substring(0, 8).toUpperCase()}</p>
                                <p><span className="font-medium">Risco:</span> {risk.risk_title}</p>
                                <p><span className="font-medium">Aceito por:</span> {risk.accepted_by} ({risk.accepted_by_role})</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Informações Importantes</h4>
                                <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                                  <li>• A carta será gerada com as informações atuais do risco</li>
                                  <li>• O documento possui validade jurídica para auditoria</li>
                                  <li>• Inclui dados da empresa e assinaturas digitais</li>
                                  <li>• Formato PDF recomendado para arquivamento oficial</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Comunicação */}
      <Dialog open={showCommunicationModal} onOpenChange={setShowCommunicationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Nova Comunicação
            </DialogTitle>
            <DialogDescription>
              Envie uma comunicação para as partes interessadas sobre este risco aceito
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stakeholder_name">Nome do Stakeholder *</Label>
                <Input
                  id="stakeholder_name"
                  value={communicationForm.stakeholder_name}
                  onChange={(e) => setCommunicationForm({...communicationForm, stakeholder_name: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="stakeholder_email">Email *</Label>
                <Input
                  id="stakeholder_email"
                  type="email"
                  value={communicationForm.stakeholder_email}
                  onChange={(e) => setCommunicationForm({...communicationForm, stakeholder_email: e.target.value})}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stakeholder_role">Função/Cargo</Label>
                <Input
                  id="stakeholder_role"
                  value={communicationForm.stakeholder_role}
                  onChange={(e) => setCommunicationForm({...communicationForm, stakeholder_role: e.target.value})}
                  placeholder="Ex: Gerente de TI"
                />
              </div>
              <div>
                <Label htmlFor="communication_type">Tipo de Comunicação</Label>
                <Select
                  value={communicationForm.communication_type}
                  onValueChange={(value: any) => setCommunicationForm({...communicationForm, communication_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification">Notificação</SelectItem>
                    <SelectItem value="request">Solicitação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="reminder">Lembrete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="message_content">Mensagem *</Label>
              <Textarea
                id="message_content"
                value={communicationForm.message_content}
                onChange={(e) => setCommunicationForm({...communicationForm, message_content: e.target.value})}
                placeholder="Digite sua mensagem..."
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCommunicationModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSendCommunication}
              disabled={!communicationForm.stakeholder_name || !communicationForm.stakeholder_email || !communicationForm.message_content}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Comunicação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Aprovação */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Solicitar Aprovação
            </DialogTitle>
            <DialogDescription>
              Solicite aprovação formal para a aceitação deste risco
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approver_name">Nome do Aprovador *</Label>
                <Input
                  id="approver_name"
                  value={approvalForm.approver_name}
                  onChange={(e) => setApprovalForm({...approvalForm, approver_name: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="approver_email">Email *</Label>
                <Input
                  id="approver_email"
                  type="email"
                  value={approvalForm.approver_email}
                  onChange={(e) => setApprovalForm({...approvalForm, approver_email: e.target.value})}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approver_role">Função/Cargo *</Label>
                <Input
                  id="approver_role"
                  value={approvalForm.approver_role}
                  onChange={(e) => setApprovalForm({...approvalForm, approver_role: e.target.value})}
                  placeholder="Ex: CEO, Diretor"
                />
              </div>
              <div>
                <Label htmlFor="approval_level">Nível de Aprovação</Label>
                <Select
                  value={approvalForm.approval_level.toString()}
                  onValueChange={(value) => setApprovalForm({...approvalForm, approval_level: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nível 1 - Gerencial</SelectItem>
                    <SelectItem value="2">Nível 2 - Diretoria</SelectItem>
                    <SelectItem value="3">Nível 3 - Executivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="approval_comments">Comentários</Label>
              <Textarea
                id="approval_comments"
                value={approvalForm.comments}
                onChange={(e) => setApprovalForm({...approvalForm, comments: e.target.value})}
                placeholder="Comentários adicionais sobre a solicitação..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="approval_conditions">Condições Especiais</Label>
              <Textarea
                id="approval_conditions"
                value={approvalForm.conditions}
                onChange={(e) => setApprovalForm({...approvalForm, conditions: e.target.value})}
                placeholder="Condições ou requisitos especiais para aprovação..."
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddApproval}
              disabled={!approvalForm.approver_name || !approvalForm.approver_email || !approvalForm.approver_role}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Solicitar Aprovação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Monitoramento */}
      <Dialog open={showMonitoringModal} onOpenChange={setShowMonitoringModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Registro de Monitoramento
            </DialogTitle>
            <DialogDescription>
              Registre uma nova revisão de monitoramento para este risco aceito
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_risk_score">Risco Atual (1-10) *</Label>
                <Input
                  id="current_risk_score"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={monitoringForm.current_risk_score}
                  onChange={(e) => setMonitoringForm({...monitoringForm, current_risk_score: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="residual_risk_score">Risco Residual (1-10) *</Label>
                <Input
                  id="residual_risk_score"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={monitoringForm.residual_risk_score}
                  onChange={(e) => setMonitoringForm({...monitoringForm, residual_risk_score: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="monitoring_notes">Observações de Monitoramento *</Label>
              <Textarea
                id="monitoring_notes"
                value={monitoringForm.monitoring_notes}
                onChange={(e) => setMonitoringForm({...monitoringForm, monitoring_notes: e.target.value})}
                placeholder="Descreva as observações desta revisão..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="recommendations">Recomendações</Label>
              <Textarea
                id="recommendations"
                value={monitoringForm.recommendations}
                onChange={(e) => setMonitoringForm({...monitoringForm, recommendations: e.target.value})}
                placeholder="Recomendações para o próximo período..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="next_review_date">Próxima Data de Revisão *</Label>
              <Input
                id="next_review_date"
                type="date"
                value={monitoringForm.next_review_date}
                onChange={(e) => setMonitoringForm({...monitoringForm, next_review_date: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowMonitoringModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddMonitoring}
              disabled={!monitoringForm.monitoring_notes || !monitoringForm.next_review_date}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Registrar Monitoramento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiskAcceptanceManagement;
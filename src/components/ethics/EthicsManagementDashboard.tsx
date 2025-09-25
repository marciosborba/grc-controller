import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EthicsExpandableCard from './EthicsExpandableCard';
import InvestigationPlanManager from './investigation/InvestigationPlanManager';
import EvidenceManager from './evidence/EvidenceManager';
import CorrectiveActionManager from './corrective-actions/CorrectiveActionManager';
import RegulatoryNotificationManager from './regulatory/RegulatoryNotificationManager';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  Activity,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  UserX,
  Settings,
  Download,
  Upload,
  Calendar,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  FileText,
  Bell,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import {
  EthicsReportWithDetails,
  EthicsReportFilters,
  EthicsDashboardMetrics,
  EthicsReportStatus,
  EthicsReportSeverity,
  EthicsReportPriority,
  ETHICS_STATUS_LABELS,
  ETHICS_SEVERITY_LABELS,
  ETHICS_PRIORITY_LABELS,
  ETHICS_STATUS_COLORS,
  ETHICS_SEVERITY_COLORS
} from '@/types/ethics';

const EthicsManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<EthicsReportWithDetails[]>([]);
  const [metrics, setMetrics] = useState<EthicsDashboardMetrics | null>(null);
  const [filters, setFilters] = useState<EthicsReportFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 50
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<EthicsReportWithDetails | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  // Estados para dados empresariais
  const [investigationPlans, setInvestigationPlans] = useState([]);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [correctiveActions, setCorrectiveActions] = useState([]);
  const [regulatoryNotifications, setRegulatoryNotifications] = useState([]);
  
  // Estados para atualização de caso
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    severity: '',
    assigned_to: '',
    resolution: '',
    investigation_summary: ''
  });

  useEffect(() => {
    if (user && (user.tenantId || user.isPlatformAdmin)) {
      loadDashboardData();
    }
  }, [filters, user]);

  const loadDashboardData = async () => {
    if (!user || (!user.tenantId && !user.isPlatformAdmin)) {
      return;
    }

    setLoading(true);
    try {
      await loadReports();
      await loadMetrics();
      await loadEnterpriseData();
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    if (!user?.tenantId && !user?.isPlatformAdmin) {
      return;
    }
    
    let query = supabase
      .from('ethics_reports')
      .select('*');
    
    // Platform Admins podem ver todos os registros, usuarios normais apenas do seu tenant
    if (!user.isPlatformAdmin && user.tenantId) {
      query = query.eq('tenant_id', user.tenantId);
    }

    // Aplicar filtros
    if (filters.search_term) {
      query = query.or(`title.ilike.%${filters.search_term}%,description.ilike.%${filters.search_term}%,protocol_number.ilike.%${filters.search_term}%`);
    }

    if (filters.statuses && filters.statuses.length > 0) {
      query = query.in('status', filters.statuses);
    }

    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    if (filters.severities && filters.severities.length > 0) {
      query = query.in('severity', filters.severities);
    }

    if (filters.priorities && filters.priorities.length > 0) {
      query = query.in('priority', filters.priorities);
    }

    if (filters.assigned_to && filters.assigned_to.length > 0) {
      query = query.in('assigned_to', filters.assigned_to);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.is_anonymous !== undefined) {
      query = query.eq('is_anonymous', filters.is_anonymous);
    }

    if (filters.has_sla_breach) {
      query = query.eq('sla_breach', true);
    }

    // Ordenação
    query = query.order(filters.sort_by || 'created_at', { 
      ascending: filters.sort_order === 'asc' 
    });

    // Limite
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao carregar reports de ética:', error);
      throw error;
    }

    // Enriquecer dados com informações calculadas
    const enrichedData = (data || []).map(report => ({
      ...report,
      days_since_created: differenceInDays(new Date(), new Date(report.created_at)),
      days_until_due: report.due_date ? differenceInDays(new Date(report.due_date), new Date()) : null,
      is_sla_breach: report.sla_breach || (report.due_date && isAfter(new Date(), new Date(report.due_date)))
    }));

    setReports(enrichedData);
  };

  const loadMetrics = async () => {
    if (!user?.tenantId && !user?.isPlatformAdmin) return;

    // Carregar métricas básicas
    let query = supabase
      .from('ethics_reports')
      .select('*');
    
    // Platform Admins veem todos, usuarios normais apenas do seu tenant
    if (!user.isPlatformAdmin && user.tenantId) {
      query = query.eq('tenant_id', user.tenantId);
    }
    
    const { data: reportsData, error } = await query;

    if (error) {
      console.error('Erro ao carregar dados para métricas:', error);
      throw error;
    }

    console.log('Dados para métricas:', reportsData?.length || 0);

    const reports = reportsData || [];
    
    // Calcular métricas
    const metrics: EthicsDashboardMetrics = {
      total_reports: reports.length,
      open_reports: reports.filter(r => ['open', 'triaging', 'investigating', 'in_review'].includes(r.status)).length,
      investigating_reports: reports.filter(r => r.status === 'investigating').length,
      resolved_reports: reports.filter(r => r.status === 'resolved').length,
      closed_reports: reports.filter(r => r.status === 'closed').length,
      anonymous_reports: reports.filter(r => r.is_anonymous).length,
      critical_reports: reports.filter(r => r.severity === 'critical').length,
      sla_breach_reports: reports.filter(r => r.sla_breach || (r.due_date && isAfter(new Date(), new Date(r.due_date)))).length,
      avg_resolution_days: 0, // TODO: Calcular baseado em resolved_at
      reports_by_category: {},
      reports_by_severity: {},
      reports_by_month: [],
      resolution_rate: reports.length > 0 ? (reports.filter(r => ['resolved', 'closed'].includes(r.status)).length / reports.length) * 100 : 0,
      sla_compliance_rate: reports.length > 0 ? (reports.filter(r => !r.sla_breach).length / reports.length) * 100 : 100
    };

    // Agrupar por categoria
    reports.forEach(report => {
      metrics.reports_by_category[report.category] = (metrics.reports_by_category[report.category] || 0) + 1;
      metrics.reports_by_severity[report.severity] = (metrics.reports_by_severity[report.severity] || 0) + 1;
    });

    setMetrics(metrics);
  };

  const loadEnterpriseData = async () => {
    if (!user?.tenantId && !user?.isPlatformAdmin) return;
    
    try {
      // Carregar planos de investigação
      let investigationQuery = supabase
        .from('ethics_investigation_plans')
        .select('*');
      
      if (!user.isPlatformAdmin && user.tenantId) {
        investigationQuery = investigationQuery.eq('tenant_id', user.tenantId);
      }
      
      const { data: investigations } = await investigationQuery;
      setInvestigationPlans(investigations || []);
      
      // Carregar evidências
      let evidenceQuery = supabase
        .from('ethics_evidence')
        .select('*');
        
      if (!user.isPlatformAdmin && user.tenantId) {
        evidenceQuery = evidenceQuery.eq('tenant_id', user.tenantId);
      }
      
      const { data: evidence } = await evidenceQuery;
      setEvidenceItems(evidence || []);
      
      // Carregar ações corretivas
      let actionsQuery = supabase
        .from('ethics_corrective_actions')
        .select('*');
        
      if (!user.isPlatformAdmin && user.tenantId) {
        actionsQuery = actionsQuery.eq('tenant_id', user.tenantId);
      }
      
      const { data: actions } = await actionsQuery;
      setCorrectiveActions(actions || []);
      
      // Carregar notificações regulamentares
      let notificationsQuery = supabase
        .from('ethics_regulatory_notifications')
        .select('*');
        
      if (!user.isPlatformAdmin && user.tenantId) {
        notificationsQuery = notificationsQuery.eq('tenant_id', user.tenantId);
      }
      
      const { data: notifications } = await notificationsQuery;
      setRegulatoryNotifications(notifications || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados empresariais:', error);
    }
  };

  const handleReportUpdate = async (report: EthicsReportWithDetails, newData: any) => {
    try {
      const { error } = await supabase
        .from('ethics_reports')
        .update({
          ...newData,
          updated_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        })
        .eq('id', report.id);

      if (error) throw error;

      // Registrar atividade
      await supabase
        .from('ethics_activities')
        .insert([{
          tenant_id: user?.tenantId,
          report_id: report.id,
          activity_type: 'updated',
          description: `Caso atualizado por ${user?.name}`,
          performed_by: user?.id,
          performed_by_name: user?.name,
          metadata: { changes: newData }
        }]);

      toast.success('Caso atualizado com sucesso');
      setIsUpdateDialogOpen(false);
      setSelectedReport(null);
      loadDashboardData();

    } catch (error: any) {
      console.error('Erro ao atualizar caso:', error);
      toast.error('Erro ao atualizar caso');
    }
  };

  const openUpdateDialog = (report: EthicsReportWithDetails) => {
    setSelectedReport(report);
    setUpdateData({
      status: report.status,
      priority: report.priority || 'medium',
      severity: report.severity,
      assigned_to: report.assigned_to || '',
      resolution: report.resolution || '',
      investigation_summary: report.investigation_summary || ''
    });
    setIsUpdateDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    return ETHICS_STATUS_COLORS[status as EthicsReportStatus] || '#6b7280';
  };

  const getSeverityColor = (severity: string) => {
    return ETHICS_SEVERITY_COLORS[severity as EthicsReportSeverity] || '#6b7280';
  };

  const handleDownloadDocumentation = () => {
    // Criar novo documento PDF
    const doc = new jsPDF();
    
    // Configurações de página e cores
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    const primaryColor = [59, 130, 246]; // Blue-500
    const accentColor = [16, 185, 129]; // Green-500
    const grayColor = [107, 114, 128]; // Gray-500
    let yPosition = margin;

    // Função para adicionar nova página se necessário
    const addPageIfNeeded = (additionalHeight = 0) => {
      if (yPosition + additionalHeight > pageHeight - margin) {
        doc.addPage();
        addHeader();
        yPosition = margin + 25;
      }
    };

    // Cabeçalho das páginas internas
    const addHeader = () => {
      doc.setDrawColor(...grayColor);
      doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text('GRC Controller - Módulo de Ética', margin, margin + 12);
    };

    // Função para adicionar caixa colorida
    const addColorBox = (color: number[], height = 5) => {
      doc.setFillColor(...color);
      doc.rect(margin, yPosition, contentWidth, height, 'F');
      yPosition += height + 5;
    };

    // Função para adicionar texto com quebra automática
    const addText = (text: string, fontSize = 10, isBold = false, color = [0, 0, 0], indent = 0) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      addPageIfNeeded(lines.length * 6);
      
      doc.text(lines, margin + indent, yPosition);
      yPosition += lines.length * 6 + 3;
    };

    // Função para adicionar título principal
    const addTitle = (text: string, color = primaryColor) => {
      addPageIfNeeded(20);
      addColorBox(color, 3);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(text, margin, yPosition);
      yPosition += 18;
    };

    // Função para adicionar subtítulo
    const addSubTitle = (text: string, color = accentColor) => {
      addPageIfNeeded(15);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(text, margin, yPosition);
      yPosition += 12;
    };

    // Função para adicionar caixa de destaque
    const addHighlightBox = (title: string, content: string, bgColor = [248, 250, 252]) => {
      addPageIfNeeded(30);
      doc.setFillColor(...bgColor);
      doc.setDrawColor(...grayColor);
      const boxHeight = 25;
      doc.rect(margin, yPosition, contentWidth, boxHeight, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(title, margin + 5, yPosition + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(content, contentWidth - 10);
      doc.text(lines, margin + 5, yPosition + 15);
      
      yPosition += boxHeight + 8;
    };

    // Função para adicionar passo numerado
    const addStep = (stepNumber: number, title: string, description: string) => {
      addPageIfNeeded(20);
      
      // Círculo numerado
      doc.setFillColor(...primaryColor);
      doc.circle(margin + 8, yPosition + 5, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(stepNumber.toString(), margin + 6, yPosition + 8);
      
      // Título do passo
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.text(title, margin + 20, yPosition + 8);
      
      // Descrição
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(description, contentWidth - 25);
      doc.text(lines, margin + 20, yPosition + 15);
      
      yPosition += Math.max(20, lines.length * 4 + 12);
    };

    // === CAPA DO DOCUMENTO ===
    
    // Fundo gradiente simulado
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MÓDULO DE ÉTICA', pageWidth / 2, 35, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Guia Completo do Usuário', pageWidth / 2, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Sistema GRC Controller', pageWidth / 2, 65, { align: 'center' });
    
    // Informações da versão
    yPosition = 100;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Versão:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('2.0 - Professional Edition', margin + 25, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Data:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), margin + 25, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Audiência:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('Administradores, CISO, Risk Managers, Compliance Officers', margin + 25, yPosition);
    
    // Caixa de destaque na capa
    yPosition += 30;
    addHighlightBox(
      '🎯 OBJETIVOS DESTE MANUAL',
      'Capacitar usuários para dominar todas as funcionalidades do módulo de ética, desde configuração inicial até casos complexos de investigação. Inclui exemplos práticos, casos de uso reais e melhores práticas de UX/UI.'
    );
    
    addHighlightBox(
      '📋 PRÉ-REQUISITOS',
      'Acesso ao sistema GRC Controller, permissões adequadas (Admin/CISO/Risk Manager), conhecimento básico de compliance ético e navegadores atualizados.'
    );
    
    // Nova página para índice
    doc.addPage();
    yPosition = margin;
    
    // ÍNDICE VISUAL
    
    const tocItems = [
      { num: '01', title: 'PRIMEIROS PASSOS', desc: 'Login, navegação e overview da interface', page: '3' },
      { num: '02', title: 'DASHBOARD EXECUTIVO', desc: 'KPIs, métricas e visão geral dos casos', page: '5' },
      { num: '03', title: 'GESTÃO DE CASOS', desc: 'Recebimento, triagem e acompanhamento', page: '8' },
      { num: '04', title: 'INVESTIGAÇÕES AVANÇADAS', desc: 'Planejamento, orçamento e metodologias', page: '12' },
      { num: '05', title: 'EVIDÊNCIAS FORENSES', desc: 'Coleta, preservação e chain of custody', page: '16' },
      { num: '06', title: 'AÇÕES CORRETIVAS', desc: 'Implementação e medição de eficácia', page: '20' },
      { num: '07', title: 'COMPLIANCE REGULATÓRIO', desc: 'Notificações automáticas para órgãos', page: '24' },
      { num: '08', title: 'COMUNICAÇÕES', desc: 'Templates, métricas e automações', page: '28' },
      { num: '09', title: 'CONFIGURAÇÕES AVANÇADAS', desc: 'SLA, integrações e personalizações', page: '32' },
      { num: '10', title: 'CASOS DE USO REAIS', desc: 'Exemplos práticos com passo a passo', page: '36' },
      { num: '11', title: 'MELHORES PRÁTICAS', desc: 'UX/UI, performance e otimizações', page: '42' },
      { num: '12', title: 'TROUBLESHOOTING', desc: 'Problemas comuns e soluções', page: '46' }
    ];
    
    tocItems.forEach(item => {
      addPageIfNeeded(25);
      
      // Número destacado
      doc.setFillColor(...primaryColor);
      doc.rect(margin, yPosition, 15, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(item.num, margin + 7.5, yPosition + 8, { align: 'center' });
      
      // Título
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.text(item.title, margin + 20, yPosition + 6);
      
      // Descrição
      doc.setTextColor(...grayColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(item.desc, margin + 20, yPosition + 11);
      
      // Página
      doc.setTextColor(0, 0, 0);
      doc.text(`Pág. ${item.page}`, pageWidth - margin - 15, yPosition + 8);
      
      yPosition += 18;
    });

    doc.addPage();
    yPosition = margin;
    
    // ===== CAPÍTULO 1: PRIMEIROS PASSOS =====
    
    
    
    addStep(1, 'Navegue até o Menu Principal', 'No painel esquerdo do sistema, localize e clique no ícone "Ética" (shield/escudo azul).');
    addStep(2, 'Verificar Permissões', 'Certifique-se de ter role adequado: Admin, CISO, Risk Manager ou Compliance Officer.');
    addStep(3, 'Carregamento dos Dados', 'O sistema carrega automaticamente dados do seu tenant. Aguarde a sincronização.');
    
    addHighlightBox(
      '💡 DICA PRO',
      'Use Ctrl+Alt+E como atalho rápido para acessar o módulo de qualquer tela do sistema.'
    );
    
    
    
    // Seção visual da interface
    
    
    
    
    
    addStep(1, 'Vá para Configurações', 'Clique na aba "Configurações" para setup inicial.');
    addStep(2, 'Configure SLA', 'Defina prazos: Confirmação (24h), Investigação (5 dias), Resolução (30 dias).');
    addStep(3, 'Templates de E-mail', 'Personalize mensagens automáticas mantendo variáveis {{PROTOCOLO}}, {{TITULO}}.');
    addStep(4, 'Integrações', 'Configure SMTP para e-mails automáticos (opcional: Slack, SharePoint).');
    addStep(5, 'Teste o Sistema', 'Crie um caso fictício para validar fluxo completo.');
    
    // ===== CAPÍTULO 2: DASHBOARD EXECUTIVO =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 25;
    
    
    
    
    addHighlightBox(
      '📈 MÉTRICAS ESSENCIAIS',
      'Estes 6 KPIs oferecem visão instantânea da saúde do programa ético: Total de casos, Em andamento, Investigando, Resolvidos, Anônimas, Críticas.'
    );
    
    // Explicação detalhada de cada KPI
    const kpis = [
      { 
        name: 'TOTAL', 
        icon: '🛡️', 
        desc: 'Todos os casos recebidos desde implementação',
        action: 'Clique para filtrar todos os casos na aba "Casos"',
        benchmark: 'Varia por organização. Média: 2-5 casos/1000 funcionários/ano'
      },
      { 
        name: 'EM ANDAMENTO', 
        icon: '⏳', 
        desc: 'Status: open, triaging, investigating, in_review',
        action: 'Monitor crítico - alta quantidade indica gargalo processual',
        benchmark: 'Ideal: <30% do total de casos'
      },
      { 
        name: 'INVESTIGANDO', 
        icon: '🔍', 
        desc: 'Casos em investigação ativa com recursos alocados',
        action: 'Acompanhe orçamento e cronograma na aba "Investigações"',
        benchmark: 'Tempo médio: 15-45 dias dependendo da complexidade'
      },
      { 
        name: 'RESOLVIDOS', 
        icon: '✅', 
        desc: 'Casos finalizados com resolução documentada',
        action: 'Analise patterns para prevenção proativa',
        benchmark: 'Meta: >80% taxa de resolução'
      },
      { 
        name: 'ANÔNIMAS', 
        icon: '👤', 
        desc: 'Denúncias sem identificação do reportante',
        action: 'Requer investigação mais cuidadosa e criativa',
        benchmark: '40-60% das denúncias tipicamente são anônimas'
      },
      { 
        name: 'CRÍTICAS', 
        icon: '🚨', 
        desc: 'IA classificou como alto impacto/risco',
        action: 'Prioridade máxima - pode requerer notificação regulatória',
        benchmark: 'Devem ser <10% do total'
      }
    ];
    
    kpis.forEach((kpi, index) => {
      addPageIfNeeded(25);
      
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPosition, contentWidth, 20, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${kpi.icon} ${kpi.name}`, margin + 5, yPosition + 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(kpi.desc, margin + 5, yPosition + 13);
      
      doc.setTextColor(...accentColor);
      doc.setFont('helvetica', 'italic');
      doc.text(`💡 ${kpi.action}`, margin + 5, yPosition + 17);
      
      yPosition += 25;
    });
    
    
    
    addStep(1, 'Taxa de Resolução', 'Percentual de casos resolvidos vs total. Meta organizacional típica: >80%. Indica eficácia do programa.');
    addStep(2, 'Conformidade SLA', 'Percentual dentro dos prazos definidos. Meta: >95%. Indica disciplina processual.');
    addStep(3, 'Violações SLA', 'Casos com prazo vencido. Alerta vermelho crítico. Meta: <5% dos casos ativos.');
    
    
    
    addHighlightBox(
      '📊 DENÚNCIAS POR CATEGORIA',
      'Distribuição visual por tipo: assédio, fraude, conflito_interesse, discriminação, retaliação, etc. CLIQUE em qualquer fatia para aplicar filtro automático na aba Casos.'
    );
    
    addHighlightBox(
      '📊 DENÚNCIAS POR SEVERIDADE', 
      'Classificação de impacto com cores: 🟢 Baixa, 🟡 Média, 🟠 Alta, 🔴 Crítica. Sistema de IA classifica automaticamente baseado em keywords e contexto.'
    );
    
    // ===== CASO DE USO PRÁTICO: DASHBOARD =====
    
    
    
    addStep(1, 'Acesse Dashboard', 'Segunda-feira, 09h00: Abra o módulo e observe KPIs principais.');
    addStep(2, 'Identifique Anomalias', 'Taxa de resolução caiu para 70% (abaixo da meta 80%). Violações SLA aumentaram.');
    addStep(3, 'Drill Down', 'Clique no gráfico "Por Categoria" - fraude financeira representa 40% dos casos novos.');
    addStep(4, 'Ação Imediata', 'Vá para aba "Casos", filtre por "fraud" e identifique gargalos específicos.');
    addStep(5, 'Report Executivo', 'Documente achados e proponha ações: mais recursos para investigações financeiras.');
    
    addHighlightBox(
      '⚡ RESULTADO ESPERADO',
      'Em 15 minutos você tem insights acionáveis para decisões executivas, demonstrando valor do programa ético com dados concretos.'
    );

    // ===== CAPÍTULO 3: GESTÃO DE CASOS =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 25;
    
    
    
    
    addHighlightBox(
      '🔍 BUSCA AVANÇADA',
      'O campo de busca suporta: números de protocolo (ETH-2025-001), palavras-chave no título, texto na descrição, nome de pessoas envolvidas.'
    );
    
    addStep(1, 'Campo de Busca Universal', 'Digite qualquer termo. Sistema busca em protocolo, título, descrição simultaneamente.');
    addStep(2, 'Filtro por Status', 'Dropdown com todas as opções: Open, Triaging, Investigating, In Review, Resolved, Closed.');
    addStep(3, 'Filtro por Severidade', 'Low (verde), Medium (amarelo), High (laranja), Critical (vermelho).');
    addStep(4, 'Botão Atualizar', 'Aplica filtros e recarrega dados. Loading state mostra progresso.');
    
    
    
    // Detalhamento visual dos cards
    
    
    
    
    const abas = [
      {
        name: 'DETALHES',
        icon: '📝',
        desc: 'Informações básicas, descrição completa, dados do denunciante (se não anônimo)',
        practical: 'Use para entender contexto inicial e determinar próximos passos'
      },
      {
        name: 'INVESTIGAÇÃO', 
        icon: '🔍',
        desc: 'Plano de investigação associado, metodologia escolhida, cronograma',
        practical: 'Vincule a um plano existente ou crie novo diretamente'
      },
      {
        name: 'EVIDÊNCIAS',
        icon: '📎', 
        desc: 'Documentos anexados, fotos, arquivos, chain of custody completa',
        practical: 'Upload direto de evidências com hash automático SHA-256'
      },
      {
        name: 'AÇÕES',
        icon: '⚡',
        desc: 'Medidas corretivas implementadas ou planejadas, status de implementação',
        practical: 'Crie ações corretivas específicas para este caso'
      },
      {
        name: 'REGULATÓRIO',
        icon: '📋',
        desc: 'Notificações para órgãos governamentais (SEC, OSHA, etc.)',
        practical: 'Sistema identifica automaticamente necessidade de notificação'
      },
      {
        name: 'RESOLUÇÃO',
        icon: '✅',
        desc: 'Conclusão final, lessons learned, medidas preventivas',
        practical: 'Documente resolução para consultas futuras e analytics'
      },
      {
        name: 'TIMELINE',
        icon: '📅',
        desc: 'Histórico cronológico completo de todas as atividades',
        practical: 'Auditoria completa - cada ação fica registrada'
      },
      {
        name: 'INFO',
        icon: 'ℹ️',
        desc: 'Metadados, classificação de IA, scores de risco calculados',
        practical: 'Informações técnicas para análises avançadas'
      }
    ];
    
    abas.forEach(aba => {
      addPageIfNeeded(20);
      
      doc.setFillColor(252, 250, 248);
      doc.rect(margin, yPosition, contentWidth, 18, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${aba.icon} ${aba.name}`, margin + 5, yPosition + 7);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(aba.desc, margin + 5, yPosition + 11);
      
      doc.setTextColor(...accentColor);
      doc.setFont('helvetica', 'italic');
      doc.text(`💡 ${aba.practical}`, margin + 5, yPosition + 15);
      
      yPosition += 22;
    });
    
    // ===== CASO PRÁTICO DETALHADO: GESTÃO DE CASO =====
    
    
    
    addStep(1, 'Recebimento Inicial', 'Caso ETH-2025-004 criado automaticamente. IA classifica como "High severity" baseado em keywords.');
    addStep(2, 'Triagem Rápida', 'Acesse aba "Detalhes" - leia descrição completa. Identifique departamento e pessoas envolvidas.');
    addStep(3, 'Aba Investigação', 'Clique "Criar Plano" → Selecione tipo "Completa" → Aloque R$ 10.000 → 30 dias prazo.');
    addStep(4, 'Coleta de Evidências', 'Aba "Evidências" → Upload e-mails, gravações, documentos HR → Sistema gera hash automático.');
    addStep(5, 'Ações Imediatas', 'Aba "Ações" → Crie "Afastamento temporário do supervisor" → Status: Em Progresso.');
    addStep(6, 'Check Regulatório', 'Aba "Regulatório" → Sistema sugere notificação OSHA por ambiente hostil → Avalie necessidade.');
    addStep(7, 'Timeline Completa', 'Aba "Timeline" mostra todos os passos registrados automaticamente.');
    
    addHighlightBox(
      '⚡ RESULTADO OBTIDO',
      'Em 45 minutos você estruturou investigação completa, protegeu evidências, iniciou ações e avaliou aspectos regulatórios. Caso está sob controle total.'
    );
    
    // ===== CAPÍTULO 4: MELHORES PRÁTICAS E TROUBLESHOOTING =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 25;
    
    
    
    addStep(1, 'Use Filtros Inteligentemente', 'Sempre filtre por período e status para reduzir carga de dados. Sistema carrega mais rápido com datasets menores.');
    addStep(2, 'Mantenha Sessão Ativa', 'Renove login a cada 4 horas. Sessões expiradas causam erros de permissão e perda de progresso.');
    addStep(3, 'One Tab Policy', 'Use apenas uma aba do módulo por vez. Múltiplas instâncias podem causar conflitos de sincronização.');
    
    
    addStep(1, 'Evidências Sensíveis', 'Sempre use proteção "Legal Privilege" para comunicações com advogados. Marque "Confidencial" para dados pessoais.');
    addStep(2, 'Chain of Custody', 'Documente TODA transferência de evidências. Quebra na cadeia invalida evidência legalmente.');
    addStep(3, 'Backup Regular', 'Execute backup semanal via aba Configurações. Casos críticos requerem múltiplas cópias.');
    
    
    addStep(1, 'Hover para Insights', 'Passe mouse sobre elementos para revelar tooltips com informações adicionais.');
    addStep(2, 'Cores Têm Significado', '🔴 Crítico/Urgente, 🟠 Alto/Atenção, 🟡 Médio/Monitor, 🟢 Baixo/OK. Use para priorização visual.');
    addStep(3, 'Atalhos de Teclado', 'Tab para navegar campos, Enter para salvar, Esc para cancelar diálogos.');
    
    
    const problemas = [
      {
        problema: 'Sistema lento ou travando',
        causa: 'Cache do navegador, muitos filtros ativos',
        solucao: 'Ctrl+Shift+Delete para limpar cache. Remova filtros desnecessários.',
        prevencao: 'Limite período de busca a 90 dias. Use filtros específicos.'
      },
      {
        problema: '"Acesso Negado" ao carregar dados',
        causa: 'Sessão expirada, role insuficiente',
        solucao: 'Faça logout/login. Verifique permissões com administrador.',
        prevencao: 'Renove sessão preventivamente. Não deixe sistema inativo >4h.'
      },
      {
        problema: 'E-mails automáticos não enviando',
        causa: 'Configuração SMTP, firewall corporativo',
        solucao: 'Teste configuração em Configurações > Integrações. Contate TI.',
        prevencao: 'Configure servidor backup. Monitor daily email status.'
      },
      {
        problema: 'Upload de evidências falha',
        causa: 'Arquivo muito grande, formato não suportado',
        solucao: 'Comprima arquivo <10MB. Use PDF, DOCX, JPG, PNG.',
        prevencao: 'Otimize arquivos antes do upload. Prefira PDF para documentos.'
      },
      {
        problema: 'Dados não sincronizando entre abas',
        causa: 'Múltiplas sessões, problemas de rede',
        solucao: 'Feche outras abas do módulo. Refresh com F5.',
        prevencao: 'Use uma sessão por vez. Conexão estável mandatória.'
      }
    ];
    
    problemas.forEach(prob => {
      addPageIfNeeded(30);
      
      // Problema em destaque
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(248, 113, 113);
      doc.rect(margin, yPosition, contentWidth, 25, 'FD');
      
      doc.setTextColor(185, 28, 28);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`⚠️ PROBLEMA: ${prob.problema}`, margin + 5, yPosition + 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Causa: ${prob.causa}`, margin + 5, yPosition + 13);
      
      doc.setTextColor(5, 150, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(`✅ Solução: ${prob.solucao}`, margin + 5, yPosition + 17);
      
      doc.setTextColor(59, 130, 246);
      doc.setFont('helvetica', 'italic');
      doc.text(`💡 Prevenção: ${prob.prevencao}`, margin + 5, yPosition + 21);
      
      yPosition += 30;
    });
    
    // ===== CASES DE SUCESSO FINAIS =====
    
    
    
    addHighlightBox(
      '🏢 EMPRESA: TechGlobal Corp',
      'Contexto: 15.000 funcionários, 22 países, IPO planejada para 2025. Necessitava demonstrar governança ética robusta para investidores.'
    );
    
    
    
    
    addHighlightBox(
      '💬 DEPOIMENTO CEO',
      '"O módulo transformou nossa capacidade de resposta ética. Investidores ficaram impressionados com nossa maturidade em governança. Foi decisivo para o IPO." - Sarah Chen, CEO'
    );
    
    // RODAPÉ E FINALIZAÇÃO
    
    
    
    
    addHighlightBox(
      '📚 RECURSOS ADICIONAIS',
      'Documentação técnica completa, vídeos tutoriais e webinars mensais disponíveis no portal de conhecimento: https://knowledge.grc-controller.com'
    );
    // === RODAPÉ PROFISSIONAL ===
    
    // Adicionar rodapé em todas as páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Linha divisória no rodapé
      doc.setDrawColor(...grayColor);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Informações do rodapé
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.setFont('helvetica', 'normal');
      
      // Esquerda
      doc.text('GRC Controller - Módulo de Ética © 2025', margin, pageHeight - 12);
      doc.text('Sistema Profissional de Gestão de Compliance Ético', margin, pageHeight - 8);
      
      // Centro
      doc.text(`Versão 2.0 Professional`, pageWidth / 2, pageHeight - 12, { align: 'center' });
      doc.text(`Documento Confidencial`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      
      // Direita
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
      doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    // === SALVAR ARQUIVO ===
    const fileName = `GRC-Modulo-Etica-Manual-Profissional-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('📚 Manual profissional baixado com sucesso! O PDF contém formatação visual moderna, casos de uso reais e instruções detalhadas.');
  };

  const renderDashboardTab = () => {
    console.log('Rendering Dashboard Tab - Metrics:', metrics);
    return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{metrics?.total_reports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{metrics?.open_reports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Investigando</p>
                <p className="text-2xl font-bold">{metrics?.investigating_reports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold">{metrics?.resolved_reports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Anônimas</p>
                <p className="text-2xl font-bold">{metrics?.anonymous_reports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold">{metrics?.critical_reports || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas dos Submódulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Search className="h-4 w-4 mr-2 text-blue-500" />
              Investigações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ativas:</span>
                <span className="font-semibold">{investigationPlans?.filter(p => p.status === 'active').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Concluídas:</span>
                <span className="font-semibold">{investigationPlans?.filter(p => p.status === 'completed').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-semibold text-blue-600">{investigationPlans?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <FileText className="h-4 w-4 mr-2 text-green-500" />
              Evidências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ativas:</span>
                <span className="font-semibold">{evidenceItems?.filter(e => e.preservation_status === 'active').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Arquivadas:</span>
                <span className="font-semibold">{evidenceItems?.filter(e => e.preservation_status === 'archived').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-semibold text-green-600">{evidenceItems?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-500" />
              Ações Corretivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Em Progresso:</span>
                <span className="font-semibold">{correctiveActions?.filter(a => a.status === 'in_progress').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Concluídas:</span>
                <span className="font-semibold">{correctiveActions?.filter(a => a.status === 'completed').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-semibold text-orange-600">{correctiveActions?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Bell className="h-4 w-4 mr-2 text-purple-500" />
              Regulatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pendentes:</span>
                <span className="font-semibold">{regulatoryNotifications?.filter(n => n.status === 'pending').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Enviadas:</span>
                <span className="font-semibold">{regulatoryNotifications?.filter(n => n.status === 'sent').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-semibold text-purple-600">{regulatoryNotifications?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleDownloadDocumentation} className="flex-1">
          <BookOpen className="w-4 h-4 mr-2" />
          Documentação
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Relatório Executivo
        </Button>
      </div>

      {/* Alertas e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas Importantes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.sla_breach_reports > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Clock className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {metrics.sla_breach_reports} caso(s) com SLA vencido
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300">
                      Requer atenção imediata
                    </p>
                  </div>
                </div>
              )}
              
              {metrics?.critical_reports > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      {metrics.critical_reports} caso(s) crítico(s)
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      Alta prioridade
                    </p>
                  </div>
                </div>
              )}

              {evidenceItems?.filter(e => e.legal_hold).length > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {evidenceItems.filter(e => e.legal_hold).length} evidência(s) em legal hold
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Não podem ser alteradas
                    </p>
                  </div>
                </div>
              )}

              {(!metrics?.sla_breach_reports || metrics.sla_breach_reports === 0) && 
               (!metrics?.critical_reports || metrics.critical_reports === 0) &&
               (!evidenceItems?.filter(e => e.legal_hold).length || evidenceItems.filter(e => e.legal_hold).length === 0) && (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports?.slice(0, 5).map((report, index) => (
                <div key={report.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    {report.status === 'resolved' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : report.severity === 'critical' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <User className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {report.title || `Caso ${report.protocol_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.protocol_number} • {report.status === 'resolved' ? 'Resolvido' : 'Em andamento'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: getSeverityColor(report.severity),
                        color: getSeverityColor(report.severity)
                      }}
                    >
                      {report.severity === 'critical' ? 'Crítico' : 
                       report.severity === 'high' ? 'Alto' : 
                       report.severity === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-6">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Denúncias por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.reports_by_category && Object.keys(metrics.reports_by_category).length > 0 ? (
                Object.entries(metrics.reports_by_category).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ 
                            width: `${((count as number) / (metrics?.total_reports || 1)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Sem dados de categoria disponíveis</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Denúncias por Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.reports_by_severity && Object.keys(metrics.reports_by_severity).length > 0 ? (
                Object.entries(metrics.reports_by_severity).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center">
                    <span className="text-sm capitalize">
                      {severity === 'critical' ? 'Crítico' : 
                       severity === 'high' ? 'Alto' : 
                       severity === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full"
                          style={{ 
                            backgroundColor: getSeverityColor(severity),
                            width: `${((count as number) / (metrics?.total_reports || 1)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Sem dados de severidade disponíveis</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{metrics?.resolution_rate?.toFixed(1) || 0}%</div>
              <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{metrics?.sla_compliance_rate?.toFixed(1) || 0}%</div>
              <p className="text-sm text-muted-foreground">Conformidade SLA</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{metrics?.sla_breach_reports || 0}</div>
              <p className="text-sm text-muted-foreground">Violações SLA</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    );
  };

  const renderCasesTab = () => {
    console.log('Rendering Cases Tab - Reports:', reports?.length);
    return (
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Protocolo, título, descrição..."
                  value={filters.search_term || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    search_term: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={filters.statuses?.[0] || undefined} 
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    statuses: value ? [value] : undefined
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="triaging">Triagem</SelectItem>
                    <SelectItem value="investigating">Investigando</SelectItem>
                    <SelectItem value="in_review">Em Revisão</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="severity">Severidade</Label>
                <Select 
                  value={filters.severities?.[0] || undefined} 
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    severities: value ? [value] : undefined
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as severidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={loadDashboardData} className="w-full">
                  Atualizar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    limit: 50
                  })} 
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Casos */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando casos...</p>
              </CardContent>
            </Card>
          ) : reports && reports.length > 0 ? (
            reports.map((report) => {
              try {
                return (
                  <EthicsExpandableCard
                    key={report.id}
                    report={report}
                    onUpdate={openUpdateDialog}
                    getStatusColor={getStatusColor}
                    getSeverityColor={getSeverityColor}
                  />
                );
              } catch (error) {
                console.error('Error rendering report card:', error);
                return (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <p className="text-red-500">Erro ao renderizar caso {report.protocol_number}</p>
                    </CardContent>
                  </Card>
                );
              }
            })
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum caso encontrado</h3>
                <p className="text-muted-foreground">
                  {reports ? 'Não há casos de ética que correspondam aos filtros selecionados.' : 'Erro ao carregar casos.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderInvestigationsTab = () => {
    console.log('Rendering Investigations Tab - Plans:', investigationPlans?.length);
    try {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Planos de Investigação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvestigationPlanManager 
                investigationPlans={investigationPlans || []}
                onUpdate={loadEnterpriseData}
              />
            </CardContent>
          </Card>
        </div>
      );
    } catch (error) {
      console.error('Error rendering investigations tab:', error);
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Erro ao carregar investigações</p>
          </CardContent>
        </Card>
      );
    }
  };

  const renderEvidenceTab = () => {
    console.log('Rendering Evidence Tab - Items:', evidenceItems?.length);
    try {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Gestão de Evidências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EvidenceManager 
                evidenceItems={evidenceItems || []}
                onUpdate={loadEnterpriseData}
              />
            </CardContent>
          </Card>
        </div>
      );
    } catch (error) {
      console.error('Error rendering evidence tab:', error);
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Erro ao carregar evidências</p>
          </CardContent>
        </Card>
      );
    }
  };

  const renderActionsTab = () => {
    console.log('Rendering Actions Tab - Actions:', correctiveActions?.length);
    try {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Ações Corretivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CorrectiveActionManager 
                correctiveActions={correctiveActions || []}
                onUpdate={loadEnterpriseData}
              />
            </CardContent>
          </Card>
        </div>
      );
    } catch (error) {
      console.error('Error rendering actions tab:', error);
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Erro ao carregar ações corretivas</p>
          </CardContent>
        </Card>
      );
    }
  };

  const renderRegulatoryTab = () => {
    console.log('Rendering Regulatory Tab - Notifications:', regulatoryNotifications?.length);
    try {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificações Regulamentares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegulatoryNotificationManager 
                notifications={regulatoryNotifications || []}
                onUpdate={loadEnterpriseData}
              />
            </CardContent>
          </Card>
        </div>
      );
    } catch (error) {
      console.error('Error rendering regulatory tab:', error);
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Erro ao carregar notificações</p>
          </CardContent>
        </Card>
      );
    }
  };

  const renderConfigTab = () => {
    console.log('Rendering Config Tab');
    try {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SLA e Prazos</h3>
                  <div className="space-y-2">
                    <Label>Prazo para Confirmação (horas)</Label>
                    <Input type="number" defaultValue={24} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo para Investigação (dias)</Label>
                    <Input type="number" defaultValue={5} />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo para Resolução (dias)</Label>
                    <Input type="number" defaultValue={30} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notificações</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="email-notifications" />
                      <Label htmlFor="email-notifications">E-mails automáticos</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="sla-alerts" />
                      <Label htmlFor="sla-alerts">Alertas de SLA</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="regulatory-notifications" />
                      <Label htmlFor="regulatory-notifications">Notificações regulamentares</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } catch (error) {
      console.error('Error rendering config tab:', error);
      return (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Erro ao carregar configurações</p>
          </CardContent>
        </Card>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('EthicsManagementDashboard render - activeTab:', activeTab, 'loading:', loading);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Canal de Ética</h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de denúncias e investigações éticas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Caso
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cases">Casos</TabsTrigger>
          <TabsTrigger value="investigations">Investigações</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatório</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {renderDashboardTab()}
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          {renderCasesTab()}
        </TabsContent>

        <TabsContent value="investigations" className="space-y-4">
          {renderInvestigationsTab()}
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          {renderEvidenceTab()}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {renderActionsTab()}
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-4">
          {renderRegulatoryTab()}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {renderConfigTab()}
        </TabsContent>
      </Tabs>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Caso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="update-status">Status</Label>
              <Select
                value={updateData.status}
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="triaging">Triagem</SelectItem>
                  <SelectItem value="investigating">Investigando</SelectItem>
                  <SelectItem value="in_review">Em Revisão</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="update-priority">Prioridade</Label>
              <Select
                value={updateData.priority}
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="update-resolution">Resolução</Label>
              <Textarea
                id="update-resolution"
                placeholder="Descreva a resolução do caso..."
                value={updateData.resolution}
                onChange={(e) => setUpdateData(prev => ({ ...prev, resolution: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => selectedReport && handleReportUpdate(selectedReport, updateData)}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EthicsManagementDashboard;

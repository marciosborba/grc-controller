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
    
    // Configurar fontes para caracteres especiais
    doc.setFont('helvetica');

    // Função para adicionar nova página se necessário com melhor espaçamento
    const addPageIfNeeded = (additionalHeight = 0) => {
      if (yPosition + additionalHeight > pageHeight - 50) { // Mais espaço para rodapé
        doc.addPage();
        addHeader();
        yPosition = margin + 35; // Mais espaço no topo
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

    // Função para adicionar texto com quebra automática e melhor espaçamento
    const addText = (text: string, fontSize = 9, isBold = false, color = [0, 0, 0], indent = 0, lineSpacing = 1.2) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      const totalHeight = lines.length * fontSize * lineSpacing;
      addPageIfNeeded(totalHeight + 8);
      
      for (let i = 0; i < lines.length; i++) {
        doc.text(lines[i], margin + indent, yPosition + (i * fontSize * lineSpacing));
      }
      yPosition += totalHeight + 8;
    };

    // Função para adicionar título principal com melhor espaçamento
    const addTitle = (text: string, color = primaryColor) => {
      addPageIfNeeded(35);
      yPosition += 8; // Espaço antes do título
      addColorBox(color, 2);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(text, margin, yPosition);
      yPosition += 20;
    };

    // Função para adicionar subtítulo com melhor formatação
    const addSubTitle = (text: string, color = accentColor) => {
      addPageIfNeeded(20);
      yPosition += 6; // Espaço antes do subtítulo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(text, margin, yPosition);
      yPosition += 15;
    };

    // Função para adicionar caixa de destaque com melhor formatação
    const addHighlightBox = (title: string, content: string, bgColor = [248, 250, 252]) => {
      const titleLines = doc.splitTextToSize(title, contentWidth - 15);
      const contentLines = doc.splitTextToSize(content, contentWidth - 15);
      const boxHeight = (titleLines.length * 5) + (contentLines.length * 4.5) + 18;
      
      addPageIfNeeded(boxHeight + 12);
      
      doc.setFillColor(...bgColor);
      doc.setDrawColor(...grayColor);
      doc.rect(margin, yPosition, contentWidth, boxHeight, 'FD');
      
      // Título da caixa
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(titleLines, margin + 8, yPosition + 10);
      
      // Conteúdo da caixa
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8);
      const contentY = yPosition + 10 + (titleLines.length * 5) + 4;
      doc.text(contentLines, margin + 8, contentY);
      
      yPosition += boxHeight + 12;
    };

    // Função para adicionar passo numerado com melhor formatação
    const addStep = (stepNumber: number, title: string, description: string) => {
      const titleLines = doc.splitTextToSize(title, contentWidth - 25);
      const descLines = doc.splitTextToSize(description, contentWidth - 25);
      const stepHeight = (titleLines.length * 4) + (descLines.length * 3.5) + 10;
      
      addPageIfNeeded(stepHeight + 5);
      
      // Círculo numerado menor
      doc.setFillColor(...primaryColor);
      doc.circle(margin + 6, yPosition + 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const numText = stepNumber.toString();
      doc.text(numText, stepNumber < 10 ? margin + 4.5 : margin + 3.5, yPosition + 6);
      
      // Título do passo
      doc.setTextColor(...primaryColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(titleLines, margin + 16, yPosition + 6);
      
      // Descrição
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const descY = yPosition + 6 + (titleLines.length * 4) + 2;
      doc.text(descLines, margin + 16, descY);
      
      yPosition += stepHeight + 8;
    };

    // === CAPA DO DOCUMENTO ===
    
    // Fundo gradiente simulado
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CANAL DE ETICA', pageWidth / 2, 35, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Manual do Usuario - Sistema GRC', pageWidth / 2, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Gestao Completa de Denuncias e Investigacoes', pageWidth / 2, 65, { align: 'center' });
    
    // Informações da versão
    yPosition = 100;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Versao:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('3.0 - Edicao Corporativa', margin + 25, yPosition);
    
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
    doc.text('Publico:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('Equipes de Compliance, Auditoria e Gestao de Riscos', margin + 25, yPosition);
    
    // Caixa de destaque na capa
    yPosition += 30;
    addHighlightBox(
      'OBJETIVO DO MANUAL',
      'Este manual oferece orientacao completa sobre o uso do modulo Canal de Etica, incluindo recebimento de denuncias, gestao de investigacoes, coleta de evidencias e implementacao de acoes corretivas.'
    );
    
    addHighlightBox(
      'PRE-REQUISITOS',
      'Acesso ao sistema GRC Controller com permissoes adequadas. Conhecimento basico de processos de compliance etico e investigacao corporativa.'
    );
    
    // Nova página para índice
    doc.addPage();
    yPosition = margin;
    
    // ÍNDICE VISUAL
    
    const tocItems = [
      { num: '01', title: 'VISAO GERAL', desc: 'Introducao ao modulo e navegacao basica', page: '3' },
      { num: '02', title: 'DASHBOARD PRINCIPAL', desc: 'KPIs, metricas e alertas importantes', page: '4' },
      { num: '03', title: 'GESTAO DE CASOS', desc: 'Recebimento, triagem e acompanhamento de denuncias', page: '6' },
      { num: '04', title: 'PLANOS DE INVESTIGACAO', desc: 'Criacao e gestao de investigacoes estruturadas', page: '8' },
      { num: '05', title: 'GESTAO DE EVIDENCIAS', desc: 'Coleta, preservacao e cadeia de custodia', page: '10' },
      { num: '06', title: 'ACOES CORRETIVAS', desc: 'Implementacao e monitoramento de medidas', page: '12' },
      { num: '07', title: 'NOTIFICACOES REGULATORIAS', desc: 'Comunicacao com orgaos fiscalizadores', page: '14' },
      { num: '08', title: 'CONFIGURACOES DO SISTEMA', desc: 'SLA, prazos e notificacoes automaticas', page: '16' },
      { num: '09', title: 'CASOS PRATICOS', desc: 'Exemplos reais de uso do sistema', page: '18' },
      { num: '10', title: 'SOLUCAO DE PROBLEMAS', desc: 'Troubleshooting e FAQ', page: '22' }
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
    
    // ===== CAPITULO 1: VISAO GERAL =====
    
    addTitle('1. VISAO GERAL DO MODULO', primaryColor);
    
    addText('O Canal de Etica e um modulo completo para gestao de denuncias e investigacoes corporativas. Ele permite receber, processar e acompanhar casos eticos de forma estruturada e transparente.');
    
    addSubTitle('1.1 Principais Funcionalidades');
    addStep(1, 'Dashboard Executivo', 'Visao geral com KPIs, metricas e alertas importantes para tomada de decisao rapida.');
    addStep(2, 'Gestao de Casos', 'Recebimento, triagem e acompanhamento completo de denuncias eticas.');
    addStep(3, 'Investigacoes Estruturadas', 'Criacao de planos de investigacao com metodologia e orcamento definidos.');
    addStep(4, 'Coleta de Evidencias', 'Sistema forensico para preservacao de provas com cadeia de custodia.');
    addStep(5, 'Acoes Corretivas', 'Implementacao e monitoramento de medidas preventivas e corretivas.');
    addStep(6, 'Compliance Regulatorio', 'Notificacoes automaticas para orgaos fiscalizadores quando necessario.');
    
    addSubTitle('1.2 Acesso ao Sistema');
    addText('Para acessar o modulo, navegue ate o menu lateral e clique em "Canal de Etica". Certifique-se de ter as permissoes adequadas: Admin, CISO, Risk Manager ou Compliance Officer.');
    
    addHighlightBox(
      'IMPORTANTE',
      'O sistema utiliza controle de acesso baseado em roles. Nem todas as funcionalidades estao disponiveis para todos os usuarios.'
    );
    
    // ===== CAPITULO 2: DASHBOARD PRINCIPAL =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('2. DASHBOARD PRINCIPAL', primaryColor);
    
    addText('O dashboard oferece uma visao executiva completa do programa de etica, apresentando metricas essenciais, alertas criticos e atividades recentes em uma unica tela.');
    
    addSubTitle('2.1 KPIs Principais');
    addText('O sistema apresenta 6 indicadores fundamentais:');
    
    addStep(1, 'Total de Casos', 'Numero total de denuncias recebidas no sistema desde a implementacao.');
    addStep(2, 'Em Andamento', 'Cases ativos em diferentes fases: aberto, triagem, investigacao, revisao.');
    addStep(3, 'Investigando', 'Casos em investigacao ativa com planos estruturados e recursos alocados.');
    addStep(4, 'Resolvidos', 'Cases finalizados com resolucao documentada e acoes implementadas.');
    addStep(5, 'Anonimas', 'Denuncias recebidas sem identificacao do denunciante.');
    addStep(6, 'Criticas', 'Cases classificados como alta prioridade pelo sistema de IA.');
    
    addSubTitle('2.2 Metricas dos Submodulos');
    addText('Cards adicionais mostram estatisticas detalhadas de cada modulo:');
    
    addHighlightBox(
      'INVESTIGACOES',
      'Mostra investigacoes ativas, concluidas e total. Permite avaliar a carga de trabalho da equipe investigativa.'
    );
    
    addHighlightBox(
      'EVIDENCIAS',
      'Controla evidencias ativas, arquivadas e total. Essencial para gestao forense e preservacao de provas.'
    );
    
    addHighlightBox(
      'ACOES CORRETIVAS',
      'Acompanha medidas em progresso, concluidas e total. Fundamental para demonstrar efetividade das respostas.'
    );
    
    addHighlightBox(
      'REGULATORIO',
      'Monitora notificacoes pendentes, enviadas e total. Critico para compliance com orgaos fiscalizadores.'
    );
    
    addSubTitle('2.3 Alertas e Atividades');
    addText('A secao de alertas destaca situacoes que requerem atencao imediata:');
    
    addStep(1, 'SLA Vencidos', 'Cases que ultrapassaram os prazos definidos e precisam de acao urgente.');
    addStep(2, 'Cases Criticos', 'Situacoes de alta prioridade que podem impactar a organizacao.');
    addStep(3, 'Legal Hold', 'Evidencias protegidas por ordem judicial que nao podem ser alteradas.');
    
    addText('A secao de atividade recente mostra os ultimos 5 casos com informacoes de status e severidade, facilitando o acompanhamento das situacoes mais atuais.');
    
    // ===== CAPITULO 3: GESTAO DE CASOS =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('3. GESTAO DE CASOS', primaryColor);
    
    addText('A aba Casos e o centro operacional do modulo, onde todas as denuncias sao gerenciadas desde o recebimento ate a resolucao final.');
    
    addSubTitle('3.1 Sistema de Filtros Avancados');
    addText('O sistema oferece filtros poderosos para localizacao rapida de casos:');
    
    addStep(1, 'Busca Universal', 'Digite numeros de protocolo (ETH-2025-001), palavras-chave do titulo ou conteudo da descricao. O sistema busca em todos os campos simultaneamente.');
    addStep(2, 'Filtro por Status', 'Selecione entre: Aberto, Triagem, Investigando, Em Revisao, Resolvido, Fechado. Cada status representa uma fase especifica do processo.');
    addStep(3, 'Filtro por Severidade', 'Classificacao automatica por IA: Baixa (verde), Media (amarelo), Alta (laranja), Critica (vermelho). Facilita priorizacao.');
    addStep(4, 'Botao Limpar Filtros', 'Restaura visualizacao completa removendo todas as restricoes aplicadas.');
    
    addSubTitle('3.2 Cards Expansiveis - Estrutura Completa');
    addText('Cada caso e apresentado em um card expansivel com 8 abas especializadas:');
    
    addHighlightBox(
      'ABA DETALHES',
      'Informacoes basicas do caso: protocolo, titulo, descricao, dados do denunciante (quando nao anonimo), data de criacao, status atual e classificacao de severidade.'
    );
    
    addHighlightBox(
      'ABA INVESTIGACAO',
      'Vinculacao com planos de investigacao estruturados. Permite criar novos planos ou associar a investigacoes existentes, definindo metodologia, orcamento e cronograma.'
    );
    
    addHighlightBox(
      'ABA EVIDENCIAS',
      'Sistema forensico completo para upload de documentos, fotos, emails, gravacoes. Cada evidencia recebe hash SHA-256 automatico e registro de cadeia de custodia.'
    );
    
    addHighlightBox(
      'ABA ACOES',
      'Gestao de medidas corretivas e preventivas. Permite criar, acompanhar e avaliar a eficacia das acoes implementadas em resposta ao caso.'
    );
    
    addHighlightBox(
      'ABA REGULATORIO',
      'Notificacoes obrigatorias para orgaos fiscalizadores. Sistema identifica automaticamente quando ha necessidade de comunicacao com autoridades.'
    );
    
    addHighlightBox(
      'ABA RESOLUCAO',
      'Documentacao da conclusao do caso, incluindo resumo da investigacao, medidas implementadas, lessons learned e recomendacoes preventivas.'
    );
    
    addHighlightBox(
      'ABA TIMELINE',
      'Historico cronologico completo de todas as atividades realizadas no caso. Cada acao fica permanentemente registrada para auditoria.'
    );
    
    addHighlightBox(
      'ABA INFO',
      'Metadados tecnicos, scores de risco calculados por IA, classificacoes automaticas e informacoes para analises avancadas.'
    );
    
    addSubTitle('3.3 Exemplo Pratico: Gestao de Caso de Assedio');
    addText('Cenario: Denuncia de assedio moral recebida anonimamente em 15/01/2025');
    
    addStep(1, 'Recepcao Automatica', 'Sistema cria caso ETH-2025-015 automaticamente. IA classifica como severidade ALTA baseado em palavras-chave detectadas.');
    addStep(2, 'Triagem Inicial', 'Acesse aba DETALHES: Leia descricao completa, identifique departamento envolvido (Vendas), possivel agressor (Gerente Regional).');
    addStep(3, 'Planejamento', 'Aba INVESTIGACAO: Clique "Criar Plano" > Tipo "Investigacao Completa" > Orcamento R$ 15.000 > Prazo 45 dias > Metodologia "Entrevistas + Analise Documental".');
    addStep(4, 'Coleta Imediata', 'Aba EVIDENCIAS: Upload emails corporativos, gravacoes de reunioes, avaliacoes de desempenho. Sistema gera hash para cada arquivo.');
    addStep(5, 'Protecao da Vitima', 'Aba ACOES: Criar "Realocacao temporaria da vitima" > Status "Em Progresso" > Responsavel "RH" > Prazo 48h.');
    addStep(6, 'Avaliacao Legal', 'Aba REGULATORIO: Sistema sugere notificacao ao Ministerio Publico do Trabalho. Avaliar necessidade com juridico.');
    addStep(7, 'Monitoramento', 'Aba TIMELINE: Acompanhar todas as acoes registradas cronologicamente.');
    
    addHighlightBox(
      'RESULTADO EM 60 MINUTOS',
      'Caso estruturado completamente: investigacao planejada, evidencias protegidas, vitima amparada, aspectos legais avaliados. Processo sob controle total.'
    );
    
    // ===== CAPITULO 4: PLANOS DE INVESTIGACAO =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('4. PLANOS DE INVESTIGACAO', primaryColor);
    
    addText('O modulo de investigacoes permite estruturar processos investigativos profissionais com metodologia definida, orcamento controlado e cronograma claro.');
    
    addSubTitle('4.1 Tipos de Investigacao');
    addStep(1, 'Investigacao Rapida', 'Para casos simples. Prazo 5-10 dias, orcamento ate R$ 5.000. Foco em entrevistas e analise documental basica.');
    addStep(2, 'Investigacao Completa', 'Para casos complexos. Prazo 30-60 dias, orcamento R$ 10.000-50.000. Inclui pericia tecnica, investigacao externa.');
    addStep(3, 'Investigacao Externa', 'Para casos criticos ou conflito de interesse. Empresa terceirizada, prazo 60-90 dias, orcamento acima R$ 50.000.');
    
    addSubTitle('4.2 Estrutura de um Plano');
    addHighlightBox(
      'METODOLOGIA',
      'Define abordagem investigativa: entrevistas, analise documental, pericia tecnica, investigacao digital, consultoria externa.'
    );
    
    addHighlightBox(
      'ORCAMENTO',
      'Controle financeiro detalhado: custos de pessoal interno, servicos externos, tecnologia, viagens, outros gastos operacionais.'
    );
    
    addHighlightBox(
      'CRONOGRAMA',
      'Timeline estruturada: fases da investigacao, marcos importantes, entregaveis esperados, datas criticas.'
    );
    
    addHighlightBox(
      'EQUIPE',
      'Definicao de responsaveis: investigador principal, especialistas tecnicos, apoio juridico, recursos externos.'
    );
    
    addSubTitle('4.3 Caso Pratico: Investigacao de Fraude Financeira');
    addText('Cenario: Suspeita de manipulacao de relatorios financeiros por controller da filial');
    
    addStep(1, 'Criacao do Plano', 'Tipo: Investigacao Completa > Metodologia: Auditoria Forense + Analise Digital > Orcamento: R$ 35.000 > Prazo: 45 dias');
    addStep(2, 'Equipe Definida', 'Investigador: Auditor Senior interno > Especialista: Perito contabil externo > Apoio: TI Forense > Juridico: Advogado trabalhista');
    addStep(3, 'Fases Estruturadas', 'Semana 1-2: Coleta documental > Semana 3-4: Entrevistas > Semana 5-6: Analise sistemas > Semana 7: Relatorio final');
    addStep(4, 'Controle Orcamentario', 'Auditoria externa: R$ 20.000 > Software forense: R$ 8.000 > Custos internos: R$ 7.000 > Total dentro do orcado');
    addStep(5, 'Entregaveis', 'Relatorio executivo > Evidencias organizadas > Recomendacoes de controle > Plano de acao corretiva');
    
    // ===== CAPITULO 5: GESTAO DE EVIDENCIAS =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('5. GESTAO DE EVIDENCIAS', primaryColor);
    
    addText('Sistema forensico profissional para coleta, preservacao e gestao de evidencias com cadeia de custodia completa e protecao juridica.');
    
    addSubTitle('5.1 Tipos de Evidencia Suportados');
    addStep(1, 'Documentos Digitais', 'PDF, DOCX, XLSX, PPT. Sistema gera hash SHA-256 automatico e preserva metadados originais.');
    addStep(2, 'Emails e Comunicacoes', 'Arquivos EML, PST, mensagens WhatsApp, Teams, Slack. Preserva headers completos e timestamps.');
    addStep(3, 'Midia Visual', 'Fotos JPG/PNG, videos MP4/AVI, gravacoes MP3/WAV. Validacao de integridade e analise de metadados EXIF.');
    addStep(4, 'Logs de Sistema', 'Arquivos JSON, XML, TXT de sistemas corporativos. Analise automatica de padroes suspeitos.');
    
    addSubTitle('5.2 Cadeia de Custodia Digital');
    addText('Cada evidencia recebe tratamento forensico completo:');
    
    addHighlightBox(
      'COLETA SEGURA',
      'Upload com verificacao de integridade, geracao automatica de hash criptografico, registro de data/hora e identificacao do coletor.'
    );
    
    addHighlightBox(
      'PRESERVACAO',
      'Armazenamento imutavel, backups redundantes, protecao contra alteracao, logs de acesso completos.'
    );
    
    addHighlightBox(
      'RASTREABILIDADE',
      'Historico completo de manuseio: quem acessou, quando, de onde, que acoes realizou. Auditoria total.'
    );
    
    addHighlightBox(
      'PROTECAO LEGAL',
      'Opcoes de Legal Hold (ordem judicial), privilegio advogado-cliente, dados pessoais sensiveis (LGPD).'
    );
    
    addSubTitle('5.3 Estados de Preservacao');
    addStep(1, 'ATIVA', 'Evidencia em investigacao ativa. Pode ser acessada pela equipe autorizada para analise.');
    addStep(2, 'ARQUIVADA', 'Investigacao concluida. Evidencia preservada por periodo de retencao definido (default: 7 anos).');
    addStep(3, 'LEGAL HOLD', 'Evidencia sob protecao judicial. Nao pode ser alterada ou destruida ate liberacao do tribunal.');
    addStep(4, 'DESTRUIDA', 'Evidencia eliminada apos periodo de retencao, conforme politica de dados da organizacao.');
    
    addSubTitle('5.4 Exemplo Pratico: Caso de Vazamento de Informacoes');
    addStep(1, 'Coleta Imediata', 'Upload de emails suspeitos (arquivo PST 2.3GB), logs de acesso ao sistema (JSON 45MB), prints de tela (PNG).');
    addStep(2, 'Verificacao Automatica', 'Sistema gera hashes: emails SHA-256:a1b2c3..., logs SHA-256:d4e5f6..., preserva metadados EXIF das imagens.');
    addStep(3, 'Classificacao Legal', 'Emails marcados "Privilegio Advogado-Cliente", logs "Acesso Restrito RH", prints "LGPD - Dados Pessoais".');
    addStep(4, 'Cadeia Documentada', 'Registro automatico: Coletado por João Silva (Auditor) em 20/01/2025 10:30, Hash verificado, Status: Ativa.');
    addStep(5, 'Protecao Garantida', 'Evidencias protegidas por 84 meses, backups em 3 locais geograficos, acesso apenas equipe investigativa.');
    
    // ===== CAPITULO 6: ACOES CORRETIVAS =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('6. ACOES CORRETIVAS E PREVENTIVAS', primaryColor);
    
    addText('Modulo especializado para implementacao, monitoramento e avaliacao de eficacia de medidas corretivas e preventivas derivadas de casos eticos.');
    
    addSubTitle('6.1 Tipos de Acoes');
    addStep(1, 'Acoes Imediatas', 'Medidas de protecao urgente: afastamento temporario, mudanca de setor, suspensao de acesso a sistemas.');
    addStep(2, 'Acoes Corretivas', 'Medidas para corrigir problemas identificados: treinamentos, mudancas de processo, disciplinares.');
    addStep(3, 'Acoes Preventivas', 'Medidas para evitar reincidencia: politicas, controles, monitoramento, campanhas de conscientizacao.');
    addStep(4, 'Acoes Sistemicas', 'Mudancas estruturais: reorganizacao, novos sistemas, culturas organizacionais.');
    
    addSubTitle('6.2 Estrutura de uma Acao');
    addHighlightBox(
      'DEFINICAO CLARA',
      'Descricao especifica da acao, objetivo esperado, resultado mensuravel, criterios de sucesso.'
    );
    
    addHighlightBox(
      'RESPONSABILIDADE',
      'Responsavel pela implementacao, equipe de apoio, stakeholders envolvidos, aprovadores necessarios.'
    );
    
    addHighlightBox(
      'CRONOGRAMA',
      'Data de inicio, marcos intermediarios, prazo final, dependencias criticas.'
    );
    
    addHighlightBox(
      'MEDICAO DE EFICACIA',
      'KPIs especificos, metodo de avaliacao, frequencia de revisao, criterios de aprovacao.'
    );
    
    addSubTitle('6.3 Status de Acompanhamento');
    addStep(1, 'PLANEJADA', 'Acao definida mas ainda nao iniciada. Aguardando aprovacao ou recursos.');
    addStep(2, 'EM PROGRESSO', 'Acao em implementacao ativa. Acompanhamento semanal do progresso.');
    addStep(3, 'CONCLUIDA', 'Acao implementada completamente. Aguardando avaliacao de eficacia.');
    addStep(4, 'EFICAZ', 'Acao concluida e comprovadamente eficaz. Objetivo atingido.');
    addStep(5, 'INEFICAZ', 'Acao nao atingiu objetivo esperado. Requer replanejamento ou substituicao.');
    
    addSubTitle('6.4 Caso Pratico: Programa Anti-Assedio');
    addText('Cenario: Implementacao de programa abrangente apos multiplos casos de assedio');
    
    addStep(1, 'Acao Imediata', 'Treinamento obrigatorio para gestores > Responsavel: RH > Prazo: 30 dias > Status: Em Progresso');
    addStep(2, 'Acao Corretiva', 'Revisao de politica de conduta > Responsavel: Juridico > Prazo: 45 dias > Status: Planejada');
    addStep(3, 'Acao Preventiva', 'Canal de denuncia anonimo > Responsavel: Compliance > Prazo: 60 dias > Status: Em Progresso');
    addStep(4, 'Medicao Eficacia', 'KPI: Reducao 50% em casos de assedio em 12 meses > Metrica: Numero de casos/trimestre');
    addStep(5, 'Resultado Obtido', 'Apos 6 meses: 73% reducao em casos, 95% dos gestores treinados, politica aprovada e divulgada');
    
    // ===== CAPITULO 7: NOTIFICACOES REGULATORIAS =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('7. NOTIFICACOES REGULATORIAS', primaryColor);
    
    addText('Sistema inteligente para identificacao automatica e gestao de notificacoes obrigatorias para orgaos fiscalizadores e autoridades competentes.');
    
    addSubTitle('7.1 Deteccao Automatica');
    addText('O sistema utiliza IA para identificar casos que requerem notificacao:');
    
    addStep(1, 'Assedio Sexual/Moral', 'Deteccao: palavras-chave especificas > Orgao: Ministerio Publico do Trabalho > Prazo: 48h');
    addStep(2, 'Discriminacao', 'Deteccao: indicadores de preconceito > Orgao: Ministerio da Justica > Prazo: 72h');
    addStep(3, 'Corrupcao/Suborno', 'Deteccao: transacoes suspeitas > Orgao: CGU/TCU > Prazo: 24h');
    addStep(4, 'Seguranca do Trabalho', 'Deteccao: acidentes/riscos > Orgao: Ministerio do Trabalho > Prazo: 24h');
    addStep(5, 'Fraude Financeira', 'Deteccao: manipulacao contabil > Orgao: CVM/Banco Central > Prazo: 24h');
    
    addSubTitle('7.2 Processo de Notificacao');
    addHighlightBox(
      'IDENTIFICACAO',
      'Sistema analisa automaticamente cada caso e identifica potencial necessidade de notificacao baseado em regulamentacoes vigentes.'
    );
    
    addHighlightBox(
      'PREPARACAO',
      'Geracao automatica de minuta de notificacao com dados essenciais: natureza do caso, envolvidos, evidencias, acoes tomadas.'
    );
    
    addHighlightBox(
      'REVISAO JURIDICA',
      'Notificacao preparada e enviada para aprovacao do juridico antes do envio oficial ao orgao competente.'
    );
    
    addHighlightBox(
      'ENVIO OFICIAL',
      'Transmissao atraves dos canais oficiais de cada orgao, com protocolo de recebimento e acompanhamento de prazos.'
    );
    
    addSubTitle('7.3 Status de Acompanhamento');
    addStep(1, 'IDENTIFICADA', 'Sistema detectou necessidade de notificacao. Aguardando preparacao da comunicacao.');
    addStep(2, 'PREPARANDO', 'Minuta em elaboracao com dados do caso e contexto legal necessario.');
    addStep(3, 'REVISAO JURIDICA', 'Notificacao sob analise do departamento juridico para aprovacao.');
    addStep(4, 'PENDENTE ENVIO', 'Aprovada pelo juridico. Aguardando transmissao oficial ao orgao.');
    addStep(5, 'ENVIADA', 'Notificacao transmitida oficialmente. Protocolo de recebimento obtido.');
    addStep(6, 'RESPONDIDA', 'Orgao fiscalizador respondeu a notificacao. Processo administrativo iniciado ou arquivado.');
    
    addSubTitle('7.4 Exemplo Pratico: Notificacao ao MPT');
    addStep(1, 'Deteccao Automatica', 'Caso ETH-2025-008 sobre assedio moral > IA detecta palavras "intimidacao", "humilhacao" > Sistema sugere notificacao MPT');
    addStep(2, 'Preparacao da Minuta', 'Sistema gera texto: "Comunicamos ocorrencia de possivel assedio moral envolvendo gestor e subordinado..."');
    addStep(3, 'Revisao Interna', 'Juridico revisa e aprova minuta, adicionando contexto sobre medidas ja implementadas pela empresa');
    addStep(4, 'Envio Oficial', 'Notificacao enviada via sistema PJe do MPT > Protocolo 2025.03.001234-5 > Prazo resposta: 30 dias');
    addStep(5, 'Acompanhamento', 'MPT arquiva caso reconhecendo adequacao das medidas tomadas pela empresa > Status: Respondida/Arquivada');
    
    // ===== CAPITULO 8: CONFIGURACOES DO SISTEMA =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('8. CONFIGURACOES DO SISTEMA', primaryColor);
    
    addText('Parametrizacao avancada do modulo para adequacao as especificidades organizacionais, incluindo SLA, prazos, notificacoes e integracoes.');
    
    addSubTitle('8.1 Gestao de SLA (Service Level Agreement)');
    addText('Definicao de prazos para cada fase do processo:');
    
    addStep(1, 'Confirmacao de Recebimento', 'Prazo padrao: 24 horas > Personalizavel: 1-72h > Trigger: Email automatico ao denunciante');
    addStep(2, 'Inicio da Investigacao', 'Prazo padrao: 5 dias uteis > Personalizavel: 1-15 dias > Trigger: Atribuicao de investigador');
    addStep(3, 'Resolucao do Caso', 'Prazo padrao: 30 dias corridos > Personalizavel: 7-90 dias > Trigger: Documentacao de conclusao');
    addStep(4, 'Implementacao de Acoes', 'Prazo padrao: 60 dias corridos > Personalizavel: 15-180 dias > Trigger: Validacao de eficacia');
    
    addSubTitle('8.2 Sistema de Notificacoes');
    addHighlightBox(
      'EMAIL AUTOMATICO',
      'Configuracao de SMTP corporativo para envio automatico de notificacoes de recebimento, status updates, lembretes de prazo.'
    );
    
    addHighlightBox(
      'ALERTAS DE SLA',
      'Notificacoes automaticas quando casos se aproximam do vencimento: 75% do prazo (alerta amarelo), 90% (alerta vermelho).'
    );
    
    addHighlightBox(
      'NOTIFICACOES PUSH',
      'Alertas em tempo real no dashboard para situacoes criticas: casos vencidos, evidencias em legal hold, aprovacoes pendentes.'
    );
    
    addSubTitle('8.3 Templates de Comunicacao');
    addText('Templates personalizaveis com variaveis dinamicas:');
    
    addStep(1, 'Confirmacao de Recebimento', 'Variáveis: {{PROTOCOLO}}, {{DATA}}, {{PRAZO_INVESTIGACAO}} > Personalização: logo, assinatura, contatos');
    addStep(2, 'Update de Status', 'Variaveis: {{STATUS_ATUAL}}, {{PRÓXIMOS_PASSOS}}, {{PRAZO}} > Personalização: nivel de detalhe');
    addStep(3, 'Solicitacao de Informacoes', 'Variaveis: {{INFORMACOES_SOLICITADAS}}, {{PRAZO_RESPOSTA}} > Personalização: tom formal/informal');
    addStep(4, 'Comunicacao de Encerramento', 'Variaveis: {{RESUMO}}, {{ACOES_IMPLEMENTADAS}} > Personalização: nivel de transparencia');
    
    addSubTitle('8.4 Integracoes Externas');
    addStep(1, 'SMTP Corporativo', 'Configuracao: servidor, porta, autenticacao, criptografia > Teste de conectividade > Logs de envio');
    addStep(2, 'Active Directory', 'Sincronizacao de usuarios, grupos, permissoes > Mapeamento de roles > Autenticacao integrada');
    addStep(3, 'SharePoint/OneDrive', 'Armazenamento de evidencias > Sincronizacao automatica > Controle de versoes');
    addStep(4, 'APIs Personalizadas', 'Integracao com sistemas internos > Webhooks > Sincronizacao bidirecionais');
    
    // ===== CAPITULO 9: CASOS PRATICOS AVANCADOS =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('9. CASOS PRATICOS AVANCADOS', primaryColor);
    
    addSubTitle('9.1 CASO COMPLEXO: ESQUEMA DE CORRUPCAO MULTINACIONAL');
    addText('Empresa: Construtora Global (50.000 funcionarios, 25 paises)');
    addText('Situacao: Denuncia anonima sobre pagamentos irregulares em licitacao no exterior');
    
    addStep(1, 'Recepcao e Classificacao', 'Protocolo: ETH-2024-127 > IA classifica: CRITICA > Palavras-chave: "propina", "licitacao", "offshore"');
    addStep(2, 'Escalonamento Imediato', 'Notificacao automatica para CEO, CLO, Board > Ativacao de protocolo de crise > Legal hold em todas evidencias');
    addStep(3, 'Investigacao Externa', 'Contratacao de firma internacional > Orcamento: USD 500.000 > Prazo: 120 dias > Equipe: 12 especialistas');
    addStep(4, 'Preservacao Massiva', 'Coleta de 15TB de dados > 50.000 emails > 200 contratos > Logs de 5 sistemas > Hash de tudo preservado');
    addStep(5, 'Cooperacao Regulatoria', 'Notificacoes simultaneas: DOJ (EUA), SFO (Reino Unido), CGU (Brasil) > Protocolos diplomaticos');
    addStep(6, 'Remediation Global', '250 acoes corretivas > Treinamento 10.000 funcionarios > Novos controles > Due diligence terceiros');
    addStep(7, 'Resultado Final', '18 meses de investigacao > 5 desligamentos > USD 50M em multas evitadas > Programa compliance renovado');
    
    addSubTitle('9.2 CASO SENSIVEL: ASSEDIO EM C-LEVEL');
    addText('Empresa: Tech Unicorn (2.000 funcionarios, pre-IPO)');
    addText('Situacao: VP Comercial acusado de assedio sexual por multiplas funcionarias');
    
    addStep(1, 'Gestao de Crise', 'Protocolo especial C-Level > Investigacao externa obrigatoria > Comunicacao com Board em 2h');
    addStep(2, 'Protecao das Vitimas', 'Afastamento imediato do acusado > Suporte psicologico > Garantia de nao-retaliacao');
    addStep(3, 'Investigacao Especializada', 'Firma boutique especializada > 3 investigadores senior > Metodologia trauma-informed');
    addStep(4, 'Evidencias Sensiveis', 'Mensagens WhatsApp > Testemunhos gravados > Cameras de seguranca > Protecao maxima');
    addStep(5, 'Decisao Executiva', '45 dias de investigacao > 12 testemunhas ouvidas > Evidencias conclusivas > Demissao por justa causa');
    addStep(6, 'Remediation Cultural', 'Programa cultural amplo > Novo codigo de conduta > Treinamento obrigatorio > Canal seguro');
    addStep(7, 'Impacto no IPO', 'Transparencia com investidores > Demonstracao de governanca > Due diligence bem-sucedida');
    
    addSubTitle('9.3 CASO SISTEMICO: FRAUDE EM SUBSIDIARIA');
    addText('Empresa: Multinacional Farmaceutica (80.000 funcionarios)');
    addText('Situacao: Controller da filial brasileira manipulando demonstracoes financeiras');
    
    addStep(1, 'Deteccao por IA', 'Sistema detecta anomalias em reconciliacoes > Padroes suspeitos em lancamentos > Alerta automatico');
    addStep(2, 'Auditoria Forense', 'Big Four contratada > Auditoria completa 24 meses > Analise de 2 milhoes de transacoes');
    addStep(3, 'Impacto Financeiro', 'R$ 50M em receitas fictícias > 15 trimestres afetados > Necessidade de restatement');
    addStep(4, 'Investigacao Criminal', 'Representacao na Policia Federal > Quebra de sigilo > Prisao preventiva do controller');
    addStep(5, 'Remediation Sistemica', 'Novos controles internos > Segregacao de funcoes > Auditoria continua implementada');
    addStep(6, 'Conformidade Regulatoria', 'Notificacao CVM > Acordo de leniencia > Monitoramento independente por 3 anos');
    addStep(7, 'Licoes Aprendidas', 'Fortalecimento do programa de compliance > Tons at the top > Cultura de integridade');
    
    // ===== CAPITULO 10: SOLUCAO DE PROBLEMAS =====
    
    doc.addPage();
    addHeader();
    yPosition = margin + 35; // Mais espaço no topo
    
    addTitle('10. SOLUCAO DE PROBLEMAS E FAQ', primaryColor);
    
    addSubTitle('10.1 Problemas Tecnicos Comuns');
    
    addHighlightBox(
      'PROBLEMA: Sistema lento ou travando',
      'CAUSA: Cache do navegador sobrecarregado, muitos filtros ativos simultaneamente. SOLUCAO: Ctrl+Shift+Delete para limpar cache completo. Remover filtros desnecessarios. PREVENCAO: Limitar periodo de busca a 90 dias. Usar filtros especificos em vez de genericos.'
    );
    
    addHighlightBox(
      'PROBLEMA: Erro "Acesso Negado" ao carregar dados',
      'CAUSA: Sessao expirada automaticamente, role de usuario insuficiente. SOLUCAO: Fazer logout completo e login novamente. Verificar permissoes com administrador do sistema. PREVENCAO: Renovar sessao preventivamente a cada 3 horas. Nao deixar sistema inativo por mais de 4 horas.'
    );
    
    addHighlightBox(
      'PROBLEMA: E-mails automaticos nao sendo enviados',
      'CAUSA: Configuracao SMTP incorreta, firewall corporativo bloqueando. SOLUCAO: Testar configuracao em Configuracoes > Integracoes > SMTP Test. Contatar equipe de TI para liberacao de portas. PREVENCAO: Configurar servidor SMTP backup. Monitorar status de envio diariamente.'
    );
    
    addHighlightBox(
      'PROBLEMA: Upload de evidencias falhando',
      'CAUSA: Arquivo muito grande (>10MB), formato nao suportado. SOLUCAO: Comprimir arquivo antes do upload. Usar formatos suportados: PDF, DOCX, JPG, PNG, MP3, MP4. PREVENCAO: Otimizar arquivos antes do upload. Preferir PDF para documentos.'
    );
    
    addHighlightBox(
      'PROBLEMA: Dados nao sincronizando entre abas',
      'CAUSA: Multiplas sessoes abertas, problemas de conectividade. SOLUCAO: Fechar todas as outras abas do modulo. Fazer refresh da pagina com F5. PREVENCAO: Usar apenas uma sessao ativa por vez. Garantir conexao de internet estavel.'
    );
    
    addSubTitle('10.2 Perguntas Frequentes (FAQ)');
    
    addStep(1, 'Como alterar prazos de SLA?', 'Acesse aba Configuracoes > SLA e Prazos > Altere valores desejados > Clique Salvar. Mudancas se aplicam apenas a novos casos.');
    addStep(2, 'Posso recuperar caso excluido?', 'Nao. Exclusoes sao permanentes por seguranca. Use "Arquivar" em vez de "Excluir" para preservar historico.');
    addStep(3, 'Como adicionar novos usuarios?', 'Gestao de usuarios e feita no modulo Admin principal. Canal de Etica herda permissoes do sistema central.');
    addStep(4, 'Evidencias tem limite de tamanho?', 'Limite individual: 10MB por arquivo. Limite total por caso: 1GB. Para arquivos maiores, use compartilhamento externo.');
    addStep(5, 'Como fazer backup dos dados?', 'Backups sao automaticos a cada 6 horas. Para backup manual: Configuracoes > Backup > Executar Agora.');
    addStep(6, 'Posso personalizar campos do formulario?', 'Campos padrao nao podem ser alterados. Campos customizados podem ser adicionados via Configuracoes > Campos Personalizados.');
    addStep(7, 'Como integrar com AD/LDAP?', 'Integracao e configurada pelo administrador do sistema no modulo de Configuracoes Gerais, nao no Canal de Etica.');
    addStep(8, 'Dados ficam por quanto tempo?', 'Retencao padrao: 7 anos para casos concluidos, permanente para casos com legal hold. Configuravel por organizacao.');
    
    addSubTitle('10.3 Suporte Tecnico');
    addHighlightBox(
      'CANAIS DE SUPORTE',
      'Email: suporte@grc-controller.com > Telefone: 0800-123-4567 > Chat: Disponivel no sistema 24/7 > Portal: https://suporte.grc-controller.com'
    );
    
    addHighlightBox(
      'RECURSOS ADICIONAIS',
      'Base de Conhecimento: https://kb.grc-controller.com > Videos Tutoriais: Canal YouTube GRC Controller > Webinars: Mensais, inscricoes no portal > Treinamentos: Presenciais e remotos disponiveis'
    );
    // === RODAPE PROFISSIONAL ===
    
    // Adicionar rodape em todas as paginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Linha divisoria no rodape
      doc.setDrawColor(...grayColor);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Informações do rodapé com formatação otimizada
      doc.setFontSize(7);
      doc.setTextColor(...grayColor);
      doc.setFont('helvetica', 'normal');
      
      // Linha única com informações essenciais
      doc.text('GRC Controller - Canal de Etica © 2025 | Versao 3.0 Corporativa', margin, pageHeight - 8);
      doc.text(`Pagina ${i} de ${totalPages} | ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    // === SALVAR ARQUIVO ===
    const fileName = `Canal-de-Etica-Manual-Completo-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('📖 Manual completo do Canal de Etica baixado com sucesso! Documentacao profissional com casos praticos e instrucoes detalhadas.');
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

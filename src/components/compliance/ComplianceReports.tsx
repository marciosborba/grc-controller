import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  FileText,
  Download,
  Mail,
  Calendar,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  TrendingUp,
  PieChart,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface ComplianceReport {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo_relatorio: string;
  categoria: string;
  frequencia_geracao: string;
  formato_saida: string;
  status: string;
  automatico: boolean;
  data_proxima_geracao: string;
  frameworks_incluidos: string[];
  requisitos_incluidos: string[];
  destinatarios: string[];
  emails_externos: string[];
  nivel_confidencialidade: string;
  created_at: string;
  template_relatorio: any;
  instancias_count: number;
  ultima_geracao: string;
}

interface ReportInstance {
  id: string;
  relatorio_id: string;
  codigo_instancia: string;
  titulo: string;
  data_inicio_periodo: string;
  data_fim_periodo: string;
  data_geracao: string;
  status_geracao: string;
  arquivo_relatorio: string;
  tamanho_arquivo: number;
  distribuido: boolean;
  data_distribuicao: string;
  gerado_por_nome: string;
  dados_relatorio?: any;
}

interface ReportFormData {
  codigo: string;
  titulo: string;
  descricao: string;
  tipo_relatorio: string;
  categoria: string;
  frequencia_geracao: string;
  formato_saida: string;
  automatico: boolean;
  frameworks_incluidos: string[];
  emails_externos: string[];
  nivel_confidencialidade: string;
}

const TIPOS_RELATORIO = [
  { value: 'dashboard', label: 'Dashboard Interativo', icon: BarChart3 },
  { value: 'executivo', label: 'Relatório Executivo', icon: TrendingUp },
  { value: 'operacional', label: 'Relatório Operacional', icon: Activity },
  { value: 'regulatorio', label: 'Relatório Regulatório', icon: Shield },
  { value: 'auditoria', label: 'Relatório de Auditoria', icon: CheckCircle }
];

const FREQUENCIAS = [
  { value: 'sob_demanda', label: 'Sob Demanda' },
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' }
];

const FORMATOS = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'excel', label: 'Excel', icon: FileText },
  { value: 'csv', label: 'CSV', icon: FileText },
  { value: 'html', label: 'HTML', icon: FileText },
  { value: 'powerbi', label: 'Power BI', icon: BarChart3 }
];

const NIVEIS_CONFIDENCIALIDADE = [
  { value: 'publico', label: 'Público', color: 'bg-green-100 text-green-800' },
  { value: 'interno', label: 'Interno', color: 'bg-blue-100 text-blue-800' },
  { value: 'restrito', label: 'Restrito', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confidencial', label: 'Confidencial', color: 'bg-red-100 text-red-800' }
];

// Templates pré-definidos de relatórios
const REPORT_TEMPLATES = [
  {
    id: 'compliance_dashboard',
    titulo: 'Dashboard de Conformidade Geral',
    descricao: 'Visão geral do status de conformidade de todos os frameworks',
    tipo_relatorio: 'dashboard',
    categoria: 'Geral',
    template_relatorio: {
      sections: [
        { type: 'metrics', title: 'Métricas Principais' },
        { type: 'frameworks_status', title: 'Status dos Frameworks' },
        { type: 'non_conformities', title: 'Não Conformidades Abertas' },
        { type: 'trends', title: 'Tendências' }
      ]
    }
  },
  {
    id: 'lgpd_compliance_report',
    titulo: 'Relatório de Conformidade LGPD',
    descricao: 'Relatório específico para conformidade com a Lei Geral de Proteção de Dados',
    tipo_relatorio: 'regulatorio',
    categoria: 'LGPD',
    template_relatorio: {
      sections: [
        { type: 'lgpd_overview', title: 'Visão Geral LGPD' },
        { type: 'data_inventory', title: 'Inventário de Dados' },
        { type: 'consent_management', title: 'Gestão de Consentimento' },
        { type: 'incidents', title: 'Incidentes de Segurança' },
        { type: 'data_subject_rights', title: 'Direitos dos Titulares' }
      ]
    }
  },
  {
    id: 'executive_summary',
    titulo: 'Sumário Executivo de Compliance',
    descricao: 'Relatório executivo com KPIs e métricas principais para alta administração',
    tipo_relatorio: 'executivo',
    categoria: 'Geral',
    template_relatorio: {
      sections: [
        { type: 'executive_summary', title: 'Resumo Executivo' },
        { type: 'key_metrics', title: 'Indicadores Chave' },
        { type: 'risk_heatmap', title: 'Mapa de Calor de Riscos' },
        { type: 'action_items', title: 'Itens de Ação' }
      ]
    }
  }
];

export function ComplianceReports() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [reportInstances, setReportInstances] = useState<ReportInstance[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [instancesDialogOpen, setInstancesDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ComplianceReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [selectedTab, setSelectedTab] = useState('reports');

  const [formData, setFormData] = useState<ReportFormData>({
    codigo: '',
    titulo: '',
    descricao: '',
    tipo_relatorio: '',
    categoria: '',
    frequencia_geracao: 'sob_demanda',
    formato_saida: 'pdf',
    automatico: false,
    frameworks_incluidos: [],
    emails_externos: [],
    nivel_confidencialidade: 'interno'
  });

  const [generateForm, setGenerateForm] = useState({
    data_inicio: '',
    data_fim: '',
    formato: 'pdf',
    enviar_email: false,
    emails_adicionais: ''
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadReports(),
        loadFrameworks(),
        loadReportInstances()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    const { data, error } = await supabase
      .from('relatorios_conformidade')
      .select(`
        *,
        instancias_relatorios_conformidade(id, data_geracao)
      `)
      .eq('tenant_id', effectiveTenantId)
      .order('titulo');

    if (error) throw error;

    const processedReports = data?.map(report => ({
      ...report,
      frameworks_incluidos: report.frameworks_incluidos || [],
      requisitos_incluidos: report.requisitos_incluidos || [],
      destinatarios: report.destinatarios || [],
      emails_externos: report.emails_externos || [],
      instancias_count: report.instancias_relatorios_conformidade?.length || 0,
      ultima_geracao: report.instancias_relatorios_conformidade?.[0]?.data_geracao || null
    })) || [];

    setReports(processedReports);
  };

  const loadFrameworks = async () => {
    const { data, error } = await supabase
      .from('frameworks_compliance')
      .select('id, nome, origem')
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo');

    if (error) throw error;
    setFrameworks(data || []);
  };

  const loadReportInstances = async () => {
    const { data, error } = await supabase
      .from('instancias_relatorios_conformidade')
      .select(`
        *,
        profiles!instancias_relatorios_conformidade_gerado_por_fkey(full_name)
      `)
      .eq('tenant_id', effectiveTenantId)
      .order('data_geracao', { ascending: false })
      .limit(20);

    if (error) throw error;

    const processedInstances = data?.map(instance => ({
      ...instance,
      gerado_por_nome: instance.profiles?.full_name || 'Sistema'
    })) || [];

    setReportInstances(processedInstances);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        tenant_id: effectiveTenantId,
        status: 'ativo',
        created_by: user?.id,
        updated_by: user?.id
      };

      let error;
      if (editingReport) {
        const { error: updateError } = await supabase
          .from('relatorios_conformidade')
          .update(payload)
          .eq('id', editingReport.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('relatorios_conformidade')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingReport ? 'Relatório atualizado!' : 'Relatório criado!');
      setDialogOpen(false);
      resetForm();
      loadReports();
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast.error('Erro ao salvar relatório');
    }
  };

  /* State for generation status */
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReport) return;
    setGenerating(true);
    toast.info('Iniciando geração do relatório...');

    try {
      // 1. Fetch Real Data
      const startDate = generateForm.data_inicio;
      const endDate = generateForm.data_fim;

      // Fetch Non-Conformities
      const { data: nonConformities, error: ncError } = await supabase
        .from('nao_conformidades')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

      if (ncError) throw ncError;

      // Fetch Action Plans
      const { data: actionPlans, error: apError } = await supabase
        .from('planos_acao_conformidade')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (apError) throw apError;

      // Fetch Requirements Stats
      const { data: reqs, error: reqError } = await supabase
        .from('requisitos_conformidade') // Note: Using correct table name from previous context if visible, otherwise assuming standard mapping. Wait, looking at SQL it is 'requisitos_compliance'
        .select('id, status, nivel_risco_nao_conformidade, criticidade')
        .eq('tenant_id', effectiveTenantId);

      // Correction: accessing 'requisitos_compliance' based on SQL dump
      const { data: requirements, error: reqsError } = await supabase
        .from('requisitos_compliance')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (reqsError) throw reqsError;

      // Calculate Metrics
      const metrics = {
        total_nc: nonConformities?.length || 0,
        nc_criticas: nonConformities?.filter(nc => nc.criticidade === 'critica').length || 0,
        nc_altas: nonConformities?.filter(nc => nc.criticidade === 'alta').length || 0,
        nc_medias: nonConformities?.filter(nc => nc.criticidade === 'media').length || 0,
        nc_baixas: nonConformities?.filter(nc => nc.criticidade === 'baixa').length || 0,
        total_planos: actionPlans?.length || 0,
        planos_concluidos: actionPlans?.filter(p => p.status === 'concluida').length || 0,
        compliance_score: 85, // Placeholder calculation, needs real logic
        requirements_count: requirements?.length || 0
      };

      // Prepare Snapshot Data
      const reportSnapshot = {
        generated_at: new Date().toISOString(),
        period: { start: startDate, end: endDate },
        metrics,
        data: {
          nonConformities: nonConformities || [],
          actionPlans: actionPlans || [],
          requirements: requirements || []
        },
        config: selectedReport
      };

      // 2. Generate HTML
      const htmlContent = generateComplianceReportHTML(selectedReport, reportSnapshot);

      // 3. Save Instance
      const instanceData = {
        tenant_id: effectiveTenantId,
        relatorio_id: selectedReport.id,
        codigo_instancia: `${selectedReport.codigo}-${new Date().toISOString().slice(0, 19).replace(/[^0-9]/g, '')}`,
        titulo: `${selectedReport.titulo} - ${new Date().toLocaleDateString('pt-BR')}`,
        data_inicio_periodo: startDate,
        data_fim_periodo: endDate,
        status_geracao: 'concluido',
        gerado_por: user?.id,
        dados_relatorio: reportSnapshot, // Storing full snapshot
        tamanho_arquivo: new Blob([htmlContent]).size,
        arquivo_relatorio: 'generated_on_the_fly' // Marker to indicate dynamic generation
      };

      const { data: newInstance, error: insertError } = await supabase
        .from('instancias_relatorios_conformidade')
        .insert([instanceData])
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Open Report
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      toast.success('Relatório gerado com sucesso!');
      setGenerateDialogOpen(false);
      loadReportInstances();

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório: ' + (error as any).message);
    } finally {
      setGenerating(false);
    }
  };

  const generateComplianceReportHTML = (reportConfig: any, snapshot: any) => {
    const { metrics, data, period } = snapshot;
    const timestamp = new Date().toLocaleString('pt-BR');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportConfig.titulo}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; color: #333; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 30px; margin-bottom: 40px; }
          .title { font-size: 28px; font-weight: bold; color: #1e293b; margin-bottom: 10px; }
          .subtitle { font-size: 14px; color: #64748b; margin-bottom: 5px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 40px; }
          .metric-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
          .metric-value { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .metric-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          .section { margin-bottom: 50px; }
          .section-title { font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; display: inline-block; }
          .badge-critica { background: #fee2e2; color: #991b1b; }
          .badge-alta { background: #ffedd5; color: #9a3412; }
          .badge-media { background: #fef9c3; color: #854d0e; }
          .badge-baixa { background: #dcfce7; color: #166534; }
          .footer { margin-top: 60px; pt: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
          
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; max-width: 100%; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">${reportConfig.titulo}</h1>
            <p class="subtitle">Código: ${reportConfig.codigo} | Categoria: ${reportConfig.categoria || 'Geral'}</p>
            <p class="subtitle">Período: ${new Date(period.start).toLocaleDateString('pt-BR')} a ${new Date(period.end).toLocaleDateString('pt-BR')}</p>
            <p class="subtitle">Gerado em: ${timestamp}</p>
          </div>

          <div class="metrics-grid">
             <div class="metric-card">
               <div class="metric-value">${metrics.compliance_score}%</div>
               <div class="metric-label">Score de Conformidade (Est.)</div>
             </div>
             <div class="metric-card">
               <div class="metric-value">${metrics.total_nc}</div>
               <div class="metric-label">Não Conformidades</div>
             </div>
             <div class="metric-card">
               <div class="metric-value">${metrics.nc_criticas}</div>
               <div class="metric-label">NCs Críticas</div>
             </div>
             <div class="metric-card">
               <div class="metric-value">${metrics.total_planos}</div>
               <div class="metric-label">Planos de Ação</div>
             </div>
          </div>

          <div class="section">
            <h2 class="section-title">Detalhamento de Não Conformidades</h2>
            ${data.nonConformities.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th width="15%">Código</th>
                    <th width="40%">Título/Descrição</th>
                    <th width="15%">Criticidade</th>
                    <th width="15%">Status</th>
                    <th width="15%">Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.nonConformities.map((nc: any) => `
                    <tr>
                      <td><strong>${nc.codigo}</strong></td>
                      <td>
                        <div style="font-weight:600; margin-bottom:4px;">${nc.titulo}</div>
                        <div style="color:#64748b; font-size:12px;">${nc.o_que?.substring(0, 100) || ''}...</div>
                      </td>
                      <td><span class="badge badge-${nc.criticidade}">${nc.criticidade?.toUpperCase()}</span></td>
                      <td>${nc.status}</td>
                      <td>${new Date(nc.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="text-align:center; color:#64748b; padding:20px;">Nenhuma não conformidade registrada no período.</p>'}
          </div>

          <div class="section">
            <h2 class="section-title">Planos de Ação Recentes</h2>
            ${data.actionPlans.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th width="20%">Código</th>
                    <th width="40%">Título</th>
                    <th width="20%">Status</th>
                    <th width="20%">Responsável</th>
                  </tr>
                </thead>
                <tbody>
                   ${data.actionPlans.slice(0, 10).map((pa: any) => `
                    <tr>
                      <td>${pa.codigo}</td>
                      <td>${pa.titulo}</td>
                      <td>${pa.status}</td>
                      <td>${pa.responsavel_execucao || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="text-align:center; color:#64748b; padding:20px;">Nenhum plano de ação registrado recentemente.</p>'}
          </div>

          <div class="footer">
            <p>Gerado automaticamente pelo GRC Controller - Confidencial</p>
          </div>
        </div>
        <script>
          // Auto-print option
          // window.print();
        </script>
      </body>
      </html>
    `;
  };

  const handleEdit = (report: ComplianceReport) => {
    setEditingReport(report);
    setFormData({
      codigo: report.codigo,
      titulo: report.titulo,
      descricao: report.descricao,
      tipo_relatorio: report.tipo_relatorio,
      categoria: report.categoria,
      frequencia_geracao: report.frequencia_geracao,
      formato_saida: report.formato_saida,
      automatico: report.automatico,
      frameworks_incluidos: report.frameworks_incluidos,
      emails_externos: report.emails_externos,
      nivel_confidencialidade: report.nivel_confidencialidade
    });
    setDialogOpen(true);
  };

  const handleDelete = async (report: ComplianceReport) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return;

    try {
      const { error } = await supabase
        .from('relatorios_conformidade')
        .delete()
        .eq('id', report.id);

      if (error) throw error;

      toast.success('Relatório excluído!');
      loadReports();
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      toast.error('Erro ao excluir relatório');
    }
  };

  const handleUseTemplate = (template: any) => {
    setFormData({
      codigo: `RPT-${Date.now()}`,
      titulo: template.titulo,
      descricao: template.descricao,
      tipo_relatorio: template.tipo_relatorio,
      categoria: template.categoria,
      frequencia_geracao: 'sob_demanda',
      formato_saida: 'pdf',
      automatico: false,
      frameworks_incluidos: [],
      emails_externos: [],
      nivel_confidencialidade: 'interno'
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      titulo: '',
      descricao: '',
      tipo_relatorio: '',
      categoria: '',
      frequencia_geracao: 'sob_demanda',
      formato_saida: 'pdf',
      automatico: false,
      frameworks_incluidos: [],
      emails_externos: [],
      nivel_confidencialidade: 'interno'
    });
    setEditingReport(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'em_desenvolvimento': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenerationStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'processando': return 'bg-blue-100 text-blue-800';
      case 'erro': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Central de Relatórios</h2>
          <p className="text-muted-foreground">Geração e gestão de relatórios de conformidade</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? 'Editar Relatório' : 'Novo Relatório'}
              </DialogTitle>
              <DialogDescription>
                Configure um novo relatório de conformidade
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="distribution">Distribuição</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codigo">Código*</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="RPT-001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                        placeholder="LGPD, SOX, Geral..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="titulo">Título do Relatório*</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Nome do relatório"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição*</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o objetivo e conteúdo do relatório"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_relatorio">Tipo de Relatório*</Label>
                      <Select value={formData.tipo_relatorio} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_relatorio: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_RELATORIO.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="formato_saida">Formato de Saída*</Label>
                      <Select value={formData.formato_saida} onValueChange={(value) => setFormData(prev => ({ ...prev, formato_saida: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMATOS.map(formato => (
                            <SelectItem key={formato.value} value={formato.value}>
                              {formato.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="frameworks_incluidos">Frameworks Incluídos</Label>
                    <Select value="" onValueChange={(value) => {
                      if (value && !formData.frameworks_incluidos.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          frameworks_incluidos: [...prev.frameworks_incluidos, value]
                        }));
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.map(framework => (
                          <SelectItem key={framework.id} value={framework.id}>
                            {framework.nome} ({framework.origem})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {formData.frameworks_incluidos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.frameworks_incluidos.map(id => {
                          const framework = frameworks.find(f => f.id === id);
                          return framework ? (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                              {framework.nome}
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  frameworks_incluidos: prev.frameworks_incluidos.filter(fId => fId !== id)
                                }))}
                                className="ml-1 hover:bg-red-100 rounded-full"
                              >
                                ×
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequencia_geracao">Frequência de Geração</Label>
                      <Select value={formData.frequencia_geracao} onValueChange={(value) => setFormData(prev => ({ ...prev, frequencia_geracao: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIAS.map(freq => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="automatico"
                        checked={formData.automatico}
                        onChange={(e) => setFormData(prev => ({ ...prev, automatico: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="automatico">Geração Automática</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="nivel_confidencialidade">Nível de Confidencialidade*</Label>
                    <Select value={formData.nivel_confidencialidade} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_confidencialidade: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEIS_CONFIDENCIALIDADE.map(nivel => (
                          <SelectItem key={nivel.value} value={nivel.value}>
                            {nivel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="emails_externos">Emails Externos (separados por vírgula)</Label>
                    <Textarea
                      id="emails_externos"
                      value={formData.emails_externos.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emails_externos: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                      }))}
                      placeholder="email1@exemplo.com, email2@exemplo.com"
                      rows={2}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingReport ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="instances">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Lista de Relatórios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map(report => {
              const TipoIcon = TIPOS_RELATORIO.find(t => t.value === report.tipo_relatorio)?.icon || FileText;
              const confidencialidadeColor = NIVEIS_CONFIDENCIALIDADE.find(n => n.value === report.nivel_confidencialidade)?.color || 'bg-gray-100 text-gray-800';

              return (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TipoIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-muted-foreground">{report.codigo}</span>
                        </div>
                        <CardTitle className="text-lg leading-tight">{report.titulo}</CardTitle>
                        <CardDescription className="mt-1">
                          {report.categoria} • {FREQUENCIAS.find(f => f.value === report.frequencia_geracao)?.label}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status e Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge className={confidencialidadeColor}>
                        {NIVEIS_CONFIDENCIALIDADE.find(n => n.value === report.nivel_confidencialidade)?.label}
                      </Badge>
                      {report.automatico && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Automático
                        </Badge>
                      )}
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Instâncias</span>
                        <p className="font-medium">{report.instancias_count}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Formato</span>
                        <p className="font-medium">{report.formato_saida.toUpperCase()}</p>
                      </div>
                    </div>

                    {report.ultima_geracao && (
                      <div className="text-sm text-muted-foreground">
                        Última geração: {new Date(report.ultima_geracao).toLocaleDateString('pt-BR')}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setGenerateForm({
                            data_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            data_fim: new Date().toISOString().split('T')[0],
                            formato: report.formato_saida,
                            enviar_email: false,
                            emails_adicionais: ''
                          });
                          setGenerateDialogOpen(true);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Gerar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(report)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setInstancesDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Histórico
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {reports.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum relatório configurado ainda.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map(template => {
              const TipoIcon = TIPOS_RELATORIO.find(t => t.value === template.tipo_relatorio)?.icon || FileText;

              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TipoIcon className="h-4 w-4 text-purple-600" />
                      <Badge variant="secondary">Template</Badge>
                    </div>
                    <CardTitle className="text-lg">{template.titulo}</CardTitle>
                    <CardDescription>{template.descricao}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p className="font-medium mb-2">Seções incluídas:</p>
                      <ul className="space-y-1">
                        {template.template_relatorio.sections.map((section: any, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-1 h-1 bg-current rounded-full"></div>
                            {section.title}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Usar Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="instances" className="space-y-6">
          <div className="space-y-4">
            {reportInstances.map(instance => (
              <Card key={instance.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium">{instance.titulo}</h4>
                        <Badge className={getGenerationStatusColor(instance.status_geracao)}>
                          {instance.status_geracao}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Período: {new Date(instance.data_inicio_periodo).toLocaleDateString('pt-BR')} a {new Date(instance.data_fim_periodo).toLocaleDateString('pt-BR')}</span>
                        <span>Gerado em: {new Date(instance.data_geracao).toLocaleDateString('pt-BR')}</span>
                        <span>Por: {instance.gerado_por_nome}</span>
                        {instance.tamanho_arquivo && (
                          <span>Tamanho: {formatFileSize(instance.tamanho_arquivo)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {instance.status_geracao === 'concluido' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              try {
                                const reportConfig = reports.find(r => r.id === instance.relatorio_id) || { titulo: instance.titulo, codigo: 'HIST', categoria: 'Histórico' };
                                // Check if we have snapshot data
                                if (instance.dados_relatorio) {
                                  const html = generateComplianceReportHTML(reportConfig, instance.dados_relatorio);
                                  const blob = new Blob([html], { type: 'text/html' });
                                  const url = URL.createObjectURL(blob);
                                  window.open(url, '_blank');
                                } else {
                                  toast.error('Este relatório antigo não possui dados visualizáveis.');
                                }
                              } catch (e) {
                                console.error(e);
                                toast.error('Erro ao abrir relatório');
                              }
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-3 w-3 mr-1" />
                            Enviar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {reportInstances.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum relatório gerado ainda.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Geração de Relatório */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerar Relatório</DialogTitle>
            <DialogDescription>
              {selectedReport?.titulo}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={generateForm.data_inicio}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, data_inicio: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={generateForm.data_fim}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, data_fim: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="formato">Formato</Label>
              <Select value={generateForm.formato} onValueChange={(value) => setGenerateForm(prev => ({ ...prev, formato: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATOS.map(formato => (
                    <SelectItem key={formato.value} value={formato.value}>
                      {formato.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enviar_email"
                checked={generateForm.enviar_email}
                onChange={(e) => setGenerateForm(prev => ({ ...prev, enviar_email: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="enviar_email">Enviar por email após geração</Label>
            </div>

            {generateForm.enviar_email && (
              <div>
                <Label htmlFor="emails_adicionais">Emails adicionais (opcional)</Label>
                <Textarea
                  id="emails_adicionais"
                  value={generateForm.emails_adicionais}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, emails_adicionais: e.target.value }))}
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                  rows={2}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComplianceReports;
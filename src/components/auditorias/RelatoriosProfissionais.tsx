import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  FileText,
  BarChart3,
  Download,
  Send,
  Eye,
  Edit,
  Filter,
  Plus,
  Search,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  PieChart,
  LineChart,
  Trash2,
  Settings,
  Mail,
  Printer,
  Share2,
  BookOpen,
  Award,
  Shield,
  Building,
  Briefcase,
  FileCheck,
  FileX,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeInput, secureLog } from '@/utils/securityLogger';
import { getStatusColor, getTypeColor, getRiskColor, formatDate } from './utils/auditUtils';

interface AuditReport {
  id: string;
  tenant_id: string;
  projeto_id: string;
  projeto_titulo?: string;
  titulo: string;
  tipo: 'executivo' | 'tecnico' | 'compliance' | 'risco' | 'performance' | 'seguimento' | 'especial';
  categoria: 'interno' | 'externo' | 'regulatorio' | 'investigativo';
  status: 'rascunho' | 'revisao' | 'aprovado' | 'publicado' | 'distribuido' | 'arquivado';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  autor_id: string;
  revisor_id?: string;
  aprovador_id?: string;
  data_criacao: string;
  data_publicacao?: string;
  data_vencimento?: string;
  versao: string;
  resumo_executivo: string;
  conteudo_principal?: string;
  metodologia?: string;
  escopo?: string;
  limitacoes?: string;
  recomendacoes?: string;
  conclusoes?: string;
  plano_acao?: string;
  total_apontamentos: number;
  apontamentos_criticos: number;
  apontamentos_altos: number;
  apontamentos_medios: number;
  apontamentos_baixos: number;
  nota_geral?: string;
  rating_numerico?: number;
  nivel_confidencialidade: 'publico' | 'interno' | 'confidencial' | 'restrito';
  distribuicao_lista?: string[];
  anexos?: string[];
  palavras_chave?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

interface ReportTemplate {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  descricao: string;
  estrutura: any;
  campos_obrigatorios: string[];
  versao: string;
  ativo: boolean;
  usado_em: number;
  data_atualizacao: string;
}

interface ReportMetrics {
  total_relatorios: number;
  relatorios_mes: number;
  tempo_medio_producao: number;
  taxa_aprovacao: number;
  distribuicao_tipos: Record<string, number>;
  distribuicao_status: Record<string, number>;
  apontamentos_totais: number;
  apontamentos_criticos: number;
  projetos_cobertos: number;
  compliance_score: number;
}

const reportTypes = [
  { 
    value: 'executivo', 
    label: 'Relatório Executivo',
    description: 'Visão estratégica para alta administração',
    icon: Award,
    color: 'text-purple-600'
  },
  { 
    value: 'tecnico', 
    label: 'Relatório Técnico',
    description: 'Análise detalhada de processos e controles',
    icon: Settings,
    color: 'text-blue-600'
  },
  { 
    value: 'compliance', 
    label: 'Relatório de Compliance',
    description: 'Conformidade regulatória e normativa',
    icon: Shield,
    color: 'text-green-600'
  },
  { 
    value: 'risco', 
    label: 'Relatório de Risco',
    description: 'Avaliação e gestão de riscos',
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  { 
    value: 'performance', 
    label: 'Relatório de Performance',
    description: 'Indicadores de desempenho e eficiência',
    icon: TrendingUp,
    color: 'text-orange-600'
  },
  { 
    value: 'seguimento', 
    label: 'Relatório de Seguimento',
    description: 'Acompanhamento de recomendações',
    icon: Activity,
    color: 'text-indigo-600'
  },
  { 
    value: 'especial', 
    label: 'Relatório Especial',
    description: 'Investigações e análises específicas',
    icon: Zap,
    color: 'text-yellow-600'
  }
];

const reportCategories = [
  { value: 'interno', label: 'Auditoria Interna', icon: Building },
  { value: 'externo', label: 'Auditoria Externa', icon: Globe },
  { value: 'regulatorio', label: 'Regulatório', icon: FileCheck },
  { value: 'investigativo', label: 'Investigativo', icon: FileX }
];

const reportStatuses = [
  { value: 'rascunho', label: 'Rascunho', color: 'bg-gray-500 text-white' },
  { value: 'revisao', label: 'Em Revisão', color: 'bg-yellow-500 text-white' },
  { value: 'aprovado', label: 'Aprovado', color: 'bg-blue-500 text-white' },
  { value: 'publicado', label: 'Publicado', color: 'bg-green-500 text-white' },
  { value: 'distribuido', label: 'Distribuído', color: 'bg-purple-500 text-white' },
  { value: 'arquivado', label: 'Arquivado', color: 'bg-gray-400 text-white' }
];

const priorityLevels = [
  { value: 'baixa', label: 'Baixa', color: 'bg-blue-500 text-white' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500 text-white' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500 text-white' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-500 text-white' }
];

const confidentialityLevels = [
  { value: 'publico', label: 'Público', icon: '🌐' },
  { value: 'interno', label: 'Interno', icon: '🏢' },
  { value: 'confidencial', label: 'Confidencial', icon: '⚠️' },
  { value: 'restrito', label: 'Restrito', icon: '🔒' }
];

export function RelatoriosProfissionais() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const [formData, setFormData] = useState({
    projeto_id: '',
    titulo: '',
    tipo: 'executivo' as const,
    categoria: 'interno' as const,
    prioridade: 'media' as const,
    nivel_confidencialidade: 'interno' as const,
    resumo_executivo: '',
    conteudo_principal: '',
    metodologia: '',
    escopo: '',
    limitacoes: '',
    recomendacoes: '',
    conclusoes: '',
    plano_acao: '',
    data_vencimento: '',
    distribuicao_lista: [] as string[],
    palavras_chave: [] as string[]
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar relatórios
      const { data: reportsData, error: reportsError } = await supabase
        .from('relatorios_auditoria')
        .select(`
          *,
          projetos_auditoria(titulo, codigo),
          profiles:autor_id(full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (reportsError) {
        secureLog('error', 'Erro ao carregar relatórios', reportsError);
      } else {
        const mappedReports = reportsData?.map(report => ({
          ...report,
          projeto_titulo: report.projetos_auditoria?.titulo || 'Projeto não definido'
        })) || [];
        setReports(mappedReports);
      }

      // Carregar templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates_relatorios')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('ativo', true)
        .order('nome');

      if (templatesError) {
        secureLog('error', 'Erro ao carregar templates', templatesError);
      } else {
        setTemplates(templatesData || []);
      }

      // Carregar projetos
      const { data: projectsData, error: projectsError } = await supabase
        .from('projetos_auditoria')
        .select('id, titulo, codigo, status')
        .eq('tenant_id', effectiveTenantId)
        .order('titulo');

      if (projectsError) {
        secureLog('error', 'Erro ao carregar projetos', projectsError);
      } else {
        setProjects(projectsData || []);
      }

      // Calcular métricas
      calculateMetrics(reportsData || []);

    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de relatórios', error);
      toast.error('Erro ao carregar dados de relatórios');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (reportsData: any[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const reportsThisMonth = reportsData.filter(r => 
      new Date(r.created_at) >= thisMonth
    ).length;

    const distribuicaoTipos = reportsData.reduce((acc, report) => {
      acc[report.tipo] = (acc[report.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribuicaoStatus = reportsData.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalApontamentos = reportsData.reduce((sum, r) => sum + (r.total_apontamentos || 0), 0);
    const apontamentosCriticos = reportsData.reduce((sum, r) => sum + (r.apontamentos_criticos || 0), 0);
    const projetosCobertos = new Set(reportsData.map(r => r.projeto_id)).size;
    
    const relatoriosAprovados = reportsData.filter(r => 
      ['aprovado', 'publicado', 'distribuido'].includes(r.status)
    ).length;
    
    const taxaAprovacao = reportsData.length > 0 ? 
      Math.round((relatoriosAprovados / reportsData.length) * 100) : 0;

    const complianceScore = Math.min(100, Math.round(
      (taxaAprovacao * 0.4) + 
      (Math.max(0, 100 - (apontamentosCriticos * 5)) * 0.3) +
      (projetosCobertos * 10 * 0.3)
    ));

    setMetrics({
      total_relatorios: reportsData.length,
      relatorios_mes: reportsThisMonth,
      tempo_medio_producao: 7, // Simulado - seria calculado com base nas datas
      taxa_aprovacao: taxaAprovacao,
      distribuicao_tipos: distribuicaoTipos,
      distribuicao_status: distribuicaoStatus,
      apontamentos_totais: totalApontamentos,
      apontamentos_criticos: apontamentosCriticos,
      projetos_cobertos: projetosCobertos,
      compliance_score: complianceScore
    });
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = !searchTerm || 
        report.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.projeto_titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.resumo_executivo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || report.tipo === filterType;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || report.categoria === filterCategory;
      
      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [reports, searchTerm, filterType, filterStatus, filterCategory]);

  const handleSaveReport = async () => {
    try {
      if (!formData.projeto_id || !formData.titulo || !formData.resumo_executivo) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      setGeneratingReport(true);

      const sanitizedData = {
        projeto_id: sanitizeInput(formData.projeto_id),
        titulo: sanitizeInput(formData.titulo),
        tipo: formData.tipo,
        categoria: formData.categoria,
        prioridade: formData.prioridade,
        nivel_confidencialidade: formData.nivel_confidencialidade,
        resumo_executivo: sanitizeInput(formData.resumo_executivo),
        conteudo_principal: sanitizeInput(formData.conteudo_principal),
        metodologia: sanitizeInput(formData.metodologia),
        escopo: sanitizeInput(formData.escopo),
        limitacoes: sanitizeInput(formData.limitacoes),
        recomendacoes: sanitizeInput(formData.recomendacoes),
        conclusoes: sanitizeInput(formData.conclusoes),
        plano_acao: sanitizeInput(formData.plano_acao),
        data_vencimento: formData.data_vencimento || null,
        distribuicao_lista: formData.distribuicao_lista,
        palavras_chave: formData.palavras_chave,
        status: 'rascunho' as const,
        versao: selectedReport ? selectedReport.versao : '1.0',
        total_apontamentos: 0,
        apontamentos_criticos: 0,
        apontamentos_altos: 0,
        apontamentos_medios: 0,
        apontamentos_baixos: 0,
        tenant_id: effectiveTenantId,
        autor_id: user?.id,
        created_by: user?.id
      };

      const { data, error } = selectedReport 
        ? await supabase
            .from('relatorios_auditoria')
            .update({ ...sanitizedData, updated_by: user?.id })
            .eq('id', selectedReport.id)
            .eq('tenant_id', effectiveTenantId)
            .select()
        : await supabase
            .from('relatorios_auditoria')
            .insert(sanitizedData)
            .select();

      if (error) {
        throw error;
      }

      toast.success(selectedReport ? 'Relatório atualizado com sucesso!' : 'Relatório criado com sucesso!');
      setDialogOpen(false);
      resetForm();
      loadData();

    } catch (error) {
      secureLog('error', 'Erro ao salvar relatório', error);
      toast.error('Erro ao salvar relatório');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) return;

    try {
      const { error } = await supabase
        .from('relatorios_auditoria')
        .delete()
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Relatório excluído com sucesso!');
      loadData();
    } catch (error) {
      secureLog('error', 'Erro ao excluir relatório', error);
      toast.error('Erro ao excluir relatório');
    }
  };

  const resetForm = () => {
    setFormData({
      projeto_id: '',
      titulo: '',
      tipo: 'executivo',
      categoria: 'interno',
      prioridade: 'media',
      nivel_confidencialidade: 'interno',
      resumo_executivo: '',
      conteudo_principal: '',
      metodologia: '',
      escopo: '',
      limitacoes: '',
      recomendacoes: '',
      conclusoes: '',
      plano_acao: '',
      data_vencimento: '',
      distribuicao_lista: [],
      palavras_chave: []
    });
    setSelectedReport(null);
  };

  const openEditDialog = (report: AuditReport) => {
    setSelectedReport(report);
    setFormData({
      projeto_id: report.projeto_id,
      titulo: report.titulo,
      tipo: report.tipo,
      categoria: report.categoria,
      prioridade: report.prioridade,
      nivel_confidencialidade: report.nivel_confidencialidade,
      resumo_executivo: report.resumo_executivo,
      conteudo_principal: report.conteudo_principal || '',
      metodologia: report.metodologia || '',
      escopo: report.escopo || '',
      limitacoes: report.limitacoes || '',
      recomendacoes: report.recomendacoes || '',
      conclusoes: report.conclusoes || '',
      plano_acao: report.plano_acao || '',
      data_vencimento: report.data_vencimento || '',
      distribuicao_lista: report.distribuicao_lista || [],
      palavras_chave: report.palavras_chave || []
    });
    setDialogOpen(true);
  };

  const openViewDialog = (report: AuditReport) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const getConfidentialityIcon = (level: string) => {
    const conf = confidentialityLevels.find(c => c.value === level);
    return conf?.icon || '📋';
  };

  const getPriorityColor = (priority: string) => {
    const prio = priorityLevels.find(p => p.value === priority);
    return prio?.color || 'bg-gray-500 text-white';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios de Auditoria</h1>
          <p className="text-muted-foreground">Sistema Profissional de Relatórios Executivos e Técnicos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Relatórios</p>
                    <p className="text-3xl font-bold">{metrics?.total_relatorios || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      +{metrics?.relatorios_mes || 0} este mês
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
                    <p className="text-3xl font-bold">{metrics?.taxa_aprovacao || 0}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Relatórios aprovados
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Apontamentos Críticos</p>
                    <p className="text-3xl font-bold text-red-600">{metrics?.apontamentos_criticos || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      De {metrics?.apontamentos_totais || 0} totais
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-3xl font-bold text-purple-600">{metrics?.compliance_score || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Índice de conformidade
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tipos de Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Escolha o tipo de relatório mais adequado para sua necessidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((type) => {
                  const IconComponent = type.icon;
                  const count = metrics?.distribuicao_tipos[type.value] || 0;
                  return (
                    <Card key={type.value} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${type.color}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{type.label}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {count} relatórios
                              </Badge>
                              <Button size="sm" variant="ghost" 
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, tipo: type.value as any }));
                                  setDialogOpen(true);
                                }}
                              >
                                Criar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Relatórios Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>
                Últimos relatórios criados ou atualizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getConfidentialityIcon(report.nivel_confidencialidade)}</span>
                        <h4 className="font-medium">{report.titulo}</h4>
                        <Badge className={getTypeColor(report.tipo)}>
                          {reportTypes.find(t => t.value === report.tipo)?.label}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {reportStatuses.find(s => s.value === report.status)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Projeto: {report.projeto_titulo} • Criado em {formatDate(report.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(report)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros e Pesquisa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar relatórios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {reportStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {reportCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Relatórios */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum relatório encontrado</h3>
                  <p className="text-muted-foreground">Crie seu primeiro relatório ou ajuste os filtros.</p>
                  <Button className="mt-4" onClick={() => { resetForm(); setDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Relatório
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{getConfidentialityIcon(report.nivel_confidencialidade)}</span>
                          <h3 className="text-lg font-semibold">{report.titulo}</h3>
                          <Badge className={getTypeColor(report.tipo)}>
                            {reportTypes.find(t => t.value === report.tipo)?.label}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {reportStatuses.find(s => s.value === report.status)?.label}
                          </Badge>
                          <Badge className={getPriorityColor(report.prioridade)}>
                            {priorityLevels.find(p => p.value === report.prioridade)?.label}
                          </Badge>
                          {report.versao && (
                            <Badge variant="secondary">v{report.versao}</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          Projeto: {report.projeto_titulo} • Categoria: {reportCategories.find(c => c.value === report.categoria)?.label}
                        </p>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-2">{report.resumo_executivo}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total:</span>
                            <span className="ml-2">{report.total_apontamentos}</span>
                          </div>
                          <div>
                            <span className="font-medium">Crítico:</span>
                            <span className="ml-2 text-red-600">{report.apontamentos_criticos}</span>
                          </div>
                          <div>
                            <span className="font-medium">Alto:</span>
                            <span className="ml-2 text-orange-600">{report.apontamentos_altos}</span>
                          </div>
                          <div>
                            <span className="font-medium">Médio:</span>
                            <span className="ml-2 text-yellow-600">{report.apontamentos_medios}</span>
                          </div>
                          <div>
                            <span className="font-medium">Baixo:</span>
                            <span className="ml-2 text-blue-600">{report.apontamentos_baixos}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Criado: {formatDate(report.created_at)}
                          </div>
                          {report.data_vencimento && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Vence: {formatDate(report.data_vencimento)}
                            </div>
                          )}
                          {report.rating_numerico && (
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              Score: {report.rating_numerico}/100
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openViewDialog(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(report)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportTypes.map(type => {
                    const count = metrics?.distribuicao_tipos[type.value] || 0;
                    const percentage = metrics?.total_relatorios ? (count / metrics.total_relatorios) * 100 : 0;
                    return (
                      <div key={type.value} className="flex items-center justify-between">
                        <span className="text-sm">{type.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-10 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportStatuses.map(status => {
                    const count = metrics?.distribuicao_status[status.value] || 0;
                    const percentage = metrics?.total_relatorios ? (count / metrics.total_relatorios) * 100 : 0;
                    return (
                      <div key={status.value} className="flex items-center justify-between">
                        <span className="text-sm">{status.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-10 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compliance Score</span>
                      <span>{metrics?.compliance_score || 0}%</span>
                    </div>
                    <Progress value={metrics?.compliance_score || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Aprovação</span>
                      <span>{metrics?.taxa_aprovacao || 0}%</span>
                    </div>
                    <Progress value={metrics?.taxa_aprovacao || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cobertura de Projetos</span>
                      <span>{metrics?.projetos_cobertos || 0} projetos</span>
                    </div>
                    <Progress value={Math.min(100, (metrics?.projetos_cobertos || 0) * 10)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatórios este mês</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{metrics?.relatorios_mes || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo médio de produção</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{metrics?.tempo_medio_producao || 0} dias</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Apontamentos críticos</span>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{metrics?.apontamentos_criticos || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Templates de Relatório</h3>
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
              <p className="text-sm text-muted-foreground mt-2">
                Em breve você poderá criar e gerenciar templates personalizados para seus relatórios.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para Criar/Editar Relatório */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport ? 'Editar Relatório' : 'Novo Relatório de Auditoria'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Projeto *</Label>
                <Select value={formData.projeto_id} onValueChange={(value) => setFormData(prev => ({...prev, projeto_id: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(projeto => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.codigo} - {projeto.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Tipo de Relatório *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({...prev, tipo: value as any}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({...prev, categoria: value as any}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select value={formData.prioridade} onValueChange={(value) => setFormData(prev => ({...prev, prioridade: value as any}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nível de Confidencialidade</Label>
                <Select value={formData.nivel_confidencialidade} onValueChange={(value) => setFormData(prev => ({...prev, nivel_confidencialidade: value as any}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {confidentialityLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.icon} {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data de Vencimento</Label>
                <Input 
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData(prev => ({...prev, data_vencimento: e.target.value}))}
                />
              </div>
            </div>

            <div>
              <Label>Título do Relatório *</Label>
              <Input 
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))}
                placeholder="Digite o título do relatório"
              />
            </div>

            {/* Conteúdo Principal */}
            <div className="space-y-4">
              <div>
                <Label>Resumo Executivo *</Label>
                <Textarea 
                  value={formData.resumo_executivo}
                  onChange={(e) => setFormData(prev => ({...prev, resumo_executivo: e.target.value}))}
                  placeholder="Resumo executivo do relatório para alta administração"
                  rows={4}
                />
              </div>

              <div>
                <Label>Escopo da Auditoria</Label>
                <Textarea 
                  value={formData.escopo}
                  onChange={(e) => setFormData(prev => ({...prev, escopo: e.target.value}))}
                  placeholder="Defina o escopo e abrangência da auditoria"
                  rows={3}
                />
              </div>

              <div>
                <Label>Metodologia</Label>
                <Textarea 
                  value={formData.metodologia}
                  onChange={(e) => setFormData(prev => ({...prev, metodologia: e.target.value}))}
                  placeholder="Descreva a metodologia utilizada na auditoria"
                  rows={3}
                />
              </div>

              <div>
                <Label>Conteúdo Principal</Label>
                <Textarea 
                  value={formData.conteudo_principal}
                  onChange={(e) => setFormData(prev => ({...prev, conteudo_principal: e.target.value}))}
                  placeholder="Desenvolvimento detalhado do relatório"
                  rows={6}
                />
              </div>

              <div>
                <Label>Limitações</Label>
                <Textarea 
                  value={formData.limitacoes}
                  onChange={(e) => setFormData(prev => ({...prev, limitacoes: e.target.value}))}
                  placeholder="Limitações identificadas durante a auditoria"
                  rows={3}
                />
              </div>

              <div>
                <Label>Recomendações</Label>
                <Textarea 
                  value={formData.recomendacoes}
                  onChange={(e) => setFormData(prev => ({...prev, recomendacoes: e.target.value}))}
                  placeholder="Recomendações para melhoria dos controles"
                  rows={4}
                />
              </div>

              <div>
                <Label>Conclusões</Label>
                <Textarea 
                  value={formData.conclusoes}
                  onChange={(e) => setFormData(prev => ({...prev, conclusoes: e.target.value}))}
                  placeholder="Conclusões finais da auditoria"
                  rows={4}
                />
              </div>

              <div>
                <Label>Plano de Ação</Label>
                <Textarea 
                  value={formData.plano_acao}
                  onChange={(e) => setFormData(prev => ({...prev, plano_acao: e.target.value}))}
                  placeholder="Plano de ação para implementação das recomendações"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReport} disabled={generatingReport}>
              {generatingReport ? 'Salvando...' : (selectedReport ? 'Atualizar' : 'Criar')} Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar Relatório */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReport && getConfidentialityIcon(selectedReport.nivel_confidencialidade)}
              {selectedReport?.titulo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Metadados */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <p className="font-medium">{reportTypes.find(t => t.value === selectedReport.tipo)?.label}</p>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {reportStatuses.find(s => s.value === selectedReport.status)?.label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs">Prioridade</Label>
                  <Badge className={getPriorityColor(selectedReport.prioridade)}>
                    {priorityLevels.find(p => p.value === selectedReport.prioridade)?.label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs">Versão</Label>
                  <p className="font-medium">v{selectedReport.versao}</p>
                </div>
              </div>

              {/* Resumo Executivo */}
              <div>
                <h4 className="font-semibold mb-2">Resumo Executivo</h4>
                <p className="text-sm leading-relaxed">{selectedReport.resumo_executivo}</p>
              </div>

              {/* Escopo */}
              {selectedReport.escopo && (
                <div>
                  <h4 className="font-semibold mb-2">Escopo</h4>
                  <p className="text-sm leading-relaxed">{selectedReport.escopo}</p>
                </div>
              )}

              {/* Metodologia */}
              {selectedReport.metodologia && (
                <div>
                  <h4 className="font-semibold mb-2">Metodologia</h4>
                  <p className="text-sm leading-relaxed">{selectedReport.metodologia}</p>
                </div>
              )}

              {/* Conteúdo Principal */}
              {selectedReport.conteudo_principal && (
                <div>
                  <h4 className="font-semibold mb-2">Conteúdo Principal</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.conteudo_principal}</p>
                </div>
              )}

              {/* Apontamentos */}
              <div>
                <h4 className="font-semibold mb-2">Resumo de Apontamentos</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center p-2 border rounded">
                    <p className="text-lg font-bold">{selectedReport.total_apontamentos}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <p className="text-lg font-bold text-red-600">{selectedReport.apontamentos_criticos}</p>
                    <p className="text-xs text-muted-foreground">Crítico</p>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <p className="text-lg font-bold text-orange-600">{selectedReport.apontamentos_altos}</p>
                    <p className="text-xs text-muted-foreground">Alto</p>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <p className="text-lg font-bold text-yellow-600">{selectedReport.apontamentos_medios}</p>
                    <p className="text-xs text-muted-foreground">Médio</p>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <p className="text-lg font-bold text-blue-600">{selectedReport.apontamentos_baixos}</p>
                    <p className="text-xs text-muted-foreground">Baixo</p>
                  </div>
                </div>
              </div>

              {/* Recomendações */}
              {selectedReport.recomendacoes && (
                <div>
                  <h4 className="font-semibold mb-2">Recomendações</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.recomendacoes}</p>
                </div>
              )}

              {/* Conclusões */}
              {selectedReport.conclusoes && (
                <div>
                  <h4 className="font-semibold mb-2">Conclusões</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.conclusoes}</p>
                </div>
              )}

              {/* Plano de Ação */}
              {selectedReport.plano_acao && (
                <div>
                  <h4 className="font-semibold mb-2">Plano de Ação</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.plano_acao}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RelatoriosProfissionais;
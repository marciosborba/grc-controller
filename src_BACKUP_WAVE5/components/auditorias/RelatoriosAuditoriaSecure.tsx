import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Trash2
} from 'lucide-react';
import { useSecureAuditData } from '@/hooks/useAuditModule';
import { useAuditDashboardData } from '@/hooks/useAuditQueries';
import { sanitizeInput } from '@/utils/securityLogger';
import { toast } from 'sonner';

interface AuditReport {
  id: string;
  tenant_id: string;
  projeto_id: string;
  projeto_titulo?: string;
  titulo: string;
  tipo: 'preliminar' | 'final' | 'executivo' | 'seguimento' | 'especial';
  status: 'rascunho' | 'revisao' | 'aprovado' | 'publicado' | 'distribuido';
  autor_id: string;
  revisor_id?: string;
  aprovador_id?: string;
  data_criacao: string;
  data_publicacao?: string;
  versao: string;
  resumo_executivo: string;
  conteudo_principal?: string;
  recomendacoes?: string;
  conclusoes?: string;
  total_apontamentos: number;
  apontamentos_criticos: number;
  apontamentos_altos: number;
  apontamentos_medios: number;
  apontamentos_baixos: number;
  nota_geral?: string;
  rating_numerico?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

const reportTypes = [
  { value: 'preliminar', label: 'Preliminar' },
  { value: 'final', label: 'Final' },
  { value: 'executivo', label: 'Executivo' },
  { value: 'seguimento', label: 'Seguimento' },
  { value: 'especial', label: 'Especial' }
];

const reportStatuses = [
  { value: 'rascunho', label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
  { value: 'revisao', label: 'Em Revisão', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'aprovado', label: 'Aprovado', color: 'bg-blue-100 text-blue-800' },
  { value: 'publicado', label: 'Publicado', color: 'bg-green-100 text-green-800' },
  { value: 'distribuido', label: 'Distribuído', color: 'bg-purple-100 text-purple-800' }
];

export function RelatoriosAuditoriaSecure() {
  // Usar hooks seguros e otimizados
  const {
    data: reports,
    loading,
    error,
    create,
    update,
    delete: deleteReport,
    LoadingComponent,
    ErrorComponent
  } = useSecureAuditData<AuditReport>('relatorios_auditoria');

  const { projetos, isAnyLoading: projectsLoading } = useAuditDashboardData();
  
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [selectedTab, setSelectedTab] = useState('reports');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    projeto_id: '',
    titulo: '',
    tipo: 'preliminar' as const,
    resumo_executivo: '',
    conteudo_principal: '',
    recomendacoes: '',
    conclusoes: ''
  });

  // Filtrar relatórios
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesType = filterType === 'all' || report.tipo === filterType;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesSearch = !searchTerm || 
        report.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.projeto_titulo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [reports, filterType, filterStatus, searchTerm]);

  // Projetos para seleção
  const projetosOptions = useMemo(() => {
    return projetos.data.map((projeto: any) => ({
      value: projeto.id,
      label: `${projeto.codigo} - ${projeto.titulo}`
    }));
  }, [projetos.data]);

  // Estatísticas dos relatórios
  const reportStats = useMemo(() => {
    return {
      total: reports.length,
      rascunho: reports.filter(r => r.status === 'rascunho').length,
      revisao: reports.filter(r => r.status === 'revisao').length,
      aprovado: reports.filter(r => r.status === 'aprovado').length,
      publicado: reports.filter(r => r.status === 'publicado').length,
      avgRating: reports.length > 0 ? 
        Math.round(reports.reduce((sum, r) => sum + (r.rating_numerico || 0), 0) / reports.length) : 0
    };
  }, [reports]);

  // Função para salvar relatório
  const handleSaveReport = async () => {
    try {
      // Validação básica
      if (!formData.projeto_id || !formData.titulo || !formData.resumo_executivo) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Sanitizar dados de entrada
      const sanitizedData = {
        projeto_id: sanitizeInput(formData.projeto_id),
        titulo: sanitizeInput(formData.titulo),
        tipo: formData.tipo,
        resumo_executivo: sanitizeInput(formData.resumo_executivo),
        conteudo_principal: sanitizeInput(formData.conteudo_principal),
        recomendacoes: sanitizeInput(formData.recomendacoes),
        conclusoes: sanitizeInput(formData.conclusoes),
        status: 'rascunho' as const,
        versao: selectedReport ? selectedReport.versao : '1.0',
        total_apontamentos: 0,
        apontamentos_criticos: 0,
        apontamentos_altos: 0,
        apontamentos_medios: 0,
        apontamentos_baixos: 0
      };

      const success = selectedReport 
        ? await update(selectedReport.id, sanitizedData)
        : await create(sanitizedData);

      if (success) {
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      projeto_id: '',
      titulo: '',
      tipo: 'preliminar',
      resumo_executivo: '',
      conteudo_principal: '',
      recomendacoes: '',
      conclusoes: ''
    });
    setSelectedReport(null);
  };

  const openEditDialog = (report: AuditReport) => {
    setSelectedReport(report);
    setFormData({
      projeto_id: report.projeto_id,
      titulo: report.titulo,
      tipo: report.tipo,
      resumo_executivo: report.resumo_executivo,
      conteudo_principal: report.conteudo_principal || '',
      recomendacoes: report.recomendacoes || '',
      conclusoes: report.conclusoes || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      await deleteReport(id);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = reportStatuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  // Renderização condicional com componentes seguros
  if (loading || projectsLoading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios de Auditoria</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedReport ? 'Editar Relatório' : 'Novo Relatório'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Projeto *</Label>
                  <Select value={formData.projeto_id} onValueChange={(value) => setFormData(prev => ({...prev, projeto_id: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projetosOptions.map(projeto => (
                        <SelectItem key={projeto.value} value={projeto.value}>
                          {projeto.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tipo do Relatório</Label>
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
              </div>

              <div>
                <Label>Título do Relatório *</Label>
                <Input 
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))}
                  placeholder="Digite o título do relatório"
                />
              </div>

              <div>
                <Label>Resumo Executivo *</Label>
                <Textarea 
                  value={formData.resumo_executivo}
                  onChange={(e) => setFormData(prev => ({...prev, resumo_executivo: e.target.value}))}
                  placeholder="Digite um resumo executivo do relatório"
                  rows={4}
                />
              </div>

              <div>
                <Label>Conteúdo Principal</Label>
                <Textarea 
                  value={formData.conteudo_principal}
                  onChange={(e) => setFormData(prev => ({...prev, conteudo_principal: e.target.value}))}
                  placeholder="Descreva o conteúdo principal do relatório"
                  rows={6}
                />
              </div>

              <div>
                <Label>Recomendações</Label>
                <Textarea 
                  value={formData.recomendacoes}
                  onChange={(e) => setFormData(prev => ({...prev, recomendacoes: e.target.value}))}
                  placeholder="Liste as principais recomendações"
                  rows={4}
                />
              </div>

              <div>
                <Label>Conclusões</Label>
                <Textarea 
                  value={formData.conclusoes}
                  onChange={(e) => setFormData(prev => ({...prev, conclusoes: e.target.value}))}
                  placeholder="Descreva as conclusões do relatório"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveReport}>
                {selectedReport ? 'Atualizar' : 'Criar'} Relatório
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{reportStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Edit className="h-8 w-8 text-gray-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Rascunho</p>
                    <p className="text-2xl font-bold text-gray-600">{reportStats.rascunho}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Revisão</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportStats.revisao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Aprovado</p>
                    <p className="text-2xl font-bold text-blue-600">{reportStats.aprovado}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Send className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Publicado</p>
                    <p className="text-2xl font-bold text-green-600">{reportStats.publicado}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Nota Média</p>
                    <p className="text-2xl font-bold text-purple-600">{reportStats.avgRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros e Pesquisa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar relatórios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
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
                  <SelectTrigger className="w-48">
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
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum relatório encontrado</h3>
                  <p className="text-muted-foreground">Crie seu primeiro relatório ou ajuste os filtros.</p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{report.titulo}</h3>
                          <Badge variant="outline">{report.tipo}</Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {reportStatuses.find(s => s.value === report.status)?.label}
                          </Badge>
                          {report.versao && (
                            <Badge variant="secondary">v{report.versao}</Badge>
                          )}
                        </div>
                        
                        {report.projeto_titulo && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Projeto: {report.projeto_titulo}
                          </p>
                        )}
                        
                        <p className="text-muted-foreground mb-4">{report.resumo_executivo}</p>
                        
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
                            {new Date(report.data_criacao).toLocaleDateString('pt-BR')}
                          </div>
                          {report.rating_numerico && (
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              Nota: {report.rating_numerico}/100
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(report)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
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
                    const count = reports.filter(r => r.tipo === type.value).length;
                    const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0;
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
                    const count = reports.filter(r => r.status === status.value).length;
                    const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0;
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
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Templates de Relatório</h3>
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
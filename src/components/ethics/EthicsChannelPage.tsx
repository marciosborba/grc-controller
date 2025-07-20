import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  UserX,
  MessageSquare,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EthicsReport {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  is_anonymous: boolean;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

const EthicsChannelPage = () => {
  const [reports, setReports] = useState<EthicsReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<EthicsReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<EthicsReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<EthicsReport | null>(null);
  const [activeTab, setActiveTab] = useState('reports');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    is_anonymous: false,
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
  });

  const [resolutionData, setResolutionData] = useState({
    status: 'resolved',
    resolution: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(report => report.severity === severityFilter);
    }
    
    setFilteredReports(filtered);
  }, [reports, searchTerm, categoryFilter, statusFilter, severityFilter]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('ethics_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar relatórios de ética',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reportData = {
        ...formData,
        status: 'open',
      };

      if (editingReport) {
        const { error } = await supabase
          .from('ethics_reports')
          .update(reportData)
          .eq('id', editingReport.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Relatório atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('ethics_reports')
          .insert([reportData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: formData.is_anonymous 
            ? 'Denúncia anônima enviada com sucesso' 
            : 'Relatório criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchReports();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar relatório',
        variant: 'destructive',
      });
    }
  };

  const handleResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from('ethics_reports')
        .update({
          status: resolutionData.status,
          resolution: resolutionData.resolution,
          assigned_to: resolutionData.assigned_to || user?.id,
          resolved_at: resolutionData.status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Relatório ${resolutionData.status === 'resolved' ? 'resolvido' : 'atualizado'} com sucesso`,
      });

      setIsResolutionDialogOpen(false);
      setSelectedReport(null);
      resetResolutionForm();
      fetchReports();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar relatório',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (report: EthicsReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description,
      category: report.category,
      severity: report.severity,
      is_anonymous: report.is_anonymous,
      reporter_name: report.reporter_name || '',
      reporter_email: report.reporter_email || '',
      reporter_phone: report.reporter_phone || '',
    });
    setIsDialogOpen(true);
  };

  const handleResolve = (report: EthicsReport) => {
    setSelectedReport(report);
    setResolutionData({
      status: report.status,
      resolution: report.resolution || '',
      assigned_to: report.assigned_to || '',
    });
    setIsResolutionDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return;
    
    try {
      const { error } = await supabase
        .from('ethics_reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Relatório excluído com sucesso',
      });
      
      fetchReports();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir relatório',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      severity: 'medium',
      is_anonymous: false,
      reporter_name: '',
      reporter_email: '',
      reporter_phone: '',
    });
    setEditingReport(null);
  };

  const resetResolutionForm = () => {
    setResolutionData({
      status: 'resolved',
      resolution: '',
      assigned_to: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'investigating': return 'Investigando';
      case 'in_review': return 'Em Análise';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return severity;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'discrimination': return 'Discriminação';
      case 'harassment': return 'Assédio';
      case 'corruption': return 'Corrupção';
      case 'fraud': return 'Fraude';
      case 'safety': return 'Segurança';
      case 'environment': return 'Meio Ambiente';
      case 'conflict_interest': return 'Conflito de Interesse';
      case 'data_protection': return 'Proteção de Dados';
      case 'other': return 'Outros';
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Canal de Ética</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Sistema de denúncias anônimas e identificadas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Denúncia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? 'Editar Relatório' : 'Nova Denúncia'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Título da denúncia"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    rows={4}
                    placeholder="Descreva detalhadamente o ocorrido, incluindo datas, locais e pessoas envolvidas..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discrimination">Discriminação</SelectItem>
                        <SelectItem value="harassment">Assédio</SelectItem>
                        <SelectItem value="corruption">Corrupção</SelectItem>
                        <SelectItem value="fraud">Fraude</SelectItem>
                        <SelectItem value="safety">Segurança no Trabalho</SelectItem>
                        <SelectItem value="environment">Meio Ambiente</SelectItem>
                        <SelectItem value="conflict_interest">Conflito de Interesse</SelectItem>
                        <SelectItem value="data_protection">Proteção de Dados</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="severity">Gravidade *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) => setFormData({...formData, severity: value})}
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
                </div>
                
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={formData.is_anonymous}
                      onCheckedChange={(checked) => setFormData({...formData, is_anonymous: checked})}
                    />
                    <Label htmlFor="anonymous" className="flex items-center space-x-2">
                      {formData.is_anonymous ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Denúncia Anônima</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Denúncia Identificada</span>
                        </>
                      )}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.is_anonymous 
                      ? 'Sua identidade será mantida em sigilo absoluto.' 
                      : 'Suas informações de contato serão utilizadas para acompanhamento do caso.'}
                  </p>
                </div>
                
                {!formData.is_anonymous && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h4 className="font-medium">Informações do Denunciante</h4>
                    
                    <div>
                      <Label htmlFor="reporter_name">Nome Completo</Label>
                      <Input
                        id="reporter_name"
                        value={formData.reporter_name}
                        onChange={(e) => setFormData({...formData, reporter_name: e.target.value})}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reporter_email">Email</Label>
                      <Input
                        id="reporter_email"
                        type="email"
                        value={formData.reporter_email}
                        onChange={(e) => setFormData({...formData, reporter_email: e.target.value})}
                        placeholder="seu.email@empresa.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reporter_phone">Telefone</Label>
                      <Input
                        id="reporter_phone"
                        value={formData.reporter_phone}
                        onChange={(e) => setFormData({...formData, reporter_phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingReport ? 'Atualizar' : 'Enviar Denúncia'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="guidelines">Diretrizes</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Pesquisar relatórios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="discrimination">Discriminação</SelectItem>
                    <SelectItem value="harassment">Assédio</SelectItem>
                    <SelectItem value="corruption">Corrupção</SelectItem>
                    <SelectItem value="fraud">Fraude</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="environment">Meio Ambiente</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Gravidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="investigating">Investigando</SelectItem>
                    <SelectItem value="in_review">Em Análise</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ethics Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{reports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <UserX className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Anônimas</p>
                    <p className="text-2xl font-bold">
                      {reports.filter(r => r.is_anonymous).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold">
                      {reports.filter(r => r.status === 'open' || r.status === 'investigating' || r.status === 'in_review').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Resolvidas</p>
                    <p className="text-2xl font-bold">
                      {reports.filter(r => r.status === 'resolved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                    <p className="text-2xl font-bold">
                      {reports.filter(r => r.severity === 'critical').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Ética</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Gravidade</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{report.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.description.substring(0, 60)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCategoryText(report.category)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(report.severity)}>
                            {getSeverityText(report.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {report.is_anonymous ? (
                              <>
                                <UserX className="h-4 w-4 mr-1" />
                                <span className="text-sm">Anônima</span>
                              </>
                            ) : (
                              <>
                                <User className="h-4 w-4 mr-1" />
                                <span className="text-sm">Identificada</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusText(report.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(report)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolve(report)}
                              title="Gerenciar Resolução"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredReports.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || severityFilter !== 'all'
                        ? 'Nenhum relatório encontrado com os filtros aplicados.'
                        : 'Nenhum relatório de ética encontrado.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(reports.map(r => r.category))).map(category => (
                    <div key={category} className="flex justify-between items-center">
                      <span>{getCategoryText(category)}</span>
                      <Badge variant="outline">
                        {reports.filter(r => r.category === category).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status dos Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['open', 'investigating', 'in_review', 'resolved', 'closed'].map(status => (
                    <div key={status} className="flex justify-between items-center">
                      <span>{getStatusText(status)}</span>
                      <Badge variant="outline">
                        {reports.filter(r => r.status === status).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes do Canal de Ética</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Como fazer uma denúncia</h3>
              <p>
                O Canal de Ética é um espaço seguro para relatar violações ao código de conduta, 
                práticas antiéticas ou ilegais. Você pode fazer denúncias de forma anônima ou identificada.
              </p>
              
              <h3>Tipos de situações que devem ser reportadas</h3>
              <ul>
                <li><strong>Discriminação:</strong> Tratamento diferenciado baseado em características pessoais</li>
                <li><strong>Assédio:</strong> Comportamento inadequado, intimidação ou coerção</li>
                <li><strong>Corrupção:</strong> Uso inadequado de cargo ou posição para benefício pessoal</li>
                <li><strong>Fraude:</strong> Atos desonestos com intenção de obter vantagem indevida</li>
                <li><strong>Segurança:</strong> Práticas que colocam em risco a segurança no trabalho</li>
                <li><strong>Meio Ambiente:</strong> Violações às normas ambientais</li>
              </ul>
              
              <h3>Garantias e Proteções</h3>
              <ul>
                <li>Confidencialidade total para denúncias anônimas</li>
                <li>Proteção contra retaliação para denunciantes identificados</li>
                <li>Investigação imparcial e profissional</li>
                <li>Acompanhamento do caso até a resolução</li>
              </ul>
              
              <h3>Processo de Investigação</h3>
              <ol>
                <li><strong>Recebimento:</strong> Denúncia é registrada no sistema</li>
                <li><strong>Análise Preliminar:</strong> Avaliação inicial da denúncia</li>
                <li><strong>Investigação:</strong> Coleta de evidências e depoimentos</li>
                <li><strong>Resolução:</strong> Conclusão e aplicação de medidas corretivas</li>
                <li><strong>Acompanhamento:</strong> Monitoramento das ações implementadas</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolution Dialog */}
      <Dialog open={isResolutionDialogOpen} onOpenChange={setIsResolutionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Resolução</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleResolution} className="space-y-4">
            <div>
              <Label>Relatório: {selectedReport?.title}</Label>
            </div>
            
            <div>
              <Label htmlFor="resolution_status">Status *</Label>
              <Select
                value={resolutionData.status}
                onValueChange={(value) => setResolutionData({...resolutionData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="investigating">Investigando</SelectItem>
                  <SelectItem value="in_review">Em Análise</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="resolution">Resolução / Comentários</Label>
              <Textarea
                id="resolution"
                value={resolutionData.resolution}
                onChange={(e) => setResolutionData({...resolutionData, resolution: e.target.value})}
                rows={4}
                placeholder="Descreva as ações tomadas, investigações realizadas e conclusões..."
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsResolutionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Atualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EthicsChannelPage;
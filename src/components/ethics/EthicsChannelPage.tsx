import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  FileText,
  BarChart3,
  Activity,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import EthicsReportCard from './EthicsReportCard';

export interface EthicsReport {
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

interface EthicsFilters {
  search_term: string;
  categories: string[];
  statuses: string[];
  severities: string[];
  show_anonymous_only: boolean;
  show_resolved: boolean;
}

const EthicsChannelPage = () => {
  const [reports, setReports] = useState<EthicsReport[]>([]);
  const [sortedReports, setSortedReports] = useState<EthicsReport[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<EthicsReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<EthicsReport | null>(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [isCardView, setIsCardView] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados de filtro
  const [filters, setFilters] = useState<EthicsFilters>({
    search_term: '',
    categories: [],
    statuses: [],
    severities: [],
    show_anonymous_only: false,
    show_resolved: true
  });

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

  // Configuração do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = [...reports];
    
    if (filters.search_term) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(filters.search_term.toLowerCase()) ||
        report.description.toLowerCase().includes(filters.search_term.toLowerCase()) ||
        report.category.toLowerCase().includes(filters.search_term.toLowerCase())
      );
    }
    
    if (filters.categories.length > 0) {
      filtered = filtered.filter(report => filters.categories.includes(report.category));
    }
    
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(report => filters.statuses.includes(report.status));
    }
    
    if (filters.severities.length > 0) {
      filtered = filtered.filter(report => filters.severities.includes(report.severity));
    }

    if (filters.show_anonymous_only) {
      filtered = filtered.filter(report => report.is_anonymous);
    }

    if (!filters.show_resolved) {
      filtered = filtered.filter(report => report.status !== 'resolved');
    }
    
    setSortedReports(filtered);
  }, [reports, filters]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedReports((reports) => {
        const oldIndex = reports.findIndex((report) => report.id === active.id);
        const newIndex = reports.findIndex((report) => report.id === over.id);

        return arrayMove(reports, oldIndex, newIndex);
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

  const updateFilter = (key: keyof EthicsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search_term: '',
      categories: [],
      statuses: [],
      severities: [],
      show_anonymous_only: false,
      show_resolved: true
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search_term ||
      filters.categories.length > 0 ||
      filters.statuses.length > 0 ||
      filters.severities.length > 0 ||
      filters.show_anonymous_only ||
      !filters.show_resolved
    );
  };

  const getMetrics = () => {
    return {
      total_reports: reports.length,
      anonymous_reports: reports.filter(r => r.is_anonymous).length,
      pending_reports: reports.filter(r => ['open', 'investigating', 'in_review'].includes(r.status)).length,
      resolved_reports: reports.filter(r => r.status === 'resolved').length,
      critical_reports: reports.filter(r => r.severity === 'critical').length,
      reports_by_category: reports.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Canal de Ética</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sistema de denúncias anônimas e identificadas para promoção da ética corporativa
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCardView(!isCardView)}
          >
            {isCardView ? <BarChart3 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            {isCardView ? 'Visão Lista' : 'Visão Cards'}
          </Button>
          
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
                  
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
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
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{metrics.total_reports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <UserX className="h-6 w-6 text-purple-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Anônimas</p>
                <p className="text-lg font-bold">{metrics.anonymous_reports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-lg font-bold">{metrics.pending_reports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Resolvidas</p>
                <p className="text-lg font-bold">{metrics.resolved_reports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Críticas</p>
                <p className="text-lg font-bold">{metrics.critical_reports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Filtros</h3>
              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar relatórios..."
                  value={filters.search_term}
                  onChange={(e) => updateFilter('search_term', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={filters.categories[0] || undefined} 
                onValueChange={(value) => updateFilter('categories', value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discrimination">Discriminação</SelectItem>
                  <SelectItem value="harassment">Assédio</SelectItem>
                  <SelectItem value="corruption">Corrupção</SelectItem>
                  <SelectItem value="fraud">Fraude</SelectItem>
                  <SelectItem value="safety">Segurança</SelectItem>
                  <SelectItem value="environment">Meio Ambiente</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.statuses[0] || undefined} 
                onValueChange={(value) => updateFilter('statuses', value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="investigating">Investigando</SelectItem>
                  <SelectItem value="in_review">Em Análise</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.severities[0] || undefined} 
                onValueChange={(value) => updateFilter('severities', value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.show_anonymous_only}
                  onChange={(e) => updateFilter('show_anonymous_only', e.target.checked)}
                />
                <span className="text-sm">Apenas anônimas</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!filters.show_resolved}
                  onChange={(e) => updateFilter('show_resolved', !e.target.checked)}
                />
                <span className="text-sm">Ocultar resolvidas</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatórios de Ética ({sortedReports.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {sortedReports.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {hasActiveFilters()
                  ? 'Nenhum relatório encontrado com os filtros aplicados.'
                  : 'Nenhum relatório de ética encontrado.'}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedReports.map(r => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sortedReports.map((report) => (
                    <EthicsReportCard
                      key={report.id}
                      report={report}
                      onEdit={handleEdit}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

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
                placeholder="Descreva as ações tomadas e a resolução do caso..."
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsResolutionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Atualizar Status
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EthicsChannelPage;
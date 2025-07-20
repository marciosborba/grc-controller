import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Search, Calendar as CalendarIcon, Edit, Trash2, ClipboardList, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuditReport {
  id: string;
  title: string;
  audit_type: string;
  status: string;
  scope: string | null;
  auditor_id: string | null;
  start_date: string | null;
  end_date: string | null;
  findings: string | null;
  recommendations: string | null;
  created_at: string;
  updated_at: string;
}

const AuditReportsPage = () => {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AuditReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<AuditReport | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    audit_type: '',
    status: 'draft',
    scope: '',
    auditor_id: '',
    findings: '',
    recommendations: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.audit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.scope?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.audit_type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    setFilteredReports(filtered);
  }, [reports, searchTerm, typeFilter, statusFilter]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar relatórios de auditoria',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reportData = {
        ...formData,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        auditor_id: user?.id,
      };

      if (editingReport) {
        const { error } = await supabase
          .from('audit_reports')
          .update(reportData)
          .eq('id', editingReport.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Relatório atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('audit_reports')
          .insert([reportData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Relatório criado com sucesso',
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

  const handleEdit = (report: AuditReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      audit_type: report.audit_type,
      status: report.status,
      scope: report.scope || '',
      auditor_id: report.auditor_id || '',
      findings: report.findings || '',
      recommendations: report.recommendations || '',
    });
    setStartDate(report.start_date ? new Date(report.start_date) : undefined);
    setEndDate(report.end_date ? new Date(report.end_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return;
    
    try {
      const { error } = await supabase
        .from('audit_reports')
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
      audit_type: '',
      status: 'draft',
      scope: '',
      auditor_id: '',
      findings: '',
      recommendations: '',
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setEditingReport(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'reviewed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'reviewed': return 'Revisado';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'internal': return 'Interna';
      case 'external': return 'Externa';
      case 'compliance': return 'Conformidade';
      case 'security': return 'Segurança';
      case 'financial': return 'Financeira';
      case 'operational': return 'Operacional';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios de Auditoria</h1>
          <p className="text-muted-foreground">Gerencie e monitore auditorias organizacionais</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? 'Editar Relatório' : 'Novo Relatório'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Ex: Auditoria de Segurança da Informação Q1 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="audit_type">Tipo de Auditoria *</Label>
                  <Select
                    value={formData.audit_type}
                    onValueChange={(value) => setFormData({...formData, audit_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Auditoria Interna</SelectItem>
                      <SelectItem value="external">Auditoria Externa</SelectItem>
                      <SelectItem value="compliance">Auditoria de Conformidade</SelectItem>
                      <SelectItem value="security">Auditoria de Segurança</SelectItem>
                      <SelectItem value="financial">Auditoria Financeira</SelectItem>
                      <SelectItem value="operational">Auditoria Operacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="reviewed">Revisado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Data de Término</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="scope">Escopo da Auditoria</Label>
                  <Textarea
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({...formData, scope: e.target.value})}
                    rows={3}
                    placeholder="Descreva o escopo, áreas e processos que serão auditados..."
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="findings">Achados da Auditoria</Label>
                  <Textarea
                    id="findings"
                    value={formData.findings}
                    onChange={(e) => setFormData({...formData, findings: e.target.value})}
                    rows={4}
                    placeholder="Descreva os principais achados, não conformidades e observações..."
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="recommendations">Recomendações</Label>
                  <Textarea
                    id="recommendations"
                    value={formData.recommendations}
                    onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                    rows={4}
                    placeholder="Liste as recomendações e ações corretivas propostas..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="internal">Interna</SelectItem>
                <SelectItem value="external">Externa</SelectItem>
                <SelectItem value="compliance">Conformidade</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
                <SelectItem value="financial">Financeira</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="reviewed">Revisado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
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
              <ClipboardList className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Revisados</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'reviewed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeText(report.audit_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusText(report.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.start_date && report.end_date ? (
                        <span className="text-sm">
                          {format(new Date(report.start_date), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(report.end_date), 'dd/MM/yy', { locale: ptBR })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
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
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Nenhum relatório encontrado com os filtros aplicados.'
                    : 'Nenhum relatório de auditoria encontrado.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditReportsPage;
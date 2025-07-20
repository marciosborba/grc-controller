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
import { CheckCircle, Plus, Search, Calendar as CalendarIcon, Edit, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ComplianceRecord {
  id: string;
  framework: string;
  control_id: string;
  control_description: string;
  compliance_status: string;
  evidence_url: string | null;
  last_assessment_date: string | null;
  next_assessment_date: string | null;
  responsible_person: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const CompliancePage = () => {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ComplianceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ComplianceRecord | null>(null);
  const [lastAssessmentDate, setLastAssessmentDate] = useState<Date>();
  const [nextAssessmentDate, setNextAssessmentDate] = useState<Date>();
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    framework: '',
    control_id: '',
    control_description: '',
    compliance_status: 'not_assessed',
    evidence_url: '',
    responsible_person: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = records;
    
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.control_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.framework.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (frameworkFilter !== 'all') {
      filtered = filtered.filter(record => record.framework === frameworkFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.compliance_status === statusFilter);
    }
    
    setFilteredRecords(filtered);
  }, [records, searchTerm, frameworkFilter, statusFilter]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_records')
        .select('*')
        .order('framework', { ascending: true });
      
      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar registros de conformidade',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recordData = {
        ...formData,
        last_assessment_date: lastAssessmentDate ? format(lastAssessmentDate, 'yyyy-MM-dd') : null,
        next_assessment_date: nextAssessmentDate ? format(nextAssessmentDate, 'yyyy-MM-dd') : null,
        created_by: user?.id,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('compliance_records')
          .update(recordData)
          .eq('id', editingRecord.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Registro atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('compliance_records')
          .insert([recordData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Registro criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchRecords();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar registro',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (record: ComplianceRecord) => {
    setEditingRecord(record);
    setFormData({
      framework: record.framework,
      control_id: record.control_id,
      control_description: record.control_description,
      compliance_status: record.compliance_status,
      evidence_url: record.evidence_url || '',
      responsible_person: record.responsible_person || '',
    });
    setLastAssessmentDate(record.last_assessment_date ? new Date(record.last_assessment_date) : undefined);
    setNextAssessmentDate(record.next_assessment_date ? new Date(record.next_assessment_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    try {
      const { error } = await supabase
        .from('compliance_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Registro excluído com sucesso',
      });
      
      fetchRecords();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir registro',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      framework: '',
      control_id: '',
      control_description: '',
      compliance_status: 'not_assessed',
      evidence_url: '',
      responsible_person: '',
    });
    setLastAssessmentDate(undefined);
    setNextAssessmentDate(undefined);
    setEditingRecord(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200';
      case 'partially_compliant': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_assessed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'compliant': return 'Conforme';
      case 'non_compliant': return 'Não Conforme';
      case 'partially_compliant': return 'Parcialmente Conforme';
      case 'not_assessed': return 'Não Avaliado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Conformidade</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Monitore a conformidade com frameworks regulatórios</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Editar Registro' : 'Novo Registro'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="framework">Framework *</Label>
                  <Select
                    value={formData.framework}
                    onValueChange={(value) => setFormData({...formData, framework: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                      <SelectItem value="LGPD">LGPD</SelectItem>
                      <SelectItem value="SOX">SOX</SelectItem>
                      <SelectItem value="NIST">NIST</SelectItem>
                      <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                      <SelectItem value="COBIT">COBIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="control_id">ID do Controle *</Label>
                  <Input
                    id="control_id"
                    value={formData.control_id}
                    onChange={(e) => setFormData({...formData, control_id: e.target.value})}
                    required
                    placeholder="Ex: A.5.1.1"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="control_description">Descrição do Controle *</Label>
                  <Textarea
                    id="control_description"
                    value={formData.control_description}
                    onChange={(e) => setFormData({...formData, control_description: e.target.value})}
                    required
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="compliance_status">Status de Conformidade *</Label>
                  <Select
                    value={formData.compliance_status}
                    onValueChange={(value) => setFormData({...formData, compliance_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliant">Conforme</SelectItem>
                      <SelectItem value="non_compliant">Não Conforme</SelectItem>
                      <SelectItem value="partially_compliant">Parcialmente Conforme</SelectItem>
                      <SelectItem value="not_assessed">Não Avaliado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="responsible_person">Responsável</Label>
                  <Input
                    id="responsible_person"
                    value={formData.responsible_person}
                    onChange={(e) => setFormData({...formData, responsible_person: e.target.value})}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="evidence_url">URL da Evidência</Label>
                  <Input
                    id="evidence_url"
                    value={formData.evidence_url}
                    onChange={(e) => setFormData({...formData, evidence_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <Label>Última Avaliação</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !lastAssessmentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lastAssessmentDate ? format(lastAssessmentDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={lastAssessmentDate}
                        onSelect={setLastAssessmentDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Próxima Avaliação</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextAssessmentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextAssessmentDate ? format(nextAssessmentDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nextAssessmentDate}
                        onSelect={setNextAssessmentDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRecord ? 'Atualizar' : 'Criar'}
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
                  placeholder="Pesquisar controles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                <SelectItem value="LGPD">LGPD</SelectItem>
                <SelectItem value="SOX">SOX</SelectItem>
                <SelectItem value="NIST">NIST</SelectItem>
                <SelectItem value="PCI DSS">PCI DSS</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="compliant">Conforme</SelectItem>
                <SelectItem value="non_compliant">Não Conforme</SelectItem>
                <SelectItem value="partially_compliant">Parcialmente</SelectItem>
                <SelectItem value="not_assessed">Não Avaliado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Conformes</p>
                <p className="text-2xl font-bold">
                  {records.filter(r => r.compliance_status === 'compliant').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Não Conformes</p>
                <p className="text-2xl font-bold">
                  {records.filter(r => r.compliance_status === 'non_compliant').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Parciais</p>
                <p className="text-2xl font-bold">
                  {records.filter(r => r.compliance_status === 'partially_compliant').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Framework</TableHead>
                <TableHead>Controle</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Avaliação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Badge variant="outline">{record.framework}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{record.control_id}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate">{record.control_description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.compliance_status)}>
                      {getStatusText(record.compliance_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.next_assessment_date ? format(new Date(record.next_assessment_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompliancePage;
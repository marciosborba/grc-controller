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
import { AlertTriangle, Plus, Search, Calendar as CalendarIcon, Edit, Trash2, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AIChatAssistant } from '@/components/ai/AIChatAssistant';
import { AIContentGenerator } from '@/components/ai/AIContentGenerator';
import { cn } from '@/lib/utils';

interface RiskAssessment {
  id: string;
  title: string;
  description: string | null;
  risk_category: string;
  severity: string;
  probability: string;
  impact_score: number;
  likelihood_score: number;
  risk_score: number;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const RiskManagementPage = () => {
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<RiskAssessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskAssessment | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    risk_category: '',
    severity: 'medium',
    probability: 'medium',
    impact_score: 5,
    likelihood_score: 5,
    status: 'open',
    assigned_to: '',
  });

  useEffect(() => {
    fetchRisks();
  }, []);

  useEffect(() => {
    let filtered = risks;
    
    if (searchTerm) {
      filtered = filtered.filter(risk => 
        risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.risk_category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(risk => risk.severity === severityFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(risk => risk.status === statusFilter);
    }
    
    setFilteredRisks(filtered);
  }, [risks, searchTerm, severityFilter, statusFilter]);

  const fetchRisks = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRisks(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar riscos',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const riskData = {
        ...formData,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        created_by: user?.id,
      };

      if (editingRisk) {
        const { error } = await supabase
          .from('risk_assessments')
          .update(riskData)
          .eq('id', editingRisk.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Risco atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('risk_assessments')
          .insert([riskData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Risco criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchRisks();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar risco',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (risk: RiskAssessment) => {
    setEditingRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description || '',
      risk_category: risk.risk_category,
      severity: risk.severity,
      probability: risk.probability,
      impact_score: risk.impact_score,
      likelihood_score: risk.likelihood_score,
      status: risk.status,
      assigned_to: risk.assigned_to || '',
    });
    setDueDate(risk.due_date ? new Date(risk.due_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este risco?')) return;
    
    try {
      const { error } = await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Risco excluído com sucesso',
      });
      
      fetchRisks();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir risco',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      risk_category: '',
      severity: 'medium',
      probability: 'medium',
      impact_score: 5,
      likelihood_score: 5,
      status: 'open',
      assigned_to: '',
    });
    setDueDate(undefined);
    setEditingRisk(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mitigated': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Riscos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gerencie e monitore os riscos da organização</p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <AIContentGenerator 
            type="risk_assessment"
            trigger={
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Avaliar com IA
              </Button>
            }
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="grc-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Novo Risco
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRisk ? 'Editar Risco' : 'Novo Risco'}
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
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.risk_category}
                    onValueChange={(value) => setFormData({...formData, risk_category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cyber Security">Segurança Cibernética</SelectItem>
                      <SelectItem value="Data Privacy">Privacidade de Dados</SelectItem>
                      <SelectItem value="Operational">Operacional</SelectItem>
                      <SelectItem value="Financial">Financeiro</SelectItem>
                      <SelectItem value="Compliance">Conformidade</SelectItem>
                      <SelectItem value="Strategic">Estratégico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="severity">Severidade *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: any) => setFormData({...formData, severity: value})}
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
                  <Label htmlFor="probability">Probabilidade *</Label>
                  <Select
                    value={formData.probability}
                    onValueChange={(value: any) => setFormData({...formData, probability: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_low">Muito Baixa</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="very_high">Muito Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="mitigated">Mitigado</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Impacto (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.impact_score}
                    onChange={(e) => setFormData({...formData, impact_score: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label>Probabilidade (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.likelihood_score}
                    onChange={(e) => setFormData({...formData, likelihood_score: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
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
                  {editingRisk ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar riscos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severidade" />
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
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="mitigated">Mitigado</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Riscos Críticos</p>
                <p className="text-2xl font-bold">
                  {risks.filter(r => r.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Riscos Altos</p>
                <p className="text-2xl font-bold">
                  {risks.filter(r => r.severity === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {risks.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{risks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riscos Identificados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{risk.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {risk.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{risk.risk_category}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(risk.severity)}>
                      {risk.severity === 'critical' ? 'Crítica' :
                       risk.severity === 'high' ? 'Alta' :
                       risk.severity === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(risk.status)}>
                      {risk.status === 'open' ? 'Aberto' :
                       risk.status === 'in_progress' ? 'Em Progresso' :
                       risk.status === 'mitigated' ? 'Mitigado' : 'Fechado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{risk.risk_score}</span>
                  </TableCell>
                  <TableCell>
                    {risk.due_date ? format(new Date(risk.due_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(risk)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(risk.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRisks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum risco encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <AIChatAssistant type="risk" context={{ risks: filteredRisks }} />
    </div>
  );
};

export default RiskManagementPage;
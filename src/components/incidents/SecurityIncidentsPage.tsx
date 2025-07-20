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
import { AlertCircle, Plus, Search, Calendar as CalendarIcon, Edit, Trash2, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SecurityIncident {
  id: string;
  title: string;
  description: string | null;
  incident_type: string;
  severity: string;
  status: string;
  affected_systems: string | null;
  detection_date: string;
  resolution_date: string | null;
  assigned_to: string | null;
  reported_by: string | null;
  created_at: string;
  updated_at: string;
}

const SecurityIncidentsPage = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<SecurityIncident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<SecurityIncident | null>(null);
  const [detectionDate, setDetectionDate] = useState<Date>(new Date());
  const [resolutionDate, setResolutionDate] = useState<Date>();
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_type: '',
    severity: 'medium',
    status: 'open',
    affected_systems: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    let filtered = incidents;
    
    if (searchTerm) {
      filtered = filtered.filter(incident => 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incident_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(incident => incident.severity === severityFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }
    
    setFilteredIncidents(filtered);
  }, [incidents, searchTerm, severityFilter, statusFilter]);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('detection_date', { ascending: false });
      
      if (error) throw error;
      setIncidents(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar incidentes',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const incidentData = {
        ...formData,
        detection_date: detectionDate.toISOString(),
        resolution_date: resolutionDate ? resolutionDate.toISOString() : null,
        reported_by: user?.id,
      };

      if (editingIncident) {
        const { error } = await supabase
          .from('security_incidents')
          .update(incidentData)
          .eq('id', editingIncident.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Incidente atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('security_incidents')
          .insert([incidentData]);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Incidente criado com sucesso',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchIncidents();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar incidente',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (incident: SecurityIncident) => {
    setEditingIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description || '',
      incident_type: incident.incident_type,
      severity: incident.severity,
      status: incident.status,
      affected_systems: incident.affected_systems || '',
      assigned_to: incident.assigned_to || '',
    });
    setDetectionDate(new Date(incident.detection_date));
    setResolutionDate(incident.resolution_date ? new Date(incident.resolution_date) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este incidente?')) return;
    
    try {
      const { error } = await supabase
        .from('security_incidents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Incidente excluído com sucesso',
      });
      
      fetchIncidents();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir incidente',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      incident_type: '',
      severity: 'medium',
      status: 'open',
      affected_systems: '',
      assigned_to: '',
    });
    setDetectionDate(new Date());
    setResolutionDate(undefined);
    setEditingIncident(null);
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
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contained': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Incidentes de Segurança</h1>
          <p className="text-muted-foreground">Gerencie e monitore incidentes de segurança</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIncident ? 'Editar Incidente' : 'Novo Incidente'}
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
                  <Label htmlFor="incident_type">Tipo de Incidente *</Label>
                  <Select
                    value={formData.incident_type}
                    onValueChange={(value) => setFormData({...formData, incident_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Malware">Malware</SelectItem>
                      <SelectItem value="Phishing">Phishing</SelectItem>
                      <SelectItem value="Data Breach">Vazamento de Dados</SelectItem>
                      <SelectItem value="Unauthorized Access">Acesso Não Autorizado</SelectItem>
                      <SelectItem value="DDoS">Ataque DDoS</SelectItem>
                      <SelectItem value="Social Engineering">Engenharia Social</SelectItem>
                      <SelectItem value="System Failure">Falha de Sistema</SelectItem>
                      <SelectItem value="Other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="severity">Severidade *</Label>
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
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="investigating">Investigando</SelectItem>
                      <SelectItem value="contained">Contido</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="affected_systems">Sistemas Afetados</Label>
                  <Input
                    id="affected_systems"
                    value={formData.affected_systems}
                    onChange={(e) => setFormData({...formData, affected_systems: e.target.value})}
                    placeholder="Ex: Sistema de email, Base de dados"
                  />
                </div>
                
                <div>
                  <Label>Data de Detecção *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(detectionDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={detectionDate}
                        onSelect={(date) => date && setDetectionDate(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Data de Resolução</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !resolutionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {resolutionDate ? format(resolutionDate, "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={resolutionDate}
                        onSelect={setResolutionDate}
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
                  {editingIncident ? 'Atualizar' : 'Criar'}
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
                  placeholder="Pesquisar incidentes..."
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
                <SelectItem value="investigating">Investigando</SelectItem>
                <SelectItem value="contained">Contido</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incident Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">
                  {incidents.filter(i => i.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Abertos</p>
                <p className="text-2xl font-bold">
                  {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold">
                  {incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{incidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incidentes de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sistemas Afetados</TableHead>
                <TableHead>Detecção</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {incident.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{incident.incident_type}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity === 'critical' ? 'Crítica' :
                       incident.severity === 'high' ? 'Alta' :
                       incident.severity === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status === 'open' ? 'Aberto' :
                       incident.status === 'investigating' ? 'Investigando' :
                       incident.status === 'contained' ? 'Contido' :
                       incident.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {incident.affected_systems || '-'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(incident.detection_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(incident)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(incident.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredIncidents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum incidente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityIncidentsPage;
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle, 
  Bell,
  Filter,
  Download,
  Send,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { usePrivacyIncidents, IncidentFilters, ANPDNotificationData } from '@/hooks/usePrivacyIncidents';
import { PrivacyIncident } from '@/types/privacy-management';
import { PrivacyIncidentCard } from './PrivacyIncidentCard';
import { CreateIncidentDialog } from './CreateIncidentDialog';
import { ANPDNotificationDialog } from './ANPDNotificationDialog';

export function PrivacyIncidentsPage() {
  const {
    incidents,
    loading,
    stats,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
    notifyANPD,
    generateANPDNotification,
    checkOverdueNotifications,
    containIncident,
    closeIncident
  } = usePrivacyIncidents();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedIncidentForNotification, setSelectedIncidentForNotification] = useState<string | null>(null);
  const [overdueIncidents, setOverdueIncidents] = useState<PrivacyIncident[]>([]);

  // Check for overdue notifications on component mount
  useEffect(() => {
    checkOverdue();
  }, []);

  const checkOverdue = async () => {
    const result = await checkOverdueNotifications();
    if (result.success && result.overdueIncidents) {
      setOverdueIncidents(result.overdueIncidents);
    }
  };

  // Filter incidents based on search and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incident_source?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof IncidentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchIncidents(newFilters);
  };

  // Handle selection
  const handleSelectIncident = (incidentId: string, selected: boolean) => {
    if (selected) {
      setSelectedIncidents([...selectedIncidents, incidentId]);
    } else {
      setSelectedIncidents(selectedIncidents.filter(id => id !== incidentId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIncidents(filteredIncidents.map(incident => incident.id));
    } else {
      setSelectedIncidents([]);
    }
  };

  // Handle incident creation
  const handleCreateIncident = async (incidentData: Partial<PrivacyIncident>) => {
    const result = await createIncident(incidentData);
    if (result.success) {
      toast.success('Incidente criado com sucesso');
      setCreateDialogOpen(false);
      
      // Check if ANPD notification is required
      if (incidentData.severity_level === 'critical' || incidentData.severity_level === 'high') {
        toast.warning('Este incidente pode requerer notificação à ANPD');
      }
    } else {
      toast.error(result.error || 'Erro ao criar incidente');
    }
  };

  // Handle ANPD notification
  const handleNotifyANPD = async (notificationData: ANPDNotificationData) => {
    if (!selectedIncidentForNotification) return;

    const result = await notifyANPD(selectedIncidentForNotification, notificationData);
    if (result.success) {
      toast.success('ANPD notificada com sucesso');
      setNotificationDialogOpen(false);
      setSelectedIncidentForNotification(null);
    } else {
      toast.error(result.error || 'Erro ao notificar ANPD');
    }
  };

  // Handle incident containment
  const handleContainIncident = async (incidentId: string, measures: string[]) => {
    const result = await containIncident(incidentId, measures);
    if (result.success) {
      toast.success('Incidente contido');
    } else {
      toast.error(result.error || 'Erro ao conter incidente');
    }
  };

  // Handle incident closure
  const handleCloseIncident = async (incidentId: string, finalReport: string) => {
    const result = await closeIncident(incidentId, finalReport);
    if (result.success) {
      toast.success('Incidente encerrado');
    } else {
      toast.error(result.error || 'Erro ao encerrar incidente');
    }
  };

  // Generate ANPD notification document
  const handleGenerateNotification = async (incidentId: string) => {
    const result = await generateANPDNotification(incidentId);
    if (result.success) {
      // In a real implementation, this would trigger a document download
      toast.success('Documento de notificação gerado');
    } else {
      toast.error(result.error || 'Erro ao gerar documento');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Incidentes de Privacidade
          </h1>
          <p className="text-muted-foreground">
            Gestão de incidentes e comunicação com a ANPD
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateIncidentDialog onCreateIncident={handleCreateIncident} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overdue Notifications Alert */}
      {overdueIncidents.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {overdueIncidents.length} incidente(s) com notificação à ANPD em atraso (prazo de 72h ultrapassado).
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2"
              onClick={() => handleFilterChange('overdue', true)}
            >
              Ver Incidentes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth} neste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Abertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">
              {stats.critical} críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requer Notificação ANPD</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.requiresANPDNotification}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdue} em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ANPD Notificada</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.anpdNotified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.resolved} resolvidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar incidentes por título, descrição ou fonte..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select 
                value={filters.status || ''} 
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="investigating">Investigando</SelectItem>
                  <SelectItem value="escalated">Escalado</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Encerrado</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.severity || ''} 
                onValueChange={(value) => handleFilterChange('severity', value || undefined)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => handleFilterChange('requiresANPD', !filters.requiresANPD)}
                className={filters.requiresANPD ? 'bg-red-50 border-red-200' : ''}
              >
                <Bell className="w-4 h-4 mr-1" />
                ANPD
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIncidents.length > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedIncidents.length} selecionado(s)
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {}}
                className="flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Exportar Relatório
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Find first incident that requires ANPD notification
                  const incidentRequiringNotification = selectedIncidents.find(id => {
                    const incident = incidents.find(i => i.id === id);
                    return incident?.anpd_notification_required && !incident?.anpd_notified;
                  });
                  
                  if (incidentRequiringNotification) {
                    setSelectedIncidentForNotification(incidentRequiringNotification);
                    setNotificationDialogOpen(true);
                  } else {
                    toast.info('Nenhum incidente selecionado requer notificação à ANPD');
                  }
                }}
                className="flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Notificar ANPD
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="open">Abertos ({stats.open})</TabsTrigger>
          <TabsTrigger value="anpd">Requer ANPD ({stats.requiresANPDNotification})</TabsTrigger>
          <TabsTrigger value="overdue">Em Atraso ({stats.overdue})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderIncidentsList(filteredIncidents)}
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          {renderIncidentsList(filteredIncidents.filter(i => ['open', 'investigating', 'escalated'].includes(i.status)))}
        </TabsContent>

        <TabsContent value="anpd" className="space-y-4">
          {renderIncidentsList(filteredIncidents.filter(i => i.anpd_notification_required))}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {renderIncidentsList(overdueIncidents)}
        </TabsContent>
      </Tabs>

      {/* ANPD Notification Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <ANPDNotificationDialog 
            incidentId={selectedIncidentForNotification}
            incident={selectedIncidentForNotification ? 
              incidents.find(i => i.id === selectedIncidentForNotification) : undefined
            }
            onNotify={handleNotifyANPD}
            onCancel={() => {
              setNotificationDialogOpen(false);
              setSelectedIncidentForNotification(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render incidents list
  function renderIncidentsList(incidentsList: PrivacyIncident[]) {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando incidentes...</p>
        </div>
      );
    }

    if (incidentsList.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'Nenhum incidente encontrado' 
                : 'Nenhum incidente registrado'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Tente ajustar os filtros ou termo de busca'
                : 'Registre o primeiro incidente de privacidade'
              }
            </p>
            {!searchTerm && Object.keys(filters).length === 0 && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Incidente
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Select All Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="select-all-incidents"
            checked={selectedIncidents.length === incidentsList.length && incidentsList.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="select-all-incidents" className="text-sm text-muted-foreground">
            Selecionar todos ({incidentsList.length})
          </label>
        </div>

        {/* Incident Cards */}
        {incidentsList.map((incident) => (
          <PrivacyIncidentCard
            key={incident.id}
            incident={incident}
            selected={selectedIncidents.includes(incident.id)}
            onSelect={(selected) => handleSelectIncident(incident.id, selected)}
            onUpdate={(updates) => updateIncident(incident.id, updates)}
            onDelete={() => deleteIncident(incident.id)}
            onContain={(measures) => handleContainIncident(incident.id, measures)}
            onClose={(report) => handleCloseIncident(incident.id, report)}
            onNotifyANPD={() => {
              setSelectedIncidentForNotification(incident.id);
              setNotificationDialogOpen(true);
            }}
            onGenerateNotification={() => handleGenerateNotification(incident.id)}
          />
        ))}
      </>
    );
  }
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  UserCheck,
  Filter,
  Download,
  Send,
  Eye,
  Calendar,
  User,
  FileText,
  AlertCircle,
  ArrowLeft
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

import { useDataSubjectRequests, RequestFilters } from '@/hooks/useDataSubjectRequests';
import { DataSubjectRequest, DataSubjectRequestType, DataSubjectRequestStatus, REQUEST_TYPES } from '@/types/privacy-management';
import { DataSubjectRequestCard } from './DataSubjectRequestCard';
import { CreateRequestDialog } from './CreateRequestDialog';
import { RequestProcessingDialog } from './RequestProcessingDialog';

export function DataSubjectRequestsPage() {
  const navigate = useNavigate();
  const {
    requests,
    loading,
    stats,
    fetchRequests,
    createRequest,
    verifyIdentity,
    processRequest,
    assignRequest,
    escalateRequest,
    getUrgentRequests,
    generateResponseTemplate
  } = useDataSubjectRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<RequestFilters>({});
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [selectedRequestForProcessing, setSelectedRequestForProcessing] = useState<string | null>(null);
  const [urgentRequests, setUrgentRequests] = useState<any[]>([]);

  // Check for urgent requests on component mount
  useEffect(() => {
    checkUrgentRequests();
  }, []);

  const checkUrgentRequests = async () => {
    const urgent = await getUrgentRequests();
    setUrgentRequests(urgent);
  };

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.data_subject_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.data_subject_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof RequestFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchRequests(newFilters);
  };

  // Handle selection
  const handleSelectRequest = (requestId: string, selected: boolean) => {
    if (selected) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRequests(filteredRequests.map(request => request.id));
    } else {
      setSelectedRequests([]);
    }
  };

  // Handle request creation
  const handleCreateRequest = async (requestData: Partial<DataSubjectRequest>) => {
    const result = await createRequest(requestData);
    if (result.success) {
      toast.success('Solicitação criada com sucesso');
      setCreateDialogOpen(false);
      await checkUrgentRequests(); // Refresh urgent requests
    } else {
      toast.error(result.error || 'Erro ao criar solicitação');
    }
  };

  // Handle identity verification
  const handleVerifyIdentity = async (requestId: string, verificationData: any) => {
    const result = await verifyIdentity({
      request_id: requestId,
      ...verificationData
    });
    
    if (result.success) {
      toast.success('Identidade verificada com sucesso');
    } else {
      toast.error(result.error || 'Erro ao verificar identidade');
    }
  };

  // Handle request processing
  const handleProcessRequest = async (processingData: any) => {
    if (!selectedRequestForProcessing) return;

    const result = await processRequest({
      request_id: selectedRequestForProcessing,
      ...processingData
    });
    
    if (result.success) {
      toast.success('Solicitação processada com sucesso');
      setProcessingDialogOpen(false);
      setSelectedRequestForProcessing(null);
      await checkUrgentRequests(); // Refresh urgent requests
    } else {
      toast.error(result.error || 'Erro ao processar solicitação');
    }
  };

  // Handle request assignment
  const handleAssignRequest = async (requestId: string, assignedTo: string, notes?: string) => {
    const result = await assignRequest({
      request_id: requestId,
      assigned_to: assignedTo,
      assignment_notes: notes
    });
    
    if (result.success) {
      toast.success('Solicitação atribuída com sucesso');
    } else {
      toast.error(result.error || 'Erro ao atribuir solicitação');
    }
  };

  // Handle request escalation
  const handleEscalateRequest = async (requestId: string, escalatedTo: string, reason: string) => {
    const result = await escalateRequest(requestId, escalatedTo, reason);
    
    if (result.success) {
      toast.success('Solicitação escalada com sucesso');
    } else {
      toast.error(result.error || 'Erro ao escalar solicitação');
    }
  };

  // Generate response template
  const handleGenerateTemplate = async (requestId: string) => {
    const result = await generateResponseTemplate(requestId);
    if (result.success) {
      toast.success('Template de resposta gerado');
      // In a real implementation, this would open a dialog with the template
    } else {
      toast.error(result.error || 'Erro ao gerar template');
    }
  };

  // Get status color for badges
  const getStatusColor = (status: DataSubjectRequestStatus) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'under_verification': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'partially_completed': return 'bg-orange-100 text-orange-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: DataSubjectRequestStatus) => {
    const labels = {
      received: 'Recebida',
      under_verification: 'Em Verificação',
      verified: 'Verificada',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      rejected: 'Rejeitada',
      partially_completed: 'Parcialmente Concluída',
      escalated: 'Escalada'
    };
    return labels[status] || status;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/privacy')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h1 className="text-3xl font-bold text-foreground">
              Solicitações de Titulares
            </h1>
            <p className="text-muted-foreground">
              Gestão de direitos dos titulares de dados pessoais
            </p>
          </div>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateRequestDialog onCreateRequest={handleCreateRequest} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Urgent Requests Alert */}
      {urgentRequests.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> {urgentRequests.length} solicitação(ões) com prazo próximo ao vencimento ou em atraso.
          </AlertDescription>
        </Alert>
      )}

      {/* Overdue Requests Alert */}
      {stats.overdue > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgente:</strong> {stats.overdue} solicitação(ões) com prazo vencido. Resposta obrigatória pela LGPD.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verification_pending} aguardando verificação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
            <p className="text-xs text-muted-foreground">
              Sendo processadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Pesquisa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Pesquisar por nome, email ou descrição..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="received">Recebida</SelectItem>
                  <SelectItem value="under_verification">Em Verificação</SelectItem>
                  <SelectItem value="verified">Verificada</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('request_type', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo de Solicitação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {Object.entries(REQUEST_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('verification_status', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Verificação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="verified">Verificadas</SelectItem>
                  <SelectItem value="unverified">Não Verificadas</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFilterChange('overdue', true)}
                className="text-red-600 hover:text-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Atrasadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            Todas ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="verification">
            Verificação ({stats.verification_pending})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            Andamento ({stats.in_progress})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Atrasadas ({stats.overdue})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({stats.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Carregando solicitações...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <DataSubjectRequestCard
                  key={request.id}
                  request={request}
                  onVerifyIdentity={(verificationData) => handleVerifyIdentity(request.id, verificationData)}
                  onProcessRequest={() => {
                    setSelectedRequestForProcessing(request.id);
                    setProcessingDialogOpen(true);
                  }}
                  onAssignRequest={(assignedTo, notes) => handleAssignRequest(request.id, assignedTo, notes)}
                  onEscalateRequest={(escalatedTo, reason) => handleEscalateRequest(request.id, escalatedTo, reason)}
                  onGenerateTemplate={() => handleGenerateTemplate(request.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tab contents would be similar but with different filtering */}
        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {filteredRequests
              .filter(request => ['received', 'under_verification'].includes(request.status))
              .map((request) => (
                <DataSubjectRequestCard
                  key={request.id}
                  request={request}
                  onVerifyIdentity={(verificationData) => handleVerifyIdentity(request.id, verificationData)}
                  onProcessRequest={() => {
                    setSelectedRequestForProcessing(request.id);
                    setProcessingDialogOpen(true);
                  }}
                  onAssignRequest={(assignedTo, notes) => handleAssignRequest(request.id, assignedTo, notes)}
                  onEscalateRequest={(escalatedTo, reason) => handleEscalateRequest(request.id, escalatedTo, reason)}
                  onGenerateTemplate={() => handleGenerateTemplate(request.id)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <div className="grid gap-4">
            {filteredRequests
              .filter(request => !request.identity_verified)
              .map((request) => (
                <DataSubjectRequestCard
                  key={request.id}
                  request={request}
                  onVerifyIdentity={(verificationData) => handleVerifyIdentity(request.id, verificationData)}
                  onProcessRequest={() => {
                    setSelectedRequestForProcessing(request.id);
                    setProcessingDialogOpen(true);
                  }}
                  onAssignRequest={(assignedTo, notes) => handleAssignRequest(request.id, assignedTo, notes)}
                  onEscalateRequest={(escalatedTo, reason) => handleEscalateRequest(request.id, escalatedTo, reason)}
                  onGenerateTemplate={() => handleGenerateTemplate(request.id)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          <div className="grid gap-4">
            {filteredRequests
              .filter(request => ['verified', 'in_progress'].includes(request.status))
              .map((request) => (
                <DataSubjectRequestCard
                  key={request.id}
                  request={request}
                  onVerifyIdentity={(verificationData) => handleVerifyIdentity(request.id, verificationData)}
                  onProcessRequest={() => {
                    setSelectedRequestForProcessing(request.id);
                    setProcessingDialogOpen(true);
                  }}
                  onAssignRequest={(assignedTo, notes) => handleAssignRequest(request.id, assignedTo, notes)}
                  onEscalateRequest={(escalatedTo, reason) => handleEscalateRequest(request.id, escalatedTo, reason)}
                  onGenerateTemplate={() => handleGenerateTemplate(request.id)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <div className="grid gap-4">
            {filteredRequests
              .filter(request => {
                const now = new Date();
                return !['completed', 'rejected'].includes(request.status) && 
                       new Date(request.due_date) < now;
              })
              .map((request) => (
                <DataSubjectRequestCard
                  key={request.id}
                  request={request}
                  onVerifyIdentity={(verificationData) => handleVerifyIdentity(request.id, verificationData)}
                  onProcessRequest={() => {
                    setSelectedRequestForProcessing(request.id);
                    setProcessingDialogOpen(true);
                  }}
                  onAssignRequest={(assignedTo, notes) => handleAssignRequest(request.id, assignedTo, notes)}
                  onEscalateRequest={(escalatedTo, reason) => handleEscalateRequest(request.id, escalatedTo, reason)}
                  onGenerateTemplate={() => handleGenerateTemplate(request.id)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {filteredRequests
              .filter(request => ['completed', 'partially_completed'].includes(request.status))
              .map((request) => (
                <DataSubjectRequestCard
                  key={request.id}
                  request={request}
                  onVerifyIdentity={(verificationData) => handleVerifyIdentity(request.id, verificationData)}
                  onProcessRequest={() => {
                    setSelectedRequestForProcessing(request.id);
                    setProcessingDialogOpen(true);
                  }}
                  onAssignRequest={(assignedTo, notes) => handleAssignRequest(request.id, assignedTo, notes)}
                  onEscalateRequest={(escalatedTo, reason) => handleEscalateRequest(request.id, escalatedTo, reason)}
                  onGenerateTemplate={() => handleGenerateTemplate(request.id)}
                />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Processing Dialog */}
      <Dialog open={processingDialogOpen} onOpenChange={setProcessingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <RequestProcessingDialog 
            requestId={selectedRequestForProcessing}
            onProcessRequest={handleProcessRequest}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
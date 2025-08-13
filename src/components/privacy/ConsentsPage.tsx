import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Users,
  Mail,
  Calendar,
  Shield,
  AlertCircle
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

import { useConsents, ConsentFilters } from '@/hooks/useConsents';
import { Consent, ConsentStatus, CollectionMethod } from '@/types/privacy-management';
import { ConsentCard } from './ConsentCard';
import { CreateConsentDialog } from './CreateConsentDialog';

export function ConsentsPage() {
  const {
    consents,
    loading,
    stats,
    fetchConsents,
    createConsent,
    revokeConsent,
    renewConsent,
    checkExpiringConsents,
    getConsentsByDataSubject,
    bulkRevokeConsents,
    generateConsentReport
  } = useConsents();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ConsentFilters>({});
  const [selectedConsents, setSelectedConsents] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expiringConsents, setExpiringConsents] = useState<Consent[]>([]);
  const [expiredConsents, setExpiredConsents] = useState<Consent[]>([]);

  // Check for expiring consents on component mount
  useEffect(() => {
    checkExpiring();
  }, []);

  const checkExpiring = async () => {
    const result = await checkExpiringConsents();
    setExpiringConsents(result.expiring);
    setExpiredConsents(result.expired);
  };

  // Filter consents based on search and filters
  const filteredConsents = consents.filter(consent => {
    const matchesSearch = 
      consent.data_subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.data_subject_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof ConsentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchConsents(newFilters);
  };

  // Handle selection
  const handleSelectConsent = (consentId: string, selected: boolean) => {
    if (selected) {
      setSelectedConsents([...selectedConsents, consentId]);
    } else {
      setSelectedConsents(selectedConsents.filter(id => id !== consentId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedConsents(filteredConsents.map(consent => consent.id));
    } else {
      setSelectedConsents([]);
    }
  };

  // Handle consent creation
  const handleCreateConsent = async (consentData: Partial<Consent>) => {
    const result = await createConsent(consentData);
    if (result.success) {
      toast.success('Consentimento registrado com sucesso');
      setCreateDialogOpen(false);
    } else {
      toast.error(result.error || 'Erro ao registrar consentimento');
    }
  };

  // Handle consent revocation
  const handleRevokeConsent = async (id: string, reason?: string) => {
    const result = await revokeConsent({
      consent_id: id,
      revocation_reason: reason,
      revoked_by: 'current-user-id', // This should come from auth context
      notification_method: 'email'
    });
    
    if (result.success) {
      toast.success('Consentimento revogado');
    } else {
      toast.error(result.error || 'Erro ao revogar consentimento');
    }
  };

  // Handle consent renewal
  const handleRenewConsent = async (id: string, newExpiryDate: string) => {
    const result = await renewConsent({
      consent_id: id,
      new_expiry_date: newExpiryDate,
      renewal_method: 'email' as CollectionMethod,
      renewed_by: 'current-user-id'
    });
    
    if (result.success) {
      toast.success('Consentimento renovado');
    } else {
      toast.error(result.error || 'Erro ao renovar consentimento');
    }
  };

  // Handle bulk revocation
  const handleBulkRevoke = async () => {
    if (selectedConsents.length === 0) {
      toast.error('Selecione pelo menos um consentimento');
      return;
    }

    // In a real implementation, this would show a confirmation dialog
    const reason = 'Revogação em lote solicitada pelo usuário';
    
    // For bulk operations, we would need to implement this differently
    // For now, we'll revoke each consent individually
    let successCount = 0;
    for (const consentId of selectedConsents) {
      const result = await revokeConsent({
        consent_id: consentId,
        revocation_reason: reason,
        revoked_by: 'current-user-id'
      });
      if (result.success) successCount++;
    }
    
    toast.success(`${successCount} consentimento(s) revogado(s)`);
    setSelectedConsents([]);
  };

  // Generate report
  const handleGenerateReport = async () => {
    const report = await generateConsentReport(filters);
    toast.success(`Relatório gerado: ${report.summary.total} consentimento(s)`);
    // In a real implementation, this would trigger a document download
  };

  // Get status color for badges
  const getStatusColor = (status: ConsentStatus) => {
    switch (status) {
      case 'granted': return 'bg-green-100 text-green-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: ConsentStatus) => {
    const labels = {
      granted: 'Concedido',
      revoked: 'Revogado',
      expired: 'Expirado',
      pending: 'Pendente'
    };
    return labels[status] || status;
  };

  // Get collection method label
  const getCollectionMethodLabel = (method: CollectionMethod) => {
    const labels = {
      website_form: 'Formulário Web',
      mobile_app: 'App Mobile',
      phone_call: 'Ligação',
      email: 'Email',
      physical_form: 'Formulário Físico',
      api: 'API',
      import: 'Importação',
      other: 'Outro'
    };
    return labels[method] || method;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestão de Consentimentos
          </h1>
          <p className="text-muted-foreground">
            Controle e auditoria de consentimentos LGPD
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Registrar Consentimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <CreateConsentDialog onCreateConsent={handleCreateConsent} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Expiring Consents Alert */}
      {expiringConsents.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> {expiringConsents.length} consentimento(s) expirando em até 30 dias.
          </AlertDescription>
        </Alert>
      )}

      {/* Expired Consents Alert */}
      {expiredConsents.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgente:</strong> {expiredConsents.length} consentimento(s) expiraram automaticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.granted}</div>
            <p className="text-xs text-muted-foreground">
              Consentimentos válidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revogados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
            <p className="text-xs text-muted-foreground">
              Revogados pelos titulares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirando</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</div>
            <p className="text-xs text-muted-foreground">
              Próximos de expirar
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
                  placeholder="Pesquisar por titular, email ou finalidade..."
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
                  <SelectItem value="granted">Concedidos</SelectItem>
                  <SelectItem value="revoked">Revogados</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('collection_method', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Método de Coleta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Métodos</SelectItem>
                  <SelectItem value="website_form">Formulário Web</SelectItem>
                  <SelectItem value="mobile_app">App Mobile</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone_call">Ligação</SelectItem>
                  <SelectItem value="physical_form">Formulário Físico</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFilterChange('expiring_soon', true)}
                className="text-orange-600 hover:text-orange-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Expirando
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedConsents.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedConsents.length} selecionado(s)
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkRevoke}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Revogar Selecionados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consents Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            Todos ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="granted">
            Ativos ({stats.granted})
          </TabsTrigger>
          <TabsTrigger value="revoked">
            Revogados ({stats.revoked})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expirados ({stats.expired})
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Expirando ({stats.expiring_soon})
          </TabsTrigger>
          <TabsTrigger value="by-method">
            Por Método
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Carregando consentimentos...</div>
          ) : filteredConsents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum consentimento encontrado
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredConsents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  selected={selectedConsents.includes(consent.id)}
                  onSelect={(selected) => handleSelectConsent(consent.id, selected)}
                  onRevoke={(reason) => handleRevokeConsent(consent.id, reason)}
                  onRenew={(newExpiryDate) => handleRenewConsent(consent.id, newExpiryDate)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="granted" className="space-y-4">
          <div className="grid gap-4">
            {filteredConsents
              .filter(consent => consent.status === 'granted')
              .map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  selected={selectedConsents.includes(consent.id)}
                  onSelect={(selected) => handleSelectConsent(consent.id, selected)}
                  onRevoke={(reason) => handleRevokeConsent(consent.id, reason)}
                  onRenew={(newExpiryDate) => handleRenewConsent(consent.id, newExpiryDate)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revoked" className="space-y-4">
          <div className="grid gap-4">
            {filteredConsents
              .filter(consent => consent.status === 'revoked')
              .map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  selected={selectedConsents.includes(consent.id)}
                  onSelect={(selected) => handleSelectConsent(consent.id, selected)}
                  onRevoke={(reason) => handleRevokeConsent(consent.id, reason)}
                  onRenew={(newExpiryDate) => handleRenewConsent(consent.id, newExpiryDate)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <div className="grid gap-4">
            {filteredConsents
              .filter(consent => consent.status === 'expired')
              .map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  selected={selectedConsents.includes(consent.id)}
                  onSelect={(selected) => handleSelectConsent(consent.id, selected)}
                  onRevoke={(reason) => handleRevokeConsent(consent.id, reason)}
                  onRenew={(newExpiryDate) => handleRenewConsent(consent.id, newExpiryDate)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <div className="grid gap-4">
            {expiringConsents.map((consent) => (
              <ConsentCard
                key={consent.id}
                consent={consent}
                selected={selectedConsents.includes(consent.id)}
                onSelect={(selected) => handleSelectConsent(consent.id, selected)}
                onRevoke={(reason) => handleRevokeConsent(consent.id, reason)}
                onRenew={(newExpiryDate) => handleRenewConsent(consent.id, newExpiryDate)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-method" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.by_collection_method).map(([method, count]) => (
              <Card key={method}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base">{getCollectionMethodLabel(method as CollectionMethod)}</span>
                    <Badge variant="outline">
                      {count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredConsents
                      .filter(consent => consent.collection_method === method)
                      .slice(0, 3)
                      .map(consent => (
                        <div key={consent.id} className="text-sm">
                          <div className="font-medium">{consent.data_subject_name || consent.data_subject_email}</div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(consent.status)}>
                              {getStatusLabel(consent.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {consent.purpose.substring(0, 30)}...
                            </span>
                          </div>
                        </div>
                      ))
                    }
                    {count > 3 && (
                      <div className="text-sm text-muted-foreground">
                        + {count - 3} outros...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
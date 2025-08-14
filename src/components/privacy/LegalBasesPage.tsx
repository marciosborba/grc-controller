import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield,
  Filter,
  Download,
  Eye,
  Edit,
  Pause,
  Play,
  Calendar,
  Users,
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

import { useLegalBases, LegalBasisFilters } from '@/hooks/useLegalBases';
import { LegalBasis, LegalBasisType, LegalBasisStatus, LEGAL_BASIS_TYPES } from '@/types/privacy-management';
import { LegalBasisCard } from './LegalBasisCard';
import { CreateLegalBasisDialog } from './CreateLegalBasisDialog';

export function LegalBasesPage() {
  const navigate = useNavigate();
  const {
    legalBases,
    loading,
    stats,
    fetchLegalBases,
    createLegalBasis,
    updateLegalBasis,
    suspendLegalBasis,
    reactivateLegalBasis,
    validateLegalBasis,
    checkExpiringBases,
    getApplicableBases,
    getLegalBasisUsageReport
  } = useLegalBases();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LegalBasisFilters>({});
  const [selectedBases, setSelectedBases] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expiringBases, setExpiringBases] = useState<LegalBasis[]>([]);
  const [expiredBases, setExpiredBases] = useState<LegalBasis[]>([]);

  // Check for expiring bases on component mount
  useEffect(() => {
    checkExpiring();
  }, []);

  const checkExpiring = async () => {
    const result = await checkExpiringBases();
    setExpiringBases(result.expiring);
    setExpiredBases(result.expired);
  };

  // Filter bases based on search and filters
  const filteredBases = legalBases.filter(basis => {
    const matchesSearch = 
      basis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      basis.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      basis.justification.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof LegalBasisFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchLegalBases(newFilters);
  };

  // Handle selection
  const handleSelectBasis = (basisId: string, selected: boolean) => {
    if (selected) {
      setSelectedBases([...selectedBases, basisId]);
    } else {
      setSelectedBases(selectedBases.filter(id => id !== basisId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedBases(filteredBases.map(basis => basis.id));
    } else {
      setSelectedBases([]);
    }
  };

  // Handle basis creation
  const handleCreateBasis = async (basisData: Partial<LegalBasis>) => {
    const result = await createLegalBasis(basisData);
    if (result.success) {
      toast.success('Base legal criada com sucesso');
      setCreateDialogOpen(false);
    } else {
      toast.error(result.error || 'Erro ao criar base legal');
    }
  };

  // Handle basis suspension
  const handleSuspendBasis = async (id: string, reason: string) => {
    const result = await suspendLegalBasis(id, reason);
    if (result.success) {
      toast.success('Base legal suspensa');
    } else {
      toast.error(result.error || 'Erro ao suspender base legal');
    }
  };

  // Handle basis reactivation
  const handleReactivateBasis = async (id: string) => {
    const result = await reactivateLegalBasis(id);
    if (result.success) {
      toast.success('Base legal reativada');
    } else {
      toast.error(result.error || 'Erro ao reativar base legal');
    }
  };

  // Handle basis validation
  const handleValidateBasis = async (id: string, isValid: boolean, notes?: string) => {
    const result = await validateLegalBasis({
      basis_id: id,
      is_valid: isValid,
      validation_notes: notes,
      validated_by: 'current-user-id', // This should come from auth context
      validation_date: new Date().toISOString()
    });
    
    if (result.success) {
      toast.success(isValid ? 'Base legal validada' : 'Base legal invalidada');
    } else {
      toast.error(result.error || 'Erro ao validar base legal');
    }
  };

  // Generate usage report
  const handleGenerateUsageReport = async (id: string) => {
    const report = await getLegalBasisUsageReport(id);
    toast.success(`Relatório gerado: ${report.total_usage_count} uso(s) encontrado(s)`);
    // In a real implementation, this would trigger a document download
  };

  // Get status color for badges
  const getStatusColor = (status: LegalBasisStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: LegalBasisStatus) => {
    const labels = {
      active: 'Ativa',
      suspended: 'Suspensa',
      expired: 'Expirada',
      revoked: 'Revogada'
    };
    return labels[status] || status;
  };

  // Get type color for badges
  const getTypeColor = (type: LegalBasisType) => {
    const colors = {
      consentimento: 'bg-blue-100 text-blue-800',
      contrato: 'bg-green-100 text-green-800',
      obrigacao_legal: 'bg-purple-100 text-purple-800',
      protecao_vida: 'bg-red-100 text-red-800',
      interesse_publico: 'bg-orange-100 text-orange-800',
      interesse_legitimo: 'bg-yellow-100 text-yellow-800',
      exercicio_direitos: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
              Bases Legais LGPD
            </h1>
            <p className="text-muted-foreground">
              Gestão de bases legais para tratamento de dados pessoais
            </p>
          </div>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Base Legal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateLegalBasisDialog onCreateBasis={handleCreateBasis} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Expiring Bases Alert */}
      {expiringBases.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> {expiringBases.length} base(s) legal(is) expirando em até 30 dias.
          </AlertDescription>
        </Alert>
      )}

      {/* Expired Bases Alert */}
      {expiredBases.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgente:</strong> {expiredBases.length} base(s) legal(is) expiraram e foram automaticamente desativadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Bases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth} criadas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Em uso atualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspensas</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground">
              Temporariamente inativas
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
              Próximas de expirar
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
                  placeholder="Pesquisar por nome, descrição ou justificativa..."
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
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="suspended">Suspensas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="revoked">Revogadas</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('legal_basis_type', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo de Base" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {Object.entries(LEGAL_BASIS_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
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
        </CardContent>
      </Card>

      {/* Legal Bases Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            Todas ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativas ({stats.active})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspensas ({stats.suspended})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expiradas ({stats.expired})
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Expirando ({stats.expiring_soon})
          </TabsTrigger>
          <TabsTrigger value="by-type">
            Por Tipo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Carregando bases legais...</div>
          ) : filteredBases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma base legal encontrada
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBases.map((basis) => (
                <LegalBasisCard
                  key={basis.id}
                  basis={basis}
                  onSuspend={(reason) => handleSuspendBasis(basis.id, reason)}
                  onReactivate={() => handleReactivateBasis(basis.id)}
                  onValidate={(isValid, notes) => handleValidateBasis(basis.id, isValid, notes)}
                  onGenerateReport={() => handleGenerateUsageReport(basis.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {filteredBases
              .filter(basis => basis.status === 'active')
              .map((basis) => (
                <LegalBasisCard
                  key={basis.id}
                  basis={basis}
                  onSuspend={(reason) => handleSuspendBasis(basis.id, reason)}
                  onReactivate={() => handleReactivateBasis(basis.id)}
                  onValidate={(isValid, notes) => handleValidateBasis(basis.id, isValid, notes)}
                  onGenerateReport={() => handleGenerateUsageReport(basis.id)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          <div className="grid gap-4">
            {filteredBases
              .filter(basis => basis.status === 'suspended')
              .map((basis) => (
                <LegalBasisCard
                  key={basis.id}
                  basis={basis}
                  onSuspend={(reason) => handleSuspendBasis(basis.id, reason)}
                  onReactivate={() => handleReactivateBasis(basis.id)}
                  onValidate={(isValid, notes) => handleValidateBasis(basis.id, isValid, notes)}
                  onGenerateReport={() => handleGenerateUsageReport(basis.id)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <div className="grid gap-4">
            {filteredBases
              .filter(basis => basis.status === 'expired')
              .map((basis) => (
                <LegalBasisCard
                  key={basis.id}
                  basis={basis}
                  onSuspend={(reason) => handleSuspendBasis(basis.id, reason)}
                  onReactivate={() => handleReactivateBasis(basis.id)}
                  onValidate={(isValid, notes) => handleValidateBasis(basis.id, isValid, notes)}
                  onGenerateReport={() => handleGenerateUsageReport(basis.id)}
                />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <div className="grid gap-4">
            {expiringBases.map((basis) => (
              <LegalBasisCard
                key={basis.id}
                basis={basis}
                onSuspend={(reason) => handleSuspendBasis(basis.id, reason)}
                onReactivate={() => handleReactivateBasis(basis.id)}
                onValidate={(isValid, notes) => handleValidateBasis(basis.id, isValid, notes)}
                onGenerateReport={() => handleGenerateUsageReport(basis.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-type" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(LEGAL_BASIS_TYPES).map(([type, label]) => {
              const count = stats.by_type[type as LegalBasisType];
              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base">{label}</span>
                      <Badge className={getTypeColor(type as LegalBasisType)}>
                        {count}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {filteredBases
                        .filter(basis => basis.legal_basis_type === type)
                        .slice(0, 3)
                        .map(basis => (
                          <div key={basis.id} className="text-sm">
                            <div className="font-medium">{basis.name}</div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(basis.status)}>
                                {getStatusLabel(basis.status)}
                              </Badge>
                            </div>
                          </div>
                        ))
                      }
                      {count > 3 && (
                        <div className="text-sm text-muted-foreground">
                          + {count - 3} outras...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Database, Scan, Eye, CheckCircle, XCircle, AlertTriangle, Filter, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import { useDataDiscovery } from '@/hooks/useDataDiscovery';
import { DataDiscoverySource, DataDiscoveryResult, SensitivityLevel, DataCategory } from '@/types/privacy-management';
import { DATA_CATEGORIES, SENSITIVITY_LEVELS } from '@/types/privacy-management';
import { CreateDataSourceDialog } from './CreateDataSourceDialog';
import { DataDiscoveryResultCard } from './DataDiscoveryResultCard';

export function DataDiscoveryPage() {
  const navigate = useNavigate();
  const {
    sources,
    results,
    state,
    fetchSources,
    createSource,
    updateSource,
    deleteSource,
    startScan,
    fetchResults,
    updateResultStatus,
    bulkUpdateResults,
    setFilters,
    getDiscoveryStats
  } = useDataDiscovery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('sources');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSources();
    fetchResults();
  }, [fetchSources, fetchResults]);

  const stats = getDiscoveryStats();

  const handleStartScan = async (sourceId: string) => {
    const result = await startScan(sourceId);
    if (result.success) {
      toast.success('Scan iniciado com sucesso');
    } else {
      toast.error(result.error || 'Erro ao iniciar scan');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedResults.length === 0) {
      toast.error('Selecione pelo menos um resultado');
      return;
    }

    let updates = {};
    switch (action) {
      case 'validate':
        updates = { status: 'validated' };
        break;
      case 'classify':
        updates = { status: 'classified' };
        break;
      case 'ignore':
        updates = { status: 'ignored' };
        break;
    }

    const result = await bulkUpdateResults(selectedResults, updates);
    if (result.success) {
      toast.success(`${selectedResults.length} resultados atualizados`);
      setSelectedResults([]);
    } else {
      toast.error(result.error || 'Erro ao atualizar resultados');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'scanning':
        return <Scan className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-pulse" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
      case 'inactive':
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: 'default',
      scanning: 'secondary',
      error: 'destructive',
      inactive: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'active' ? 'Ativo' :
          status === 'scanning' ? 'Digitalizando' :
            status === 'error' ? 'Erro' :
              status === 'inactive' ? 'Inativo' : status}
      </Badge>
    );
  };

  const getSensitivityBadge = (level: SensitivityLevel) => {
    const variants: Record<SensitivityLevel, "default" | "secondary" | "destructive" | "outline"> = {
      baixa: 'outline',
      media: 'secondary',
      alta: 'default',
      critica: 'destructive'
    };

    return (
      <Badge variant={variants[level]}>
        {SENSITIVITY_LEVELS[level]}
      </Badge>
    );
  };

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = results.filter(result =>
    result.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.field_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
            <h1 className="text-3xl font-bold text-foreground">Discovery de Dados</h1>
            <p className="text-muted-foreground">
              Mapeamento automático de dados pessoais em sistemas e aplicações
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Fonte de Dados
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fontes Totais</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSources} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Descobertos</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResults}</div>
            <p className="text-xs text-muted-foreground">
              registros encontrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classifiedResults}</div>
            <p className="text-xs text-muted-foreground">
              {stats.classificationProgress}% progresso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalData}</div>
            <p className="text-xs text-muted-foreground">
              sensibilidade crítica
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Descoberta</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSources > 0 ? Math.round((stats.totalResults / stats.totalSources)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              dados por fonte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar fontes de dados ou resultados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria de Dados</label>
                <Select onValueChange={(value) => setFilters({ data_category: [value as DataCategory] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DATA_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nível de Sensibilidade</label>
                <Select onValueChange={(value) => setFilters({ sensitivity_level: [value as SensitivityLevel] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar sensibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SENSITIVITY_LEVELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => setFilters({})} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Fontes de Dados ({sources.length})</TabsTrigger>
          <TabsTrigger value="results">Resultados ({results.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          {state.loading ? (
            <div className="text-center py-8">Carregando fontes de dados...</div>
          ) : filteredSources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma fonte de dados encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando suas primeiras fontes de dados para descobrir informações pessoais.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Fonte
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSources.map((source) => (
                <Card key={source.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getStatusIcon(source.status)}
                          {source.name}
                        </CardTitle>
                        <CardDescription>
                          {source.description || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStartScan(source.id)}>
                            <Scan className="w-4 h-4 mr-2" />
                            Iniciar Scan
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Resultados
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        {getStatusBadge(source.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <Badge variant="outline">{source.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Frequência:</span>
                        <span className="text-sm">{source.scan_frequency}</span>
                      </div>
                      {source.last_scan_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Último Scan:</span>
                          <span className="text-sm">
                            {new Date(source.last_scan_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedResults.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedResults.length} resultados selecionados
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleBulkAction('validate')}>
                      Validar
                    </Button>
                    <Button size="sm" onClick={() => handleBulkAction('classify')}>
                      Classificar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('ignore')}>
                      Ignorar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {state.loading ? (
            <div className="text-center py-8">Carregando resultados...</div>
          ) : filteredResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
                  Execute scans nas fontes de dados para descobrir informações pessoais.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <DataDiscoveryResultCard
                  key={result.id}
                  result={result}
                  selected={selectedResults.includes(result.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedResults(prev => [...prev, result.id]);
                    } else {
                      setSelectedResults(prev => prev.filter(id => id !== result.id));
                    }
                  }}
                  onUpdateStatus={updateResultStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Data Source Dialog */}
      <CreateDataSourceDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={createSource}
      />
    </div>
  );
}
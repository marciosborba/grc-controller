import React, { useState, useEffect } from 'react';
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
  Building,
  Globe,
  Database,
  Activity
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

import { useProcessingActivities, ProcessingActivityFilters } from '@/hooks/useProcessingActivities';
import { ProcessingActivity, ProcessingActivityStatus, ProcessingPurpose } from '@/types/privacy-management';

export function ProcessingActivitiesPage() {
  const {
    activities,
    loading,
    stats,
    fetchActivities,
    createActivity,
    updateActivity,
    suspendActivity,
    reactivateActivity,
    validateActivity,
    reviewActivity,
    generateDPIARecommendation,
    generateRATReport
  } = useProcessingActivities();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProcessingActivityFilters>({});
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof ProcessingActivityFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchActivities(newFilters);
  };

  // Handle selection
  const handleSelectActivity = (activityId: string, selected: boolean) => {
    if (selected) {
      setSelectedActivities([...selectedActivities, activityId]);
    } else {
      setSelectedActivities(selectedActivities.filter(id => id !== activityId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedActivities(filteredActivities.map(activity => activity.id));
    } else {
      setSelectedActivities([]);
    }
  };

  // Handle activity suspension
  const handleSuspendActivity = async (id: string, reason: string) => {
    const result = await suspendActivity(id, reason);
    if (result.success) {
      toast.success('Atividade de tratamento suspensa');
    } else {
      toast.error(result.error || 'Erro ao suspender atividade');
    }
  };

  // Handle activity reactivation
  const handleReactivateActivity = async (id: string) => {
    const result = await reactivateActivity(id);
    if (result.success) {
      toast.success('Atividade de tratamento reativada');
    } else {
      toast.error(result.error || 'Erro ao reativar atividade');
    }
  };

  // Generate DPIA recommendation
  const handleGenerateDPIA = async (id: string) => {
    const recommendation = await generateDPIARecommendation(id);
    
    const message = recommendation.requires_dpia 
      ? `DPIA requerida (Risco: ${recommendation.risk_level})`
      : `DPIA não requerida (Risco: ${recommendation.risk_level})`;
    
    toast.success(message);
    // In a real implementation, this would show a detailed dialog with the recommendation
  };

  // Generate RAT report
  const handleGenerateRATReport = async () => {
    const report = await generateRATReport(filters);
    toast.success(`Relatório RAT gerado: ${report.summary.total} atividade(s)`);
    // In a real implementation, this would trigger a document download
  };

  // Get status color for badges
  const getStatusColor = (status: ProcessingActivityStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: ProcessingActivityStatus) => {
    const labels = {
      active: 'Ativa',
      suspended: 'Suspensa',
      under_review: 'Em Revisão'
    };
    return labels[status] || status;
  };

  // Get purpose label
  const getPurposeLabel = (purpose: ProcessingPurpose) => {
    const labels = {
      marketing: 'Marketing',
      comunicacao_comercial: 'Comunicação Comercial',
      analise_comportamental: 'Análise Comportamental',
      gestao_rh: 'Gestão de RH',
      folha_pagamento: 'Folha de Pagamento',
      controle_acesso: 'Controle de Acesso',
      contabilidade: 'Contabilidade',
      declaracoes_fiscais: 'Declarações Fiscais',
      videomonitoramento: 'Videomonitoramento',
      seguranca: 'Segurança',
      atendimento_cliente: 'Atendimento ao Cliente',
      suporte_tecnico: 'Suporte Técnico',
      pesquisa_satisfacao: 'Pesquisa de Satisfação',
      desenvolvimento_produtos: 'Desenvolvimento de Produtos',
      outros: 'Outros'
    };
    return labels[purpose] || purpose;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Registro de Atividades de Tratamento (RAT)
          </h1>
          <p className="text-muted-foreground">
            Gestão completa das atividades de tratamento de dados pessoais
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateRATReport}>
            <Download className="w-4 h-4 mr-2" />
            Relatório RAT
          </Button>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Atividade de Tratamento</DialogTitle>
                <DialogDescription>
                  Registre uma nova atividade de tratamento de dados pessoais no RAT
                </DialogDescription>
              </DialogHeader>
              {/* CreateProcessingActivityDialog component would go here */}
              <div className="text-center py-8 text-muted-foreground">
                Componente CreateProcessingActivityDialog será implementado
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atividades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Em operação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.high_risk}</div>
            <p className="text-xs text-muted-foreground">
              Requerem DPIA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferência Internacional</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.with_international_transfer}</div>
            <p className="text-xs text-muted-foreground">
              Fora do território nacional
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
                  placeholder="Pesquisar por nome, descrição ou departamento..."
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
                  <SelectItem value="under_review">Em Revisão</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('department', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="TI">Tecnologia da Informação</SelectItem>
                  <SelectItem value="RH">Recursos Humanos</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Juridico">Jurídico</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFilterChange('high_risk', true)}
                className="text-red-600 hover:text-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alto Risco
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFilterChange('international_transfer', true)}
                className="text-orange-600 hover:text-orange-700"
              >
                <Globe className="w-4 h-4 mr-2" />
                Internacional
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Tabs */}
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
          <TabsTrigger value="under_review">
            Em Revisão ({stats.under_review})
          </TabsTrigger>
          <TabsTrigger value="high_risk">
            Alto Risco ({stats.high_risk})
          </TabsTrigger>
          <TabsTrigger value="by_department">
            Por Departamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Carregando atividades de tratamento...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma atividade de tratamento encontrada
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <ProcessingActivityCard
                  key={activity.id}
                  activity={activity}
                  onSuspend={(reason) => handleSuspendActivity(activity.id, reason)}
                  onReactivate={() => handleReactivateActivity(activity.id)}
                  onGenerateDPIA={() => handleGenerateDPIA(activity.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {filteredActivities
              .filter(activity => activity.status === 'active')
              .map((activity) => (
                <ProcessingActivityCard
                  key={activity.id}
                  activity={activity}
                  onSuspend={(reason) => handleSuspendActivity(activity.id, reason)}
                  onReactivate={() => handleReactivateActivity(activity.id)}
                  onGenerateDPIA={() => handleGenerateDPIA(activity.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          <div className="grid gap-4">
            {filteredActivities
              .filter(activity => activity.status === 'suspended')
              .map((activity) => (
                <ProcessingActivityCard
                  key={activity.id}
                  activity={activity}
                  onSuspend={(reason) => handleSuspendActivity(activity.id, reason)}
                  onReactivate={() => handleReactivateActivity(activity.id)}
                  onGenerateDPIA={() => handleGenerateDPIA(activity.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="under_review" className="space-y-4">
          <div className="grid gap-4">
            {filteredActivities
              .filter(activity => activity.status === 'under_review')
              .map((activity) => (
                <ProcessingActivityCard
                  key={activity.id}
                  activity={activity}
                  onSuspend={(reason) => handleSuspendActivity(activity.id, reason)}
                  onReactivate={() => handleReactivateActivity(activity.id)}
                  onGenerateDPIA={() => handleGenerateDPIA(activity.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="high_risk" className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atenção:</strong> Atividades de alto risco requerem Relatório de Impacto à Proteção de Dados (DPIA/RIPD).
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {filteredActivities
              .filter(activity => activity.is_high_risk)
              .map((activity) => (
                <ProcessingActivityCard
                  key={activity.id}
                  activity={activity}
                  onSuspend={(reason) => handleSuspendActivity(activity.id, reason)}
                  onReactivate={() => handleReactivateActivity(activity.id)}
                  onGenerateDPIA={() => handleGenerateDPIA(activity.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="by_department" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.by_department).map(([department, count]) => (
              <Card key={department}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {department}
                    </span>
                    <Badge variant="outline">
                      {count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredActivities
                      .filter(activity => activity.department === department)
                      .slice(0, 3)
                      .map(activity => (
                        <div key={activity.id} className="text-sm">
                          <div className="font-medium">{activity.name}</div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(activity.status)}>
                              {getStatusLabel(activity.status)}
                            </Badge>
                            {activity.is_high_risk && (
                              <Badge variant="destructive" className="text-xs">
                                Alto Risco
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    {count > 3 && (
                      <div className="text-sm text-muted-foreground">
                        + {count - 3} outras...
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

// Simplified ProcessingActivityCard component (would be in a separate file)
interface ProcessingActivityCardProps {
  activity: ProcessingActivity;
  onSuspend: (reason: string) => void;
  onReactivate: () => void;
  onGenerateDPIA: () => void;
}

function ProcessingActivityCard({ 
  activity, 
  onSuspend, 
  onReactivate, 
  onGenerateDPIA 
}: ProcessingActivityCardProps) {
  // Get status color for badges
  const getStatusColor = (status: ProcessingActivityStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: ProcessingActivityStatus) => {
    const labels = {
      active: 'Ativa',
      suspended: 'Suspensa',
      under_review: 'Em Revisão'
    };
    return labels[status] || status;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      activity.is_high_risk ? 'border-red-200 bg-red-50' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {activity.name}
                  {activity.is_high_risk && (
                    <AlertTriangle className="w-4 h-4 text-red-600" title="Alto Risco" />
                  )}
                  {activity.has_international_transfer && (
                    <Globe className="w-4 h-4 text-orange-600" title="Transferência Internacional" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(activity.status)}>
                  {getStatusLabel(activity.status)}
                </Badge>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {activity.department && (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Departamento:</span>
                  <span className="font-medium">{activity.department}</span>
                </div>
              )}

              {activity.data_controller && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Controlador:</span>
                  <span className="font-medium">{activity.data_controller}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criada:</span>
                <span className="font-medium">
                  {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {activity.data_categories && activity.data_categories.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Categorias:</span>
                  <div className="flex flex-wrap gap-1">
                    {activity.data_categories.slice(0, 2).map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {activity.data_categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{activity.data_categories.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onGenerateDPIA}
              >
                <Shield className="w-4 h-4 mr-2" />
                Avaliar DPIA
              </Button>

              {activity.status === 'active' ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onSuspend('Suspensão solicitada pelo usuário')}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Suspender
                </Button>
              ) : activity.status === 'suspended' && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={onReactivate}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Reativar
                </Button>
              )}

              <Button size="sm" variant="ghost">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
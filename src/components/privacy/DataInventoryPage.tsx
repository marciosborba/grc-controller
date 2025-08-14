import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Database, CheckCircle, AlertTriangle, Calendar, Users, FileText, Filter, MoreHorizontal, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import { useDataInventory } from '@/hooks/useDataInventory';
import { DataInventory, SensitivityLevel, DataCategory } from '@/types/privacy-management';
import { DATA_CATEGORIES, SENSITIVITY_LEVELS } from '@/types/privacy-management';
import { CreateDataInventoryDialog } from './CreateDataInventoryDialog';
import { DataInventoryCard } from './DataInventoryCard';

export function DataInventoryPage() {
  const navigate = useNavigate();
  const {
    inventoryItems,
    state,
    fetchInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    markAsReviewed,
    bulkMarkAsReviewed,
    setFilters,
    getInventoryStats,
    getItemsNeedingReview
  } = useDataInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const stats = getInventoryStats();
  const itemsNeedingReview = getItemsNeedingReview();

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um item');
      return;
    }

    switch (action) {
      case 'review':
        const result = await bulkMarkAsReviewed(selectedItems);
        if (result.success) {
          toast.success(`${selectedItems.length} itens marcados como revisados`);
          setSelectedItems([]);
        } else {
          toast.error(result.error || 'Erro ao marcar como revisados');
        }
        break;
      // Adicionar mais ações conforme necessário
    }
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: 'default',
      archived: 'secondary',
      deleted: 'destructive',
      migrated: 'outline'
    };

    const labels = {
      active: 'Ativo',
      archived: 'Arquivado',
      deleted: 'Excluído',
      migrated: 'Migrado'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const isOverdue = (nextReviewDate?: string) => {
    if (!nextReviewDate) return false;
    return new Date(nextReviewDate) < new Date();
  };

  const isDueSoon = (nextReviewDate?: string) => {
    if (!nextReviewDate) return false;
    const reviewDate = new Date(nextReviewDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return reviewDate <= thirtyDaysFromNow && reviewDate >= new Date();
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.system_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'critical':
        return matchesSearch && item.sensitivity_level === 'critica';
      case 'review':
        return matchesSearch && (isOverdue(item.next_review_date) || isDueSoon(item.next_review_date));
      case 'archived':
        return matchesSearch && item.status === 'archived';
      default:
        return matchesSearch && item.status === 'active';
    }
  });

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
            <h1 className="text-3xl font-bold text-foreground">Inventário de Dados Pessoais</h1>
            <p className="text-muted-foreground">
              Catálogo completo de dados pessoais tratados pela organização
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Item do Inventário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeItems} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highSensitivityItems} alta sensibilidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisam Revisão</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueReview} em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              registros de dados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalItems > 0 ? Math.round((stats.activeItems / stats.totalItems) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              itens ativos
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
              placeholder="Buscar por nome, descrição ou sistema..."
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

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedItems.length} itens selecionados
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('review')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como Revisados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({stats.totalItems})</TabsTrigger>
          <TabsTrigger value="critical">Críticos ({stats.criticalItems})</TabsTrigger>
          <TabsTrigger value="review">Precisam Revisão ({stats.needsReview})</TabsTrigger>
          <TabsTrigger value="archived">Arquivados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {state.loading ? (
            <div className="text-center py-8">Carregando inventário...</div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro item do inventário de dados pessoais.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <DataInventoryCard
                  key={item.id}
                  item={item}
                  selected={selectedItems.includes(item.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedItems(prev => [...prev, item.id]);
                    } else {
                      setSelectedItems(prev => prev.filter(id => id !== item.id));
                    }
                  }}
                  onUpdate={updateInventoryItem}
                  onDelete={deleteInventoryItem}
                  onMarkAsReviewed={markAsReviewed}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Dados de Sensibilidade Crítica</h4>
                <p className="text-sm text-destructive/80">
                  Estes dados requerem proteção especial e monitoramento contínuo conforme LGPD.
                </p>
              </div>
            </div>
          </div>
          
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum dado crítico encontrado</h3>
                <p className="text-muted-foreground">
                  Excelente! Não há dados de sensibilidade crítica no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <DataInventoryCard
                  key={item.id}
                  item={item}
                  selected={selectedItems.includes(item.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedItems(prev => [...prev, item.id]);
                    } else {
                      setSelectedItems(prev => prev.filter(id => id !== item.id));
                    }
                  }}
                  onUpdate={updateInventoryItem}
                  onDelete={deleteInventoryItem}
                  onMarkAsReviewed={markAsReviewed}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Itens que Precisam de Revisão</h4>
                <p className="text-sm text-yellow-700">
                  Revise regularmente seu inventário para manter a conformidade com a LGPD.
                </p>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Todas as revisões em dia</h3>
                <p className="text-muted-foreground">
                  Parabéns! Não há itens pendentes de revisão no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <DataInventoryCard
                  key={item.id}
                  item={item}
                  selected={selectedItems.includes(item.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedItems(prev => [...prev, item.id]);
                    } else {
                      setSelectedItems(prev => prev.filter(id => id !== item.id));
                    }
                  }}
                  onUpdate={updateInventoryItem}
                  onDelete={deleteInventoryItem}
                  onMarkAsReviewed={markAsReviewed}
                  showReviewAlert={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {/* Similar structure for archived items */}
          <div className="text-center py-8 text-muted-foreground">
            Itens arquivados aparecerão aqui
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Data Inventory Dialog */}
      <CreateDataInventoryDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={createInventoryItem}
      />
    </div>
  );
}
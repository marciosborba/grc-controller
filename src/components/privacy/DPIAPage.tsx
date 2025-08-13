import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, AlertTriangle, CheckCircle, Clock, Shield, Download, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

import { useDPIA, DPIAFilters } from '@/hooks/useDPIA';
import { DPIAAssessment } from '@/types/privacy-management';
import { DPIACard } from './DPIACard';
import { CreateDPIADialog } from './CreateDPIADialog';

export function DPIAPage() {
  const { 
    dpias, 
    loading, 
    stats, 
    fetchDPIAs, 
    createDPIA, 
    updateDPIA, 
    deleteDPIA,
    approveDPIA,
    rejectDPIA,
    exportDPIA,
    duplicateDPIA 
  } = useDPIA();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DPIAFilters>({});
  const [selectedDPIAs, setSelectedDPIAs] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter DPIAs based on search and filters
  const filteredDPIAs = dpias.filter(dpia => {
    const matchesSearch = dpia.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dpia.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof DPIAFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchDPIAs(newFilters);
  };

  // Handle selection
  const handleSelectDPIA = (dpiaId: string, selected: boolean) => {
    if (selected) {
      setSelectedDPIAs([...selectedDPIAs, dpiaId]);
    } else {
      setSelectedDPIAs(selectedDPIAs.filter(id => id !== dpiaId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDPIAs(filteredDPIAs.map(dpia => dpia.id));
    } else {
      setSelectedDPIAs([]);
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selectedDPIAs.length === 0) return;

    if (!confirm(`Tem certeza que deseja excluir ${selectedDPIAs.length} DPIA(s)?`)) {
      return;
    }

    try {
      const deletePromises = selectedDPIAs.map(id => deleteDPIA(id));
      await Promise.all(deletePromises);
      
      toast.success(`${selectedDPIAs.length} DPIA(s) excluída(s) com sucesso`);
      setSelectedDPIAs([]);
    } catch (error) {
      toast.error('Erro ao excluir DPIAs');
    }
  };

  const handleBulkExport = async () => {
    if (selectedDPIAs.length === 0) return;

    try {
      // In a real implementation, this would generate a combined report
      toast.success(`Exportando ${selectedDPIAs.length} DPIA(s)...`);
    } catch (error) {
      toast.error('Erro ao exportar DPIAs');
    }
  };

  // Handle DPIA actions
  const handleCreateDPIA = async (dpiaData: Partial<DPIAAssessment>) => {
    const result = await createDPIA(dpiaData);
    if (result.success) {
      toast.success('DPIA criada com sucesso');
      setCreateDialogOpen(false);
    } else {
      toast.error(result.error || 'Erro ao criar DPIA');
    }
  };

  const handleApproveDPIA = async (id: string) => {
    const result = await approveDPIA(id);
    if (result.success) {
      toast.success('DPIA aprovada com sucesso');
    } else {
      toast.error(result.error || 'Erro ao aprovar DPIA');
    }
  };

  const handleRejectDPIA = async (id: string, reason: string) => {
    const result = await rejectDPIA(id, reason);
    if (result.success) {
      toast.success('DPIA rejeitada');
    } else {
      toast.error(result.error || 'Erro ao rejeitar DPIA');
    }
  };

  const handleDuplicateDPIA = async (id: string) => {
    const result = await duplicateDPIA(id);
    if (result.success) {
      toast.success('DPIA duplicada com sucesso');
    } else {
      toast.error(result.error || 'Erro ao duplicar DPIA');
    }
  };

  const handleExportDPIA = async (id: string) => {
    const result = await exportDPIA(id);
    if (result.success && result.url) {
      // In a real implementation, this would trigger a download
      toast.success('DPIA exportada com sucesso');
    } else {
      toast.error(result.error || 'Erro ao exportar DPIA');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            DPIA - Data Protection Impact Assessment
          </h1>
          <p className="text-muted-foreground">
            Avaliação de impacto à proteção de dados pessoais
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova DPIA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateDPIADialog onCreateDPIA={handleCreateDPIA} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DPIAs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgress} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção especial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulta ANPD</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.requiresConsultation}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam consulta prévia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdue > 0 && `${stats.overdue} em atraso`}
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
                  placeholder="Buscar DPIAs por título ou descrição..."
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
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="pending_approval">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.riskLevel || ''} 
                onValueChange={(value) => handleFilterChange('riskLevel', value || undefined)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Nível de Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDPIAs.length > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedDPIAs.length} selecionada(s)
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkExport}
                className="flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Exportar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
              >
                Excluir
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* DPIA List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando DPIAs...</p>
          </div>
        ) : filteredDPIAs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'Nenhuma DPIA encontrada' 
                  : 'Nenhuma DPIA criada ainda'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'Tente ajustar os filtros ou termo de busca'
                  : 'Crie sua primeira DPIA para começar a avaliar impactos de proteção de dados'
                }
              </p>
              {!searchTerm && Object.keys(filters).length === 0 && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira DPIA
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedDPIAs.length === filteredDPIAs.length && filteredDPIAs.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="select-all" className="text-sm text-muted-foreground">
                Selecionar todos ({filteredDPIAs.length})
              </label>
            </div>

            {/* DPIA Cards */}
            {filteredDPIAs.map((dpia) => (
              <DPIACard
                key={dpia.id}
                dpia={dpia}
                selected={selectedDPIAs.includes(dpia.id)}
                onSelect={(selected) => handleSelectDPIA(dpia.id, selected)}
                onApprove={() => handleApproveDPIA(dpia.id)}
                onReject={(reason) => handleRejectDPIA(dpia.id, reason)}
                onDuplicate={() => handleDuplicateDPIA(dpia.id)}
                onExport={() => handleExportDPIA(dpia.id)}
                onUpdate={(updates) => updateDPIA(dpia.id, updates)}
                onDelete={() => deleteDPIA(dpia.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
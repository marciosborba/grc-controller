import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  Target,
  Download,
  Filter,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import type { Risk, RiskFilters } from '@/types/risk-management';

interface TableViewProps {
  risks: Risk[];
  searchTerm: string;
  filters?: RiskFilters;
  onUpdate: (riskId: string, data: any) => void;
  onDelete: (riskId: string) => void;
}

type SortField = 'name' | 'category' | 'riskLevel' | 'riskScore' | 'status' | 'createdAt' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export const TableView: React.FC<TableViewProps> = ({
  risks,
  searchTerm,
  filters = {},
  onUpdate,
  onDelete
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    assignedTo: '',
    status: ''
  });

  const { toast } = useToast();
  const { tenantSettings, isMatrix4x4, isMatrix5x5, getMatrixLabels, getRiskLevels: getTenantRiskLevels } = useTenantSettings();

  // Filtrar e ordenar riscos
  const processedRisks = useMemo(() => {
    const filtered = risks.filter(risk => {
      // Busca por termo
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!risk.name.toLowerCase().includes(term) &&
            !risk.description?.toLowerCase().includes(term) &&
            !risk.category.toLowerCase().includes(term) &&
            !risk.assignedTo?.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Aplicar filtros
      if (filters?.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(risk.category)) return false;
      }

      if (filters?.levels && filters.levels.length > 0) {
        if (!filters.levels.includes(risk.riskLevel)) return false;
      }

      if (filters?.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(risk.status)) return false;
      }

      if (filters?.showOverdue) {
        const now = new Date();
        if (!risk.dueDate || risk.dueDate > now || risk.status === 'Fechado') {
          return false;
        }
      }

      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Tratamento especial para datas
      if (sortField === 'createdAt' || sortField === 'dueDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Tratamento especial para texto
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [risks, searchTerm, filters, sortField, sortDirection]);

  // Obter níveis de risco baseados na configuração da matriz
  const getRiskLevels = () => {
    return getTenantRiskLevels();
  };

  // Calcular estatísticas dos níveis de risco
  const riskLevelStats = useMemo(() => {
    const levels = getRiskLevels();
    const stats: Record<string, number> = {};
    
    // Inicializar stats com os níveis corretos
    levels.forEach(level => {
      stats[level] = 0;
    });
    
    processedRisks.forEach(risk => {
      if (stats.hasOwnProperty(risk.riskLevel)) {
        stats[risk.riskLevel]++;
      }
    });
    
    return stats;
  }, [processedRisks, isMatrix4x4, isMatrix5x5]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Função inteligente para cores de nível de risco baseada na configuração do tenant
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto':
      case 'Crítico':
        return 'border-red-500 bg-red-100 text-red-900 dark:border-red-400 dark:bg-red-950/30 dark:text-red-300';
      
      case 'Alto':
        return 'border-orange-500 bg-orange-100 text-orange-900 dark:border-orange-400 dark:bg-orange-950/30 dark:text-orange-300';
      
      case 'Médio':
        return 'border-yellow-500 bg-yellow-100 text-yellow-900 dark:border-yellow-400 dark:bg-yellow-950/30 dark:text-yellow-300';
      
      case 'Baixo':
        return 'border-green-500 bg-green-100 text-green-900 dark:border-green-400 dark:bg-green-950/30 dark:text-green-300';
      
      case 'Muito Baixo':
        return 'border-blue-500 bg-blue-100 text-blue-900 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300';
      
      default:
        return 'border-gray-500 bg-gray-100 text-gray-900 dark:border-gray-400 dark:bg-gray-950/30 dark:text-gray-300';
    }
  };

  // Função melhorada para cores de status com fundo colorido completo
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identificado':
        return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700';
      
      case 'Avaliado':
        return 'bg-purple-500 text-white border-purple-600 dark:bg-purple-600 dark:border-purple-700';
      
      case 'Em Tratamento':
        return 'bg-indigo-500 text-white border-indigo-600 dark:bg-indigo-600 dark:border-indigo-700';
      
      case 'Monitorado':
        return 'bg-teal-500 text-white border-teal-600 dark:bg-teal-600 dark:border-teal-700';
      
      case 'Fechado':
        return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:border-gray-700';
      
      case 'Reaberto':
        return 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:border-orange-700';
      
      default:
        return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:border-gray-700';
    }
  };

  // Função para cores de categoria
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'operacional':
        return 'bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700';
      
      case 'financeiro':
        return 'bg-green-500 text-white border-green-600 dark:bg-green-600 dark:border-green-700';
      
      case 'tecnológico':
      case 'tecnologico':
        return 'bg-purple-500 text-white border-purple-600 dark:bg-purple-600 dark:border-purple-700';
      
      case 'regulatório':
      case 'regulatorio':
        return 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700';
      
      case 'reputacional':
        return 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:border-orange-700';
      
      case 'estratégico':
      case 'estrategico':
        return 'bg-indigo-500 text-white border-indigo-600 dark:bg-indigo-600 dark:border-indigo-700';
      
      case 'ambiental':
        return 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:border-emerald-700';
      
      case 'compliance':
        return 'bg-yellow-500 text-white border-yellow-600 dark:bg-yellow-600 dark:border-yellow-700';
      
      case 'mercado':
        return 'bg-cyan-500 text-white border-cyan-600 dark:bg-cyan-600 dark:border-cyan-700';
      
      case 'legal':
        return 'bg-rose-500 text-white border-rose-600 dark:bg-rose-600 dark:border-rose-700';
      
      default:
        return 'bg-gray-500 text-white border-gray-600 dark:bg-gray-600 dark:border-gray-700';
    }
  };

  // Função para ícones de categoria
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'operacional':
        return '⚙️';
      case 'financeiro':
        return '💰';
      case 'tecnológico':
      case 'tecnologico':
        return '💻';
      case 'regulatório':
      case 'regulatorio':
        return '📜';
      case 'reputacional':
        return '🏆';
      case 'estratégico':
      case 'estrategico':
        return '🎯';
      case 'ambiental':
        return '🌱';
      case 'compliance':
        return '⚖️';
      case 'mercado':
        return '📈';
      case 'legal':
        return '📝';
      default:
        return '📊';
    }
  };

  // Função para ícones de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Identificado':
        return '🔍';
      case 'Avaliado':
        return '📊';
      case 'Em Tratamento':
        return '🛠️';
      case 'Monitorado':
        return '👁️';
      case 'Fechado':
        return '✅';
      case 'Reaberto':
        return '🔄';
      default:
        return '📝';
    }
  };

  // Função para obter ícone do nível de risco
  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'Muito Alto':
      case 'Crítico':
        return '🔴';
      case 'Alto':
        return '🟠';
      case 'Médio':
        return '🟡';
      case 'Baixo':
        return '🟢';
      case 'Muito Baixo':
        return '🔵';
      default:
        return '⚪';
    }
  };

  // Função para obter informações sobre a matriz de risco
  const getMatrixInfo = () => {
    if (isMatrix4x4) {
      return {
        type: '4x4',
        maxScore: 16,
        description: 'Matriz 4x4 (Probabilidade × Impacto)'
      };
    } else {
      return {
        type: '5x5',
        maxScore: 25,
        description: 'Matriz 5x5 (Probabilidade × Impacto)'
      };
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = (risk: Risk) => {
    if (!risk.dueDate || risk.status === 'Fechado') return false;
    return new Date(risk.dueDate) < new Date();
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setEditForm({
      name: risk.name,
      description: risk.description || '',
      assignedTo: risk.assignedTo || '',
      status: risk.status
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedRisk) return;

    onUpdate(selectedRisk.id, {
      name: editForm.name,
      description: editForm.description,
      assignedTo: editForm.assignedTo,
      status: editForm.status
    });

    setIsEditDialogOpen(false);
    setSelectedRisk(null);

    toast({
      title: '✅ Risco Atualizado',
      description: 'As alterações foram salvas com sucesso.',
    });
  };

  const handleDelete = (risk: Risk) => {
    if (confirm(`Tem certeza que deseja excluir o risco "${risk.name}"?`)) {
      onDelete(risk.id);
      toast({
        title: '🗑️ Risco Excluído',
        description: 'O risco foi removido permanentemente.',
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Categoria', 'Nível', 'Score', 'Status', 'Responsável', 'Criado em', 'Vencimento'];
    const csvData = processedRisks.map(risk => [
      risk.name,
      risk.category,
      risk.riskLevel,
      risk.riskScore.toString(),
      risk.status,
      risk.assignedTo || '',
      formatDate(risk.createdAt),
      formatDate(risk.dueDate)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `riscos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '📊 Exportação Concluída',
      description: 'Os dados foram exportados para CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header da Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Table2 className="h-5 w-5" />
              <span>Lista Detalhada de Riscos</span>
              <Badge variant="secondary">{processedRisks.length} riscos</Badge>
              <Badge variant="outline" className="text-xs">
                {getMatrixInfo().description}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Estatísticas rápidas dos níveis de risco */}
              <div className="hidden md:flex items-center space-x-2">
                {Object.entries(riskLevelStats).map(([level, count]) => {
                  if (count === 0) return null;
                  return (
                    <Badge 
                      key={level} 
                      className={`${getRiskLevelColor(level)} border text-xs`}
                      title={`${count} risco(s) de nível ${level}`}
                    >
                      <span className="mr-1">{getRiskLevelIcon(level)}</span>
                      {count}
                    </Badge>
                  );
                })}
              </div>
              
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabela Principal */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 min-w-[200px]"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Risco</span>
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Categoria</span>
                      {getSortIcon('category')}
                    </div>
                  </TableHead>
                  
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('riskLevel')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nível</span>
                      {getSortIcon('riskLevel')}
                    </div>
                  </TableHead>
                  
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('riskScore')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Score</span>
                      {getSortIcon('riskScore')}
                    </div>
                  </TableHead>
                  
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  
                  <TableHead>Responsável</TableHead>
                  
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Vencimento</span>
                      {getSortIcon('dueDate')}
                    </div>
                  </TableHead>
                  
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Criado em</span>
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {processedRisks.map((risk) => (
                  <TableRow 
                    key={risk.id} 
                    className={`hover:bg-muted/50 ${isOverdue(risk) ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{risk.name}</h4>
                          {isOverdue(risk) && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {risk.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {risk.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getCategoryColor(risk.category)} border text-xs font-medium`}>
                        <span className="mr-1">{getCategoryIcon(risk.category)}</span>
                        {risk.category}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getRiskLevelColor(risk.riskLevel)} border text-xs font-medium`}>
                        <span className="mr-1">{getRiskLevelIcon(risk.riskLevel)}</span>
                        {risk.riskLevel}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-1">
                          <span className="font-mono font-bold text-lg">{risk.riskScore}</span>
                          <span className="text-xs text-muted-foreground">/{getMatrixInfo().maxScore}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((risk.riskScore / getMatrixInfo().maxScore) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getStatusColor(risk.status)} border text-xs font-medium px-2 py-1`}>
                        <span className="mr-1">{getStatusIcon(risk.status)}</span>
                        {risk.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {risk.assignedTo ? (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{risk.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não atribuído</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {risk.dueDate ? (
                        <div className={`flex items-center space-x-1 ${isOverdue(risk) ? 'text-red-600' : ''}`}>
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{formatDate(risk.dueDate)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(risk.createdAt)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(risk)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(risk)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Estado vazio */}
          {processedRisks.length === 0 && (
            <div className="text-center py-12">
              <Table2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum risco encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'Tente ajustar os filtros ou termo de busca'
                  : 'Nenhum risco foi identificado ainda'
                }
              </p>
            </div>
          )}
          
          {/* Legenda de Níveis de Risco */}
          {processedRisks.length > 0 && (
            <div className="p-4 border-t bg-muted/20">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className="text-sm font-medium text-muted-foreground mr-2">Níveis de Risco:</span>
                
                {getRiskLevels().map((level) => (
                  <div key={level} className="flex items-center space-x-1">
                    <Badge className={`${getRiskLevelColor(level)} border text-xs`}>
                      <span className="mr-1">{getRiskLevelIcon(level)}</span>
                      {level}
                    </Badge>
                  </div>
                ))}
                
                <div className="ml-4 text-xs text-muted-foreground">
                  Matriz: {getMatrixInfo().description}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Risco</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no risco selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assigned" className="text-right">
                Responsável
              </Label>
              <Input
                id="edit-assigned"
                value={editForm.assignedTo}
                onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  X,
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  Target,
  CheckCircle
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { RiskFilters as RiskFiltersType, RiskCategory, RiskLevel, RiskStatus } from '@/types/risk-management';
import { RISK_CATEGORIES } from '@/types/risk-management';

interface RiskFiltersProps {
  filters?: RiskFiltersType;
  onFiltersChange: (filters: RiskFiltersType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClose?: () => void;
}

export const RiskFilters: React.FC<RiskFiltersProps> = ({
  filters = {},
  onFiltersChange,
  searchTerm,
  onSearchChange,
  onClose
}) => {
  const riskLevels: RiskLevel[] = ['Muito Alto', 'Alto', 'Médio', 'Baixo', 'Muito Baixo'];
  const riskStatuses: RiskStatus[] = ['Identificado', 'Avaliado', 'Em Tratamento', 'Monitorado', 'Fechado', 'Reaberto'];

  const handleCategoryToggle = (category: RiskCategory) => {
    const currentCategories = filters?.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined
    });
  };

  const handleLevelToggle = (level: RiskLevel) => {
    const currentLevels = filters?.levels || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    
    onFiltersChange({
      ...filters,
      levels: newLevels.length > 0 ? newLevels : undefined
    });
  };

  const handleStatusToggle = (status: RiskStatus) => {
    const currentStatuses = filters?.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...filters,
      statuses: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const getActiveFiltersCount = () => {
    return (
      (filters?.categories?.length || 0) +
      (filters?.levels?.length || 0) +
      (filters?.statuses?.length || 0) +
      (filters?.showOverdue ? 1 : 0) +
      (searchTerm ? 1 : 0)
    );
  };

  const getLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'Muito Alto': return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400';
      case 'Alto': return 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400';
      case 'Médio': return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400';
      case 'Baixo': return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400';
      default: return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'Identificado': return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      case 'Avaliado': return 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400';
      case 'Em Tratamento': return 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400';
      case 'Monitorado': return 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-400';
      case 'Fechado': return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
      case 'Reaberto': return 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400';
      default: return 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Busca */}
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center space-x-1">
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Nome, descrição, categoria..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Categorias */}
        <div>
          <Label className="text-sm font-medium mb-3 flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>Categorias</span>
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.keys(RISK_CATEGORIES).map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories?.includes(category as RiskCategory) || false}
                  onCheckedChange={() => handleCategoryToggle(category as RiskCategory)}
                />
                <Label 
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer flex-1"
                  title={RISK_CATEGORIES[category as RiskCategory]}
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Níveis de Risco */}
        <div>
          <Label className="text-sm font-medium mb-3 flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Níveis de Risco</span>
          </Label>
          <div className="space-y-2">
            {riskLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={filters.levels?.includes(level) || false}
                  onCheckedChange={() => handleLevelToggle(level)}
                />
                <Label 
                  htmlFor={`level-${level}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  <Badge variant="outline" className={`${getLevelColor(level)} border text-xs`}>
                    {level}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div>
          <Label className="text-sm font-medium mb-3 flex items-center space-x-1">
            <CheckCircle className="h-4 w-4" />
            <span>Status</span>
          </Label>
          <div className="space-y-2">
            {riskStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.statuses?.includes(status) || false}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <Label 
                  htmlFor={`status-${status}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  <Badge variant="outline" className={`${getStatusColor(status)} border text-xs`}>
                    {status}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Opções Especiais */}
        <div>
          <Label className="text-sm font-medium mb-3 flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Alertas</span>
          </Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdue"
                checked={filters?.showOverdue || false}
                onCheckedChange={(checked) => 
                  onFiltersChange({
                    ...filters,
                    showOverdue: checked ? true : undefined
                  })
                }
              />
              <Label htmlFor="overdue" className="text-sm cursor-pointer">
                Ações Vencidas
              </Label>
            </div>
          </div>
        </div>

        {/* Limpar Filtros */}
        {getActiveFiltersCount() > 0 && (
          <>
            <Separator />
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="w-full flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Limpar Filtros</span>
            </Button>
          </>
        )}

        {/* Resumo dos Filtros Ativos */}
        {getActiveFiltersCount() > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Filtros ativos:</p>
            <p>{getActiveFiltersCount()} filtro(s) aplicado(s)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
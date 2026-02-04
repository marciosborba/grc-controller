import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { AssessmentFramework } from '@/types/assessment';

interface AssessmentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFramework: string;
  setSelectedFramework: (framework: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedResponsible: string;
  setSelectedResponsible: (responsible: string) => void;
  frameworks: AssessmentFramework[];
  responsibles: any[];
}

export function AssessmentFilters({
  searchTerm,
  setSearchTerm,
  selectedFramework,
  setSelectedFramework,
  selectedStatus,
  setSelectedStatus,
  selectedResponsible,
  setSelectedResponsible,
  frameworks,
  responsibles
}: AssessmentFiltersProps) {
  
  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'planejado', label: 'Planejado' },
    { value: 'iniciado', label: 'Iniciado' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'em_revisao', label: 'Em Revisão' },
    { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'suspenso', label: 'Suspenso' }
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedFramework('all');
    setSelectedStatus('all');
    setSelectedResponsible('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedFramework !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (selectedResponsible !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtros Avançados</h3>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca por Texto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro por Framework */}
        <Select value={selectedFramework} onValueChange={setSelectedFramework}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os Frameworks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Frameworks</SelectItem>
            {frameworks.map((framework) => (
              <SelectItem key={framework.id} value={framework.id}>
                {framework.nome} ({framework.tipo_framework})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Status */}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Responsável */}
        <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os Responsáveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Responsáveis</SelectItem>
            {responsibles.map((responsible) => (
              <SelectItem key={responsible.id} value={responsible.id}>
                {responsible.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags de Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {searchTerm && (
            <Badge variant="outline" className="gap-1">
              Busca: "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedFramework !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Framework: {frameworks.find(f => f.id === selectedFramework)?.nome}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setSelectedFramework('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedStatus !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Status: {statusOptions.find(s => s.value === selectedStatus)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setSelectedStatus('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedResponsible !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Responsável: {responsibles.find(r => r.id === selectedResponsible)?.full_name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setSelectedResponsible('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Filter } from 'lucide-react';
import type { UserManagementFilters, AppRole } from '@/types/user-management';
import { USER_ROLES } from '@/types/user-management';

interface UserFiltersProps {
  filters: UserManagementFilters;
  onFiltersChange: (filters: Partial<UserManagementFilters>) => void;
}

const DEPARTMENTS = [
  'Tecnologia da Informação',
  'Segurança da Informação',
  'Compliance',
  'Auditoria',
  'Riscos',
  'Jurídico',
  'Recursos Humanos',
  'Financeiro',
  'Operações'
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'locked', label: 'Bloqueado' }
];

const LOGIN_PERIOD_OPTIONS = [
  { value: 1, label: 'Último dia' },
  { value: 7, label: 'Últimos 7 dias' },
  { value: 30, label: 'Últimos 30 dias' },
  { value: 90, label: 'Últimos 90 dias' }
];

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof UserManagementFilters, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const clearFilter = (key: keyof UserManagementFilters) => {
    onFiltersChange({ [key]: undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      role: undefined,
      status: undefined,
      department: undefined,
      mfa_enabled: undefined,
      last_login_days: undefined
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length - (filters.search ? 1 : 0); // Excluir search da contagem
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Limpar todos
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Role */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Role</Label>
          <div className="relative">
            <Select
              value={filters.role || ''}
              onValueChange={(value) => 
                handleFilterChange('role', value || undefined)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todas as roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as roles</SelectItem>
                {Object.entries(USER_ROLES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.role && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-0 h-8 w-6 p-0"
                onClick={() => clearFilter('role')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Status</Label>
          <div className="relative">
            <Select
              value={filters.status || ''}
              onValueChange={(value) => 
                handleFilterChange('status', value || undefined)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.status && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-0 h-8 w-6 p-0"
                onClick={() => clearFilter('status')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Departamento */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Departamento</Label>
          <div className="relative">
            <Select
              value={filters.department || ''}
              onValueChange={(value) => 
                handleFilterChange('department', value || undefined)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos os departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.department && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-0 h-8 w-6 p-0"
                onClick={() => clearFilter('department')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* MFA */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">MFA</Label>
          <div className="relative">
            <Select
              value={filters.mfa_enabled?.toString() || ''}
              onValueChange={(value) => 
                handleFilterChange('mfa_enabled', 
                  value === '' ? undefined : value === 'true'
                )
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">MFA Habilitado</SelectItem>
                <SelectItem value="false">MFA Desabilitado</SelectItem>
              </SelectContent>
            </Select>
            {filters.mfa_enabled !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-0 h-8 w-6 p-0"
                onClick={() => clearFilter('mfa_enabled')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Último Login */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Último Login</Label>
          <div className="relative">
            <Select
              value={filters.last_login_days?.toString() || ''}
              onValueChange={(value) => 
                handleFilterChange('last_login_days', 
                  value === '' ? undefined : parseInt(value)
                )
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Qualquer período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer período</SelectItem>
                {LOGIN_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.last_login_days && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-0 h-8 w-6 p-0"
                onClick={() => clearFilter('last_login_days')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Filtros Ativos:</Label>
          <div className="flex flex-wrap gap-2">
            {filters.role && (
              <Badge variant="secondary" className="text-xs">
                Role: {USER_ROLES[filters.role as AppRole]}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => clearFilter('role')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.status && (
              <Badge variant="secondary" className="text-xs">
                Status: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => clearFilter('status')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.department && (
              <Badge variant="secondary" className="text-xs">
                Departamento: {filters.department}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => clearFilter('department')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.mfa_enabled !== undefined && (
              <Badge variant="secondary" className="text-xs">
                MFA: {filters.mfa_enabled ? 'Habilitado' : 'Desabilitado'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => clearFilter('mfa_enabled')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.last_login_days && (
              <Badge variant="secondary" className="text-xs">
                Login: {LOGIN_PERIOD_OPTIONS.find(p => p.value === filters.last_login_days)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => clearFilter('last_login_days')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
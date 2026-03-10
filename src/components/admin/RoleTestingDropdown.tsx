import React from 'react';
import { TestTube, Crown, Shield, User, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRoleTesting } from '@/hooks/useRoleTesting';

interface RoleTestingDropdownProps {
  collapsed?: boolean;
}

const getRoleIcon = (roleId: string) => {
  switch (roleId) {
    case 'platform_admin':
      return Crown;
    case 'admin':
    case 'ciso':
      return Shield;
    case 'auditor':
      return AlertTriangle;
    default:
      return User;
  }
};

const getRoleBadgeColor = (roleId: string) => {
  switch (roleId) {
    case 'platform_admin':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'ciso':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'risk_manager':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'compliance_officer':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'auditor':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export function RoleTestingDropdown({ collapsed = false }: RoleTestingDropdownProps) {
  const {
    canTestRoles,
    isTestingRole,
    currentTestRole,
    testRoles,
    startRoleTesting
  } = useRoleTesting();

  if (!canTestRoles || !currentTestRole) {
    return null;
  }

  const handleRoleChange = (roleId: string) => {
    startRoleTesting(roleId);
  };

  const RoleIcon = getRoleIcon(currentTestRole.id);

  return (
    <div className={`${collapsed ? 'px-1' : 'px-2 sm:px-3'} mb-3 sm:mb-4`}>
      {!collapsed && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <TestTube className="h-3 w-3 text-orange-600 dark:text-orange-400" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Teste de Roles
            </span>
          </div>
          {isTestingRole && (
            <div className="flex items-center gap-1 mb-2">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                Modo de teste ativo
              </span>
            </div>
          )}
        </div>
      )}
      
      <Select value={currentTestRole.id} onValueChange={handleRoleChange}>
        <SelectTrigger 
          className={`${
            collapsed 
              ? 'w-10 h-10 p-0 justify-center' 
              : 'w-full h-auto py-2 px-3'
          } border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors`}
          title={collapsed ? currentTestRole.displayName : ''}
        >
          {collapsed ? (
            <RoleIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          ) : (
            <SelectValue>
              <div className="flex items-center gap-2 min-w-0">
                <RoleIcon className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200 truncate">
                      {currentTestRole.displayName}
                    </span>
                    {isTestingRole && (
                      <Badge 
                        variant="outline" 
                        className="text-[9px] px-1 py-0 h-4 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
                      >
                        TESTE
                      </Badge>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-orange-600 dark:text-orange-400 truncate">
                    {currentTestRole.description}
                  </p>
                </div>
              </div>
            </SelectValue>
          )}
        </SelectTrigger>
        
        <SelectContent className="w-80">
          {testRoles.map((role) => {
            const Icon = getRoleIcon(role.id);
            const isCurrentRole = role.id === currentTestRole.id;
            
            return (
              <SelectItem 
                key={role.id} 
                value={role.id}
                className="cursor-pointer py-3 px-3"
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {role.displayName}
                      </span>
                      <Badge 
                        className={`text-[9px] px-1.5 py-0 h-4 ${getRoleBadgeColor(role.id)}`}
                      >
                        {role.name.toUpperCase()}
                      </Badge>
                      {isCurrentRole && (
                        <Badge 
                          variant="outline" 
                          className="text-[9px] px-1 py-0 h-4 bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                        >
                          ATIVO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 4).map((permission) => (
                        <Badge 
                          key={permission} 
                          variant="secondary" 
                          className="text-[8px] px-1 py-0 h-3"
                        >
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 4 && (
                        <Badge 
                          variant="secondary" 
                          className="text-[8px] px-1 py-0 h-3"
                        >
                          +{role.permissions.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

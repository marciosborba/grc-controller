import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGlobalTenantSelection } from '@/contexts/TenantSelectorContext';

export const TenantSelector: React.FC = () => {
  const { isEnabled, availableTenants, selectedTenantId, setSelectedTenantId } = useGlobalTenantSelection();
  
  if (!isEnabled || availableTenants.length === 0) {
    return null;
  }

  const selectedTenant = availableTenants.find(t => t.id === selectedTenantId);

  return (
    <Select 
      value={selectedTenantId} 
      onValueChange={setSelectedTenantId}
    >
      <SelectTrigger className="w-full md:w-[180px] lg:w-[200px] h-9 border-0 bg-muted/50 hover:bg-muted/80 focus:ring-1 focus:ring-primary/30">
        <div className="flex items-center space-x-2 min-w-0">
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            {selectedTenant ? (
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-sm font-medium truncate">
                  {selectedTenant.name}
                </span>
                <Badge 
                  variant="outline" 
                  className="h-4 px-1.5 text-[10px] font-normal bg-background/50 border-border/50 flex-shrink-0"
                >
                  {selectedTenant.subscription_plan.charAt(0).toUpperCase()}
                </Badge>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Organização</span>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
        </div>
      </SelectTrigger>
      <SelectContent align="end" className="w-[260px]">
        {availableTenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id} className="py-2.5">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium truncate text-sm">{tenant.name}</span>
              </div>
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs bg-muted text-muted-foreground border-muted-foreground/20 flex-shrink-0"
              >
                {tenant.subscription_plan}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
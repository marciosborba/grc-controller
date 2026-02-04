import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  badge?: string | number;
  category: 'primary' | 'secondary' | 'integration';
}

interface AssessmentQuickActionsProps {
  actions: QuickAction[];
}

export function AssessmentQuickActions({ actions }: AssessmentQuickActionsProps) {
  const primaryActions = actions.filter(action => action.category === 'primary');
  const secondaryActions = actions.filter(action => action.category === 'secondary');
  const integrationActions = actions.filter(action => action.category === 'integration');

  const renderActionCard = (action: QuickAction) => (
    <Card 
      key={action.id}
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-md"
      onClick={action.action}
    >
      <CardContent className={`p-6 ${action.color} text-white relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
            <p className="text-sm opacity-90">{action.description}</p>
          </div>
          <div className="ml-4 relative">
            <action.icon className="h-8 w-8" />
            {action.badge && (
              <Badge className="absolute -top-2 -right-2 bg-white text-primary text-xs">
                {action.badge}
              </Badge>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -translate-y-12 translate-x-12"></div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Ações Primárias */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Ações Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryActions.map(renderActionCard)}
        </div>
      </div>

      {/* Ações Secundárias */}
      {secondaryActions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Ferramentas Avançadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {secondaryActions.map(renderActionCard)}
          </div>
        </div>
      )}

      {/* Integrações */}
      {integrationActions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Integrações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationActions.map(renderActionCard)}
          </div>
        </div>
      )}
    </div>
  );
}
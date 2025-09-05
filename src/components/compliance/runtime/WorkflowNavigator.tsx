import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  GitBranch, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Shield
} from 'lucide-react';

import { WorkflowState, WorkflowTransition } from '@/types/compliance-process-templates';

interface WorkflowNavigatorProps {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  currentState: string;
  availableTransitions: WorkflowTransition[];
  onTransition?: (transitionId: string) => void;
  readonly?: boolean;
  getStateIcon: (state: WorkflowState) => JSX.Element;
  getStateColor: (state: WorkflowState) => string;
}

export const WorkflowNavigator: React.FC<WorkflowNavigatorProps> = ({
  states,
  transitions,
  currentState,
  availableTransitions,
  onTransition,
  readonly = false,
  getStateIcon,
  getStateColor
}) => {
  const currentStateData = states.find(s => s.id === currentState);
  
  const getTransitionTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'submit': return <CheckCircle className="h-3 w-3" />;
      case 'approve': return <Shield className="h-3 w-3" />;
      case 'reject': return <AlertCircle className="h-3 w-3" />;
      case 'review': return <Users className="h-3 w-3" />;
      default: return <ArrowRight className="h-3 w-3" />;
    }
  };

  const getTransitionTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'submit': return 'bg-blue-100 text-blue-700';
      case 'approve': return 'bg-green-100 text-green-700';
      case 'reject': return 'bg-red-100 text-red-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isStateCompleted = (stateId: string): boolean => {
    // Simple logic: a state is considered completed if it's not the current state
    // and there's a path from it to the current state
    return stateId !== currentState && states.findIndex(s => s.id === stateId) < states.findIndex(s => s.id === currentState);
  };

  const isStateActive = (stateId: string): boolean => {
    return stateId === currentState;
  };

  const isStateFuture = (stateId: string): boolean => {
    return stateId !== currentState && states.findIndex(s => s.id === stateId) > states.findIndex(s => s.id === currentState);
  };

  const getStateStatusIcon = (state: WorkflowState) => {
    if (isStateCompleted(state.id)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (isStateActive(state.id)) {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <h3 className="font-semibold flex items-center space-x-2">
          <GitBranch className="h-5 w-5" />
          <span>Workflow</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Navegue pelo processo
        </p>
      </div>

      {/* Current State */}
      {currentStateData && (
        <div className="flex-shrink-0 p-4 border-b bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded ${getStateColor(currentStateData)}`}>
              {getStateIcon(currentStateData)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{currentStateData.name}</div>
              <div className="text-sm text-muted-foreground">
                Estado Atual • {currentStateData.assignee_role || 'Não atribuído'}
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              Ativo
            </Badge>
          </div>
          {currentStateData.description && (
            <p className="text-sm text-muted-foreground mt-2 ml-11">
              {currentStateData.description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Available Transitions */}
          {availableTransitions.length > 0 && !readonly && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">
                Ações Disponíveis
              </h4>
              <div className="space-y-2">
                {availableTransitions.map(transition => {
                  const toState = states.find(s => s.id === transition.to_state);
                  return (
                    <Card key={transition.id} className="border border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{transition.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Para: {toState?.name}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getTransitionTriggerColor(transition.trigger)}`}
                            >
                              {getTransitionTriggerIcon(transition.trigger)}
                              <span className="ml-1">{transition.trigger}</span>
                            </Badge>
                            {transition.require_approval && (
                              <Badge variant="outline" className="text-xs bg-yellow-50">
                                <Shield className="h-3 w-3 mr-1" />
                                Aprovação
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onTransition?.(transition.id)}
                          className="w-full mt-3"
                        >
                          {transition.name}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {availableTransitions.length === 0 && !readonly && (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">
                Nenhuma ação disponível no momento
              </div>
            </div>
          )}

          <Separator />

          {/* Workflow Timeline */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">
              Fluxo do Processo
            </h4>
            <div className="space-y-3">
              {states.map((state, index) => {
                const isCompleted = isStateCompleted(state.id);
                const isActive = isStateActive(state.id);
                const isFuture = isStateFuture(state.id);

                return (
                  <div key={state.id} className="relative">
                    {/* Connection Line */}
                    {index < states.length - 1 && (
                      <div className={`absolute left-2 top-8 w-0.5 h-6 ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-200'
                      }`} />
                    )}

                    {/* State */}
                    <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                      isActive ? 'bg-blue-50 border border-blue-200' : 
                      isCompleted ? 'bg-green-50 border border-green-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getStateStatusIcon(state)}
                      </div>

                      {/* State Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-sm">{state.name}</div>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {state.type}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {state.assignee_role && (
                            <span>Responsável: {state.assignee_role}</span>
                          )}
                        </div>

                        {state.description && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {state.description}
                          </div>
                        )}

                        {/* State Fields */}
                        {state.required_fields && state.required_fields.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground">
                              Campos necessários: {state.required_fields.length}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Workflow Statistics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">
              Estatísticas
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-center">
                    {states.filter(s => isStateCompleted(s.id)).length}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Concluídos
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-center">
                    {states.length}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Total
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
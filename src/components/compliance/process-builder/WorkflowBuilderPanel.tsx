import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitBranch,
  Play,
  Square,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

import { WorkflowState, WorkflowTransition, WORKFLOW_STATE_TYPES } from '@/types/compliance-process-templates';

interface WorkflowBuilderPanelProps {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  onChange: (states: WorkflowState[], transitions: WorkflowTransition[]) => void;
  readonly?: boolean;
}

export const WorkflowBuilderPanel: React.FC<WorkflowBuilderPanelProps> = ({
  states,
  transitions,
  onChange,
  readonly = false
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const getStateIcon = (type: string) => {
    switch (type) {
      case 'start': return <Play className="h-4 w-4" />;
      case 'end': return <Square className="h-4 w-4" />;
      case 'task': return <Settings className="h-4 w-4" />;
      case 'review': return <CheckCircle className="h-4 w-4" />;
      case 'approval': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStateColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-100 text-green-700';
      case 'end': return 'bg-red-100 text-red-700';
      case 'task': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      case 'approval': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Construtor de Workflow</h3>
            <p className="text-sm text-muted-foreground">
              Configure os estados e transições do processo
            </p>
          </div>
          
          {!readonly && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Novo Estado
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* States */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="h-5 w-5" />
                  <span>Estados</span>
                  <Badge variant="outline">{states.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {states.map((state) => (
                    <div 
                      key={state.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedState === state.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedState(state.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded ${getStateColor(state.type)}`}>
                            {getStateIcon(state.type)}
                          </div>
                          <div>
                            <div className="font-medium">{state.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {state.type} • {state.assignee_role || 'Não atribuído'}
                            </div>
                          </div>
                        </div>
                        {!readonly && (
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {state.description && (
                        <p className="text-sm text-muted-foreground mt-2 ml-11">
                          {state.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transitions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="h-5 w-5 rotate-90" />
                  <span>Transições</span>
                  <Badge variant="outline">{transitions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transitions.map((transition) => (
                    <div key={transition.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{transition.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {states.find(s => s.id === transition.from_state)?.name} → {' '}
                            {states.find(s => s.id === transition.to_state)?.name}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {transition.trigger}
                          </Badge>
                          {transition.require_approval && (
                            <Badge variant="outline" className="text-xs bg-yellow-50">
                              Aprovação
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Workflow (Placeholder) */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Visualização do Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Visualização gráfica do workflow será implementada em uma versão futura
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {states.length} estados configurados com {transitions.length} transições
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
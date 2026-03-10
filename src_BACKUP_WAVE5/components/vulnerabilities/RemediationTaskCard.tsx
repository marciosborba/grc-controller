import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ActionPlan } from './ActionPlan';
import { User, Users, Calendar, ChevronDown, ChevronUp, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RemediationTask {
    id: string;
    title: string;
    description: string;
    assigned_to: string;
    assigned_team: string;
    status: 'open' | 'in_progress' | 'done';
    due_date: string;
}

interface RemediationTaskCardProps {
    task: RemediationTask;
    onUpdateStatus: (id: string, newStatus: string) => void;
}

export function RemediationTaskCard({ task, onUpdateStatus }: RemediationTaskCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-500 hover:bg-green-600';
            case 'in_progress': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-slate-500 hover:bg-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return <CheckCircle className="h-4 w-4" />;
            case 'in_progress': return <PlayCircle className="h-4 w-4" />;
            default: return <Circle className="h-4 w-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done': return 'Concluído';
            case 'in_progress': return 'Em Progresso';
            default: return 'Aberto';
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 flex-1">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>

                    <div className="flex-1">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            {task.title}
                            <Badge className={`${getStatusColor(task.status)} pointer-events-none text-white border-0`}>
                                {getStatusLabel(task.status)}
                            </Badge>
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            {task.assigned_to && (
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" /> {task.assigned_to}
                                </span>
                            )}
                            {task.assigned_team && (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" /> {task.assigned_team}
                                </span>
                            )}
                            {task.due_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {format(new Date(task.due_date), 'dd/MM/yyyy')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {task.status !== 'done' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(task.id, 'done')}
                            className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Concluir
                        </Button>
                    )}
                    {task.status === 'open' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(task.id, 'in_progress')}
                            className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <PlayCircle className="h-3.5 w-3.5" />
                            Iniciar
                        </Button>
                    )}
                </div>
            </div>

            <CollapsibleContent className="border-t bg-muted/20 p-4 space-y-4">
                {task.description && (
                    <div className="text-sm text-muted-foreground bg-background p-3 rounded border">
                        {task.description}
                    </div>
                )}

                {/* Each task has its own Action Plan */}
                <div className="pl-4 border-l-2 border-primary/20">
                    <h5 className="text-sm font-medium mb-2">Checklist da Tarefa</h5>
                    {/* We'll pass task_id to ActionPlan to filter items specific to this task */}
                    <ActionPlan vulnerabilityId={task.id} isTask={true} />
                </div>

                {/* Attachments could also be localized here if we update the Attachments component */}
            </CollapsibleContent>
        </Collapsible>
    );
}

import React, { useEffect, useState } from 'react';
import { History, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { incidentService } from '@/services/incidentService';
import { Badge } from '@/components/ui/badge';
import type { IncidentHistory } from '@/services/incidentService';

interface IncidentHistoryTabProps {
    incidentId: string;
}

const actionMap: Record<string, { label: string, color: string }> = {
    create: { label: 'Criado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    update: { label: 'Atualizado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    delete: { label: 'Excluído', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    status_change: { label: 'Status Alterado', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
    comment: { label: 'Comentário', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
};

const formatActionDetails = (details: any) => {
    if (!details) return null;

    if (details.status) return `Status alterado para: ${details.status}`;
    if (details.recovery_actions) return `Análise de Causa Raiz foi editada.`;
    if (details.severity) return `Severidade alterada para: ${details.severity}`;
    if (details.priority) return `Prioridade alterada para: ${details.priority}`;
    if (details.title) return `Título ou descrição alterados.`;

    return 'O incidente foi modificado.';
};

const IncidentHistoryTab: React.FC<IncidentHistoryTabProps> = ({ incidentId }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await incidentService.getHistory(incidentId);
                setHistory(data || []);
            } catch (error) {
                console.error("Failed to load incident history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [incidentId]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                    <History className="h-5 w-5" />
                    HISTÓRICO DE MUDANÇAS
                </h4>
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="space-y-4">
                <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                    <History className="h-5 w-5" />
                    HISTÓRICO DE MUDANÇAS
                </h4>
                <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
                    <History className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">Sem Histórico</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Nenhuma modificação foi registrada para este incidente até o momento.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2 mb-4">
                <History className="h-5 w-5" />
                HISTÓRICO DE MUDANÇAS
            </h4>

            <div className="relative border-l border-muted-foreground/20 ml-3 md:ml-4 space-y-6 pb-4">
                {history.map((log) => {
                    const actionInfo = actionMap[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-800' };
                    const userName = log.user?.full_name || log.user?.email || 'Usuário Desconhecido';

                    return (
                        <div key={log.id} className="relative pl-6">
                            {/* Timeline dot */}
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary/20 border-2 border-primary bg-background" />

                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={`${actionInfo.color} border-none font-medium text-xs px-2 py-0.5 rounded-sm`}>
                                        {actionInfo.label}
                                    </Badge>
                                    <span className="text-sm font-medium flex items-center gap-1 text-foreground">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        {userName}
                                    </span>
                                </div>
                                <time className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(log.created_at || new Date()), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                </time>
                            </div>

                            <div className="text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-md border mt-2">
                                {formatActionDetails(log.details) || 'Detalhes não registrados.'}

                                {log.action === 'comment' && log.details?.content && (
                                    <div className="mt-1 italic border-l-2 border-primary/20 pl-2">
                                        "{log.details.content}"
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default IncidentHistoryTab;

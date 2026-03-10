import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, History } from 'lucide-react';
import { format, formatDistance, differenceInHours, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatusChange {
    id: string;
    old_status: string | null;
    new_status: string;
    changed_at: string;
    changed_by: string;
}

interface CycleTimeTimelineProps {
    vulnerabilityId: string;
}

export function CycleTimeTimeline({ vulnerabilityId }: CycleTimeTimelineProps) {
    const [history, setHistory] = useState<StatusChange[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [vulnerabilityId]);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('vulnerability_status_history')
                .select('*')
                .eq('vulnerability_id', vulnerabilityId)
                .order('changed_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDuration = (current: string, previous: string | undefined) => {
        if (!previous) return 'Início';
        return formatDistance(new Date(current), new Date(previous), { locale: ptBR });
    };

    const getExactDuration = (current: string, previous?: string) => {
        if (!previous) return '';
        const start = new Date(previous);
        const end = new Date(current);
        const hours = differenceInHours(end, start);

        if (hours < 24) return `${hours}h`;
        return `${differenceInDays(end, start)}d`;
    };

    if (loading) {
        return <div className="text-center p-4">Carregando histórico...</div>;
    }

    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Timeline de Status (Cycle Time)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Nenhum histórico de mudanças registrado ainda.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Timeline de Status (Cycle Time)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
                    {history.map((change, index) => {
                        const previousChange = history[index + 1]; // Since we ordered desc, previous in time is next in array
                        const duration = previousChange
                            ? getDuration(change.changed_at, previousChange.changed_at)
                            : 'Início';

                        const exactDuration = previousChange
                            ? getExactDuration(change.changed_at, previousChange.changed_at)
                            : '';

                        return (
                            <div key={change.id} className="relative pl-6">
                                <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <span className="text-muted-foreground">{format(new Date(change.changed_at), "dd 'de' MMM 'as' HH:mm", { locale: ptBR })}</span>
                                        {exactDuration && (
                                            <Badge variant="outline" className="ml-auto flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {exactDuration}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        {change.old_status ? (
                                            <>
                                                <Badge variant="secondary">{change.old_status}</Badge>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                <Badge>{change.new_status}</Badge>
                                            </>
                                        ) : (
                                            <Badge className="bg-green-600">Criado como {change.new_status}</Badge>
                                        )}
                                    </div>

                                    {previousChange && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Permaneceu em {previousChange.new_status} por {duration}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIUsageTabProps {
    tenantId: string;
    readonly?: boolean;
}

interface AIUsageLog {
    id: string;
    created_at: string;
    tokens_input: number;
    tokens_output: number;
    cost_usd: number;
    model_name?: string;
    provider?: string;
    status: 'success' | 'error';
}

export const AIUsageTab: React.FC<AIUsageTabProps> = ({ tenantId, readonly = false }) => {
    const [logs, setLogs] = useState<AIUsageLog[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsage = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ai_usage_logs')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error loading usage:', error);
            toast.error('Erro ao carregar logs de uso');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) loadUsage();
    }, [tenantId]);

    const totalCost = logs.reduce((acc, log) => acc + (log.cost_usd || 0), 0);
    const totalTokens = logs.reduce((acc, log) => acc + (log.tokens_input || 0) + (log.tokens_output || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                            <BarChart3 className="h-4 w-4 text-orange-400" /> Custo Estimado (Recente)
                        </div>
                        <div className="text-2xl font-bold text-white">${totalCost.toFixed(4)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                            <Zap className="h-4 w-4 text-yellow-400" /> Total Tokens (Recente)
                        </div>
                        <div className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-white">Data</TableHead>
                                <TableHead className="text-white">Modelo</TableHead>
                                <TableHead className="text-white">Tokens (In/Out)</TableHead>
                                <TableHead className="text-white">Custo</TableHead>
                                <TableHead className="text-white text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        Nenhum registro de uso encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="text-muted-foreground font-mono text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-white">{log.model_name || 'N/A'}</div>
                                            <div className="text-xs text-muted-foreground">{log.provider || 'default'}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <span className="text-green-400">{log.tokens_input}</span> / <span className="text-blue-400">{log.tokens_output}</span>
                                        </TableCell>
                                        <TableCell className="text-sm text-white">
                                            ${(log.cost_usd || 0).toFixed(6)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={log.status === 'error' ? 'destructive' : 'default'} className={log.status === 'success' ? 'bg-green-500/20 text-green-400' : ''}>
                                                {log.status === 'success' ? 'Sucesso' : 'Erro'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

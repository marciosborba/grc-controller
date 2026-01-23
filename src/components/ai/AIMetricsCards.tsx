import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, MessageSquare, Workflow, BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface AIMetricsCardsProps {
    tenantId: string;
    mode: 'platform' | 'tenant';
}

export const AIMetricsCards: React.FC<AIMetricsCardsProps> = ({ tenantId, mode }) => {
    const [metrics, setMetrics] = useState<any>({
        total_requests_today: 0,
        total_tokens_today: 0,
        total_cost_today: 0,
        active_providers_count: 0,
        active_prompts_count: 0
    });
    const [loading, setLoading] = useState(true);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            // Determine the tenant_id to pass to RPC.
            // If Platform Mode, pass NULL to see everything.
            // If Tenant Mode, pass the tenantId.
            const rpcTenantId = mode === 'platform' ? null : tenantId;

            const { data, error } = await supabase
                .rpc('get_ai_dashboard_metrics', {
                    p_tenant_id: rpcTenantId
                });

            if (error) {
                console.error('Failed to load metrics:', error);
            } else if (data && data.length > 0) {
                setMetrics(data[0]);
            }
        } catch (err) {
            console.error('Error loading AI metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, [tenantId, mode]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(val || 0);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="p-4 h-full">
                    <div className="flex flex-col h-full min-h-[100px] text-center">
                        <div className="flex justify-center mb-2">
                            <Cpu className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Provedores Ativos</p>
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-2xl font-bold text-foreground mb-1">
                                {loading ? '...' : metrics.active_providers_count}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 h-full">
                    <div className="flex flex-col h-full min-h-[100px] text-center">
                        <div className="flex justify-center mb-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Prompts Ativos</p>
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-2xl font-bold text-foreground mb-1">
                                {loading ? '...' : metrics.active_prompts_count}
                            </p>
                            <p className="text-xs text-muted-foreground">Configurados</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 h-full">
                    <div className="flex flex-col h-full min-h-[100px] text-center">
                        <div className="flex justify-center mb-2">
                            <Workflow className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Workflows Ativos</p>
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-2xl font-bold text-foreground mb-1">-</p>
                            <p className="text-xs text-muted-foreground">Em desenvolvimento</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-blue-500/20">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <BarChart3 className="w-12 h-12 text-blue-500" />
                </div>
                <CardContent className="p-4 h-full">
                    <div className="flex flex-col h-full min-h-[100px] text-center">
                        <div className="flex justify-center mb-2">
                            <BarChart3 className="h-5 w-5 text-orange-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Uso Hoje (Requisições)</p>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-3xl font-bold text-foreground mb-1">
                                    {loading ? '...' : metrics.total_requests_today}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {loading ? '...' : metrics.total_tokens_today.toLocaleString()} tokens | {formatCurrency(metrics.total_cost_today)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

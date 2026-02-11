import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bell, AlertCircle, X, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsWidget = () => {
    const navigate = useNavigate();

    // Mock Data for Notifications
    const alerts = [
        { id: 1, title: 'Nova vulnerabilidade Zero-Day detectada', type: 'critical', time: '10 min' },
        { id: 2, title: 'Assessment vencido: Fornecedor ABC', type: 'warning', time: '2h' },
        { id: 3, title: 'Política de Senhas expirando', type: 'info', time: '5h' },
    ];

    const pendingAlerts = 12;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/notifications')}
        >
            {/* Watermark Icon */}
            <Bell className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                            <Bell className="h-4 w-4 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Notificações</span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded text-[10px] font-bold text-amber-500 border border-amber-500/20 animate-pulse">
                        <AlertCircle className="h-3 w-3" />
                        <span>{pendingAlerts} Pendentes</span>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Feed de Alertas</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Atenção necessária para itens críticos.
                    </p>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 flex flex-col min-h-0">
                <div className="flex-1 w-full min-h-0 mt-2 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg bg-background/50 border border-border/50 hover:bg-background transition-colors cursor-pointer group/item">
                            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${alert.type === 'critical' ? 'bg-red-500' :
                                    alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover/item:text-primary transition-colors">
                                    {alert.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground">{alert.time} atrás</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Expert Insight Footer */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-2">
                    <span>Limpar tudo</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

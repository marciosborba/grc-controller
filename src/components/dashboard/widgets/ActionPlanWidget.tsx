import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClipboardList, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActionPlansIntegration } from '@/hooks/useActionPlansIntegration';
import { Progress } from '@/components/ui/progress';

export const ActionPlanWidget = () => {
    const { metrics, loading } = useActionPlansIntegration();
    const navigate = useNavigate();

    const total = metrics?.total || 0;
    const overdue = metrics?.overdue || 0;
    const completion = metrics?.completionRate || 0;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/action-plans')}
        >
            <CardHeader className="pb-2 pt-4 sm:pt-6 px-4 sm:px-6 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 sm:p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                        <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest">Planos de Ação</span>
                </div>

                <div className="mt-2 text-muted-foreground text-sm">
                    Gerenciamento de tarefas e remediações.
                </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-2 sm:pb-4 relative z-10 flex-1 flex flex-col justify-end gap-2 sm:gap-4 mt-2 sm:mt-0">
                <div>
                    <div className="flex justify-between items-end mb-1 sm:mb-2">
                        <span className="text-3xl sm:text-4xl font-bold text-foreground tracking-tighter">{completion}%</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mb-1 uppercase font-semibold">Concluído</span>
                    </div>
                    <Progress value={completion} className="h-1.5 bg-secondary" indicatorClassName="bg-blue-500" />
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-bold text-foreground">{total}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Total</span>
                    </div>
                    <div className="w-px bg-border h-8"></div>
                    <div className="flex flex-col">
                        <span className={`text-xl sm:text-2xl font-bold ${overdue > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{overdue}</span>
                        <span className={`text-[10px] uppercase font-bold ${overdue > 0 ? 'text-red-500/70' : 'text-emerald-500/70'}`}>Atrasados</span>
                    </div>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </CardContent>
        </Card>
    );
};

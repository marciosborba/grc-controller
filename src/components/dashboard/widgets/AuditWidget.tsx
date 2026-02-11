import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClipboardCheck, Calendar, AlertCircle, ChevronRight, Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AuditWidget = () => {
    const navigate = useNavigate();

    // Mock Data for Audit Findings Aging
    // Critical metric: Are we fixing audit findings fast enough?
    const findingData = [
        { month: 'Jan', open: 12 },
        { month: 'Fev', open: 15 },
        { month: 'Mar', open: 10 }, // Dip (Good)
        { month: 'Abr', open: 8 },  // Dip (Good)
        { month: 'Mai', open: 14 }, // Spike (New Audit)
    ];

    const totalOpen = 14;
    const highRiskFindings = 3;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/audit')}
        >
            {/* Watermark Icon */}
            <Gavel className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-teal-500/10 border border-teal-500/20">
                            <ClipboardCheck className="h-4 w-4 text-teal-500" />
                        </div>
                        <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Auditoria</span>
                    </div>
                    {highRiskFindings > 0 && (
                        <div className="flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded text-[10px] font-bold text-red-500 border border-red-500/20">
                            <AlertCircle className="h-3 w-3" />
                            <span>{highRiskFindings} High Risk</span>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{totalOpen}</span>
                        <span className="text-sm font-medium text-muted-foreground">Apontamentos</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Em aberto das últimas auditorias internas.
                    </p>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 min-h-[160px] flex flex-col justify-end">

                <div className="h-[100px] w-full mt-2 -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={findingData}>
                            <defs>
                                <linearGradient id="gradientAudit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                cursor={false}
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                            />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            <Area
                                type="monotone"
                                dataKey="open"
                                stroke="#14b8a6"
                                fillOpacity={1}
                                fill="url(#gradientAudit)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Expert Insight Footer */}
                <div className="ml-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Ver plano de remediação</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

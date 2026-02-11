import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Scale, MessageSquare, AlertOctagon, ChevronRight, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const EthicsWidget = () => {
    const navigate = useNavigate();

    // Mock Data for Ethics / Whistleblower Channel
    const reportsData = [
        { category: 'Assédio', count: 4, color: '#f43f5e' }, // Rose 500
        { category: 'Fraude', count: 2, color: '#e11d48' }, // Rose 600
        { category: 'Conflito', count: 7, color: '#be123c' }, // Rose 700
        { category: 'Outros', count: 3, color: '#9f1239' }, // Rose 800
    ];

    const totalReports = 16;
    const avgResolutionDays = 5.2;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/ethics')}
        >
            {/* Watermark Icon */}
            <HeartHandshake className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                            <Scale className="h-4 w-4 text-rose-500" />
                        </div>
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Ética & Conduta</span>
                    </div>
                    <div className="flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded text-[10px] font-bold text-rose-500 border border-rose-500/20">
                        <MessageSquare className="h-3 w-3" />
                        <span>{avgResolutionDays} dias (médio)</span>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{totalReports}</span>
                        <span className="text-sm font-medium text-muted-foreground">Denúncias Ativas</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1" title="Canal de integridade: Casos sob investigação">
                        Casos sob investigação pelo comitê.
                    </p>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 flex flex-col min-h-0">
                <div className="flex-1 w-full min-h-0 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportsData} barSize={24}>
                            <XAxis
                                dataKey="category"
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {reportsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Expert Insight Footer */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                    <span>Acessar canal de denúncias</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

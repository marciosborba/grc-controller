import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Siren, ArrowRight, Activity, Timer, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIncidentManagement } from '@/hooks/useIncidentManagement';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const IncidentsWidget = () => {
    const { incidents, isIncidentsLoading } = useIncidentManagement();
    const navigate = useNavigate();

    const openIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed');

    // Expert Metric: MTTR (Mean Time To Resolve) vs Volume
    // Shows if the team is getting overwhelmed (Volume up, MTTR up) or efficient (Volume up, MTTR down).
    const mttrData = [
        { day: 'Seg', volume: 4, mttr: 1.5 }, // 1.5 hours
        { day: 'Ter', volume: 6, mttr: 2.1 },
        { day: 'Qua', volume: 3, mttr: 1.2 },
        { day: 'Qui', volume: 8, mttr: 3.5 }, // Activity Spike + Slower response
        { day: 'Sex', volume: 5, mttr: 1.8 },
    ];

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/incidents')}
        >
            {/* Watermark Icon */}
            <Siren className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                            <Timer className="h-4 w-4 text-purple-500" />
                        </div>
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Ops Efficiency</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        <span>Últimos 5 dias</span>
                    </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <span className="text-4xl font-bold text-foreground tracking-tighter">1.8h</span>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase">MTTR Médio</p>
                    </div>
                    <div className={`text-right ${mttrData[mttrData.length - 1].mttr < 2 ? 'text-emerald-500' : 'text-orange-500'}`}>
                        <span className="text-sm font-bold"> -12%</span>
                        <p className="text-[10px] text-muted-foreground uppercase">vs Semana Anterior</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 min-h-[160px] flex flex-col justify-end">

                <div className="h-[120px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={mttrData}>
                            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                            />
                            <Bar dataKey="volume" name="Incidentes" barSize={20} fill="#a855f7" radius={[4, 4, 0, 0]} fillOpacity={0.6} />
                            <Line type="monotone" dataKey="mttr" name="MTTR (h)" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Expert Insight Footer */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Eficiência operacional estável</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

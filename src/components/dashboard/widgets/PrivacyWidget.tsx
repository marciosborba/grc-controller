import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, Clock, Users, ChevronRight, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const PrivacyWidget = () => {
    const navigate = useNavigate();

    // Mock Data for Privacy / GDPA / LGPD
    const dsarData = [
        { status: 'Novos', minutes: 12, color: '#a855f7' },  // Purple
        { status: 'Andamento', minutes: 18, color: '#3b82f6' }, // Blue
        { status: 'Revisão', minutes: 5, color: '#eab308' },   // Yellow
    ];

    const totalRequests = 35;
    const slaCompliance = 94; // %

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/privacy')}
        >
            {/* Watermark Icon */}
            <Fingerprint className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                            <Eye className="h-4 w-4 text-purple-500" />
                        </div>
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Privacidade & LGPD</span>
                    </div>
                    <div className={`flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded text-[10px] font-bold text-purple-500 border border-purple-500/20`}>
                        <Clock className="h-3 w-3" />
                        <span>SLA: {slaCompliance}%</span>
                    </div>
                </div>

                <div className="mt-4 flex items-end gap-3">
                    <div>
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{totalRequests}</span>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase">Solicitações (DSAR)</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 min-h-[160px] flex flex-col justify-end">

                <div className="h-[120px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dsarData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barCategoryGap={2}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="status" type="category" width={60} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                            />
                            <Bar dataKey="minutes" radius={[0, 4, 4, 0]} barSize={16}>
                                {dsarData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Expert Insight Footer */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>2 solicitações vencendo hoje</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText, CheckCircle2, Users, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

export const PolicyWidget = () => {
    const navigate = useNavigate();

    // Mock Data for Policy Management
    const policyData = [
        { name: 'Lidas', uv: 85, fill: '#10b981' }, // Emerald
        { name: 'Desconhecido', uv: 100, fill: '#334155' }, // Background track (Slate 700)
    ];

    // Actually just want one bar showing progress
    const chartData = [
        { name: 'Meta', uv: 100, fill: 'transparent' }, // invisible track setter
        { name: 'Adesão', uv: 78, fill: '#3b82f6' } // Blue progress
    ];

    const totalPolicies = 24;
    const adherenceRate = 78;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/policies')}
        >
            {/* Watermark Icon */}
            <BookOpen className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Políticas</span>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded text-[10px] font-bold text-blue-500 border border-blue-500/20">
                        <Users className="h-3 w-3" />
                        <span>Corp</span>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{adherenceRate}%</span>
                        <span className="text-sm font-medium text-muted-foreground">Taxa de Adesão</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Colaboradores que leram e aceitaram.
                    </p>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 min-h-[160px] flex flex-col justify-end">

                <div className="h-[100px] w-full mt-2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="100%"
                            barSize={10}
                            data={chartData}
                            startAngle={180}
                            endAngle={0}
                        >
                            <RadialBar
                                background={{ fill: 'hsl(var(--muted))' }}
                                dataKey="uv"
                                cornerRadius={10}
                            />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center -mt-4 pointer-events-none">
                        <span className="text-xl font-bold text-blue-500">{totalPolicies} Docs</span>
                    </div>
                </div>

                {/* Expert Insight Footer */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Campanha de conscientização ativa</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

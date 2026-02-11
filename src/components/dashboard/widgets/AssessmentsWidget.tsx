import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClipboardList, Send, CheckCircle2, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

export const AssessmentsWidget = () => {
    const navigate = useNavigate();

    // Mock Data for Assessment Campaigns
    const data = [
        { name: 'Enviados', count: 150, fill: '#818cf8' }, // Indigo 400
        { name: 'Respondidos', count: 89, fill: '#4f46e5' }, // Indigo 600
    ];

    // Radial Bar needs formatting
    const chartData = [
        { name: 'Total', value: 100, fill: 'transparent' },
        { name: 'Respondidos', value: 59, fill: '#6366f1' } // Indigo 500
    ];

    const participationRate = 59;
    const activeCampaigns = 3;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/assessments')}
        >
            {/* Watermark Icon */}
            <FileSpreadsheet className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                            <ClipboardList className="h-4 w-4 text-indigo-500" />
                        </div>
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Assessments</span>
                    </div>
                    <div className="bg-indigo-500/10 px-2 py-1 rounded text-[10px] font-bold text-indigo-500 border border-indigo-500/20">
                        {activeCampaigns} Ativos
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{participationRate}%</span>
                        <span className="text-sm font-medium text-muted-foreground">Taxa de Resposta</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Campanhas de maturidade em andamento.
                    </p>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 flex flex-col min-h-0">
                <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="100%"
                            barSize={12}
                            data={chartData}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <RadialBar
                                background={{ fill: 'hsl(var(--muted))' }}
                                dataKey="value"
                                cornerRadius={12}
                            />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                        <span className="text-2xl font-bold text-indigo-500">89</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Respondidos</span>
                    </div>
                </div>

                {/* Expert Insight Footer */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                    <span>Enviar lembretes automáticos</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAssessmentMetrics } from '@/hooks/useAssessments';
import { FileCheck, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export const ComplianceWidget = () => {
    const { metrics, isLoading } = useAssessmentMetrics();
    const navigate = useNavigate();

    const maturity = metrics?.average_maturity || 0;

    // Expert Metric: Maturity by Domain (ISO 27001 / NIST Categories)
    // This helps Decision Makers identify specific weak areas vs strong areas.
    const domainData = [
        { subject: 'Acesso', A: 120, fullMark: 150 },
        { subject: 'Dados', A: 98, fullMark: 150 },
        { subject: 'Rede', A: 86, fullMark: 150 },
        { subject: 'Físico', A: 99, fullMark: 150 },
        { subject: 'Incid.', A: 85, fullMark: 150 },
        { subject: 'Legal', A: 65, fullMark: 150 },
    ];

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/compliance')}
        >
            {/* Watermark Icon - Subtle Expert Style */}
            <FileCheck className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                            <FileCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Compliance</span>
                    </div>
                    <div className="bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                        NIST CSF 2.0
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{maturity}%</span>
                        <span className="text-sm font-medium text-muted-foreground">Maturidade Global</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1" title="Gap de conformidade identificado em: Aspectos Legais">
                        Gap identificado: <span className="text-orange-500 font-bold">Aspectos Legais</span>
                    </p>
                </div>
            </CardHeader>

            <CardContent className="px-1 pb-4 relative z-10 flex-1 flex flex-col min-h-0">
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={domainData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar
                                name="Maturidade"
                                dataKey="A"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="#10b981"
                                fillOpacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Expert Insight Footer */}
                <div className="mx-6 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                    <span>Ver análise de gaps detalhada</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

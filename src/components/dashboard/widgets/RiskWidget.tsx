import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useRisks } from '@/hooks/useRisks';
import { Shield, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const RiskWidget = () => {
    const { risks, isLoading } = useRisks();
    const navigate = useNavigate();

    const totalRisks = risks.length;
    // Calculate average, defaulting to mock if empty for visualization
    const avgRiskScore = 3.2;

    // Expert Metric: Risk Reduction Over Time
    // Shows executives if the investment in security is actually reducing risk exposure.
    // Inherent Risk (Red) vs Residual Risk (Green/Orange)
    const riskTrendData = [
        { month: 'Q1', inherent: 4.8, residual: 4.2 },
        { month: 'Q2', inherent: 4.8, residual: 3.8 },
        { month: 'Q3', inherent: 4.9, residual: 3.5 },
        { month: 'Q4', inherent: 4.9, residual: 3.2 }, // Current state
    ];

    const currentResidual = riskTrendData[riskTrendData.length - 1].residual;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/risks')}
        >
            {/* Watermark Icon */}
            <Shield className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                            <Shield className="h-4 w-4 text-orange-500" />
                        </div>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Risk Posture</span>
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded text-[10px] font-bold text-green-500 border border-green-500/20">
                        <TrendingDown className="h-3 w-3" />
                        <span>-21% YTD</span>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{currentResidual}</span>
                        <span className="text-sm font-medium text-muted-foreground">/ 5.0 (Residual)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Risco Inerente estimado em: <span className="text-red-500 font-bold">4.9</span>
                    </p>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 relative z-10 flex-1 min-h-[160px] flex flex-col justify-end">

                {/* Chart Area */}
                <div className="h-[120px] w-full mt-2 -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={riskTrendData}>
                            <defs>
                                <linearGradient id="gradientResidual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                {/* Pattern for Inherent Risk to differentiate */}
                                <pattern id="patternInherent" patternUnits="userSpaceOnUse" width="4" height="4">
                                    <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#ef4444" strokeWidth="1" opacity="0.2" />
                                </pattern>
                            </defs>
                            <Tooltip
                                cursor={false}
                                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                            />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            {/* Inherent Risk Line (Reference) */}
                            <Area
                                type="step"
                                dataKey="inherent"
                                stroke="#ef4444"
                                strokeDasharray="4 4"
                                fill="transparent"
                                strokeWidth={1}
                                activeDot={false}
                            />
                            {/* Residual Risk Area (Main) */}
                            <Area
                                type="monotone"
                                dataKey="residual"
                                stroke="#f97316"
                                fillOpacity={1}
                                fill="url(#gradientResidual)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Expert Insight Footer */}
                <div className="ml-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Ver matriz de calor completa</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

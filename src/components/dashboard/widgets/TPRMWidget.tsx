import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2, AlertTriangle, PieChart as PieIcon, ChevronRight, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const TPRMWidget = () => {
    const navigate = useNavigate();

    // Mock Data for Third Party Risk
    const vendorData = [
        { name: 'Crítico', value: 8, color: '#ef4444' },   // Red
        { name: 'Alto', value: 15, color: '#f97316' },     // Orange
        { name: 'Médio', value: 42, color: '#eab308' },    // Yellow
        { name: 'Baixo', value: 65, color: '#3b82f6' },    // Blue
    ];

    const totalVendors = 130;
    const criticalVendors = 8;

    return (
        <Card
            className="relative overflow-hidden bg-card border-border/50 hover:border-border transition-all duration-300 group h-full flex flex-col justify-between shadow-sm hover:shadow-md"
            onClick={() => navigate('/tprm')}
        >
            {/* Watermark Icon */}
            <Globe2 className="absolute -right-12 -top-12 h-64 w-64 text-primary/5 rotate-12 pointer-events-none" />

            <CardHeader className="pb-2 pt-6 px-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                            <Building2 className="h-4 w-4 text-orange-500" />
                        </div>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">TPRM / Vendors</span>
                    </div>
                    {criticalVendors > 0 && (
                        <div className="flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded text-[10px] font-bold text-red-500 border border-red-500/20 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{criticalVendors} Críticos</span>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">{totalVendors}</span>
                        <span className="text-sm font-medium text-muted-foreground">Fornecedores Ativos</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-1 pb-4 relative z-10 flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={vendorData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {vendorData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            cursor={false}
                            contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 'var(--radius)' }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                </ResponsiveContainer>

                {/* Expert Insight Footer */}
                <div className="mx-6 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Revisar assessments pendentes</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

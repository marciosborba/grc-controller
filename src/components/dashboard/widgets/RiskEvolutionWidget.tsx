import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector, Legend } from 'recharts';
import { Info, MoreHorizontal, TrendingUp, TrendingDown, Activity, AlertCircle, ArrowUpRight, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface RiskLevelConfig {
    id: string; // or name as id
    name: string;
    color: string;
}

interface RiskMatrixConfig {
    type: '3x3' | '4x4' | '5x5';
    risk_levels_custom?: RiskLevelConfig[];
}

export const RiskEvolutionWidget = () => {
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [loading, setLoading] = useState(true);
    const [riskLevels, setRiskLevels] = useState<RiskLevelConfig[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0); // For Pie Chart

    // --- FETCH CONFIG ---
    useEffect(() => {
        if (!effectiveTenantId) return;

        const loadConfig = async () => {
            try {
                const { data } = await supabase
                    .from('tenants')
                    .select('settings')
                    .eq('id', effectiveTenantId)
                    .single();

                const config: RiskMatrixConfig = data?.settings?.risk_matrix || { type: '5x5' };
                let levels: RiskLevelConfig[] = [];

                if (config.risk_levels_custom && config.risk_levels_custom.length > 0) {
                    // Use custom levels if available
                    levels = config.risk_levels_custom.map((l: any) => ({
                        id: l.name, // Use name as ID for data mapping
                        name: l.name,
                        color: l.color
                    }));
                } else {
                    // Default Levels based on Matrix Type
                    if (config.type === '5x5') {
                        levels = [
                            { id: 'Muito Baixo', name: 'Muito Baixo', color: '#3b82f6' }, // Blue
                            { id: 'Baixo', name: 'Baixo', color: '#22c55e' },             // Green
                            { id: 'Médio', name: 'Médio', color: '#eab308' },             // Yellow
                            { id: 'Alto', name: 'Alto', color: '#f97316' },               // Orange
                            { id: 'Muito Alto', name: 'Muito Alto', color: '#ef4444' }    // Red
                        ];
                    } else { // 4x4 or 3x3 defaults
                        levels = [
                            { id: 'Baixo', name: 'Baixo', color: '#22c55e' },
                            { id: 'Médio', name: 'Médio', color: '#eab308' },
                            { id: 'Alto', name: 'Alto', color: '#f97316' },
                            { id: 'Crítico', name: 'Crítico', color: '#ef4444' }
                        ];
                    }
                }

                setRiskLevels(levels);
                generateMockData(levels);

            } catch (error) {
                console.error("Error loading risk config:", error);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [effectiveTenantId]);

    // --- MOCK DATA GENERATOR ---
    const generateMockData = (levels: RiskLevelConfig[]) => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        const data = months.map(month => {
            const entry: any = { name: month };
            levels.forEach(level => {
                // Generate random value roughly based on severity (fewer high risks)
                const base = level.color.includes('red') || level.color.includes('ef4444') ? 5 :
                    level.color.includes('orange') || level.color.includes('f97316') ? 10 : 20;
                entry[level.id] = Math.floor(Math.random() * base) + 5;
            });
            return entry;
        });
        setChartData(data);
    };

    // --- PIE CHART DATA (Treatment Status) ---
    // This could also be dynamic, but keeping static for now as it wasn't the specific request
    const treatmentData = [
        { name: 'Mitigado', value: 45, color: '#10b981' },
        { name: 'Em Tratamento', value: 30, color: '#3b82f6' },
        { name: 'Aceito', value: 15, color: '#ef4444' },
        { name: 'Residual', value: 10, color: '#eab308' },
    ];

    // Pie Active Shape (Same as TPRM/Evolution V29)
    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="text-lg font-bold font-sans drop-shadow-sm filter brightness-125">
                    {value}%
                </text>
                <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#94a3b8" className="text-[9px] uppercase font-bold tracking-widest">
                    {payload.name}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8} // Expanding effect
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    fillOpacity={0.8}
                    stroke={fill}
                    strokeWidth={2}
                    className="drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300"
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={innerRadius - 8}
                    outerRadius={innerRadius - 4}
                    fill={fill}
                    fillOpacity={0.4}
                />
            </g>
        );
    };

    // --- TOOLTIPS ---
    const CustomAreaTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-xl p-3 rounded-lg shadow-2xl">
                    <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">{label}</p>
                    <div className="space-y-1.5">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-300 w-20 truncate">{entry.name}:</span>
                                <span className="font-bold text-white tabular-nums">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };


    return (
        <Card className="h-full flex flex-col bg-card border-border shadow-sm overflow-hidden relative group">
            <CardContent className="p-0 h-full">
                {/* Re-implementing the 'RiskEvolutionContent' structure directly here */}
                <div className="flex flex-col h-full w-full bg-slate-950/20">
                    {/* Premium Header */}
                    <div className="px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-sm flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Activity className="h-4 w-4 text-primary animate-pulse" />
                                Análise de Tendência e Tratamento
                            </h4>
                            <p className="text-xs text-muted-foreground">Monitoramento de volume e eficiência de resposta</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 p-0 flex flex-col min-h-0">

                        {/* TOP: EVOLUTION AREA CHART (50%) */}
                        <div className="flex-1 p-4 lg:p-5 border-b border-white/5 relative group flex flex-col min-h-0">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2 relative z-10 shrink-0">
                                <TrendingUp className="w-3 h-3 text-primary" /> Evolução Histórica
                            </h4>
                            <div className="flex-1 w-full relative z-10 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            {riskLevels.map((level) => (
                                                <linearGradient key={`grad-${level.id}`} id={`color-${level.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={level.color} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={level.color} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickCount={5}
                                        />
                                        <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />

                                        {/* Dynamically Render Areas */}
                                        {riskLevels.map((level, index) => (
                                            <Area
                                                key={level.id}
                                                type="monotone"
                                                dataKey={level.id}
                                                name={level.name}
                                                stackId="1"
                                                stroke={level.color}
                                                strokeWidth={2}
                                                fill={`url(#color-${level.id})`}
                                                animationDuration={1500}
                                                animationBegin={index * 200} // Staggered animation
                                                activeDot={{ r: 5, strokeWidth: 0, fill: level.color, className: "animate-pulse" }}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* BOTTOM: TREATMENT STATUS DONUT (50%) */}
                        <div className="flex-1 p-0 flex flex-col min-h-0 border-l border-white/5 bg-gradient-to-t from-black/20 to-transparent">
                            <div className="p-5 pb-0 flex items-center justify-between">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 shrink-0">
                                    <PieChartIcon className="w-3 h-3 text-blue-500" /> Status de Resposta
                                </h4>
                            </div>

                            <div className="flex-1 min-h-0 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            data={treatmentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                            onMouseEnter={(_, index) => setActiveIndex(index)}
                                            stroke="none"
                                        >
                                            {treatmentData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    fillOpacity={0.8}
                                                    stroke={entry.color}
                                                    strokeWidth={1}
                                                    className="transition-all duration-300 hover:opacity-100 cursor-pointer hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                                />
                                            ))}
                                        </Pie>
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            iconType="circle"
                                            iconSize={6}
                                            wrapperStyle={{ bottom: '10px', fontSize: '10px' }}
                                            content={({ payload }) => (
                                                <ul className="flex flex-wrap justify-center gap-3 w-full px-4">
                                                    {payload?.map((entry: any, index: number) => (
                                                        <li key={`item-${index}`} className="flex items-center gap-1.5 cursor-pointer hover:opacity-100 opacity-60 transition-opacity">
                                                            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-[10px] font-medium text-slate-300">{entry.value}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Bottom Stats Row */}
                            <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                                <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Riscos</span>
                                    <div className="text-2xl font-black text-white flex items-center gap-2">
                                        142
                                        <AlertCircle className="w-3 h-3 text-slate-500" />
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Eficácia</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-emerald-500">78%</span>
                                        <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center border border-emerald-500/20">
                                            <ArrowUpRight className="w-2 h-2 mr-0.5" /> 12%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </CardContent>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </Card>
    );
};

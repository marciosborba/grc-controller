import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2, AlertTriangle, PieChart as PieIcon, ChevronRight, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

// --- TYPES (Shared with RiskMatrix/RiskEvolution) ---
interface RiskLevelConfig {
    id: string; // or name as id
    name: string;
    color: string;
}

interface RiskMatrixConfig {
    type: '3x3' | '4x4' | '5x5';
    risk_levels_custom?: RiskLevelConfig[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-xl p-3 rounded-lg shadow-2xl">
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: payload[0].payload.color }} />
                    <span className="text-slate-400 capitalize">{payload[0].name}:</span>
                    <span className="font-bold text-white tabular-nums">{payload[0].value} Vendors</span>
                </div>
            </div>
        );
    }
    return null;
};

// Custom Active Shape
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
        <g>
            <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="text-xl font-bold font-sans drop-shadow-sm filter brightness-125">
                {value}
            </text>
            <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#94a3b8" className="text-[9px] uppercase font-bold tracking-widest">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
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
                innerRadius={innerRadius - 6}
                outerRadius={innerRadius - 3}
                fill={fill}
                fillOpacity={0.4}
            />
        </g>
    );
};

export const TPRMWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [vendorData, setVendorData] = useState<any[]>([]);

    // Calculate totals based on dynamic data
    const totalVendors = vendorData.reduce((acc, curr) => acc + curr.value, 0);
    // Determine "Critical" count - roughly assumes highest severity items are "Critical" or "Muito Alto"
    // We filter for levels that likely represent high risk (Red/Orange)
    const criticalVendors = vendorData
        .filter(d => d.color.includes('ef4444') || d.color.includes('red') || d.name.includes('Crítico') || d.name.includes('Muito Alto'))
        .reduce((acc, curr) => acc + curr.value, 0);

    // --- FETCH CONFIG & GENERATE DATA ---
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
                    levels = config.risk_levels_custom.map((l: any) => ({
                        id: l.name,
                        name: l.name,
                        color: l.color
                    }));
                } else {
                    if (config.type === '5x5') {
                        levels = [
                            { id: 'Muito Baixo', name: 'Muito Baixo', color: '#3b82f6' },
                            { id: 'Baixo', name: 'Baixo', color: '#22c55e' },
                            { id: 'Médio', name: 'Médio', color: '#eab308' },
                            { id: 'Alto', name: 'Alto', color: '#f97316' },
                            { id: 'Muito Alto', name: 'Muito Alto', color: '#ef4444' }
                        ];
                    } else {
                        levels = [
                            { id: 'Baixo', name: 'Baixo', color: '#22c55e' },
                            { id: 'Médio', name: 'Médio', color: '#eab308' },
                            { id: 'Alto', name: 'Alto', color: '#f97316' },
                            { id: 'Crítico', name: 'Crítico', color: '#ef4444' }
                        ];
                    }
                }

                // Generate Mock Vendor Data based on levels
                const mockData = levels.map(level => ({
                    name: level.name,
                    value: Math.floor(Math.random() * 40) + 5, // Random count between 5 and 45
                    color: level.color
                }));

                // Sort by severity (optional, but good for visual order) - here just relying on config order
                setVendorData(mockData);

            } catch (error) {
                console.error("Error loading TPRM config:", error);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [effectiveTenantId]);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    if (loading) {
        return (
            <Card className="h-full flex items-center justify-center bg-card border-border/50 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </Card>
        );
    }

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

            <CardContent className="px-1 pb-4 relative z-10 flex-1 min-h-[160px] flex flex-col">
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={vendorData}
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={onPieEnter}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                                animationBegin={0}
                                animationDuration={1500}
                            >
                                {vendorData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        fillOpacity={0.3} // TRANSPARENT
                                        stroke={entry.color} // SOLID BORDERS
                                        strokeWidth={2}
                                        className="transition-all duration-300 hover:opacity-100 cursor-pointer"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px' }}
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                formatter={(value, entry: any) => (
                                    <span className="text-slate-400 hover:text-white transition-colors cursor-pointer ml-1">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Expert Insight Footer */}
                <div className="mx-6 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
                    <span>Revisar assessments pendentes</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
        </Card>
    );
};

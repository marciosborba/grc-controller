import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// --- TYPES ---
interface Risk {
    id: string;
    impact_score: number;
    likelihood_score: number;
}

interface MatrixCell {
    risks: Risk[];
    count: number;
    bg: string;
    name: string;
    score: number;
}

interface RiskLevelConfig {
    id: string;
    name: string;
    value: number;
    color: string;
    minValue: number;
    maxValue: number;
}

interface RiskMatrixConfig {
    type: '3x3' | '4x4' | '5x5';
    impact_labels: string[];
    likelihood_labels: string[];
    calculation_method?: 'multiplication' | 'addition' | 'custom';
    risk_levels_custom?: RiskLevelConfig[];
    risk_levels?: any;
    matrix?: number[][];
}

export const RiskMatrixWidget = () => {
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const navigate = useNavigate();

    const [risks, setRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(true);
    const [matrixConfig, setMatrixConfig] = useState<RiskMatrixConfig>({
        type: '5x5',
        impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico'],
        likelihood_labels: ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo'],
        calculation_method: 'multiplication'
    });

    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    useEffect(() => {
        if (!effectiveTenantId) return;
        const loadData = async () => {
            try {
                const [settingsRes, risksRes] = await Promise.all([
                    supabase.from('tenants').select('settings').eq('id', effectiveTenantId).single(),
                    supabase.from('risk_assessments').select('id, impact_score, likelihood_score').eq('tenant_id', effectiveTenantId)
                ]);

                if (settingsRes.data?.settings?.risk_matrix) {
                    setMatrixConfig(settingsRes.data.settings.risk_matrix);
                }

                if (risksRes.data) {
                    setRisks(risksRes.data);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [effectiveTenantId]);

    const gridSize = parseInt(matrixConfig.type.charAt(0));

    // --- LOGIC (V19/20) ---
    const calculateScore = (probability: number, impact: number) => {
        switch (matrixConfig.calculation_method) {
            case 'multiplication':
                return probability * impact;
            case 'addition':
                return probability + impact;
            case 'custom':
                return matrixConfig.matrix?.[probability - 1]?.[impact - 1] || (probability * impact);
            default:
                return probability * impact;
        }
    };

    const getRiskLevelDetails = (score: number) => {
        if (matrixConfig.risk_levels_custom?.length) {
            const level = matrixConfig.risk_levels_custom.find(l => score >= l.minValue && score <= l.maxValue);
            if (level) return { color: level.color, name: level.name };
        }

        // Defaults
        if (gridSize === 5) {
            if (score >= 17) return { color: '#ef4444', name: 'Muito Alto' };
            if (score >= 9) return { color: '#f97316', name: 'Alto' };
            if (score >= 5) return { color: '#eab308', name: 'Médio' };
            if (score >= 3) return { color: '#22c55e', name: 'Baixo' };
            return { color: '#3b82f6', name: 'Muito Baixo' };
        } else if (gridSize === 4) {
            if (score >= 10) return { color: '#ef4444', name: 'Muito Alto' };
            if (score >= 7) return { color: '#f97316', name: 'Alto' };
            if (score >= 3) return { color: '#eab308', name: 'Médio' };
            return { color: '#22c55e', name: 'Baixo' };
        } else {
            if (score >= 6) return { color: '#ef4444', name: 'Alto' };
            if (score >= 3) return { color: '#eab308', name: 'Médio' };
            return { color: '#22c55e', name: 'Baixo' };
        }
    };

    const matrixGrid: MatrixCell[][] = [];

    // Initialize Grid
    for (let row = 0; row < gridSize; row++) {
        const matrixRow: MatrixCell[] = [];
        for (let col = 0; col < gridSize; col++) {
            const impactVal = gridSize - row; // Row 0 -> Impact Max
            const probVal = col + 1;          // Col 0 -> Prob 1

            const score = calculateScore(probVal, impactVal);
            const level = getRiskLevelDetails(score);

            matrixRow.push({
                risks: [],
                count: 0,
                bg: level.color,
                name: level.name,
                score: score
            });
        }
        matrixGrid.push(matrixRow);
    }

    // Populate
    risks.forEach(r => {
        const prob = Math.round(r.likelihood_score || 0);
        const imp = Math.round(r.impact_score || 0);
        const pIndex = Math.max(0, Math.min(gridSize - 1, prob - 1));
        const iIndex = Math.max(0, Math.min(gridSize - 1, imp - 1));

        // Visual Coordinates
        const visualRow = gridSize - imp;
        const visualCol = pIndex;

        if (matrixGrid[visualRow]?.[visualCol]) {
            matrixGrid[visualRow][visualCol].risks.push(r);
            matrixGrid[visualRow][visualCol].count++;
        }
    });

    return (
        <Card className="h-full flex flex-col bg-card border-border shadow-sm overflow-hidden relative group">
            <div className="flex flex-col h-full w-full bg-slate-950/20">
                <CardHeader className="px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-sm flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                            <AlertTriangle className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Matriz de Riscos</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">Distribuição de probabilidade e impacto</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 flex flex-col items-center justify-center min-h-0 overflow-hidden">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /> : (
                        <div className="aspect-square h-full max-h-full w-auto max-w-full relative grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-2">

                            {/* Y-Axis Label */}
                            <div className="flex items-center justify-center">
                                <span className="transform -rotate-90 text-sm font-bold text-muted-foreground whitespace-nowrap tracking-widest uppercase">
                                    IMPACTO
                                </span>
                            </div>

                            {/* Main Grid Area */}
                            <div className="relative grid grid-cols-[auto_1fr] gap-3 w-full h-full">
                                {/* Y-Axis Numbers */}
                                <div className="flex flex-col justify-between py-6 h-full">
                                    {Array.from({ length: gridSize }, (_, i) => gridSize - i).map(val => (
                                        <div key={val} className="flex-1 flex items-center justify-end pr-3 text-base font-bold text-muted-foreground">
                                            {val}
                                        </div>
                                    ))}
                                </div>

                                {/* The Matrix Grid */}
                                <div
                                    className="grid w-full h-full border border-border rounded-md overflow-hidden"
                                    style={{
                                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                                        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                                        gap: '2px', // Increased Gap for visual definition
                                        backgroundColor: '#262626'
                                    }}
                                >
                                    {matrixGrid.map((row, rowIndex) => (
                                        row.map((cell, colIndex) => {
                                            return (
                                                <TooltipProvider key={`${rowIndex}-${colIndex}`}>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            {/* INTERACTIVE CONTAINER */}
                                                            <div
                                                                className="relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 group"
                                                                onClick={() => navigate('/risks')}
                                                            >
                                                                {/*
                                                              Anexo 2 Style: Solid Color (Reverted)
                                                            */}
                                                                <div
                                                                    className="absolute inset-0 z-0 transition-opacity"
                                                                    style={{
                                                                        background: `linear-gradient(180deg, ${cell.bg}CC 0%, ${cell.bg}40 100%)`
                                                                    }}
                                                                />

                                                                {/* CONTENT LAYER */}
                                                                <div className="relative z-10 flex flex-col items-center justify-center p-0.5 w-full">
                                                                    <span className={cn(
                                                                        "font-black drop-shadow-sm text-white",
                                                                        // Dynamic sizing based on grid to prevent overflow
                                                                        gridSize === 5 ? "text-xl" : "text-2xl",
                                                                        cell.count === 0 && "opacity-90 scale-90"
                                                                    )}>
                                                                        {cell.count > 0 ? cell.count : cell.score}
                                                                    </span>

                                                                    {/* Compact Label */}
                                                                    <span className={cn(
                                                                        "uppercase font-bold text-white/90 leading-tight mt-0.5 drop-shadow-sm text-center px-1 break-words w-full",
                                                                        // Smaller text for larger grids to fit
                                                                        gridSize === 5 ? "text-[8px]" : "text-[10px]"
                                                                    )}>
                                                                        {cell.name}
                                                                    </span>
                                                                </div>

                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-sm font-semibold bg-background border-border shadow-xl p-3">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cell.bg }} />
                                                                    <span>{cell.name} (Score: {cell.score})</span>
                                                                </div>
                                                                <div className="text-muted-foreground font-normal">
                                                                    P: {matrixConfig.likelihood_labels[colIndex]} <br />
                                                                    I: {matrixConfig.impact_labels[gridSize - 1 - rowIndex]}
                                                                </div>
                                                                <div className="pt-2 border-t mt-1">
                                                                    {cell.count} Risco(s) neste quadrante
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>

                            {/* Corner Spacer */}
                            <div />

                            {/* X-Axis Area */}
                            <div className="grid grid-rows-[auto_auto] gap-2 pl-10">
                                {/* X-Axis Numbers */}
                                <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                                    {Array.from({ length: gridSize }, (_, i) => i + 1).map(val => (
                                        <div key={val} className="flex justify-center text-base font-bold text-muted-foreground">
                                            {val}
                                        </div>
                                    ))}
                                </div>

                                {/* X-Axis Label */}
                                <div className="flex justify-center pt-2">
                                    <span className="text-sm font-bold text-muted-foreground tracking-widest uppercase">
                                        PROBABILIDADE
                                    </span>
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>

                {/* LEGEND SECTION */}
                {!loading && (
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 bg-transparent mt-auto">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-4">Legenda dos Níveis de Risco:</h4>
                        <div className="flex flex-wrap gap-3 justify-center mb-4">
                            {(() => {
                                // Helper to Generate Legend Items
                                let legendItems: { name: string; color: string; min: number; max: number }[] = [];

                                if (matrixConfig.risk_levels_custom?.length) {
                                    legendItems = matrixConfig.risk_levels_custom.map(l => ({
                                        name: l.name,
                                        color: l.color,
                                        min: l.minValue,
                                        max: l.maxValue
                                    }));
                                } else {
                                    // Default Levels Generation (Reverse Engineering from Logic)
                                    // This is a bit manual but necessary if we don't store the "Ranges" explicitly in default mode.
                                    // Standard 5x5: MB(1-2), B(3-4), M(5-8), A(9-16), MA(17-25)
                                    // Standard 4x4: B(1-2), M(3-6), A(7-9), MA(10-16)
                                    // Standard 3x3: B(1-2), M(3-4), A(5-9) (Adjusted to typical 3x3)

                                    const gridSize = parseInt(matrixConfig.type.charAt(0));
                                    if (gridSize === 5) {
                                        legendItems = [
                                            { name: 'Muito Baixo', color: '#3b82f6', min: 1, max: 2 },
                                            { name: 'Baixo', color: '#22c55e', min: 3, max: 4 },
                                            { name: 'Médio', color: '#eab308', min: 5, max: 8 },
                                            { name: 'Alto', color: '#f97316', min: 9, max: 16 },
                                            { name: 'Muito Alto', color: '#ef4444', min: 17, max: 25 },
                                        ];
                                    } else if (gridSize === 4) {
                                        legendItems = [
                                            { name: 'Baixo', color: '#22c55e', min: 1, max: 2 },
                                            { name: 'Médio', color: '#eab308', min: 3, max: 6 },
                                            { name: 'Alto', color: '#f97316', min: 7, max: 9 },
                                            { name: 'Muito Alto', color: '#ef4444', min: 10, max: 16 },
                                        ];
                                    } else {
                                        legendItems = [
                                            { name: 'Baixo', color: '#22c55e', min: 1, max: 2 },
                                            { name: 'Médio', color: '#eab308', min: 3, max: 4 },
                                            { name: 'Alto', color: '#ef4444', min: 5, max: 9 },
                                        ];
                                    }
                                }

                                return legendItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 px-3 py-1.5 bg-background border border-border rounded-md shadow-sm">
                                        <div className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-semibold whitespace-nowrap text-foreground">
                                            {item.name} <span className="text-muted-foreground ml-1">({item.min === item.max ? item.min : `${item.min}-${item.max}`})</span>
                                        </span>
                                    </div>
                                ));
                            })()}
                        </div>

                        <div className="text-center space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">
                                Matriz {matrixConfig.type} - {parseInt(matrixConfig.type.charAt(0)) ** 2} combinações possíveis
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Cell
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface ComplianceChartsProps {
    trendData: {
        month: string;
        score: number;
        assessments: number;
    }[];
    frameworkData: {
        name: string;
        score: number;
        total: number;
    }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg p-3 shadow-lg">
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-primary">
                    Conformidade: {payload[0].value}%
                </p>
                {payload[0].payload.assessments !== undefined && (
                    <p className="text-xs text-muted-foreground">
                        {payload[0].payload.assessments} avaliações
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export function ComplianceCharts({ trendData, frameworkData }: ComplianceChartsProps) {
    // Sort framework data to show most critical first or alphabetical
    const sortedFrameworks = [...frameworkData].sort((a, b) => b.total - a.total).slice(0, 10);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Trend Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                            <CardTitle className="text-lg">Evolução da Conformidade</CardTitle>
                            <CardDescription>Média de conformidade nos últimos 6 meses</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs text-muted-foreground"
                                        tick={{ fill: 'currentColor' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        className="text-xs text-muted-foreground"
                                        tick={{ fill: 'currentColor' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Dados insuficientes para histórico
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Framework Comparison Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                            <CardTitle className="text-lg">Conformidade por Framework</CardTitle>
                            <CardDescription>Adesão aos requisitos por norma</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        {sortedFrameworks.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sortedFrameworks} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        className="text-xs text-muted-foreground font-medium"
                                        tick={{ fill: 'currentColor' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-background border rounded p-2 shadow">
                                                        <p className="font-semibold">{payload[0].payload.name}</p>
                                                        <p className="text-sm">Conformidade: {payload[0].value}%</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                        {
                                            sortedFrameworks.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#10b981' : entry.score >= 70 ? '#f59e0b' : '#ef4444'} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Nenhum framework avaliado
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

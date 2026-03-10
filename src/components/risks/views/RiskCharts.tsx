import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  LabelList
} from 'recharts';
import type { Risk } from '@/types/risk-management';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface RiskChartsProps {
  data: Risk[];
  type: 'level-distribution' | 'category-distribution' | 'trend-analysis';
  height?: number;
}

const RiskCharts: React.FC<RiskChartsProps> = ({ data, type, height = 200 }) => {
  const { getRiskLevels } = useTenantSettings();
  const riskLevels = getRiskLevels();

  const chartData = useMemo(() => {
    switch (type) {
      case 'level-distribution': {
        const levelData = data.reduce((acc, risk) => {
          acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return riskLevels.map(level => ({
          name: level,
          value: levelData[level] || 0,
          color: getRiskLevelColor(level)
        }));
      }

      case 'category-distribution': {
        const categoryData = data.reduce((acc, risk) => {
          acc[risk.category] = (acc[risk.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryData).map(([category, count]) => ({
          name: category,
          value: count,
          percentage: ((count / data.length) * 100).toFixed(1)
        }));
      }

      case 'trend-analysis': {
        const levelData = data.reduce((acc, risk) => {
          acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return [
          { month: 'Jan', total: Math.max(0, data.length - 15), alto: Math.max(0, (levelData['Alto'] || 0) - 3) },
          { month: 'Fev', total: Math.max(0, data.length - 12), alto: Math.max(0, (levelData['Alto'] || 0) - 2) },
          { month: 'Mar', total: Math.max(0, data.length - 8), alto: Math.max(0, (levelData['Alto'] || 0) - 1) },
          { month: 'Abr', total: Math.max(0, data.length - 5), alto: levelData['Alto'] || 0 },
          { month: 'Mai', total: data.length, alto: levelData['Alto'] || 0 }
        ];
      }

      default:
        return [];
    }
  }, [data, type, riskLevels]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto': return '#ef4444';
      case 'Alto': return '#f97316';
      case 'Médio': return '#eab308';
      case 'Baixo': return '#22c55e';
      case 'Muito Baixo': return '#64748b';
      default: return '#6b7280';
    }
  };

  if (type === 'level-distribution') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            fontSize={10}
            tick={{ fill: 'currentColor' }}
            tickMargin={5}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            fontSize={10}
            tick={{ fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: 'var(--muted)' }}
          />
          <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'category-distribution') {
    // Ordenar os dados do maior para o menor para ficar mais bonito no gráfico de barras horizontais
    const sortedData = [...chartData].sort((a: any, b: any) => b.value - a.value);

    // Altura dinâmica baseada na quantidade de itens (35px por item + 40px área de folga)
    const dynamicHeight = Math.max(height || 250, sortedData.length * 35 + 40);

    return (
      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'currentColor' }}
            width={90}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
            formatter={(value: any, name: any, props: any) => {
              const item = sortedData.find((c: any) => c.name === props.payload.name) as any;
              return [`${value} (${item?.percentage || 0}%)`, 'Quantidade / %'];
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
            ))}
            <LabelList dataKey="value" position="right" fill="currentColor" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'trend-analysis') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            fontSize={10}
            tickMargin={5}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            fontSize={10}
            axisLine={false}
            tickLine={false}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Total"
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="alto"
            stroke="#ef4444"
            strokeWidth={2}
            name="Alto Risco"
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default RiskCharts;
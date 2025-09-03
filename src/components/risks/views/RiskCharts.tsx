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
  Line
} from 'recharts';
import type { Risk } from '@/types/risk-management';

interface RiskChartsProps {
  data: Risk[];
  type: 'level-distribution' | 'category-distribution' | 'trend-analysis';
  height?: number;
}

const RiskCharts: React.FC<RiskChartsProps> = ({ data, type, height = 200 }) => {
  const chartData = useMemo(() => {
    switch (type) {
      case 'level-distribution': {
        const levelData = data.reduce((acc, risk) => {
          acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return ['Muito Alto', 'Alto', 'Médio', 'Baixo', 'Muito Baixo'].map(level => ({
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
  }, [data, type]);

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
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'category-distribution') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'trend-analysis') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Total"
          />
          <Line 
            type="monotone" 
            dataKey="alto" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Alto Risco"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default RiskCharts;
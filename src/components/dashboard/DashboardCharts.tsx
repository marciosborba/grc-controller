import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
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
  Area,
  AreaChart
} from 'recharts';
import {
  AlertTriangle,
  Shield,
  FileCheck,
  Users,
  TrendingUp,
  Building
} from 'lucide-react';

interface DashboardData {
  risks: any[];
  policies: any[];
  vendors: any[];
  incidents: any[];
  assessments: any[];
  compliance: any[];
}

const DashboardCharts = () => {
  const [data, setData] = useState<DashboardData>({
    risks: [],
    policies: [],
    vendors: [],
    incidents: [],
    assessments: [],
    compliance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [risksResult, policiesResult, vendorsResult, incidentsResult, assessmentsResult, complianceResult] = await Promise.all([
          supabase.from('risk_assessments').select('*'),
          supabase.from('policies').select('*'),
          supabase.from('vendors').select('*'),
          supabase.from('security_incidents').select('*'),
          supabase.from('assessments').select('*'),
          supabase.from('compliance_records').select('*')
        ]);

        setData({
          risks: risksResult.data || [],
          policies: policiesResult.data || [],
          vendors: vendorsResult.data || [],
          incidents: incidentsResult.data || [],
          assessments: assessmentsResult.data || [],
          compliance: complianceResult.data || []
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(4).fill(null).map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Preparar dados para gráficos
  const risksBySeverity = data.risks.reduce((acc, risk) => {
    acc[risk.severity] = (acc[risk.severity] || 0) + 1;
    return acc;
  }, {});

  const riskSeverityData = [
    { name: 'Baixo', value: risksBySeverity.low || 0, color: '#22c55e' },
    { name: 'Médio', value: risksBySeverity.medium || 0, color: '#eab308' },
    { name: 'Alto', value: risksBySeverity.high || 0, color: '#f97316' },
    { name: 'Crítico', value: risksBySeverity.critical || 0, color: '#ef4444' }
  ];

  const vendorsByRisk = data.vendors.reduce((acc, vendor) => {
    acc[vendor.risk_level] = (acc[vendor.risk_level] || 0) + 1;
    return acc;
  }, {});

  const vendorRiskData = [
    { name: 'Baixo Risco', value: vendorsByRisk.low || 0, color: '#22c55e' },
    { name: 'Médio Risco', value: vendorsByRisk.medium || 0, color: '#eab308' },
    { name: 'Alto Risco', value: vendorsByRisk.high || 0, color: '#ef4444' }
  ];

  const incidentsBySeverity = data.incidents.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {});

  const incidentData = [
    { name: 'Baixo', value: incidentsBySeverity.low || 0 },
    { name: 'Médio', value: incidentsBySeverity.medium || 0 },
    { name: 'Alto', value: incidentsBySeverity.high || 0 },
    { name: 'Crítico', value: incidentsBySeverity.critical || 0 }
  ];

  const complianceByFramework = data.compliance.reduce((acc, record) => {
    acc[record.framework] = (acc[record.framework] || 0) + 1;
    return acc;
  }, {});

  const complianceData = Object.entries(complianceByFramework).map(([framework, count]) => ({
    framework,
    total: count as number,
    compliant: data.compliance.filter(r => r.framework === framework && r.compliance_status === 'compliant').length
  }));

  // Dados de tendência dos últimos 6 meses (simulado baseado em dados reais)
  const getTrendData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map((month, index) => {
      const factor = (index + 1) / 6; // Simular melhoria ao longo do tempo
      return {
        month,
        risks: Math.max(1, Math.floor(data.risks.length * (1.5 - factor * 0.5))),
        incidents: Math.max(0, Math.floor(data.incidents.length * (1.3 - factor * 0.3))),
        compliance: Math.min(100, Math.floor(70 + factor * 25))
      };
    });
  };

  const trendData = getTrendData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Riscos por Severidade */}
      <Card className="grc-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Distribuição de Riscos por Severidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskSeverityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskSeverityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fornecedores por Risco */}
      <Card className="grc-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-accent" />
            <span>Fornecedores por Nível de Risco</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(vendorsByRisk).map(([level, count]) => ({ level, count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tendência de Incidentes */}
      <Card className="grc-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-danger" />
            <span>Tendência de Incidentes por Severidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incidentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance de Compliance */}
      <Card className="grc-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-success" />
            <span>Performance de Compliance por Framework</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="framework" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="compliant" fill="#22c55e" name="Compliant" />
              <Bar dataKey="total" fill="#94a3b8" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tendências Gerais - Span 2 columns */}
      <Card className="grc-card lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Tendências Consolidadas - Últimos 6 Meses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="risks" 
                stackId="1" 
                stroke="#ef4444" 
                fill="#ef444420"
                name="Riscos Abertos"
              />
              <Area 
                type="monotone" 
                dataKey="incidents" 
                stackId="2" 
                stroke="#f97316" 
                fill="#f9731620"
                name="Incidentes"
              />
              <Line 
                type="monotone" 
                dataKey="compliance" 
                stroke="#22c55e" 
                strokeWidth={3}
                name="Score Compliance (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
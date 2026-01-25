import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Shield,
    AlertTriangle,
    Clock,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Zap,
    Triangle,
    Circle,
    Info,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MetricsTabProps {
    loading: boolean;
    displayMetrics: any;
    metrics: any;
    recentVulnerabilities: any[];
}

export function MetricsTab({ loading, displayMetrics, metrics, recentVulnerabilities }: MetricsTabProps) {
    const navigate = useNavigate();

    const getSeverityBadgeColor = (severity: string) => {
        const colors = {
            Critical: 'bg-red-600 text-white border-red-700 font-semibold',
            High: 'bg-orange-600 text-white border-orange-700 font-semibold',
            Medium: 'bg-yellow-600 text-white border-yellow-700 font-semibold',
            Low: 'bg-blue-600 text-white border-blue-700 font-semibold',
            Info: 'bg-gray-600 text-white border-gray-700 font-semibold',
        };
        return colors[severity as keyof typeof colors] || colors.Info;
    };

    const getStatusBadgeColor = (status: string) => {
        const colors = {
            Open: 'bg-red-600 text-white border-red-700 font-semibold',
            In_Progress: 'bg-yellow-600 text-white border-yellow-700 font-semibold',
            Testing: 'bg-blue-600 text-white border-blue-700 font-semibold',
            Resolved: 'bg-green-600 text-white border-green-700 font-semibold',
            Accepted: 'bg-gray-600 text-white border-gray-700 font-semibold',
            False_Positive: 'bg-purple-600 text-white border-purple-700 font-semibold',
            Duplicate: 'bg-indigo-600 text-white border-indigo-700 font-semibold',
        };
        return colors[status as keyof typeof colors] || colors.Open;
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total de Vulnerabilidades */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total de Vulnerabilidades</p>
                                <p className="text-2xl font-bold">
                                    {loading ? '...' : displayMetrics.total_vulnerabilities}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                                    {metrics?.total_vulnerabilities ? 'Dados atualizados' : 'Nenhuma vulnerabilidade'}
                                </p>
                            </div>
                            <Shield className="h-10 w-10 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Críticas Abertas */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Críticas Abertas</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {loading ? '...' : displayMetrics.critical_open}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />
                                    {metrics?.critical_open ? 'Requer atenção imediata' : 'Nenhuma crítica aberta'}
                                </p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* SLA Compliance */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loading ? '...' : displayMetrics.sla_compliance}%
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                    {(metrics?.sla_compliance || 100) >= 90 ? 'Dentro do prazo' : 'Atenção necessária'}
                                </p>
                            </div>
                            <Clock className="h-10 w-10 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Tempo Médio Resolução */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tempo Médio Resolução</p>
                                <p className="text-2xl font-bold">
                                    {loading ? '...' : displayMetrics.avg_resolution_time}d
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
                                    {metrics?.avg_resolution_time ? 'Baseado em dados reais' : 'Sem dados de resolução'}
                                </p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Severity Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['High', 'Medium', 'Low', 'Info'].map((severity) => {
                    const count = displayMetrics.by_severity[severity as keyof typeof displayMetrics.by_severity];

                    let icon, color, title, desc;
                    switch (severity) {
                        case 'High':
                            icon = <Zap className="h-10 w-10 text-orange-600" />;
                            color = 'text-orange-600';
                            title = 'Vuln. Altas';
                            desc = 'Prioridade alta';
                            break;
                        case 'Medium':
                            icon = <Triangle className="h-10 w-10 text-yellow-600" />;
                            color = 'text-yellow-600';
                            title = 'Vuln. Médias';
                            desc = 'Prioridade média';
                            break;
                        case 'Low':
                            icon = <Circle className="h-10 w-10 text-blue-600" />;
                            color = 'text-blue-600';
                            title = 'Vuln. Baixas';
                            desc = 'Prioridade baixa';
                            break;
                        default:
                            icon = <Info className="h-10 w-10 text-gray-600" />;
                            color = 'text-gray-600';
                            title = 'Vuln. Info';
                            desc = 'Informativas';
                    }

                    return (
                        <Card key={severity}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                                        <p className={`text-2xl font-bold ${color}`}>
                                            {loading ? '...' : count}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                                            {React.cloneElement(icon as any, { className: `h-3 w-3 mr-1 ${color}` })}
                                            {count > 0 ? desc : `Nenhuma ${title.toLowerCase()}`}
                                        </p>
                                    </div>
                                    {icon}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Severity Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Severidade</CardTitle>
                        <CardDescription>
                            Vulnerabilidades categorizadas por nível de criticidade
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : (
                                ['Critical', 'High', 'Medium', 'Low', 'Info'].map((severity) => {
                                    const count = displayMetrics.by_severity[severity as keyof typeof displayMetrics.by_severity] || 0;
                                    const total = displayMetrics.total_vulnerabilities || 0;
                                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                                    const severityLabels = {
                                        Critical: 'Crítica',
                                        High: 'Alta',
                                        Medium: 'Média',
                                        Low: 'Baixa',
                                        Info: 'Info'
                                    };

                                    return (
                                        <div key={severity} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge className={getSeverityBadgeColor(severity)}>
                                                    {severityLabels[severity as keyof typeof severityLabels]}
                                                </Badge>
                                                <span className="text-sm font-medium">{count}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress value={percentage} className="w-20 h-2" />
                                                <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status das Vulnerabilidades</CardTitle>
                        <CardDescription>
                            Estado atual do processo de remediação
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : (
                                ['Open', 'In_Progress', 'Testing', 'Resolved', 'Accepted', 'False_Positive', 'Duplicate'].map((status) => {
                                    const count = displayMetrics.by_status[status as keyof typeof displayMetrics.by_status] || 0;
                                    if (count === 0) return null;

                                    const total = displayMetrics.total_vulnerabilities || 0;
                                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                                    const statusLabels = {
                                        Open: 'Aberta',
                                        In_Progress: 'Em Progresso',
                                        Testing: 'Em Teste',
                                        Resolved: 'Resolvida',
                                        Accepted: 'Aceita',
                                        False_Positive: 'Falso Positivo',
                                        Duplicate: 'Duplicada'
                                    };

                                    return (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge className={getStatusBadgeColor(status)}>
                                                    {statusLabels[status as keyof typeof statusLabels]}
                                                </Badge>
                                                <span className="text-sm font-medium">{count}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress value={percentage} className="w-20 h-2" />
                                                <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Vulnerabilities */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Vulnerabilidades Recentes</CardTitle>
                            <CardDescription>
                                Últimas vulnerabilidades identificadas
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/vulnerabilities/management')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Todas
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-sm text-muted-foreground mt-2">Carregando vulnerabilidades...</p>
                            </div>
                        ) : recentVulnerabilities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma vulnerabilidade encontrada</p>
                                <p className="text-sm mt-2">As vulnerabilidades aparecerão aqui quando forem identificadas</p>
                            </div>
                        ) : (
                            recentVulnerabilities.map((vulnerability) => {
                                const severityLabels = {
                                    Critical: 'Crítica',
                                    High: 'Alta',
                                    Medium: 'Média',
                                    Low: 'Baixa',
                                    Info: 'Info'
                                };

                                const statusLabels = {
                                    Open: 'Aberta',
                                    In_Progress: 'Em Progresso',
                                    Testing: 'Em Teste',
                                    Resolved: 'Resolvida',
                                    Accepted: 'Aceita',
                                    False_Positive: 'Falso Positivo',
                                    Duplicate: 'Duplicada'
                                };

                                return (
                                    <div key={vulnerability.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Badge className={getSeverityBadgeColor(vulnerability.severity)}>
                                                {severityLabels[vulnerability.severity as keyof typeof severityLabels] || vulnerability.severity}
                                            </Badge>
                                            <div>
                                                <h4 className="font-medium">{vulnerability.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {vulnerability.asset_name} • {vulnerability.source_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getStatusBadgeColor(vulnerability.status)}>
                                                {statusLabels[vulnerability.status as keyof typeof statusLabels] || vulnerability.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(vulnerability.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}

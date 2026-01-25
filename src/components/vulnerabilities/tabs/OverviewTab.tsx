import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shield,
    Layers,
    Server,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Activity,
    List,
    Upload,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

interface OverviewTabProps {
    vulnMetrics: any;
    loading: boolean;
}

export function OverviewTab({ vulnMetrics, loading }: OverviewTabProps) {
    const navigate = useNavigate();
    const tenantId = useCurrentTenantId();
    const [appsCount, setAppsCount] = useState(0);
    const [assetsCount, setAssetsCount] = useState(0);
    const [appsCriticalCount, setAppsCriticalCount] = useState(0);
    const [assetsCriticalCount, setAssetsCriticalCount] = useState(0);
    const [countsLoading, setCountsLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!tenantId) return;
            setCountsLoading(true);
            try {
                // Fetch All Sistemas
                const { data: sistemas, error } = await supabase
                    .from('sistemas')
                    .select('tipo')
                    .eq('tenant_id', tenantId);

                if (error) throw error;

                // Categorize
                // Assuming Apps are commonly [Web Application, Mobile App, API]
                // Assuming Assets are [Server, Workstation, Network Device]
                // If tipo is null, we can default or count as Assets for now. 
                // Based on Applications.tsx and CMDB.tsx, they map ALL.
                // So for "High Level" overview, we might just want "Inventory Count" (Total)
                // Or try to split.

                const appTypes = ['Web Application', 'Mobile App', 'API', 'Database', 'Cloud Service', 'Desktop App'];

                // Categorize Systems
                const apps = sistemas?.filter(s => appTypes.includes(s.tipo || '')) || [];
                const assets = sistemas?.filter(s => !appTypes.includes(s.tipo || '')) || [];

                setAppsCount(apps.length);
                setAssetsCount(assets.length);

                // Fetch Critical Vulnerabilities to find affected assets
                const { data: criticalVulns } = await supabase
                    .from('vulnerabilities')
                    .select('asset_name, app_id')
                    .eq('severity', 'Critical')
                    .eq('tenant_id', tenantId);

                // Extract unique affected names/ids
                const affectedNames = new Set(criticalVulns?.map(v => v.asset_name) || []);
                const affectedIds = new Set(criticalVulns?.map(v => v.app_id).filter(Boolean) || []);

                // Count how many apps are affected
                // Match by ID (if available) or Name (fallback)
                const criticalAppsCount = apps.filter(app =>
                    (app.id && affectedIds.has(app.id)) ||
                    (app.nome && affectedNames.has(app.nome))
                ).length;

                // For assets (infra), usually mapped by asset_name
                const criticalAssetsCount = assets.filter(asset =>
                    (asset.nome && affectedNames.has(asset.nome))
                ).length;

                // Store these for the UI (using temporary state augmentation or new state)
                // Since I can't easily add new state without changing the whole file structure defined in `useState`, 
                // I will update the state variables to hold objects OR add new state variables.
                // It is safer to add new state variables.
                setAppsCriticalCount(criticalAppsCount);
                setAssetsCriticalCount(criticalAssetsCount);

            } catch (e) {
                console.error("Error fetching overview counts", e);
            } finally {
                setCountsLoading(false);
            }
        };

        fetchCounts();
    }, [tenantId]);

    return (
        <div className="space-y-6">
            {/* Mixed High-Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Vulnerability Health (From props) */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total de Vulnerabilidades</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {loading ? '...' : vulnMetrics?.total_vulnerabilities || 0}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Shield className="h-3 w-3 mr-1 text-blue-500" />
                                    Monitoramento ativo
                                </p>
                            </div>
                            <Shield className="h-10 w-10 text-blue-100 dark:text-blue-900/40" />
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Risks (From props) */}
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Risco Crítico</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {loading ? '...' : vulnMetrics?.critical_open || 0}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                                    Vulnerabilidades Críticas
                                </p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-red-100 dark:text-red-900/40" />
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Count (From local state) */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Aplicações</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {countsLoading ? '...' : appsCount}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Layers className="h-3 w-3 mr-1 text-purple-500" />
                                    {countsLoading ? '...' : `${appsCriticalCount} com risco crítico`}
                                </p>
                            </div>
                            <Layers className="h-10 w-10 text-purple-100 dark:text-purple-900/40" />
                        </div>
                    </CardContent>
                </Card>

                {/* CMDB Assets Count (From local state) */}
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Infraestrutura</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {countsLoading ? '...' : assetsCount}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Server className="h-3 w-3 mr-1 text-green-500" />
                                    {countsLoading ? '...' : `${assetsCriticalCount} com risco crítico`}
                                </p>
                            </div>
                            <Server className="h-10 w-10 text-green-100 dark:text-green-900/40" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Cards */}
            <h3 className="text-lg font-semibold mt-8 mb-4">Gerenciamento de Módulos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-red-500"
                    onClick={() => navigate('/vulnerabilities/management')}>
                    <CardContent className="p-6 text-center">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <List className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Vulnerabilidades</h3>
                        <p className="text-sm text-muted-foreground">
                            Lista detalhada, classificação de risco e gestão de correção de falhas de segurança.
                        </p>
                        <Button variant="ghost" className="mt-4 w-full text-red-600 hover:text-red-700 hover:bg-red-50">Acessar Painel</Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-purple-500"
                    onClick={() => navigate('/vulnerabilities/applications')}>
                    <CardContent className="p-6 text-center">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Layers className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Aplicações</h3>
                        <p className="text-sm text-muted-foreground">
                            Inventário de softwares, APIs e sistemas com seus respectivos riscos.
                        </p>
                        <Button variant="ghost" className="mt-4 w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50">Acessar Inventário</Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-green-500"
                    onClick={() => navigate('/vulnerabilities/cmdb')}>
                    <CardContent className="p-6 text-center">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Server className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">CMDB</h3>
                        <p className="text-sm text-muted-foreground">
                            Gestão de configuração de ativos, servidores e dispositivos de rede.
                        </p>
                        <Button variant="ghost" className="mt-4 w-full text-green-600 hover:text-green-700 hover:bg-green-50">Acessar Infraestrutura</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" /> Importação de Dados
                        </CardTitle>
                        <CardDescription>Traga dados de scanners externos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/vulnerabilities/import')}>
                            Importar Scan
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" /> Configurações
                        </CardTitle>
                        <CardDescription>Gerencie regras de severidade e SLAs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/vulnerabilities/classification')}>
                            Configurar Regras
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

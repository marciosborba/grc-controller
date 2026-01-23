
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useTenantManagement } from '@/hooks/useTenantManagement';
import { Box, Code2, ShieldAlert, FileKey2 } from 'lucide-react';

interface TenantModulesTabProps {
    tenantId: string;
}

export const TenantModulesTab: React.FC<TenantModulesTabProps> = ({ tenantId }) => {
    const { getSystemModules, getTenantModules, toggleTenantModule } = useTenantManagement();

    const [modules, setModules] = useState<any[]>([]);
    const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [tenantId]);

    const loadData = async () => {
        try {
            const [allModules, tenantMods] = await Promise.all([
                getSystemModules(),
                getTenantModules(tenantId)
            ]);

            setModules(allModules);

            const enabledMap: Record<string, boolean> = {};
            tenantMods.forEach((tm: any) => {
                enabledMap[tm.module_key] = tm.is_enabled;
            });
            setEnabledModules(enabledMap);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (moduleKey: string, checked: boolean) => {
        // Optimistic update
        setEnabledModules(prev => ({ ...prev, [moduleKey]: checked }));

        try {
            await toggleTenantModule({
                tenantId,
                moduleKey,
                isEnabled: checked
            });
        } catch (e) {
            // Revert on error
            setEnabledModules(prev => ({ ...prev, [moduleKey]: !checked }));
        }
    };

    if (loading) return <div>Carregando módulos...</div>;

    const groupedModules = modules.reduce((acc: any, mod: any) => {
        const cat = mod.category || 'Módulos Gerais';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(mod);
        return acc;
    }, {});

    const getCategoryIcon = (cat: string) => {
        if (cat === 'artificial_intelligence') return <Code2 className="h-5 w-5 text-purple-500" />;
        if (cat === 'security') return <ShieldAlert className="h-5 w-5 text-red-500" />;
        if (cat === 'privacy') return <FileKey2 className="h-5 w-5 text-blue-500" />;
        if (cat === 'strategic') return <Code2 className="h-5 w-5 text-green-500" />; // Or another icon
        if (cat === 'reporting') return <Box className="h-5 w-5 text-orange-500" />;
        return <Box className="h-5 w-5 text-gray-500" />;
    }

    const formatCategory = (cat: string) => {
        const map: Record<string, string> = {
            'artificial_intelligence': 'Inteligência Artificial',
            'security': 'Segurança Cibernética',
            'privacy': 'Privacidade & Dados',
            'grc': 'Governança & Riscos',
            'ethics': 'Ética & Compliance',
            'strategic': 'Estratégia & Planejamento',
            'reporting': 'Relatórios & Analytics'
        };
        return map[cat] || cat;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card>
                <CardHeader>
                    <CardTitle>Módulos Ativos</CardTitle>
                    <CardDescription>Gerencie quais funcionalidades estão disponíveis para este tenant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {Object.keys(groupedModules).map(category => (
                            <div key={category}>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                                    {getCategoryIcon(category)}
                                    {formatCategory(category)}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groupedModules[category].map((mod: any) => (
                                        <div key={mod.key} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                            <div className="space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    {mod.name}
                                                    {enabledModules[mod.key] && <Badge variant="secondary" className="text-[10px] h-5">Ativo</Badge>}
                                                </div>
                                                <p className="text-xs text-muted-foreground pr-8">{mod.description}</p>
                                            </div>
                                            <Switch
                                                checked={enabledModules[mod.key] || false}
                                                onCheckedChange={(checked) => handleToggle(mod.key, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

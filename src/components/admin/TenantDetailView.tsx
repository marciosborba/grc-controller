
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, LayoutDashboard, Boxes, Users2, BrainCircuit, ShieldAlert, Settings } from 'lucide-react';
import { TenantOverviewTab } from './tabs/TenantOverviewTab';
import { TenantModulesTab } from './tabs/TenantModulesTab';
import { TenantUsersTab } from './tabs/TenantUsersTab';

interface TenantDetailViewProps {
    tenantId: string;
    tenantName: string;
    onBack: () => void;
}

const TenantDetailView: React.FC<TenantDetailViewProps> = ({ tenantId, tenantName, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{tenantName}</h1>
                    <p className="text-sm text-muted-foreground">Administração do Tenant</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto w-full">
                    <TabsTrigger value="overview" className="flex gap-2">
                        <LayoutDashboard className="h-4 w-4" /> <span className="hidden md:inline">Visão Geral</span>
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="flex gap-2">
                        <Boxes className="h-4 w-4" /> <span className="hidden md:inline">Módulos</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex gap-2">
                        <Users2 className="h-4 w-4" /> <span className="hidden md:inline">Usuários</span>
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex gap-2" disabled>
                        <BrainCircuit className="h-4 w-4" /> <span className="hidden md:inline">IA & Automação</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex gap-2" disabled>
                        <ShieldAlert className="h-4 w-4" /> <span className="hidden md:inline">Segurança</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex gap-2" disabled>
                        <Settings className="h-4 w-4" /> <span className="hidden md:inline">Configurações</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <TenantOverviewTab tenantId={tenantId} />
                </TabsContent>

                <TabsContent value="modules">
                    <TenantModulesTab tenantId={tenantId} />
                </TabsContent>

                <TabsContent value="users">
                    <TenantUsersTab tenantId={tenantId} />
                </TabsContent>

                {/* Placeholders for future implementation */}
                <TabsContent value="ai"><div className="p-10 text-center text-muted-foreground">Em breve: Configurações de IA Global</div></TabsContent>
                <TabsContent value="security"><div className="p-10 text-center text-muted-foreground">Em breve: Chaves de Criptografia e Sessão</div></TabsContent>
                <TabsContent value="settings"><div className="p-10 text-center text-muted-foreground">Em breve: Configurações Avançadas</div></TabsContent>
            </Tabs>
        </div>
    );
};

export default TenantDetailView;

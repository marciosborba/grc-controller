import React, { useState } from 'react';
import { Shield, Users, Key, Network } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Importando as sub-seções que serão englobadas pelo IAM
import { UserManagementSection } from './UserManagementSection';
import { GroupManagementSection } from './GroupManagementSection';
import { VendorUsersSection } from './VendorUsersSection';
// O AccessPermissionsTab originalmente estava em 'tabs', subindo um nível para acessá-lo
import { AccessPermissionsTab, RolesTab } from '../tabs/AccessPermissionsTab';

interface IdentityAccessManagementSectionProps {
    tenantId: string;
    onMetricsUpdate?: (metrics: any) => void;
}

export const IdentityAccessManagementSection: React.FC<IdentityAccessManagementSectionProps> = ({
    tenantId,
    onMetricsUpdate
}) => {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold tracking-tight">Acessos e Identidade (IAM)</h2>
                <p className="text-muted-foreground text-sm">
                    Gerenciamento centralizado de usuários, grupos, perfis e controle de acesso (RBAC).
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-border/50 pb-px mb-4">
                    <TabsList className="h-10 items-end justify-start rounded-none border-none bg-transparent p-0 w-full overflow-x-auto flex-nowrap gap-4">
                        <TabsTrigger
                            value="users"
                            className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent hover:text-foreground"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Usuários Internos
                        </TabsTrigger>

                        <TabsTrigger
                            value="vendors"
                            className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent hover:text-foreground"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Usuários Externos
                        </TabsTrigger>

                        <TabsTrigger
                            value="groups"
                            className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent hover:text-foreground"
                        >
                            <Network className="w-4 h-4 mr-2" />
                            Grupos
                        </TabsTrigger>

                        <TabsTrigger
                            value="permissions"
                            className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent hover:text-foreground"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Permissões (RBAC)
                        </TabsTrigger>

                    </TabsList>
                </div>

                <TabsContent value="users" className="mt-0 border-0 p-0 focus-visible:outline-none">
                    <UserManagementSection
                        tenantId={tenantId}
                        onMetricsUpdate={onMetricsUpdate}
                    />
                </TabsContent>

                <TabsContent value="vendors" className="mt-0 border-0 p-0 focus-visible:outline-none">
                    <VendorUsersSection tenantId={tenantId} />
                </TabsContent>

                <TabsContent value="groups" className="mt-0 border-0 p-0 focus-visible:outline-none">
                    <GroupManagementSection tenantId={tenantId} />
                </TabsContent>

                <TabsContent value="permissions" className="mt-0 border-0 p-0 focus-visible:outline-none">
                    <div className="bg-card border rounded-lg p-1">
                        <AccessPermissionsTab />
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
};

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert } from 'lucide-react';
import PolicyAuditorDashboard from './auditor/PolicyAuditorDashboard';

export default function InternalControlsManagement() {
    return (
        <div className="space-y-6">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-primary" />
                        <div className="flex flex-col">
                            <CardTitle>Controles Internos & Auditoria de Políticas</CardTitle>
                            <CardDescription>
                                Gestão inteligente de controles internos e análise de aderência a frameworks (ISO, SOX, etc.)
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <PolicyAuditorDashboard />
                </CardContent>
            </Card>
        </div>
    );
}

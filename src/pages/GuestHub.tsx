import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Store, ShieldAlert, AlertTriangle, LogOut } from 'lucide-react';

export const GuestHub = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Collect the portals this user has access to
    const accessiblePortals = [];

    if (user?.isVendorOnly || user?.roles?.includes('vendor')) {
        accessiblePortals.push({
            id: 'vendor',
            title: 'Portal do Fornecedor',
            description: 'Acesse questionários e avaliações de fornecedor.',
            icon: <Store className="h-8 w-8 text-blue-500" />,
            path: '/vendor-portal',
            color: 'bg-blue-50 dark:bg-blue-900/20'
        });
    }

    if (user?.enabledModules?.includes('risk_portal') || user?.permissions?.includes('risk.read')) {
        accessiblePortals.push({
            id: 'risk',
            title: 'Portal de Riscos',
            description: 'Visualize e responda a riscos atribuídos a você.',
            icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
            path: '/risk-portal',
            color: 'bg-amber-50 dark:bg-amber-900/20'
        });
    }

    if (user?.enabledModules?.includes('vulnerability_portal') || user?.permissions?.includes('vulnerability.read') || user?.permissions?.includes('security.read')) {
        accessiblePortals.push({
            id: 'vulnerability',
            title: 'Portal de Vulnerabilidades',
            description: 'Gerencie vulnerabilidades e planos de remediação.',
            icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
            path: '/vulnerability-portal',
            color: 'bg-red-50 dark:bg-red-900/20'
        });
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Bem-vindo(a), {user?.name}</h1>
                    <p className="text-muted-foreground">
                        Você tem acesso a múltiplos portais. Escolha qual deseja acessar agora.
                    </p>
                </div>

                {accessiblePortals.length === 0 ? (
                    <Card className="text-center p-8">
                        <CardHeader>
                            <CardTitle>Nenhum Acesso Encontrado</CardTitle>
                            <CardDescription>
                                Você não possui acessos vinculados à sua conta no momento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleLogout} variant="outline">
                                Voltar para o Login
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accessiblePortals.map((portal) => (
                            <Card
                                key={portal.id}
                                className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/50 group ${portal.color}`}
                                onClick={() => navigate(portal.path)}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto bg-background p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                        {portal.icon}
                                    </div>
                                    <CardTitle className="mt-4">{portal.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <CardDescription className="text-sm">
                                        {portal.description}
                                    </CardDescription>
                                    <Button className="w-full mt-6" variant="default">
                                        Acessar Portal
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex justify-center pt-8">
                    <Button variant="ghost" className="text-muted-foreground" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Sair
                    </Button>
                </div>
            </div>
        </div>
    );
};

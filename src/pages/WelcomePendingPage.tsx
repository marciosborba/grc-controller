import React from 'react';
import { useAuth } from '@/components/OptimizedAuthProvider';

const WelcomePendingPage: React.FC = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'Usuário';

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="max-w-lg w-full text-center space-y-6">
                {/* Avatar / Icon */}
                <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl">👋</span>
                </div>

                {/* Greeting */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Olá {firstName}, seja bem-vindo!
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        Sua organização está revisando o seu acesso e em breve tudo estará pronto.
                    </p>
                </div>

                {/* Info card */}
                <div className="rounded-xl border bg-muted/30 p-5 text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-blue-600 text-sm">ℹ️</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium">O que acontece agora?</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                O administrador da sua organização irá configurar as permissões e módulos
                                que você terá acesso. Você receberá uma notificação quando tudo estiver pronto.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email info */}
                <p className="text-xs text-muted-foreground">
                    Conectado como <span className="font-medium text-foreground">{user?.email}</span>
                </p>
            </div>
        </div>
    );
};

export default WelcomePendingPage;

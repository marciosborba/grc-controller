import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createImpersonationClient } from '@/integrations/supabase/client';

interface ImpersonationInfo {
    isImpersonating: boolean;
    impersonatedBy: string;
    impersonatedUser: string;
}

/**
 * ImpersonationBanner
 *
 * Renderizado em TODAS as rotas protegidas.
 *
 * Na aba de impersonação (?impersonated=true):
 *   - Cria um cliente Supabase isolado com sessionStorage
 *   - Processa o #access_token do magic link SOMENTE nesse cliente
 *   - O localStorage (sessão do admin) não é tocado
 *
 * Na aba do admin:
 *   - O componente não renderiza nada (não detecta impersonação)
 */
export const ImpersonationBanner: React.FC = () => {
    const [info, setInfo] = useState<ImpersonationInfo>({
        isImpersonating: false,
        impersonatedBy: '',
        impersonatedUser: ''
    });

    // Mantém referência ao cliente de impersonação para sign-out
    const impersonationClientRef = useRef<ReturnType<typeof createImpersonationClient> | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isImpersonated = params.get('impersonated') === 'true';

        if (!isImpersonated) {
            // Verificar sessionStorage para persistir durante navegação interna
            const active = sessionStorage.getItem('impersonation_active');
            if (active === 'true') {
                setInfo({
                    isImpersonating: true,
                    impersonatedBy: sessionStorage.getItem('impersonation_by') || '',
                    impersonatedUser: sessionStorage.getItem('impersonation_user') || ''
                });
                // Garantir que o cliente de impersonação existe para o sign-out
                if (!impersonationClientRef.current) {
                    impersonationClientRef.current = createImpersonationClient();
                }
            }
            return;
        }

        const impersonatedBy = params.get('impersonated_by') || '';
        const impersonatedUser = params.get('impersonated_user') || '';

        // ---- SESSÃO ISOLADA ----
        // Cria um cliente específico com sessionStorage (não toca localStorage do admin)
        const impersonationClient = createImpersonationClient();
        impersonationClientRef.current = impersonationClient;

        // Deixa o cliente processar o #access_token da URL automaticamente
        // (detectSessionInUrl: true no createImpersonationClient)
        // Aguardamos o evento SIGNED_IN para confirmar que a sessão foi estabelecida
        const { data: { subscription } } = impersonationClient.auth.onAuthStateChange((event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
                console.log('[Impersonation] Sessão isolada estabelecida para:', session.user?.email);
            }
        });

        // Salvar estado no sessionStorage para sobreviver a navegações internas
        sessionStorage.setItem('impersonation_active', 'true');
        sessionStorage.setItem('impersonation_by', impersonatedBy);
        sessionStorage.setItem('impersonation_user', impersonatedUser);

        setInfo({ isImpersonating: true, impersonatedBy, impersonatedUser });

        // Limpar params da URL sem recarregar (UX mais limpa)
        window.history.replaceState({}, '', window.location.pathname);

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleEndImpersonation = async () => {
        // Sign-out do cliente isolado (não afeta o localStorage do admin)
        if (impersonationClientRef.current) {
            await impersonationClientRef.current.auth.signOut();
        }
        sessionStorage.removeItem('impersonation_active');
        sessionStorage.removeItem('impersonation_by');
        sessionStorage.removeItem('impersonation_user');
        window.close(); // Fecha a aba de impersonação
    };

    if (!info.isImpersonating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                    🎭 <strong>Modo Impersonação Ativo</strong>
                    {info.impersonatedUser && (
                        <span className="ml-1">
                            — Você está visualizando como <strong>{info.impersonatedUser}</strong>
                        </span>
                    )}
                    {info.impersonatedBy && (
                        <span className="ml-1 opacity-80">
                            (sessão iniciada por {info.impersonatedBy})
                        </span>
                    )}
                </span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleEndImpersonation}
                className="text-white hover:bg-orange-600 hover:text-white border border-white/30 ml-4"
            >
                <LogOut className="h-4 w-4 mr-1" />
                Encerrar Impersonação
            </Button>
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, KeyRound, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContextOptimized';

export const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [hashError, setHashError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    // Store the actual session captured from the invite/recovery link so we don't lose it
    const capturedSessionRef = useRef<any>(null);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { refreshUserData } = useAuth();

    const [isGuest, setIsGuest] = useState(false);

    // Removed isVendorPortal and loginRoute since login is now unified
    const loginRoute = '/login';

    useEffect(() => {
        // Check for error in the URL hash (e.g. expired link)
        const urlHashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = urlHashParams.get('error_description');

        if (errorDescription) {
            setHashError(decodeURIComponent(errorDescription));
            toast({
                title: "Link Inválido",
                description: decodeURIComponent(errorDescription),
                variant: "destructive",
            });
        }

        // We need to capture the session from the invite/recovery link immediately
        // because AuthContextOptimized can sign the user out during its profile loading
        // if no profile is found yet (new invited user).
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                    if (session) {
                        console.log(`🔗 [RESET] Session captured from ${event} event.`);
                        capturedSessionRef.current = session;
                        setSessionReady(true);
                        setHashError(null);

                        const role = session.user?.user_metadata?.system_role;
                        const isVendor = session.user?.user_metadata?.is_vendor;
                        if (event === 'PASSWORD_RECOVERY' || role === 'guest' || isVendor) {
                            setIsGuest(true);
                        }
                    }
                }
            }
        );

        // Also check if there's already an active session (page refresh scenario)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && !capturedSessionRef.current) {
                console.log('🔗 [RESET] Existing session found on init.');
                capturedSessionRef.current = session;
                setSessionReady(true);
                const role = session.user?.user_metadata?.system_role;
                const isVendor = session.user?.user_metadata?.is_vendor;
                if (role === 'guest' || isVendor) setIsGuest(true);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [toast]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "As senhas não coincidem",
                description: "Por favor, digite a mesma senha nos dois campos.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Senha muito curta",
                description: "Sua nova senha deve ter pelo menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            let { data: { session } } = await supabase.auth.getSession();
            console.log('🔄 [AUTH] Estado da sessão antes de redefinir:', { hasSession: !!session });

            // If session was lost (common with invite links that get consumed by AuthContext),
            // try to restore it from the captured session ref
            if (!session && capturedSessionRef.current) {
                console.warn('⚠️ [AUTH] Sessão ausente, tentando restaurar via sessão capturada do convite...');
                const { data: restored, error: restoreError } = await supabase.auth.setSession({
                    access_token: capturedSessionRef.current.access_token,
                    refresh_token: capturedSessionRef.current.refresh_token,
                });
                if (!restoreError && restored.session) {
                    session = restored.session;
                    console.log('✅ [AUTH] Sessão restaurada com sucesso.');
                } else {
                    console.error('❌ [AUTH] Não foi possível restaurar a sessão:', restoreError);
                }
            }

            if (!session) {
                throw new Error('Sua sessão expirou. Por favor, solicite um novo link de acesso.');
            }

            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            // ✅ Senha definida com sucesso — mostrar tela de sucesso IMEDIATAMENTE.
            // O restante é limpeza/sincronização e não deve bloquear o usuário.
            setSuccess(true);
            setLoading(false);

            // Limpeza em background: refreshSession pode falhar em fluxo de convite (token rotacionado),
            // mas isso não invalida a senha já cadastrada.
            const runPostSetupCleanup = async () => {
                try {
                    await supabase.auth.refreshSession();
                } catch (refreshErr: any) {
                    console.warn('⚠️ [AUTH] refreshSession falhou (não-fatal, senha já definida):', refreshErr.message);
                }

                let targetUrl = '/';
                try {
                    const { data: { user: updatedUser } } = await supabase.auth.getUser();
                    if (updatedUser) {
                        console.log(`🔄 [AUTH] Ativando perfil: ${updatedUser.id}`);
                        const { data: updateData } = await supabase
                            .from('profiles')
                            .update({ is_active: true, must_change_password: false, last_login_at: new Date().toISOString() })
                            .eq('user_id', updatedUser.id)
                            .select();

                        if (!updateData || updateData.length === 0) {
                            await supabase
                                .from('profiles')
                                .update({ is_active: true, must_change_password: false })
                                .eq('email', updatedUser.email);
                        }

                        if (isGuest || updatedUser.user_metadata?.is_vendor) {
                            await supabase.from('vendor_users').update({ is_active: true }).eq('email', updatedUser.email);
                            await supabase.from('vendor_portal_users').update({ force_password_change: false }).eq('email', updatedUser.email);
                        }

                        // Risk stakeholder → always go to risk portal after first access
                        if (updatedUser.user_metadata?.invited_as === 'risk_stakeholder') {
                            targetUrl = '/risk-portal';
                        } else {
                            const userData = await refreshUserData();
                            if (userData) {
                                const isAdmin = userData.roles?.some((r: string) => ['admin', 'tenant_admin', 'super_admin', 'platform_admin'].includes(r));
                                const isExternalUser = userData.system_role === 'guest' || userData.roles?.includes('guest') || userData.isVendorOnly;
                                if (isExternalUser && !isAdmin) {
                                    const portals: string[] = [];
                                    if (userData.isVendorOnly || userData.roles?.includes('vendor')) portals.push('/vendor-portal');
                                    if (userData.enabledModules?.includes('risk_portal') || userData.permissions?.includes('risk.read')) portals.push('/risk-portal');
                                    if (userData.enabledModules?.includes('vulnerability_portal') || userData.permissions?.includes('vulnerability.read') || userData.permissions?.includes('security.read')) portals.push('/vulnerability-portal');
                                    const unique = [...new Set(portals)];
                                    if (unique.length === 1) targetUrl = unique[0];
                                    else if (unique.length > 1) targetUrl = '/guest-hub';
                                }
                            }
                        }
                    }
                } catch (cleanupErr: any) {
                    console.error('❌ [AUTH] Erro na limpeza pós-reset (não-fatal):', cleanupErr.message);
                }

                navigate(targetUrl, { replace: true });
            };

            setTimeout(runPostSetupCleanup, 2000);

        } catch (error: any) {
            console.error('❌ Erro ao redefinir senha:', error);
            toast({
                title: "Erro ao atualizar senha",
                description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (hashError) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
                <Card className="w-full max-w-md shadow-lg border-red-200 dark:border-red-900">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Link Inválido</CardTitle>
                        <CardDescription className="text-red-500 font-medium">
                            O link de redefinição expirou ou não é mais válido.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-6">{hashError}</p>
                        <Button className="w-full" onClick={() => navigate(loginRoute)}>
                            Voltar para o Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
                <Card className="w-full max-w-md shadow-lg border-green-200 dark:border-green-900">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Tudo Pronto!</CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400 font-medium">
                            {isGuest ? 'Bem-vindo(a)! Sua senha foi configurada com sucesso.' : 'Sua senha foi redefinida com sucesso.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-6">
                            Você será redirecionado para a plataforma em alguns instantes.
                        </p>
                        <Button className="w-full" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Acessando a Plataforma...
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Crie uma nova senha</CardTitle>
                    <CardDescription>
                        Sua nova senha deve ser diferente das anteriores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !password || !confirmPassword}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Redefinir Senha'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(loginRoute)} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

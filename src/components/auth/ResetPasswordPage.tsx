import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, KeyRound, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [hashError, setHashError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

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

        // Check user session to see if they are actually a guest
        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.system_role === 'guest' || user?.user_metadata?.is_vendor) {
                setIsGuest(true);
            }
        };
        checkUserRole();

        // Set up a listener so if the user arrives cleanly, we ensure they are "logged in" enough to update their password
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    console.log('🔗 [AUTH] Redefinição de senha autorizada.');
                    setHashError(null);
                    if (session?.user?.user_metadata?.system_role === 'guest' || session?.user?.user_metadata?.is_vendor) {
                        setIsGuest(true);
                    }
                }
                // Invite links fire SIGNED_IN instead of PASSWORD_RECOVERY
                if (event === 'SIGNED_IN') {
                    const role = session?.user?.user_metadata?.system_role;
                    const isVendor = session?.user?.user_metadata?.is_vendor;
                    if (role === 'guest' || isVendor) {
                        console.log('🔗 [AUTH] Convite detectado via SIGNED_IN — ativando modo convidado/fornecedor.');
                        setIsGuest(true);
                    }
                    setHashError(null);
                }
            }
        );

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
            const { data: { session } } = await supabase.auth.getSession();
            console.log('🔄 [AUTH] Estado da sessão antes de redefinir:', { hasSession: !!session });

            if (!session) {
                console.warn('⚠️ [AUTH] Sessão ausente antes de redefinir. Verificando getUser()...');
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                console.log('👤 [AUTH] getUser() result:', { hasUser: !!currentUser });
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                throw error;
            }

            // Atualizar o perfil do usuário para ativo e remover a flag de mudança de senha obrigatória
            // Isso remove o usuário do status "Pendente" no painel de IAM
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({
                    is_active: true,
                    must_change_password: false,
                    last_login_at: new Date().toISOString()
                }).eq('user_id', user.id);
                console.log('✅ Perfil atualizado: is_active=true, must_change_password=false');
            }

            setSuccess(true);
            toast({
                title: "Tudo Certo!",
                description: "Sua senha foi configurada. Redirecionando para a aplicação...",
            });

            // Redirect to root, where App.tsx will route them dynamically based on permissions
            setTimeout(() => navigate('/'), 2000);

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
                        <Button className="w-full" onClick={() => navigate('/')}>
                            Acessar a Plataforma
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

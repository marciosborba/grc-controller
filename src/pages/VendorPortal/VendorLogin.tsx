import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, ArrowRight, KeyRound, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VendorLoginProps {
    onLoginSuccess?: () => void;
}

export const VendorLogin: React.FC<VendorLoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Force-change-password state
    const [forceChangeMode, setForceChangeMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Sign out any existing session first to avoid session conflicts
            await supabase.auth.signOut();

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            if (data.user) {
                // VERIFICAR STATUS VIA RPC UNIFICADO
                const { data: status, error: rpcError } = await supabase.rpc('check_is_vendor', {
                    check_uid: data.user.id,
                });

                if (rpcError) throw rpcError;

                const cleanStatus = status ? String(status).trim().toLowerCase() : 'unknown';

                if (cleanStatus === 'not_found') {
                    await supabase.auth.signOut();
                    toast({
                        title: "Acesso Negado",
                        description: "Esta conta não possui permissões de fornecedor no sistema.",
                        variant: "destructive"
                    });
                    setIsLoading(false);
                    return;
                }

                if (cleanStatus === 'inactive') {
                    await supabase.auth.signOut();
                    toast({
                        title: "Conta Desativada",
                        description: "Sua conta de acesso ao portal está desativada. Entre em contato com o administrador.",
                        variant: "destructive"
                    });
                    setIsLoading(false);
                    return;
                }

                // Se for 'active', continuamos o fluxo normal
                // Mas ainda precisamos do vendorUser/portalUserCheck para outros metadados (como nome e force_change)
                const { data: vendorUser } = await supabase
                    .from('vendor_users')
                    .select('id, name')
                    .eq('auth_user_id', data.user.id)
                    .maybeSingle();

                const { data: portalUserCheck } = await supabase
                    .from('vendor_portal_users')
                    .select('vendor_id, force_password_change')
                    .eq('email', email.trim().toLowerCase())
                    .maybeSingle();

                // Check if forced password change is required
                if (portalUserCheck?.force_password_change) {
                    // Don't navigate yet – show the change password screen
                    setForceChangeMode(true);
                    return;
                }

                toast({
                    title: "Login realizado com sucesso",
                    description: `Bem-vindo${vendorUser?.name ? `, ${vendorUser.name}` : ''}!`,
                });

                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    const from = (location.state as any)?.from?.pathname || '/vendor-portal';
                    navigate(from, { replace: true });
                }
            }
        } catch (error: any) {
            console.error('[VendorLogin] auth error:', error);
            const knownMessages: Record<string, string> = {
                'Invalid login credentials': 'E-mail ou senha incorretos.',
                'Email not confirmed': 'E-mail ainda não confirmado.',
                'User not found': 'Usuário não encontrado.',
            };
            const msg = knownMessages[error.message] || `Erro: ${error.message}`;
            toast({
                title: "Erro de Autenticação",
                description: msg,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast({ title: "E-mail necessário", description: "Preencha seu e-mail corporativo primeiro para recuperar a senha.", variant: "destructive" });
            return;
        }
        setIsResetting(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/vendor-portal/reset-password`,
            });
            if (error) throw error;

            toast({
                title: "E-mail enviado",
                description: "Verifique sua caixa de entrada para redefinir sua senha.",
            });
        } catch (err: any) {
            toast({ title: "Erro", description: err.message || "Erro ao enviar e-mail de recuperação.", variant: "destructive" });
        } finally {
            setIsResetting(false);
        }
    };


    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast({ title: "Senha inválida", description: "A senha deve ter ao menos 6 caracteres.", variant: "destructive" });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "Senhas não conferem", description: "A confirmação não corresponde à nova senha.", variant: "destructive" });
            return;
        }
        setChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            // Clear the force_password_change flag
            await supabase
                .from('vendor_portal_users')
                .update({ force_password_change: false })
                .eq('email', email.trim().toLowerCase());

            toast({
                title: "✅ Senha alterada com sucesso!",
                description: "Sua senha foi atualizada. Bem-vindo ao Portal.",
            });

            if (onLoginSuccess) {
                onLoginSuccess();
            } else {
                const from = (location.state as any)?.from?.pathname || '/vendor-portal';
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            toast({ title: "Erro ao alterar senha", description: err.message, variant: "destructive" });
        } finally {
            setChangingPassword(false);
        }
    };

    // ── Force Change Password Screen ─────────────────────────────────────────
    if (forceChangeMode) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full sm:mx-auto sm:max-w-md">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-amber-500/20">
                            <KeyRound className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-extrabold text-foreground tracking-tight">
                        Alteração de Senha Obrigatória
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Por segurança, defina uma nova senha antes de continuar.
                    </p>
                </div>

                <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                    <Card className="border-border shadow-xl shadow-amber-500/5">
                        <CardHeader>
                            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-400">
                                    Este é o seu primeiro acesso. A senha fornecida pelo administrador deve ser substituída por uma senha pessoal e segura.
                                </p>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleChangePassword}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nova Senha</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <Input
                                            id="new-password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Mínimo 6 caracteres"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 pr-10 h-12 text-base bg-background"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowNewPassword(v => !v)}
                                        >
                                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="Repita a nova senha"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 h-12 text-base bg-background"
                                            required
                                        />
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-xs text-red-500">As senhas não conferem.</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-md group"
                                    disabled={changingPassword || newPassword !== confirmPassword || newPassword.length < 6}
                                >
                                    {changingPassword ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Salvando...</>
                                    ) : (
                                        <><KeyRound className="mr-2 h-5 w-5" />Confirmar Nova Senha</>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        );
    }

    // ── Regular Login Screen ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full sm:mx-auto sm:max-w-md">
                <div className="flex justify-center mb-0 text-center items-center flex-col">
                    <img src="/logo-login.png?v=4" alt="GEPRIV Logo" className="h-[100px] sm:h-[200px] w-auto object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png?v=4'; }} />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground tracking-tight">
                    Portal do Fornecedor
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Acesse a plataforma de Governança, Riscos e Compliance
                </p>
            </div>

            <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                <Card className="border-border shadow-xl shadow-primary/5">
                    <CardHeader>
                        <CardTitle className="text-xl">Fazer Login</CardTitle>
                        <CardDescription>
                            Insira suas credenciais fornecidas pela organização para acessar seus assessments pendentes.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail Corporativo</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="fornecedor@empresa.com.br"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 text-base transition-all focus:ring-2 focus:ring-primary/20 bg-background"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        disabled={isResetting || isLoading}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        {isResetting ? 'Enviando...' : 'Esqueceu a senha?'}
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12 text-base transition-all focus:ring-2 focus:ring-primary/20 bg-background"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(v => !v)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-medium shadow-md group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Autenticando...</>
                                ) : (
                                    <>Acessar Portal<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <div className="mt-8 text-center text-xs text-muted-foreground max-w-md mx-auto">
                <p>
                    Este ambiente é de uso exclusivo para fornecedores e parceiros cadastrados.
                    Acesso não autorizado é expressamente proibido.
                </p>
            </div>
        </div>
    );
};

export default VendorLogin;

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
                // Verify the user is a vendor via vendor_users (preferred) or vendor_portal_users (fallback)
                const { data: vendorUser } = await supabase
                    .from('vendor_users')
                    .select('id, name')
                    .eq('auth_user_id', data.user.id)
                    .maybeSingle();

                // Fallback: check vendor_portal_users by email
                const { data: portalUserCheck } = await supabase
                    .from('vendor_portal_users')
                    .select('vendor_id, email, force_password_change')
                    .eq('email', email.trim().toLowerCase())
                    .maybeSingle();

                if (!vendorUser && !portalUserCheck) {
                    await supabase.auth.signOut();
                    toast({
                        title: "Acesso Negado",
                        description: "Esta conta não possui permissões de fornecedor no sistema.",
                        variant: "destructive"
                    });
                    return;
                }

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
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-amber-200">
                            <KeyRound className="h-8 w-8 text-amber-600" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900 tracking-tight">
                        Alteração de Senha Obrigatória
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Por segurança, defina uma nova senha antes de continuar.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <Card className="border-amber-200 shadow-xl shadow-amber-100/50">
                        <CardHeader>
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800">
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
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="new-password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Mínimo 6 caracteres"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 pr-10 h-12 text-base"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="Repita a nova senha"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 h-12 text-base"
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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform shadow-sm ring-1 ring-primary/20">
                        <Shield className="h-8 w-8 text-primary transform -rotate-3" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Portal do Fornecedor
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Acesse a plataforma de Governança, Riscos e Compliance
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="border-border/50 shadow-xl shadow-gray-200/50">
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
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="fornecedor@empresa.com.br"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 h-12 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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

            <div className="mt-8 text-center text-xs text-gray-500 max-w-md mx-auto">
                <p>
                    Este ambiente é de uso exclusivo para fornecedores e parceiros cadastrados.
                    Acesso não autorizado é expressamente proibido.
                </p>
            </div>
        </div>
    );
};

export default VendorLogin;

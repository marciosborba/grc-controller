import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ShieldCheck, LogOut, Loader2 } from 'lucide-react';

export const MfaVerifyPage = () => {
    const { user, needsMFA, logout } = useAuth();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [trustDevice, setTrustDevice] = useState(false);

    // If MFA is not needed, redirect to dashboard
    useEffect(() => {
        if (!needsMFA && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [needsMFA, user, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || code.length < 6) return;

        setIsSubmitting(true);
        try {
            // 1. Verify TOTP with Supabase
            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
                factorId: (await supabase.auth.mfa.listFactors()).data?.totp[0].id as string,
                code: code
            });

            if (verifyError) throw verifyError;

            console.log('✅ [MFA] Verified. Response session AAL:', verifyData?.user?.app_metadata?.aal);

            toast.success('Autenticação de dois fatores confirmada');

            // 2. Handle Trusted Device
            if (trustDevice && user) {
                const token = `trusted_${new Date().getTime()}`;
                localStorage.setItem(`grc_trusted_device_${user.id}`, token);
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 90);
                localStorage.setItem(`grc_trusted_device_${user.id}_expiry`, expiryDate.toISOString());
            }

            // 3. Force Session Update
            // 3. Force Session Update
            // Robust session extraction
            let sessionToSet: any = null;
            const responseAny = verifyData as any;

            if (responseAny?.access_token) {
                sessionToSet = responseAny;
            } else if (responseAny?.session?.access_token) {
                sessionToSet = responseAny.session;
            }

            if (sessionToSet && sessionToSet.access_token && sessionToSet.refresh_token) {
                const { error: setSessionError } = await supabase.auth.setSession({
                    access_token: sessionToSet.access_token,
                    refresh_token: sessionToSet.refresh_token
                });

                if (setSessionError) {
                    console.error('Error setting session:', setSessionError);
                }
            }

            // 4. Navigate immediately
            // Set emergency bypass flag
            sessionStorage.setItem('grc_mfa_completed', Date.now().toString());

            toast.success('Autenticação confirmada!');
            navigate('/dashboard', { replace: true });

        } catch (err: any) {
            console.error('❌ [MFA] Error:', err);
            toast.error(err.message || 'Código inválido');
            setIsSubmitting(false);
        }
    };

    // Check if trusted devices are allowed by tenant
    // Note: user.settings is settings from the tenant
    const allowTrustedDevices = user?.settings?.security?.accessControl?.allowTrustedDevices;

    if (!user) return null; // Should be handled by route protection

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Verificação de Segurança
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sua conta está protegida por autenticação de dois fatores.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Digite o código</CardTitle>
                        <CardDescription>
                            Abra seu aplicativo autenticador (Google Authenticator, Authy, etc) e digite o código de 6 dígitos.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleVerify}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Código de Verificação</Label>
                                <Input
                                    id="code"
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-2xl tracking-widest"
                                    autoFocus
                                    autoComplete="one-time-code"
                                />
                            </div>

                            {allowTrustedDevices && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="trustDevice"
                                        checked={trustDevice}
                                        onCheckedChange={(c) => setTrustDevice(!!c)}
                                    />
                                    <Label htmlFor="trustDevice" className="text-sm font-normal cursor-pointer">
                                        Confiar neste dispositivo por 90 dias
                                    </Label>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || code.length < 6}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verificar
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => logout()}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair e voltar ao login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

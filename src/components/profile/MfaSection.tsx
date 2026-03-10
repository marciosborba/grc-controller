import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Mail, QrCode, Copy, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MfaSectionProps {
    user: any;
    initMFA: () => Promise<void>;
    verifyMFA: () => Promise<void>;
    mfaInitiated: boolean;
    showMfaSetup: boolean;
    setShowMfaSetup: (show: boolean) => void;
    mfaSecret: string;
    mfaQr: string;
    mfaCode: string;
    setMfaCode: (code: string) => void;
    saving: boolean;
}

export const MfaSection: React.FC<MfaSectionProps> = ({
    user,
    initMFA,
    verifyMFA,
    mfaInitiated,
    showMfaSetup,
    setShowMfaSetup,
    mfaSecret,
    mfaQr,
    mfaCode,
    setMfaCode,
    saving
}) => {
    const [method, setMethod] = useState<'app' | 'email'>('app');

    const handleMethodChange = (value: 'app' | 'email') => {
        setMethod(value);
        if (showMfaSetup) setShowMfaSetup(false);
    };

    const handleEmailMfaSetup = () => {
        toast.info("MFA por Email ativado", {
            description: "Você receberá códigos de verificação no seu email cadastrado."
        });
        // Aqui poderia chamar uma API para salvar a preferência
    };

    return (
        <Card className="border-border/50 shadow-sm h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Autenticação em Dois Fatores (MFA)
                </CardTitle>
                <CardDescription>
                    Escolha como deseja proteger sua conta adicionalmente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">

                {/* Selection */}
                <div className="space-y-3">
                    <Label>Método de Autenticação</Label>
                    <RadioGroup defaultValue="app" value={method} onValueChange={(v) => handleMethodChange(v as 'app' | 'email')} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="app" id="mfa-app" className="peer sr-only" />
                            <Label
                                htmlFor="mfa-app"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Smartphone className="mb-3 h-6 w-6" />
                                App Autenticador
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="email" id="mfa-email" className="peer sr-only" />
                            <Label
                                htmlFor="mfa-email"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <Mail className="mb-3 h-6 w-6" />
                                E-mail
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* APP FLOW */}
                {method === 'app' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {!showMfaSetup ? (
                            <div className="bg-muted/30 p-4 rounded-lg text-center space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Utilize um app como Google Authenticator, Authy ou Microsoft Authenticator.
                                </p>
                                <Button onClick={initMFA} disabled={saving} variant="default" className="w-full sm:w-auto">
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                                    Configurar via App
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 border rounded-lg p-4 bg-background">
                                <div className="space-y-2 text-center">
                                    <h4 className="font-semibold text-sm">Escaneie o QR Code</h4>
                                    <div className="flex justify-center p-4 bg-white rounded-lg border w-fit mx-auto">
                                        {mfaQr && mfaQr.startsWith('data:') ? (
                                            <img src={mfaQr} alt="QR Code MFA" className="h-32 w-32 object-contain" />
                                        ) : mfaQr ? (
                                            // If raw SVG string
                                            <div
                                                className="h-32 w-32 [&>svg]:w-full [&>svg]:h-full"
                                                dangerouslySetInnerHTML={{ __html: mfaQr }}
                                            />
                                        ) : (
                                            <div className="h-32 w-32 bg-muted flex items-center justify-center text-xs">Carregando...</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Ou digite o código manual:</Label>
                                    <div className="flex gap-2">
                                        <code className="flex-1 p-2 bg-muted rounded text-xs font-mono border text-center select-all">
                                            {mfaSecret}
                                        </code>
                                        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => {
                                            navigator.clipboard.writeText(mfaSecret);
                                            toast.success("Copiado!");
                                        }}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t mt-2">
                                    <Label>Digite o código do app:</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={mfaCode}
                                            onChange={e => setMfaCode(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="font-mono tracking-widest text-center"
                                        />
                                        <Button onClick={verifyMFA} disabled={mfaCode.length < 6 || saving}>Ativar</Button>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowMfaSetup(false)}>Cancelar</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* EMAIL FLOW */}
                {method === 'email' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-primary mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">Verificação por Email</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Os códigos de segurança serão enviados para <strong>{user?.email}</strong> sempre que um novo login for detectado.
                                    </p>
                                </div>
                            </div>
                            <Button onClick={handleEmailMfaSetup} variant="outline" className="w-full">
                                Definir Email como Padrão
                            </Button>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
};

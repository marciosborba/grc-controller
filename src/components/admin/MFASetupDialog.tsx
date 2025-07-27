import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Smartphone, 
  Key, 
  Copy, 
  Download,
  QrCode,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useMFA } from '@/hooks/useMFA';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const verificationSchema = z.object({
  token: z.string().min(6, 'Token deve ter 6 dígitos').max(6, 'Token deve ter 6 dígitos'),
  backup_code: z.string().optional()
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface MFASetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MFASetupDialog: React.FC<MFASetupDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const {
    mfaConfig,
    setupData,
    isMFAEnabled,
    setupMFA,
    verifyMFA,
    disableMFA,
    regenerateBackupCodes,
    newBackupCodes,
    isSettingUpMFA,
    isEnablingMFA: isLoading,
    isDisablingMFA,
    isRegeneratingCodes
  } = useMFA();

  const [currentStep, setCurrentStep] = useState<'setup' | 'verify' | 'manage'>('setup');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      token: '',
      backup_code: ''
    }
  });

  React.useEffect(() => {
    if (isMFAEnabled) {
      setCurrentStep('manage');
    } else if (setupData) {
      setCurrentStep('verify');
    } else {
      setCurrentStep('setup');
    }
  }, [isMFAEnabled, setupData]);

  const handleSetupMFA = () => {
    if (user?.id) {
      setupMFA(user.id);
    }
  };

  const handleVerifyAndEnable = (data: VerificationFormData) => {
    if (user?.id) {
      verifyMFA(user.id, {
        token: data.token,
        backup_code: data.backup_code
      });
    }
  };

  const handleDisableMFA = (data: VerificationFormData) => {
    if (user?.id) {
      disableMFA(user.id);
    }
  };

  const handleRegenerateBackupCodes = () => {
    console.warn('Regenerate backup codes não implementado ainda');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `Códigos de Backup MFA - ${user?.email}\n\nGuarde estes códigos em local seguro. Cada código pode ser usado apenas uma vez.\n\n${codes.join('\n')}\n\nGerado em: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${user?.email}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Códigos de backup baixados');
  };

  const handleClose = () => {
    form.reset();
    setCurrentStep(isMFAEnabled ? 'manage' : 'setup');
    setShowBackupCodes(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Autenticação Multifator (MFA)
          </DialogTitle>
          <DialogDescription>
            Configure a autenticação de dois fatores para aumentar a segurança da sua conta.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup" disabled={isMFAEnabled}>
              1. Configurar
            </TabsTrigger>
            <TabsTrigger value="verify" disabled={!setupData && isMFAEnabled}>
              2. Verificar
            </TabsTrigger>
            <TabsTrigger value="manage" disabled={!isMFAEnabled}>
              3. Gerenciar
            </TabsTrigger>
          </TabsList>

          {/* Etapa 1: Configuração Inicial */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Configurar Autenticador
                </CardTitle>
                <CardDescription>
                  Configure um aplicativo autenticador no seu dispositivo móvel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Aplicativos Recomendados:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 border rounded-lg text-center">
                      <div className="font-medium">Google Authenticator</div>
                      <div className="text-xs text-gray-500">iOS / Android</div>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <div className="font-medium">Microsoft Authenticator</div>
                      <div className="text-xs text-gray-500">iOS / Android</div>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <div className="font-medium">Authy</div>
                      <div className="text-xs text-gray-500">iOS / Android</div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Certifique-se de ter um aplicativo autenticador instalado antes de continuar.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleSetupMFA} 
                  disabled={isSettingUpMFA}
                  className="w-full"
                >
                  {isSettingUpMFA ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Iniciar Configuração
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Etapa 2: Verificação */}
          <TabsContent value="verify" className="space-y-4">
            {setupData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Escaneie o Código QR
                    </CardTitle>
                    <CardDescription>
                      Use seu aplicativo autenticador para escanear o código QR abaixo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={setupData.qr_code} 
                        alt="QR Code para MFA"
                        className="border rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Ou digite manualmente:</h4>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <code className="flex-1 text-sm">{setupData.secret}</code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(setupData.secret)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Códigos de Backup</CardTitle>
                    <CardDescription>
                      Guarde estes códigos em local seguro. Eles podem ser usados se você perder acesso ao seu dispositivo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded font-mono text-sm">
                      {setupData.backup_codes.map((code, index) => (
                        <div key={index} className="p-1">
                          {code}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(setupData.backup_codes.join('\n'))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Códigos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackupCodes(setupData.backup_codes)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Códigos
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verificar Configuração</CardTitle>
                    <CardDescription>
                      Digite o código de 6 dígitos do seu aplicativo autenticador para confirmar a configuração.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleVerifyAndEnable)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="token"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código de Verificação</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="000000"
                                  maxLength={6}
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Digite o código de 6 dígitos do seu aplicativo autenticador.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Habilitar MFA
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Etapa 3: Gerenciamento */}
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  MFA Habilitado
                </CardTitle>
                <CardDescription>
                  Sua conta está protegida com autenticação de dois fatores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Autenticação Multifator Ativa</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Habilitado
                  </Badge>
                </div>

                {mfaConfig && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Último uso:</span>
                      <span>
                        {mfaConfig.last_used_at 
                          ? new Date(mfaConfig.last_used_at).toLocaleString()
                          : 'Nunca usado'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Códigos de backup disponíveis:</span>
                      <span>{mfaConfig.backup_codes?.length || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gerenciar Códigos de Backup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Códigos de Backup
                </CardTitle>
                <CardDescription>
                  Gerencie seus códigos de backup para recuperação de conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showBackupCodes ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Códigos disponíveis:</span>
                      <Badge variant="outline">
                        {mfaConfig?.backup_codes?.length || 0} códigos
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBackupCodes(true)}
                      >
                        Ver Códigos
                      </Button>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleRegenerateBackupCodes)} className="flex gap-2">
                          <Input
                            placeholder="Código do app"
                            className="w-32"
                            {...form.register('token')}
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            disabled={isRegeneratingCodes}
                          >
                            {isRegeneratingCodes ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              'Gerar Novos'
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded font-mono text-sm">
                      {(newBackupCodes || mfaConfig?.backup_codes || []).map((code, index) => (
                        <div key={index} className="p-1">
                          {code}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard((newBackupCodes || mfaConfig?.backup_codes || []).join('\n'))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackupCodes(newBackupCodes || mfaConfig?.backup_codes || [])}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBackupCodes(false)}
                      >
                        Ocultar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Desabilitar MFA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <ShieldX className="w-4 h-4" />
                  Desabilitar MFA
                </CardTitle>
                <CardDescription>
                  Remover a proteção de autenticação de dois fatores da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção!</strong> Desabilitar o MFA reduzirá significativamente a segurança da sua conta.
                  </AlertDescription>
                </Alert>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleDisableMFA)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Verificação</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="000000"
                              maxLength={6}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Digite o código do seu aplicativo autenticador para confirmar.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      variant="destructive"
                      disabled={isDisablingMFA}
                    >
                      {isDisablingMFA ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Desabilitando...
                        </>
                      ) : (
                        <>
                          <ShieldX className="w-4 h-4 mr-2" />
                          Desabilitar MFA
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Scan,
    ShieldAlert,
    UserX,
    FileWarning,
    Ghost,
    CheckCircle,
    Clock,
    AlertTriangle,
    Info
} from 'lucide-react';

interface ScanResult {
    retention_violations: number;
    consent_gaps: number;
    ghost_data: number;
    dlp_findings: Array<{
        id: string;
        action: string;
        finding: string;
        created_at: string;
    }>;
    timestamp: string;
}

export const PrivacyScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runScan = async () => {
        setIsScanning(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('run_privacy_scan');

            if (rpcError) throw rpcError;

            setScanResult(data as ScanResult);
        } catch (err: any) {
            console.error('Privacy scan failed:', err);
            setError(err.message || 'Erro ao executar verificação de privacidade');
        } finally {
            setIsScanning(false);
        }
    };

    const getStatusColor = (count: number) => count > 0 ? 'text-red-500' : 'text-green-500';
    const getBadgeVariant = (count: number) => count > 0 ? 'destructive' : 'outline';

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Scan className="h-6 w-6 text-primary" />
                            Scanner de Conformidade de Dados
                        </h2>
                        <p className="text-muted-foreground">
                            Auditoria automática de Retenção, Consentimento e Vazamento de Dados (DLP)
                        </p>
                    </div>
                    <Button
                        onClick={runScan}
                        disabled={isScanning}
                        className="w-full sm:w-auto"
                    >
                        {isScanning ? (
                            <>Running Scan...</>
                        ) : (
                            <>
                                <Scan className="mr-2 h-4 w-4" /> Executar Verificação
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {scanResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Retention Card */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Card className="cursor-help hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                            Violações de Retenção
                                            <Info className="h-3 w-3" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className={`h-8 w-8 ${getStatusColor(scanResult.retention_violations)}`} />
                                                <span className="text-2xl font-bold">{scanResult.retention_violations}</span>
                                            </div>
                                            <Badge variant={getBadgeVariant(scanResult.retention_violations)}>
                                                {scanResult.retention_violations > 0 ? 'Ação Necessária' : 'OK'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Usuários inativos por &gt; 1 ano
                                        </p>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">LGPD Art. 15 e 16</p>
                                <p className="text-xs max-w-xs">Dados pessoais devem ser eliminados após o término de seu tratamento. Manter dados de usuários inativos gera risco desnecessário.</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Consent Gaps */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Card className="cursor-help hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                            Consentimento Pendente
                                            <Info className="h-3 w-3" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <UserX className={`h-8 w-8 ${getStatusColor(scanResult.consent_gaps)}`} />
                                                <span className="text-2xl font-bold">{scanResult.consent_gaps}</span>
                                            </div>
                                            <Badge variant={getBadgeVariant(scanResult.consent_gaps)}>
                                                {scanResult.consent_gaps > 0 ? 'Risco Legal' : 'OK'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Usuários sem registro de aceite
                                        </p>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">LGPD Art. 7 e 8</p>
                                <p className="text-xs max-w-xs">O controlador deve ser capaz de provar que o consentimento foi obtido. Usuários sem registro formal de aceite representam passivo jurídico.</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Ghost Data */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Card className="cursor-help hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                            Dados Órfãos (Ghost)
                                            <Info className="h-3 w-3" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Ghost className={`h-8 w-8 ${getStatusColor(scanResult.ghost_data)}`} />
                                                <span className="text-2xl font-bold">{scanResult.ghost_data}</span>
                                            </div>
                                            <Badge variant={getBadgeVariant(scanResult.ghost_data)}>
                                                {scanResult.ghost_data > 0 ? 'Limpeza Necessária' : 'Limpo'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Perfis desconectados
                                        </p>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">Princípio da Qualidade (Art. 6, V)</p>
                                <p className="text-xs max-w-xs">Dados devem ser exatos e atualizados. Registros órfãos (sem usuário vinculado) violam a integridade e ocupam armazenamento indevidamente.</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* DLP Findings */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Card className="cursor-help hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                            Alertas DLP (Logs)
                                            <Info className="h-3 w-3" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileWarning className={`h-8 w-8 ${getStatusColor(scanResult.dlp_findings.length)}`} />
                                                <span className="text-2xl font-bold">{scanResult.dlp_findings.length}</span>
                                            </div>
                                            <Badge variant={getBadgeVariant(scanResult.dlp_findings.length)}>
                                                {scanResult.dlp_findings.length > 0 ? 'Vazamento' : 'Seguro'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Dados sensíveis em logs
                                        </p>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">Segurança (LGPD Art. 46)</p>
                                <p className="text-xs max-w-xs">Logs de sistema NÃO devem conter dados pessoais sensíveis (CPFs, Emails) em texto plano. Isso configura incidente de segurança se vazado.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {scanResult?.dlp_findings.length > 0 && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                        <CardHeader>
                            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" /> Detalhes dos Vazamentos (DLP)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {scanResult.dlp_findings.slice(0, 5).map((finding, idx) => (
                                    <li key={idx} className="bg-white dark:bg-black/20 p-3 rounded border text-sm flex justify-between">
                                        <span>
                                            <strong>{finding.finding}</strong> em <em>{finding.action}</em>
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {new Date(finding.created_at).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {scanResult.dlp_findings.length > 5 && (
                                <p className="text-xs text-center mt-2 text-muted-foreground">
                                    ... e mais {scanResult.dlp_findings.length - 5} ocorrências.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </TooltipProvider>
    );
};

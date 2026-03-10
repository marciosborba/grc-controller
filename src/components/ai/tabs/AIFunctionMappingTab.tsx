import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { aiConfigService, AIPromptTemplate, AIFunctionMapping } from '@/services/aiConfigService';

interface AIFunctionMappingTabProps {
    tenantId: string;
    readonly?: boolean;
}

const SYSTEM_FUNCTIONS = [
    { key: 'audit', label: 'Auditoria de Políticas', description: 'Realiza análise de conformidade entre políticas e frameworks.' },
    { key: 'risk', label: 'Análise de Riscos', description: 'Identifica e avalia riscos em cenários operacionais.' },
    { key: 'compliance', label: 'Monitoramento de Compliance', description: 'Verifica requisitos regulatórios de forma contínua.' },
    { key: 'privacy', label: 'Privacidade (LGPD/GDPR)', description: 'Analisa impacto de proteção de dados.' },
    { key: 'incident', label: 'Gestão de Incidentes', description: 'Sugere respostas e classifica severidade de incidentes.' },
    { key: 'assessment', label: 'Assessments (Questionários)', description: 'Avalia maturidade com base em questionários respondidos.' }
];

export const AIFunctionMappingTab: React.FC<AIFunctionMappingTabProps> = ({ tenantId, readonly = false }) => {
    const [loading, setLoading] = useState(true);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Prompts
            const promptData = await aiConfigService.getPrompts(tenantId);
            setPrompts(promptData);

            // Load Mappings
            const mappingData = await aiConfigService.getFunctionMappings(tenantId);
            const map: Record<string, string> = {};
            mappingData.forEach(m => {
                map[m.function_key] = m.prompt_template_id;
            });
            setMappings(map);
        } catch (error) {
            console.error('Error loading mappings:', error);
            toast.error('Falha ao carregar configurações.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) loadData();
    }, [tenantId]);

    const handleMappingChange = (functionKey: string, promptId: string) => {
        setMappings(prev => ({ ...prev, [functionKey]: promptId }));
    };

    const handleSave = async (functionKey: string) => {
        const promptId = mappings[functionKey];
        if (!promptId) return;

        try {
            await aiConfigService.upsertFunctionMapping({
                tenant_id: tenantId,
                function_key: functionKey,
                prompt_template_id: promptId
            });
            toast.success('Mapeamento salvo com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar mapeamento.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <div>
                    <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
                        <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                        Mapeamento de Funções
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">Defina qual "Personalidade" (Prompt) a IA deve assumir para cada função do sistema.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} className="w-full sm:w-auto">
                    <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
                </Button>
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardContent className="p-0">
                    {/* ── MOBILE: cards ── */}
                    <div className="sm:hidden divide-y divide-white/5">
                        {SYSTEM_FUNCTIONS.map((func) => (
                            <div key={func.key} className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="font-medium text-white text-sm">{func.label}</div>
                                        <Badge variant="outline" className="mt-0.5 text-[10px] font-mono bg-black/20 text-muted-foreground border-white/10">
                                            {func.key}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{func.description}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={mappings[func.key] || ''}
                                        onValueChange={(val) => handleMappingChange(func.key, val)}
                                        disabled={readonly}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10 text-xs flex-1">
                                            <SelectValue placeholder="Selecione um prompt..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10">
                                            {prompts.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!readonly && (
                                        <Button size="sm" variant="ghost" className="hover:bg-emerald-500/20 hover:text-emerald-400 shrink-0" onClick={() => handleSave(func.key)}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── DESKTOP: tabela ── */}
                    <div className="hidden sm:block">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-white w-[300px]">Função do Sistema</TableHead>
                                    <TableHead className="text-white">Descrição</TableHead>
                                    <TableHead className="text-white w-[350px]">Prompt Selecionado</TableHead>
                                    <TableHead className="text-white text-right w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {SYSTEM_FUNCTIONS.map((func) => (
                                    <TableRow key={func.key} className="border-white/5 hover:bg-white/5">
                                        <TableCell>
                                            <div className="font-medium text-white">{func.label}</div>
                                            <Badge variant="outline" className="mt-1 text-xs font-mono bg-black/20 text-muted-foreground border-white/10">
                                                {func.key}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {func.description}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={mappings[func.key] || ''}
                                                onValueChange={(val) => handleMappingChange(func.key, val)}
                                                disabled={readonly}
                                            >
                                                <SelectTrigger className="bg-black/20 border-white/10">
                                                    <SelectValue placeholder="Selecione um prompt..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-900 border-white/10">
                                                    {prompts.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!readonly && (
                                                <Button size="sm" variant="ghost" className="hover:bg-emerald-500/20 hover:text-emerald-400" onClick={() => handleSave(func.key)}>
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

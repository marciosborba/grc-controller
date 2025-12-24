import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ChevronRight, ChevronLeft, CheckCircle, Search,
    BookOpen, Target, Users, Calendar, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { AssessmentFramework } from '@/types/assessment';
import { useAssessmentIntegration } from '@/hooks/useAssessmentIntegration';

export default function AssessmentWizard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { frameworks: availableFrameworks, availableUsers, createAssessment } = useAssessmentIntegration();

    // Wizard State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        framework_id: '',
        responsavel_id: '',
        aprovador_id: '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim_planejada: '',
        prioridade: 'media'
    });

    const [selectedFramework, setSelectedFramework] = useState<AssessmentFramework | null>(null);

    // Helper: Filter Frameworks
    const [frameworkSearch, setFrameworkSearch] = useState('');
    const filteredFrameworks = availableFrameworks.filter(f =>
        f.nome.toLowerCase().includes(frameworkSearch.toLowerCase()) ||
        f.tipo_framework.toLowerCase().includes(frameworkSearch.toLowerCase())
    );

    // Steps Logic
    const nextStep = () => {
        if (step === 1 && !formData.framework_id) return toast.error('Selecione um framework');
        if (step === 2 && (!formData.titulo || !formData.responsavel_id)) return toast.error('Preencha os campos obrigatórios');
        setStep(step + 1);
    };
    const prevStep = () => setStep(step - 1);

    // Create
    const handleCreate = async () => {
        setLoading(true);
        try {
            const payload = {
                title: formData.titulo, // The hook expects 'titulo'? No, hook maps it or pass directly.
                // Let's check useAssessmentIntegration signature. It takes 'assessmentData'.
                // Map to DB columns
                titulo: formData.titulo,
                descricao: formData.descricao,
                framework_id: formData.framework_id,
                responsavel_id: formData.responsavel_id,
                aprovador_id: formData.aprovador_id,
                data_inicio: formData.data_inicio,
                data_fim_planejada: formData.data_fim_planejada,
                status: 'planejado',
                tenant_id: (user as any)?.tenant_id,
                percentual_conclusao: 0,
                percentual_maturidade: 0,
                configuracoes_especiais: { prioridade: formData.prioridade }
            };

            const newAssessment = await createAssessment(payload);
            toast.success('Assessment criado com sucesso!');
            navigate(`/assessments/${newAssessment.id}`);
        } catch (err: any) {
            toast.error('Erro ao criar assessment: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Novo Assessment</h1>
                    <p className="text-muted-foreground">Assistente de criação de avaliação</p>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`flex items-center ${i < 3 ? 'after:content-[""] after:h-px after:w-8 after:bg-border after:mx-2' : ''}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 
                          ${step === i ? 'border-primary bg-primary text-primary-foreground' :
                                    step > i ? 'border-primary bg-primary/20 text-primary' : 'border-muted text-muted-foreground'}`
                            }>
                                {i}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="min-h-[500px] flex flex-col">
                <CardContent className="flex-1 p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-2xl font-semibold">Selecione o Framework</h2>
                                <p className="text-muted-foreground">Escolha o padrão de conformidade para esta avaliação</p>
                            </div>

                            <div className="relative max-w-md mx-auto mb-8">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar framework..."
                                    className="pl-10"
                                    value={frameworkSearch}
                                    onChange={e => setFrameworkSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFrameworks.map(fw => (
                                    <div
                                        key={fw.id}
                                        onClick={() => { setFormData({ ...formData, framework_id: fw.id }); setSelectedFramework(fw); }}
                                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50 relative overflow-hidden
                                      ${formData.framework_id === fw.id ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' : 'border-muted bg-card'}`
                                        }
                                    >
                                        {formData.framework_id === fw.id && (
                                            <div className="absolute top-2 right-2 text-primary">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div className="mb-2 p-2 w-fit rounded bg-blue-100 text-blue-700">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-semibold mb-1">{fw.nome}</h3>
                                        <Badge variant="secondary" className="mb-2">{fw.tipo_framework}</Badge>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{fw.descricao || 'Sem descrição'}</p>
                                    </div>
                                ))}
                            </div>
                            {filteredFrameworks.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    Nenhum framework encontrado.
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-2xl mx-auto">
                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-2xl font-semibold">Detalhes da Avaliação</h2>
                                <p className="text-muted-foreground">Defina o escopo, equipe e prazos</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título do Assessment <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={formData.titulo}
                                        onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                        placeholder="Ex: Auditoria Interna ISO 27001 - Q1 2024"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        value={formData.descricao}
                                        onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                        placeholder="Objetivos e escopo detalhado..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Responsável <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.responsavel_id}
                                            onValueChange={v => setFormData({ ...formData, responsavel_id: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                            <SelectContent>
                                                {availableUsers.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Aprovador</Label>
                                        <Select
                                            value={formData.aprovador_id}
                                            onValueChange={v => setFormData({ ...formData, aprovador_id: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                            <SelectContent>
                                                {availableUsers.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Data Início</Label>
                                        <Input type="date" value={formData.data_inicio} onChange={e => setFormData({ ...formData, data_inicio: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prazo Final</Label>
                                        <Input type="date" value={formData.data_fim_planejada} onChange={e => setFormData({ ...formData, data_fim_planejada: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Prioridade</Label>
                                    <Select value={formData.prioridade} onValueChange={v => setFormData({ ...formData, prioridade: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="baixa">Baixa</SelectItem>
                                            <SelectItem value="media">Média</SelectItem>
                                            <SelectItem value="alta">Alta</SelectItem>
                                            <SelectItem value="critica">Crítica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-2xl mx-auto text-center">
                            <div className="space-y-2 mb-8">
                                <h2 className="text-2xl font-semibold">Revisão</h2>
                                <p className="text-muted-foreground">Confira os dados antes de criar</p>
                            </div>

                            <div className="bg-muted/30 p-6 rounded-lg border text-left space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Framework</span>
                                    <span className="font-medium flex items-center gap-2"><BookOpen className="h-4 w-4" /> {selectedFramework?.nome}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Título</span>
                                    <span className="font-medium">{formData.titulo}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Responsável</span>
                                    <span className="font-medium flex items-center gap-2"><Users className="h-4 w-4" /> {availableUsers.find(u => u.id === formData.responsavel_id)?.full_name || formData.responsavel_id}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Prazo</span>
                                    <span className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> {formData.data_fim_planejada || 'Não definido'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Prioridade</span>
                                    <Badge variant={formData.prioridade === 'critica' ? 'destructive' : 'secondary'}>{formData.prioridade}</Badge>
                                </div>
                            </div>

                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 text-left text-sm">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Próximos Passos</p>
                                    <p>Ao confirmar, você será redirecionado para a tela de execução onde poderá iniciar o preenchimento das respostas.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-between border-t p-6">
                    <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    {step < 3 ? (
                        <Button onClick={nextStep}>
                            Próximo <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleCreate} disabled={loading} className="w-32">
                            {loading ? 'Criando...' : 'Criar e Iniciar'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

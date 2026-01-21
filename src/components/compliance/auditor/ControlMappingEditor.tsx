import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { policyAuditorService, AuditResult } from '@/services/policyAuditorService';
import { toast } from 'sonner';

interface ControlMappingEditorProps {
    match: any; // Using any for now to map from DB result
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export const ControlMappingEditor: React.FC<ControlMappingEditorProps> = ({ match, isOpen, onClose, onSave }) => {
    const [adequacyScore, setAdequacyScore] = useState<number>(match?.adequacy_score || 0);
    const [maturityLevel, setMaturityLevel] = useState<string>(match?.maturity_level || 'Initial');
    const [status, setStatus] = useState<string>(match?.status || 'non_compliant');
    const [userNotes, setUserNotes] = useState<string>(match?.user_notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await policyAuditorService.updateControlMatch(match.id, {
                adequacy_score: adequacyScore,
                maturity_level: maturityLevel as any,
                status: status as any,
                user_notes: userNotes
            });
            toast.success('Mapeamento atualizado com sucesso');
            onSave();
            onClose();
        } catch (error) {
            toast.error('Erro ao salvar analise');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!match) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Editor de Controle: {match.control_code}
                        <Badge variant="outline">{match.framework_requirement_code || 'N/A'}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Ajuste a análise automática do IA para este controle.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground mb-1 block">Controle Detectado</Label>
                            <div className="p-3 bg-muted rounded-md text-sm italic">
                                "{match.control_description}"
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground mb-1 block">Evidência na Política</Label>
                            <div className="p-3 bg-muted/50 border border-dashed rounded-md text-sm text-muted-foreground max-h-[100px] overflow-y-auto">
                                "{match.detected_evidence}"
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Nível de Adequação</Label>
                                <span className="text-sm font-bold text-primary">{adequacyScore}%</span>
                            </div>
                            <Slider
                                value={[adequacyScore]}
                                onValueChange={(val) => setAdequacyScore(val[0])}
                                max={100}
                                step={5}
                                className="py-2"
                            />
                            <p className="text-xs text-muted-foreground">O quanto este controle atende ao requisito do framework.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Maturidade (CMMI)</Label>
                                <Select value={maturityLevel} onValueChange={setMaturityLevel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Initial">Inicial (Ad-hoc)</SelectItem>
                                        <SelectItem value="Managed">Gerenciado</SelectItem>
                                        <SelectItem value="Defined">Definido</SelectItem>
                                        <SelectItem value="Quantitatively Managed">Gerenciado Quantitativamente</SelectItem>
                                        <SelectItem value="Optimizing">Em Otimização</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="compliant">Conforme</SelectItem>
                                        <SelectItem value="partial">Parcialmente Conforme</SelectItem>
                                        <SelectItem value="non_compliant">Não Conforme</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notas do Auditor</Label>
                            <Textarea
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                placeholder="Justificativa ou observações sobre a análise..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Análise'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

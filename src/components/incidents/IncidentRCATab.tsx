import React, { useState } from 'react';
import { Target, Save, Loader2, Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Incident } from '@/types/incident-management';

interface IncidentRCATabProps {
    incident: Incident;
    canEdit: boolean;
    onUpdate: (id: string, updates: Partial<Incident>) => void;
}

const IncidentRCATab: React.FC<IncidentRCATabProps> = ({ incident, canEdit, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        recovery_actions: incident.recovery_actions || '',
        lessons_learned: incident.lessons_learned || '',
        preventive_measures: incident.preventive_measures || ''
    });

    const hasData = !!(incident.recovery_actions || incident.lessons_learned || incident.preventive_measures);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(incident.id, formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save RCA", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // View when pending and not editing
    if (!isEditing && !hasData) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        ANÁLISE DE CAUSA RAIZ
                    </h4>
                    {canEdit && (
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                Iniciar Análise
                            </Button>
                        </div>
                    )}
                </div>
                <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
                    <Target className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">Análise Pendente</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        A causa raiz, lições aprendidas e medidas preventivas ainda não foram documentadas para este incidente.
                    </p>
                </div>
            </div>
        );
    }

    // View when editing or when data exists
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <h4 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    ANÁLISE DE CAUSA RAIZ
                </h4>
                <div className="flex flex-wrap gap-2">
                    {canEdit && !isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    )}
                    {isEditing && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => {
                                setFormData({
                                    recovery_actions: incident.recovery_actions || '',
                                    lessons_learned: incident.lessons_learned || '',
                                    preventive_measures: incident.preventive_measures || ''
                                });
                                setIsEditing(false);
                            }} disabled={isSaving}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Salvar
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="recovery_actions" className="font-semibold text-primary/90 flex items-center gap-2">
                        Ações de Recuperação
                    </Label>
                    {isEditing ? (
                        <Textarea
                            id="recovery_actions"
                            placeholder="Descreva as ações tomadas para recuperar os serviços ou conter os danos imediatos..."
                            value={formData.recovery_actions}
                            onChange={(e) => handleChange('recovery_actions', e.target.value)}
                            className="min-h-[100px] resize-y"
                        />
                    ) : (
                        <div className="bg-muted/30 p-4 rounded-md text-sm border whitespace-pre-wrap">
                            {incident.recovery_actions || <span className="text-muted-foreground italic">Não preenchido.</span>}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lessons_learned" className="font-semibold text-primary/90 flex items-center gap-2">
                        Lições Aprendidas
                    </Label>
                    {isEditing ? (
                        <Textarea
                            id="lessons_learned"
                            placeholder="O que aprendemos com este incidente? Quais foram as falhas identificadas?"
                            value={formData.lessons_learned}
                            onChange={(e) => handleChange('lessons_learned', e.target.value)}
                            className="min-h-[100px] resize-y"
                        />
                    ) : (
                        <div className="bg-muted/30 p-4 rounded-md text-sm border whitespace-pre-wrap">
                            {incident.lessons_learned || <span className="text-muted-foreground italic">Não preenchido.</span>}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="preventive_measures" className="font-semibold text-primary/90 flex items-center gap-2">
                        Medidas Preventivas
                    </Label>
                    {isEditing ? (
                        <Textarea
                            id="preventive_measures"
                            placeholder="Quais ações serão tomadas para evitar que este incidente ocorra novamente?"
                            value={formData.preventive_measures}
                            onChange={(e) => handleChange('preventive_measures', e.target.value)}
                            className="min-h-[100px] resize-y"
                        />
                    ) : (
                        <div className="bg-muted/30 p-4 rounded-md text-sm border whitespace-pre-wrap">
                            {incident.preventive_measures || <span className="text-muted-foreground italic">Não preenchido.</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncidentRCATab;

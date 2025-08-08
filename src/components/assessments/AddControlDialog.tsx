import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  onControlAdded: () => void;
}

const AddControlDialog: React.FC<AddControlDialogProps> = ({
  open,
  onOpenChange,
  assessmentId,
  onControlAdded,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableControls, setAvailableControls] = useState<any[]>([]);
  const [selectedControlId, setSelectedControlId] = useState('');
  const [customControl, setCustomControl] = useState({
    control_code: '',
    control_text: '',
    domain: '',
  });
  const [mode, setMode] = useState<'existing' | 'custom'>('existing');

  useEffect(() => {
    if (open) {
      fetchAvailableControls();
    }
  }, [open, assessmentId]);

  const fetchAvailableControls = async () => {
    try {
      // Get assessment framework
      const { data: assessment } = await supabase
        .from('assessments')
        .select('framework_id_on_creation')
        .eq('id', assessmentId)
        .single();

      if (!assessment) return;

      // Get controls from framework that are not yet in this assessment
      const { data: existingResponses } = await supabase
        .from('assessment_responses')
        .select('control_id')
        .eq('assessment_id', assessmentId);

      const existingControlIds = existingResponses?.map(r => r.control_id) || [];

      let query = supabase
        .from('framework_controls')
        .select('*')
        .eq('framework_id', assessment.framework_id_on_creation);

      if (existingControlIds.length > 0) {
        query = query.not('id', 'in', `(${existingControlIds.join(',')})`);
      }

      const { data: controls } = await query;
      setAvailableControls(controls || []);
    } catch (error) {
      console.error('Error fetching available controls:', error);
    }
  };

  const handleAddControl = async () => {
    try {
      setIsLoading(true);

      if (mode === 'existing' && selectedControlId) {
        // Add existing control to assessment
        const { error } = await supabase
          .from('assessment_responses')
          .insert([
            {
              assessment_id: assessmentId,
              control_id: selectedControlId,
              question_status: 'pending',
            },
          ]);

        if (error) throw error;
      } else if (mode === 'custom') {
        // First create the control, then add to assessment
        const { data: newControl, error: controlError } = await supabase
          .from('framework_controls')
          .insert([
            {
              control_code: customControl.control_code,
              control_text: customControl.control_text,
              domain: customControl.domain,
              framework_id: (await supabase
                .from('assessments')
                .select('framework_id_on_creation')
                .eq('id', assessmentId)
                .single()).data?.framework_id_on_creation,
            },
          ])
          .select()
          .single();

        if (controlError) throw controlError;

        // Now add to assessment
        const { error: responseError } = await supabase
          .from('assessment_responses')
          .insert([
            {
              assessment_id: assessmentId,
              control_id: newControl.id,
              question_status: 'pending',
            },
          ]);

        if (responseError) throw responseError;
      }

      toast({
        title: 'Sucesso',
        description: 'Controle adicionado ao assessment com sucesso.',
      });

      onControlAdded();
      onOpenChange(false);
      setSelectedControlId('');
      setCustomControl({ control_code: '', control_text: '', domain: '' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar controle.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Controle ao Assessment</DialogTitle>
          <DialogDescription>
            Escolha um controle existente do framework ou crie um novo controle personalizado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button
              variant={mode === 'existing' ? 'default' : 'outline'}
              onClick={() => setMode('existing')}
              className="flex-1"
            >
              Controle Existente
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              onClick={() => setMode('custom')}
              className="flex-1"
            >
              Controle Personalizado
            </Button>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-2">
              <Label htmlFor="control">Selecionar Controle</Label>
              <Select value={selectedControlId} onValueChange={setSelectedControlId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um controle..." />
                </SelectTrigger>
                <SelectContent>
                  {availableControls.map((control) => (
                    <SelectItem key={control.id} value={control.id}>
                      {control.control_code} - {control.control_text.substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableControls.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Todos os controles do framework já foram adicionados a este assessment.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="control_code">Código do Controle</Label>
                <Input
                  id="control_code"
                  value={customControl.control_code}
                  onChange={(e) => setCustomControl(prev => ({
                    ...prev,
                    control_code: e.target.value
                  }))}
                  placeholder="Ex: AC-1, CP-1, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="control_text">Descrição do Controle</Label>
                <Textarea
                  id="control_text"
                  value={customControl.control_text}
                  onChange={(e) => setCustomControl(prev => ({
                    ...prev,
                    control_text: e.target.value
                  }))}
                  placeholder="Descreva o controle de segurança..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domínio</Label>
                <Input
                  id="domain"
                  value={customControl.domain}
                  onChange={(e) => setCustomControl(prev => ({
                    ...prev,
                    domain: e.target.value
                  }))}
                  placeholder="Ex: Controle de Acesso, Segurança de Dados, etc."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddControl}
            disabled={
              isLoading ||
              (mode === 'existing' && !selectedControlId) ||
              (mode === 'custom' && (!customControl.control_code || !customControl.control_text))
            }
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Controle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddControlDialog;
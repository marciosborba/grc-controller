import React, { useState } from 'react';
import { Calendar, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAssessments } from '@/hooks/useAssessments';

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateAssessmentDialog: React.FC<CreateAssessmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { frameworks, createAssessment } = useAssessments();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    framework_id_on_creation: '',
    due_date: undefined as Date | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.framework_id_on_creation) return;

    try {
      setIsLoading(true);
      await createAssessment({
        name: formData.name,
        framework_id_on_creation: formData.framework_id_on_creation,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : undefined,
      });
      
      setFormData({
        name: '',
        framework_id_on_creation: '',
        due_date: undefined,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      setFormData({
        name: '',
        framework_id_on_creation: '',
        due_date: undefined,
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Assessment *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Auditoria Interna ISO 27001 - 2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="framework">Framework *</Label>
            <Select
              value={formData.framework_id_on_creation}
              onValueChange={(value) => setFormData(prev => ({ ...prev, framework_id_on_creation: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((framework) => (
                  <SelectItem key={framework.id} value={framework.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{framework.short_name}</span>
                      <span className="text-sm text-muted-foreground">{framework.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prazo (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.due_date && 'text-muted-foreground'
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formData.due_date ? (
                    format(formData.due_date, "PPP", { locale: ptBR })
                  ) : (
                    'Selecione uma data'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || !formData.framework_id_on_creation || isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Assessment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
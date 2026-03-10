import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

export default function SimpleDatePicker() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">🧪 Teste Simples de Date Picker</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Selecione uma data:
          </label>
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                type="button"
                onClick={() => {
                  console.log('🖱️ Botão clicado, abrindo popover...');
                  setIsOpen(true);
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span className="text-muted-foreground">Clique para selecionar</span>
                )}
              </Button>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-auto p-0 z-[9999]" 
              align="start" 
              side="bottom"
              onOpenAutoFocus={(e) => {
                console.log('📅 Popover aberto, foco automático');
                e.preventDefault();
              }}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  console.log('📅 Data selecionada:', selectedDate);
                  setDate(selectedDate);
                  setIsOpen(false);
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm">
            <strong>Data selecionada:</strong> {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : 'Nenhuma'}
          </p>
          <p className="text-sm mt-1">
            <strong>Popover aberto:</strong> {isOpen ? 'Sim' : 'Não'}
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-600">
          <p>💡 <strong>Como testar:</strong></p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Clique no botão acima</li>
            <li>Verifique se o calendário aparece</li>
            <li>Clique em uma data</li>
            <li>Verifique se a data aparece no botão</li>
            <li>Abra o console para ver os logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
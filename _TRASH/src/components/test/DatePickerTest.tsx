import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

export default function DatePickerTest() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  console.log('🧪 DatePickerTest renderizado');
  console.log('📅 Estado atual:', { date, isOpen });

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-center">🧪 Teste de Date Picker</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Teste de Seleção de Data:
          </label>
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                type="button"
                onClick={() => {
                  console.log('🖱️ Botão clicado!');
                  setIsOpen(!isOpen);
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span className="text-muted-foreground">Clique para selecionar data</span>
                )}
              </Button>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-auto p-0" 
              align="start"
              onOpenAutoFocus={(e) => {
                console.log('📅 Popover aberto com foco');
                e.preventDefault();
              }}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  console.log('📅 Data selecionada no Calendar:', selectedDate);
                  setDate(selectedDate);
                  setIsOpen(false);
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">📊 Estado Atual:</h3>
          <p className="text-sm">
            <strong>Data selecionada:</strong> {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : 'Nenhuma'}
          </p>
          <p className="text-sm">
            <strong>Popover aberto:</strong> {isOpen ? 'Sim' : 'Não'}
          </p>
          <p className="text-sm">
            <strong>Timestamp:</strong> {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs">
          <p className="font-semibold mb-2">🔍 Como testar:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Clique no botão acima</li>
            <li>Verifique se o calendário aparece</li>
            <li>Clique em uma data</li>
            <li>Verifique se a data aparece no botão</li>
            <li>Abra o console (F12) para ver os logs</li>
          </ol>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-xs">
          <p className="font-semibold mb-2">⚠️ Possíveis problemas:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Popover não abre: problema com Radix UI</li>
            <li>Calendário não aparece: problema com react-day-picker</li>
            <li>Data não seleciona: problema com event handlers</li>
            <li>Formatação incorreta: problema com date-fns</li>
          </ul>
        </div>

        <button 
          className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => {
            setDate(undefined);
            setIsOpen(false);
            console.log('🔄 Estado resetado');
          }}
        >
          🔄 Resetar Teste
        </button>
      </div>
    </div>
  );
}
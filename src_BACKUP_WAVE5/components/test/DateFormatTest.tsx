import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DateFormatTest() {
  const [testDate, setTestDate] = useState(null);

  const handleDateSelect = (date) => {
    console.log('🧪 Data selecionada no teste:', date);
    console.log('🧪 Tipo:', typeof date);
    console.log('🧪 É Date?', date instanceof Date);
    setTestDate(date);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">🧪 Teste de Formatação</h3>
      <p>Data atual: {testDate ? format(testDate, "dd/MM/yyyy", { locale: ptBR }) : 'Nenhuma'}</p>
      <button 
        onClick={() => handleDateSelect(new Date())}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Definir Data Atual
      </button>
      <button 
        onClick={() => handleDateSelect(null)}
        className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded"
      >
        Limpar Data
      </button>
    </div>
  );
}
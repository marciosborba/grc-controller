import React from 'react';
import SimpleDatePicker from '@/components/test/SimpleDatePicker';

export default function TestDatePicker() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">🧪 Teste de Componentes de Data</h1>
            <p className="text-gray-600 mt-2">
              Esta página testa os componentes de data isoladamente para identificar problemas.
            </p>
          </div>
          
          <div className="p-6">
            <SimpleDatePicker />
          </div>
          
          <div className="p-6 border-t bg-gray-50">
            <h3 className="font-semibold mb-2">🔍 Instruções de Debug:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Abra o console do navegador (F12)</li>
              <li>2. Teste o componente acima</li>
              <li>3. Se funcionar aqui, o problema está no modal</li>
              <li>4. Se não funcionar, o problema está nos componentes base</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
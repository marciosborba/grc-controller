import React from 'react';
import DatePickerTest from '@/components/test/DatePickerTest';

export default function TestDatePickerPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Página de Teste - Date Picker
            </h1>
            <p className="text-gray-600">
              Esta página testa os componentes de data isoladamente para identificar problemas
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <DatePickerTest />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">📋 Instruções de Debug</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-600">✅ Se funcionar aqui:</h3>
                  <p className="text-sm text-gray-600">
                    O problema está específico no modal do assessment. Pode ser:
                  </p>
                  <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                    <li>Z-index do modal interferindo</li>
                    <li>Event propagation sendo bloqueado</li>
                    <li>CSS do modal conflitando</li>
                    <li>Estados do modal interferindo</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-red-600">❌ Se não funcionar aqui:</h3>
                  <p className="text-sm text-gray-600">
                    O problema está nos componentes base. Pode ser:
                  </p>
                  <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                    <li>Dependências não instaladas corretamente</li>
                    <li>Configuração do Radix UI incorreta</li>
                    <li>Problema com react-day-picker</li>
                    <li>Conflito de CSS global</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-600">🔍 Logs no Console:</h3>
                  <p className="text-sm text-gray-600">
                    Abra o console (F12) e procure por:
                  </p>
                  <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                    <li>🧪 DatePickerTest renderizado</li>
                    <li>🖱️ Botão clicado!</li>
                    <li>📅 Popover aberto com foco</li>
                    <li>📅 Data selecionada no Calendar</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-purple-600">🛠️ Próximos Passos:</h3>
                  <ol className="text-xs text-gray-500 list-decimal list-inside mt-1">
                    <li>Teste este componente primeiro</li>
                    <li>Se funcionar, o problema está no modal</li>
                    <li>Se não funcionar, verifique dependências</li>
                    <li>Reporte os resultados para correção específica</li>
                  </ol>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">📦 Dependências Necessárias:</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✅ @radix-ui/react-popover</li>
                  <li>✅ react-day-picker</li>
                  <li>✅ date-fns</li>
                  <li>✅ lucide-react</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              💡 Dica: Se o teste funcionar aqui mas não no modal, o problema é específico do contexto do modal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
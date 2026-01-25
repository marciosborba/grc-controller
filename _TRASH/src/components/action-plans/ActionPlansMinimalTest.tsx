import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ActionPlansMinimalTest() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Componente carregado!');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    console.log('🚀 ActionPlansMinimalTest montado!');
    setTimestamp(new Date().toLocaleString());
    
    // Teste básico sem Supabase
    setTimeout(() => {
      setMessage('Componente funcionando após 2 segundos!');
      console.log('✅ Componente funcionando normalmente');
    }, 2000);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <div className="border-l border-muted-foreground/20 pl-4">
          <h1 className="text-2xl font-bold">Teste Mínimo - Planos de Ação</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status do Componente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-100 border border-green-300 rounded">
              <h3 className="font-bold text-green-800">✅ COMPONENTE FUNCIONANDO</h3>
              <p className="text-green-700">{message}</p>
              <p className="text-sm text-green-600">Carregado em: {timestamp}</p>
            </div>
            
            <div className="p-4 bg-blue-100 border border-blue-300 rounded">
              <h3 className="font-bold text-blue-800">🔍 INFORMAÇÕES DE DEBUG</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• URL atual: {window.location.pathname}</li>
                <li>• Componente: ActionPlansMinimalTest</li>
                <li>• React renderizando: ✅</li>
                <li>• Router funcionando: ✅</li>
                <li>• UI Components carregando: ✅</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
              <h3 className="font-bold text-yellow-800">⚠️ PRÓXIMOS PASSOS</h3>
              <p className="text-sm text-yellow-700">
                Se você está vendo esta mensagem, o problema NÃO é:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 mt-2">
                <li>• Roteamento</li>
                <li>• Carregamento do componente</li>
                <li>• Imports/exports</li>
                <li>• Renderização básica</li>
              </ul>
              <p className="text-sm text-yellow-700 mt-2">
                O problema deve estar na integração com Supabase ou autenticação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Console</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              onClick={() => {
                console.log('🧪 TESTE MANUAL - Botão clicado!');
                console.log('📍 Localização:', window.location);
                console.log('⏰ Timestamp:', new Date().toISOString());
                alert('Verifique o console do navegador (F12)');
              }}
            >
              Testar Console
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                console.log('🔄 Recarregando página...');
                window.location.reload();
              }}
            >
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navegação de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/assessments')}
            >
              Assessments
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/assessments/action-plans')}
            >
              Action Plans (Assessments)
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/action-plans')}
            >
              Action Plans (Direto)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
/**
 * EXEMPLO DE FORMULARIO COM CRIPTOGRAFIA - TEMPORARIAMENTE DESABILITADO
 * 
 * Versão simplificada para corrigir problemas de performance.
 */

import React from 'react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Shield,
  AlertTriangle
} from 'lucide-react';

const CryptoFormExampleDisabled: React.FC = () => {
  const { user } = useAuth();
  const hasPermission = user?.isPlatformAdmin || false;
  
  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4" />
            <p>Acesso restrito a administradores da plataforma.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Sistema de Criptografia Temporariamente Desabilitado
        </CardTitle>
        <CardDescription>
          O sistema de criptografia foi temporariamente desabilitado para corrigir problemas de performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            🔧 Manutenção em Andamento
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Estamos otimizando o sistema de criptografia para melhorar a performance. 
            Esta funcionalidade será reativada em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoFormExampleDisabled;
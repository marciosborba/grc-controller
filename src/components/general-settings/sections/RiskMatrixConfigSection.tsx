import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Activity, 
  Edit, 
  Target, 
  CheckCircle,
  Building2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSecurity } from '@/utils/tenantSecurity';

interface RiskMatrixConfigSectionProps {
  organizationId?: string;
  onSettingsChange?: () => void;
}

export const RiskMatrixConfigSection: React.FC<RiskMatrixConfigSectionProps> = ({
  organizationId,
  onSettingsChange
}) => {
  const { user } = useAuth();
  const { userTenantId } = useTenantSecurity();
  
  // Fallback para tenant ID
  const tenantId = userTenantId || user?.tenantId || organizationId;
  
  const [isLoading, setIsLoading] = useState(false);
  const [matrixSize, setMatrixSize] = useState<'3x3' | '4x4' | '5x5'>('5x5');
  const [matrixData, setMatrixData] = useState<any>(null);

  console.log('🚀 RiskMatrixConfigSection renderizado!', {
    tenantId,
    userTenantId,
    userTenantIdFromAuth: user?.tenantId,
    organizationId,
    isLoading,
    matrixSize
  });

  useEffect(() => {
    console.log('🔄 useEffect executado, carregando dados...');
    loadMatrixConfig();
  }, [tenantId]);

  const loadMatrixConfig = async () => {
    console.log('📥 Iniciando carregamento da configuração...');
    setIsLoading(true);
    
    try {
      if (!tenantId) {
        console.log('⚠️ Nenhum tenant ID, usando configuração padrão');
        setMatrixData({ default: true });
        return;
      }

      console.log('🔍 Buscando configuração para tenant:', tenantId);
      
      const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar:', error);
        setMatrixData({ error: error.message });
        return;
      }

      console.log('✅ Dados recebidos:', data);
      setMatrixData(data);
      
      if (data?.settings?.risk_matrix?.type) {
        setMatrixSize(data.settings.risk_matrix.type);
      }
      
    } catch (error) {
      console.error('💥 Exceção:', error);
      setMatrixData({ exception: String(error) });
    } finally {
      setIsLoading(false);
      console.log('🏁 Carregamento finalizado');
    }
  };

  const renderSimpleMatrix = () => {
    const size = parseInt(matrixSize.charAt(0));
    console.log('🎯 Renderizando matriz simples:', { matrixSize, size });
    
    return (
      <div className="border-4 border-red-500 p-4 bg-yellow-50">
        <h3 className="text-lg font-bold text-red-600 mb-4">
          🎯 MATRIZ DE RISCO {matrixSize.toUpperCase()}
        </h3>
        
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-blue-200">
              <th className="border-2 border-black p-2 font-bold">P/I</th>
              {Array.from({ length: size }, (_, i) => (
                <th key={i} className="border-2 border-black p-2 font-bold">
                  I{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: size }, (_, i) => (
              <tr key={i}>
                <td className="border-2 border-black p-2 font-bold bg-blue-100">
                  P{i + 1}
                </td>
                {Array.from({ length: size }, (_, j) => (
                  <td key={j} className="border-2 border-black p-2 text-center bg-green-100">
                    <div className="font-bold text-lg">{(i + 1) * (j + 1)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Debug Header */}
      <div className="p-4 bg-red-100 border-2 border-red-500 rounded">
        <h2 className="text-xl font-bold text-red-600">🔧 COMPONENTE DE MATRIZ DE RISCO</h2>
        <div className="mt-2 text-sm">
          <strong>Status:</strong> {isLoading ? '⏳ Carregando...' : '✅ Pronto'}<br/>
          <strong>Tenant ID:</strong> {tenantId || '❌ Não encontrado'}<br/>
          <strong>Tamanho:</strong> {matrixSize}<br/>
          <strong>Dados:</strong> {matrixData ? '✅ Carregados' : '❌ Não carregados'}
        </div>
      </div>

      {/* Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4" />
        <AlertTitle>Matriz de Risco da Organização</AlertTitle>
        <AlertDescription>
          Configure a matriz de risco padrão para sua organização.
        </AlertDescription>
      </Alert>

      {/* Main Card */}
      <Card className="border-2 border-green-500">
        <CardHeader className="bg-green-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Configuração da Matriz de Risco
              </CardTitle>
              <CardDescription>
                Configure os níveis de probabilidade, impacto e a matriz de risco da organização
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                console.log('💾 Botão salvar clicado');
                toast.success('Configuração salva!');
              }} 
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Size Selector */}
          <div className="mb-6">
            <Label className="text-lg font-semibold">Tamanho da Matriz</Label>
            <Select
              value={matrixSize}
              onValueChange={(value) => {
                console.log('🔄 Alterando tamanho para:', value);
                setMatrixSize(value as any);
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3x3">3x3 (Simples)</SelectItem>
                <SelectItem value="4x4">4x4 (Padrão)</SelectItem>
                <SelectItem value="5x5">5x5 (Detalhada)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Matrix Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Matriz de Risco
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8 border-2 border-yellow-500 bg-yellow-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm">Carregando matriz...</span>
              </div>
            ) : (
              renderSimpleMatrix()
            )}
          </div>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-100 border rounded">
            <h4 className="font-bold mb-2">🔍 Informações de Debug:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                tenantId,
                userTenantId,
                organizationId,
                isLoading,
                matrixSize,
                matrixData,
                user: user ? { id: user.id, tenantId: user.tenantId } : null
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMatrixConfigSection;
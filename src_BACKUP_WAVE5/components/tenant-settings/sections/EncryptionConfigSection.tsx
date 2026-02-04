import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, Shield, Key, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface EncryptionConfigSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const EncryptionConfigSection: React.FC<EncryptionConfigSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [encryptionSettings, setEncryptionSettings] = useState({
    dataAtRest: true,
    dataInTransit: true,
    fieldLevelEncryption: false,
    algorithm: 'AES-256-GCM',
    keyRotationEnabled: true,
    keyRotationDays: 90
  });

  const [encryptedFields, setEncryptedFields] = useState({
    personalData: true,
    financialData: false,
    sensitiveDocuments: true,
    auditLogs: false,
    backups: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleEncryption = async (field: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      // Simular ativação/desativação de criptografia
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEncryptionSettings({
        ...encryptionSettings,
        [field]: enabled
      });
      
      onSettingsChange();
      toast.success(`Criptografia ${enabled ? 'ativada' : 'desativada'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao alterar configuração de criptografia');
    } finally {
      setIsLoading(false);
    }
  };

  const getEncryptionStatus = () => {
    const activeFeatures = Object.values(encryptionSettings).filter(Boolean).length;
    const totalFeatures = Object.keys(encryptionSettings).length - 2; // Excluir algorithm e keyRotationDays
    
    if (activeFeatures >= totalFeatures - 1) return { level: 'high', label: 'Alto', color: 'green' };
    if (activeFeatures >= 2) return { level: 'medium', label: 'Médio', color: 'yellow' };
    return { level: 'low', label: 'Baixo', color: 'red' };
  };

  const encryptionStatus = getEncryptionStatus();

  return (
    <div className="space-y-6">
      {/* Status Geral de Criptografia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Status de Criptografia
          </CardTitle>
          <CardDescription>
            Visão geral das configurações de criptografia ativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                encryptionStatus.color === 'green' ? 'bg-green-100' :
                encryptionStatus.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Shield className={`h-6 w-6 ${
                  encryptionStatus.color === 'green' ? 'text-green-600' :
                  encryptionStatus.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <div className="font-medium">Nível de Criptografia: {encryptionStatus.label}</div>
                <div className="text-sm text-muted-foreground">
                  Algoritmo: {encryptionSettings.algorithm}
                </div>
              </div>
            </div>
            <Badge 
              className={
                encryptionStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                encryptionStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }
            >
              {encryptionStatus.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Criptografia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurações de Criptografia
          </CardTitle>
          <CardDescription>
            Configure os tipos de criptografia para diferentes dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Criptografia Básica */}
          <div className="space-y-4">
            <h4 className="font-medium">Criptografia Básica</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="data-at-rest">Dados em Repouso</Label>
                  <p className="text-xs text-muted-foreground">
                    Criptografa dados armazenados no banco de dados
                  </p>
                </div>
                <Switch
                  id="data-at-rest"
                  checked={encryptionSettings.dataAtRest}
                  onCheckedChange={(checked) => handleToggleEncryption('dataAtRest', checked)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="data-in-transit">Dados em Trânsito</Label>
                  <p className="text-xs text-muted-foreground">
                    Criptografa dados durante transmissão (TLS/SSL)
                  </p>
                </div>
                <Switch
                  id="data-in-transit"
                  checked={encryptionSettings.dataInTransit}
                  onCheckedChange={(checked) => handleToggleEncryption('dataInTransit', checked)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="field-level">Criptografia em Nível de Campo</Label>
                  <p className="text-xs text-muted-foreground">
                    Criptografia granular para campos específicos
                  </p>
                </div>
                <Switch
                  id="field-level"
                  checked={encryptionSettings.fieldLevelEncryption}
                  onCheckedChange={(checked) => handleToggleEncryption('fieldLevelEncryption', checked)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Algoritmo de Criptografia */}
          <div className="space-y-4">
            <h4 className="font-medium">Algoritmo de Criptografia</h4>
            
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algoritmo</Label>
              <Select
                value={encryptionSettings.algorithm}
                onValueChange={(value) => {
                  setEncryptionSettings({...encryptionSettings, algorithm: value});
                  onSettingsChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AES-256-GCM">AES-256-GCM (Recomendado)</SelectItem>
                  <SelectItem value="AES-256-CBC">AES-256-CBC</SelectItem>
                  <SelectItem value="ChaCha20-Poly1305">ChaCha20-Poly1305</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                AES-256-GCM oferece melhor segurança e performance
              </p>
            </div>
          </div>

          {/* Rotação de Chaves */}
          <div className="space-y-4">
            <h4 className="font-medium">Rotação de Chaves</h4>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="key-rotation">Rotação Automática de Chaves</Label>
                <p className="text-xs text-muted-foreground">
                  Gera novas chaves automaticamente para maior segurança
                </p>
              </div>
              <Switch
                id="key-rotation"
                checked={encryptionSettings.keyRotationEnabled}
                onCheckedChange={(checked) => {
                  setEncryptionSettings({...encryptionSettings, keyRotationEnabled: checked});
                  onSettingsChange();
                }}
              />
            </div>

            {encryptionSettings.keyRotationEnabled && (
              <div className="space-y-2">
                <Label htmlFor="rotation-days">Intervalo de Rotação (dias)</Label>
                <Select
                  value={encryptionSettings.keyRotationDays.toString()}
                  onValueChange={(value) => {
                    setEncryptionSettings({
                      ...encryptionSettings, 
                      keyRotationDays: parseInt(value)
                    });
                    onSettingsChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias (Recomendado)</SelectItem>
                    <SelectItem value="180">180 dias</SelectItem>
                    <SelectItem value="365">365 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Criptografia por Tipo de Dados */}
      {encryptionSettings.fieldLevelEncryption && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Criptografia por Tipo de Dados
            </CardTitle>
            <CardDescription>
              Configure criptografia específica para diferentes tipos de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(encryptedFields).map(([field, enabled]) => {
                const fieldLabels = {
                  personalData: 'Dados Pessoais',
                  financialData: 'Dados Financeiros',
                  sensitiveDocuments: 'Documentos Sensíveis',
                  auditLogs: 'Logs de Auditoria',
                  backups: 'Backups'
                };

                const fieldDescriptions = {
                  personalData: 'CPF, RG, endereços, telefones',
                  financialData: 'Dados bancários, cartões, transações',
                  sensitiveDocuments: 'Contratos, relatórios confidenciais',
                  auditLogs: 'Registros de atividades e acessos',
                  backups: 'Arquivos de backup e exportações'
                };

                return (
                  <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor={field}>
                        {fieldLabels[field as keyof typeof fieldLabels]}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {fieldDescriptions[field as keyof typeof fieldDescriptions]}
                      </p>
                    </div>
                    <Switch
                      id={field}
                      checked={enabled}
                      onCheckedChange={(checked) => {
                        setEncryptedFields({...encryptedFields, [field]: checked});
                        onSettingsChange();
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas e Informações */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> A ativação ou desativação da criptografia pode afetar a performance do sistema.
          Alterações em dados já existentes podem levar tempo para serem processadas.
        </AlertDescription>
      </Alert>

      {!encryptionSettings.dataAtRest && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção:</strong> Dados em repouso não estão criptografados. 
            Recomendamos ativar esta opção para maior segurança.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
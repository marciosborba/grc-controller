import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Database, Users, Activity, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface DataExportSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const DataExportSection: React.FC<DataExportSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [exportSettings, setExportSettings] = useState({
    format: 'json',
    includeMetadata: true,
    anonymizeData: false,
    dateRange: 'all'
  });

  const [selectedDataTypes, setSelectedDataTypes] = useState({
    users: true,
    risks: true,
    audits: false,
    policies: false,
    incidents: false,
    activityLogs: false,
    settings: false
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const dataTypes = [
    { key: 'users', label: 'Dados de Usuários', icon: Users, description: 'Perfis, permissões e configurações' },
    { key: 'risks', label: 'Riscos', icon: Activity, description: 'Registros de riscos e avaliações' },
    { key: 'audits', label: 'Auditorias', icon: FileText, description: 'Relatórios e evidências de auditoria' },
    { key: 'policies', label: 'Políticas', icon: FileText, description: 'Documentos e versões de políticas' },
    { key: 'incidents', label: 'Incidentes', icon: Activity, description: 'Registros de incidentes de segurança' },
    { key: 'activityLogs', label: 'Logs de Atividade', icon: Calendar, description: 'Histórico de ações dos usuários' },
    { key: 'settings', label: 'Configurações', icon: Database, description: 'Configurações da organização' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simular processo de exportação
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
      }

      // Simular download do arquivo
      const selectedTypes = Object.entries(selectedDataTypes)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key);

      const filename = `export_${tenantId}_${new Date().toISOString().split('T')[0]}.${exportSettings.format}`;
      
      toast.success(`Exportação concluída! Arquivo: ${filename}`);
    } catch (error) {
      toast.error('Erro durante a exportação');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedDataTypes).filter(Boolean).length;
  };

  const getTotalEstimatedSize = () => {
    // Simular cálculo de tamanho baseado nos tipos selecionados
    let size = 0;
    if (selectedDataTypes.users) size += 0.5;
    if (selectedDataTypes.risks) size += 2.1;
    if (selectedDataTypes.audits) size += 1.8;
    if (selectedDataTypes.policies) size += 0.3;
    if (selectedDataTypes.incidents) size += 0.7;
    if (selectedDataTypes.activityLogs) size += 5.2;
    if (selectedDataTypes.settings) size += 0.1;
    
    return size.toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportação de Dados
        </CardTitle>
        <CardDescription>
          Exporte dados da organização para backup ou migração
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Tipos de Dados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Tipos de Dados para Exportar</h4>
            <Badge variant="outline">
              {getSelectedCount()} de {dataTypes.length} selecionados
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataTypes.map((dataType) => {
              const Icon = dataType.icon;
              return (
                <div key={dataType.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={dataType.key}
                    checked={selectedDataTypes[dataType.key as keyof typeof selectedDataTypes]}
                    onCheckedChange={(checked) => {
                      setSelectedDataTypes({
                        ...selectedDataTypes,
                        [dataType.key]: checked
                      });
                    }}
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor={dataType.key} className="font-medium cursor-pointer">
                        {dataType.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {dataType.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configurações de Exportação */}
        <div className="space-y-4">
          <h4 className="font-medium">Configurações de Exportação</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Formato do Arquivo</Label>
              <Select
                value={exportSettings.format}
                onValueChange={(value) => setExportSettings({...exportSettings, format: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Período dos Dados</Label>
              <Select
                value={exportSettings.dateRange}
                onValueChange={(value) => setExportSettings({...exportSettings, dateRange: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os dados</SelectItem>
                  <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                  <SelectItem value="last_90_days">Últimos 90 dias</SelectItem>
                  <SelectItem value="last_year">Último ano</SelectItem>
                  <SelectItem value="current_year">Ano atual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-metadata">Incluir metadados</Label>
                <p className="text-xs text-muted-foreground">
                  Timestamps, IDs internos e informações de auditoria
                </p>
              </div>
              <Switch
                id="include-metadata"
                checked={exportSettings.includeMetadata}
                onCheckedChange={(checked) => 
                  setExportSettings({...exportSettings, includeMetadata: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anonymize-data">Anonimizar dados pessoais</Label>
                <p className="text-xs text-muted-foreground">
                  Remove ou mascara informações pessoais identificáveis
                </p>
              </div>
              <Switch
                id="anonymize-data"
                checked={exportSettings.anonymizeData}
                onCheckedChange={(checked) => 
                  setExportSettings({...exportSettings, anonymizeData: checked})
                }
              />
            </div>
          </div>
        </div>

        {/* Informações da Exportação */}
        <div className="space-y-4">
          <h4 className="font-medium">Resumo da Exportação</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{getSelectedCount()}</div>
              <div className="text-sm text-muted-foreground">Tipos de dados</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{getTotalEstimatedSize()} MB</div>
              <div className="text-sm text-muted-foreground">Tamanho estimado</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{exportSettings.format.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground">Formato</div>
            </div>
          </div>
        </div>

        {/* Botão de Exportação */}
        <div className="space-y-4">
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exportando dados...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}
          
          <Button 
            onClick={handleExport}
            disabled={isExporting || getSelectedCount() === 0}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Iniciar Exportação'}
          </Button>
          
          {getSelectedCount() === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Selecione pelo menos um tipo de dados para exportar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
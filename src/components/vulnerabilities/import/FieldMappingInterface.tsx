import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { ImportSource, ImportPreview, FieldMapping } from './types/import';

interface FieldMappingInterfaceProps {
  source: ImportSource;
  preview: ImportPreview;
  onMappingChange: (mapping: FieldMapping) => void;
}

// Definição dos campos obrigatórios e opcionais
const REQUIRED_FIELDS = [
  { key: 'title', label: 'Título da Vulnerabilidade', description: 'Nome ou título da vulnerabilidade' },
  { key: 'description', label: 'Descrição', description: 'Descrição detalhada da vulnerabilidade' },
  { key: 'severity', label: 'Severidade', description: 'Nível de severidade (Critical, High, Medium, Low, Info)' },
  { key: 'asset_name', label: 'Nome do Ativo', description: 'Nome ou identificação do ativo afetado' },
  { key: 'source_tool', label: 'Ferramenta de Origem', description: 'Nome da ferramenta que detectou a vulnerabilidade' }
];

const OPTIONAL_FIELDS = [
  { key: 'cvss_score', label: 'CVSS Score', description: 'Pontuação CVSS (0.0 - 10.0)' },
  { key: 'cve_id', label: 'CVE ID', description: 'Identificador CVE (ex: CVE-2023-1234)' },
  { key: 'cwe_id', label: 'CWE ID', description: 'Identificador CWE (ex: CWE-79)' },
  { key: 'asset_ip', label: 'IP do Ativo', description: 'Endereço IP do ativo afetado' },
  { key: 'asset_url', label: 'URL do Ativo', description: 'URL do ativo afetado' },
  { key: 'port', label: 'Porta', description: 'Porta do serviço afetado' },
  { key: 'protocol', label: 'Protocolo', description: 'Protocolo utilizado (TCP, UDP, HTTP, etc.)' },
  { key: 'source_scan_id', label: 'ID do Scan', description: 'Identificador do scan que detectou a vulnerabilidade' },
  { key: 'plugin_id', label: 'Plugin ID', description: 'ID do plugin/regra que detectou a vulnerabilidade' },
  { key: 'solution', label: 'Solução', description: 'Passos para remediar a vulnerabilidade' },
  { key: 'references', label: 'Referências', description: 'Links e referências adicionais' },
  { key: 'first_found', label: 'Primeira Detecção', description: 'Data da primeira detecção' },
  { key: 'last_found', label: 'Última Detecção', description: 'Data da última detecção' }
];

// Mapeamentos pré-definidos por ferramenta
const TOOL_MAPPINGS: Record<string, Partial<FieldMapping>> = {
  nessus_file: {
    title: 'pluginName',
    description: 'description',
    severity: 'severity',
    cvss_score: 'cvss_base_score',
    asset_name: 'host',
    asset_ip: 'host',
    port: 'port',
    protocol: 'protocol',
    source_tool: 'Nessus',
    plugin_id: 'pluginID',
    solution: 'solution'
  },
  qualys_file: {
    title: 'TITLE',
    description: 'DIAGNOSIS',
    severity: 'SEVERITY',
    cvss_score: 'CVSS_BASE',
    asset_name: 'IP',
    asset_ip: 'IP',
    port: 'PORT',
    protocol: 'PROTOCOL',
    source_tool: 'Qualys',
    plugin_id: 'QID',
    solution: 'SOLUTION'
  },
  openvas_file: {
    title: 'name',
    description: 'description',
    severity: 'severity',
    cvss_score: 'cvss_base',
    asset_name: 'host',
    asset_ip: 'host',
    port: 'port',
    source_tool: 'OpenVAS',
    plugin_id: 'nvt_oid',
    solution: 'solution'
  },
  burp_file: {
    title: 'name',
    description: 'description',
    severity: 'severity',
    asset_name: 'host',
    asset_url: 'url',
    source_tool: 'Burp Suite',
    solution: 'remediation'
  },
  owasp_zap_file: {
    title: 'alert',
    description: 'desc',
    severity: 'risk',
    asset_name: 'url',
    asset_url: 'url',
    source_tool: 'OWASP ZAP',
    solution: 'solution'
  }
};

export default function FieldMappingInterface({ 
  source, 
  preview, 
  onMappingChange 
}: FieldMappingInterfaceProps) {
  const [mapping, setMapping] = useState<FieldMapping>({} as FieldMapping);
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    // Inicializar com mapeamento pré-definido se disponível
    const predefinedMapping = TOOL_MAPPINGS[source.type] || {};
    const initialMapping = { ...predefinedMapping };
    
    // Habilitar campos obrigatórios por padrão
    const initialEnabledFields: Record<string, boolean> = {};
    REQUIRED_FIELDS.forEach(field => {
      initialEnabledFields[field.key] = true;
    });
    
    // Habilitar campos opcionais que têm mapeamento pré-definido
    OPTIONAL_FIELDS.forEach(field => {
      if (predefinedMapping[field.key as keyof FieldMapping]) {
        initialEnabledFields[field.key] = true;
      }
    });

    setMapping(initialMapping);
    setEnabledFields(initialEnabledFields);
  }, [source.type]);

  useEffect(() => {
    onMappingChange(mapping);
    validateMapping();
  }, [mapping, onMappingChange]);

  const validateMapping = () => {
    const errors: string[] = [];
    
    // Verificar campos obrigatórios
    REQUIRED_FIELDS.forEach(field => {
      if (enabledFields[field.key] && !mapping[field.key as keyof FieldMapping]) {
        errors.push(`Campo obrigatório "${field.label}" não foi mapeado`);
      }
    });

    setValidationErrors(errors);
  };

  const handleFieldMappingChange = (fieldKey: string, sourceField: string) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: sourceField
    }));
  };

  const handleFieldToggle = (fieldKey: string, enabled: boolean) => {
    setEnabledFields(prev => ({
      ...prev,
      [fieldKey]: enabled
    }));

    if (!enabled) {
      // Remove o mapeamento se o campo for desabilitado
      setMapping(prev => {
        const newMapping = { ...prev };
        delete newMapping[fieldKey as keyof FieldMapping];
        return newMapping;
      });
    }
  };

  const resetToDefaults = () => {
    const predefinedMapping = TOOL_MAPPINGS[source.type] || {};
    setMapping(predefinedMapping);
    
    const defaultEnabledFields: Record<string, boolean> = {};
    REQUIRED_FIELDS.forEach(field => {
      defaultEnabledFields[field.key] = true;
    });
    OPTIONAL_FIELDS.forEach(field => {
      if (predefinedMapping[field.key as keyof FieldMapping]) {
        defaultEnabledFields[field.key] = true;
      }
    });
    
    setEnabledFields(defaultEnabledFields);
  };

  const autoDetectMapping = () => {
    const detectedMapping: Partial<FieldMapping> = {};
    const detectedFields = preview.detected_fields;

    // Lógica de detecção automática baseada em nomes comuns
    const fieldPatterns: Record<string, string[]> = {
      title: ['title', 'name', 'vulnerability', 'issue', 'finding', 'pluginname'],
      description: ['description', 'desc', 'details', 'summary', 'diagnosis'],
      severity: ['severity', 'risk', 'level', 'priority', 'criticality'],
      cvss_score: ['cvss', 'score', 'cvss_base', 'cvss_score'],
      cve_id: ['cve', 'cve_id', 'cve_number'],
      cwe_id: ['cwe', 'cwe_id', 'cwe_number'],
      asset_name: ['host', 'hostname', 'asset', 'target', 'ip', 'server'],
      asset_ip: ['ip', 'host_ip', 'target_ip', 'address'],
      port: ['port', 'service_port', 'target_port'],
      protocol: ['protocol', 'service', 'scheme'],
      solution: ['solution', 'fix', 'remediation', 'recommendation']
    };

    Object.entries(fieldPatterns).forEach(([targetField, patterns]) => {
      const matchedField = detectedFields.find(field => 
        patterns.some(pattern => 
          field.toLowerCase().includes(pattern.toLowerCase())
        )
      );
      
      if (matchedField) {
        detectedMapping[targetField as keyof FieldMapping] = matchedField;
      }
    });

    setMapping(prev => ({ ...prev, ...detectedMapping }));
  };

  const renderFieldMapping = (field: { key: string; label: string; description: string }, isRequired: boolean) => {
    const isEnabled = enabledFields[field.key];
    const currentMapping = mapping[field.key as keyof FieldMapping];
    const hasMapping = Boolean(currentMapping);

    return (
      <div key={field.key} className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => handleFieldToggle(field.key, checked)}
              disabled={isRequired}
            />
            <div>
              <div className="flex items-center gap-2">
                <Label className="font-medium">{field.label}</Label>
                {isRequired && (
                  <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                )}
                {hasMapping && isEnabled && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          </div>
        </div>

        {isEnabled && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select
                value={currentMapping || 'none'}
                onValueChange={(value) => handleFieldMappingChange(field.key, value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o campo de origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não mapear</SelectItem>
                  {preview.detected_fields.map(sourceField => (
                    <SelectItem key={sourceField} value={sourceField}>
                      {sourceField}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentMapping && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {currentMapping}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mapeamento de Campos
          </CardTitle>
          <CardDescription>
            Configure como os campos do arquivo/API serão mapeados para os campos de vulnerabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={autoDetectMapping}>
              <Eye className="h-4 w-4 mr-2" />
              Detectar Automaticamente
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold">{preview.detected_fields.length}</p>
              <p className="text-xs text-muted-foreground">Campos Detectados</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                {Object.values(mapping).filter(Boolean).length}
              </p>
              <p className="text-xs text-muted-foreground">Campos Mapeados</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">
                {Object.values(enabledFields).filter(Boolean).length}
              </p>
              <p className="text-xs text-muted-foreground">Campos Habilitados</p>
            </div>
          </div>

          {/* Erros de validação */}
          {validationErrors.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Erros de mapeamento:</p>
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm">• {error}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Campos Obrigatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campos Obrigatórios</CardTitle>
          <CardDescription>
            Estes campos são necessários para criar vulnerabilidades válidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {REQUIRED_FIELDS.map(field => renderFieldMapping(field, true))}
        </CardContent>
      </Card>

      {/* Campos Opcionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campos Opcionais</CardTitle>
          <CardDescription>
            Campos adicionais que podem enriquecer os dados das vulnerabilidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {OPTIONAL_FIELDS.map(field => renderFieldMapping(field, false))}
        </CardContent>
      </Card>

      {/* Preview dos dados mapeados */}
      {preview.sample_records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview dos Dados Mapeados</CardTitle>
            <CardDescription>
              Visualize como os dados serão importados com o mapeamento atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preview.sample_records.slice(0, 3).map((record, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Registro {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(mapping).map(([targetField, sourceField]) => {
                      if (!sourceField || !enabledFields[targetField]) return null;
                      
                      const value = record[sourceField];
                      return (
                        <div key={targetField} className="flex justify-between">
                          <span className="font-medium text-muted-foreground">
                            {REQUIRED_FIELDS.find(f => f.key === targetField)?.label ||
                             OPTIONAL_FIELDS.find(f => f.key === targetField)?.label ||
                             targetField}:
                          </span>
                          <span className="truncate max-w-48" title={String(value)}>
                            {String(value || 'N/A')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
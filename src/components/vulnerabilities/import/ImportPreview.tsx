import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  BarChart3,
  Clock,
  Loader2
} from 'lucide-react';
import { ImportSource, ImportPreview, ConnectionConfig } from './types/import';
import { toast } from 'sonner';

interface ImportPreviewComponentProps {
  source: ImportSource;
  file?: File | null;
  connectionConfig?: ConnectionConfig;
  onPreviewGenerated: (preview: ImportPreview) => void;
}

export default function ImportPreviewComponent({ 
  source, 
  file, 
  connectionConfig, 
  onPreviewGenerated 
}: ImportPreviewComponentProps) {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file || (connectionConfig && connectionConfig.api_url)) {
      generatePreview();
    }
  }, [file, connectionConfig]);

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let previewData: ImportPreview;

      if (file) {
        previewData = await generateFilePreview(file);
      } else if (connectionConfig) {
        previewData = await generateApiPreview(connectionConfig);
      } else {
        throw new Error('Nenhum arquivo ou configuração de API fornecida');
      }

      setPreview(previewData);
      onPreviewGenerated(previewData);
      toast.success('Preview gerado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao gerar preview: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFilePreview = async (file: File): Promise<ImportPreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = parseFileContent(content, file.name);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const generateApiPreview = async (config: ConnectionConfig): Promise<ImportPreview> => {
    // Simular chamada de API para preview
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock data baseado no tipo de fonte
    return {
      source_type: source.type,
      total_records: 150,
      sample_records: generateMockApiData(source.type),
      detected_fields: getExpectedFieldsForSource(source.type),
      field_mapping_suggestions: {},
      validation_results: {
        valid_records: 145,
        invalid_records: 5,
        warnings: [],
        errors: []
      },
      estimated_import_time: 30
    };
  };

  const parseFileContent = (content: string, fileName: string): ImportPreview => {
    const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
    let parsedRecords: any[] = [];
    let detectedFields: string[] = [];

    switch (fileExtension) {
      case '.csv':
        ({ records: parsedRecords, fields: detectedFields } = parseCSV(content));
        break;
      case '.xml':
      case '.nessus':
        ({ records: parsedRecords, fields: detectedFields } = parseXML(content, source.type));
        break;
      case '.json':
        ({ records: parsedRecords, fields: detectedFields } = parseJSON(content));
        break;
      default:
        throw new Error(`Formato de arquivo não suportado: ${fileExtension}`);
    }

    // Validar registros
    const validationResults = validateRecords(parsedRecords, source.type);

    return {
      source_type: source.type,
      total_records: parsedRecords.length,
      sample_records: parsedRecords.slice(0, 10),
      detected_fields,
      field_mapping_suggestions: generateFieldMappingSuggestions(detectedFields, source.type),
      validation_results: validationResults,
      estimated_import_time: Math.ceil(parsedRecords.length / 10) // 10 records per second
    };
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }
    
    return { records, fields: headers };
  };

  const parseXML = (content: string, sourceType: string) => {
    const records: any[] = [];
    let fields: string[] = [];

    if (sourceType === 'nessus_file') {
      // Parse Nessus XML
      const reportItemRegex = /<ReportItem[^>]*>(.*?)<\/ReportItem>/gs;
      let match;
      
      while ((match = reportItemRegex.exec(content)) !== null) {
        const itemContent = match[1];
        const record: any = {};
        
        // Extract attributes from ReportItem tag
        const reportItemTag = content.substring(match.index, match.index + match[0].indexOf('>') + 1);
        const pluginIDMatch = reportItemTag.match(/pluginID="([^"]*)"/);
        const pluginNameMatch = reportItemTag.match(/pluginName="([^"]*)"/);
        const severityMatch = reportItemTag.match(/severity="([^"]*)"/);
        
        if (pluginIDMatch) record.pluginID = pluginIDMatch[1];
        if (pluginNameMatch) record.pluginName = pluginNameMatch[1];
        if (severityMatch) record.severity = severityMatch[1];
        
        // Extract other fields
        const descMatch = itemContent.match(/<description>(.*?)<\/description>/s);
        if (descMatch) record.description = descMatch[1].trim();
        
        const solutionMatch = itemContent.match(/<solution>(.*?)<\/solution>/s);
        if (solutionMatch) record.solution = solutionMatch[1].trim();
        
        records.push(record);
      }
      
      fields = ['pluginID', 'pluginName', 'severity', 'description', 'solution'];
    } else if (sourceType === 'qualys_file') {
      // Parse Qualys XML
      const vulnRegex = /<VULN[^>]*>(.*?)<\/VULN>/gs;
      let match;
      
      while ((match = vulnRegex.exec(content)) !== null) {
        const vulnContent = match[1];
        const record: any = {};
        
        const qidMatch = vulnContent.match(/<QID>(.*?)<\/QID>/);
        if (qidMatch) record.QID = qidMatch[1];
        
        const titleMatch = vulnContent.match(/<TITLE>(.*?)<\/TITLE>/);
        if (titleMatch) record.TITLE = titleMatch[1];
        
        const severityMatch = vulnContent.match(/<SEVERITY>(.*?)<\/SEVERITY>/);
        if (severityMatch) record.SEVERITY = severityMatch[1];
        
        records.push(record);
      }
      
      fields = ['QID', 'TITLE', 'SEVERITY'];
    }
    
    return { records, fields };
  };

  const parseJSON = (content: string) => {
    const data = JSON.parse(content);
    let records = Array.isArray(data) ? data : [data];
    
    // Extract fields from first record
    const fields = records.length > 0 ? Object.keys(records[0]) : [];
    
    return { records, fields };
  };

  const validateRecords = (records: any[], sourceType: string) => {
    let validRecords = 0;
    let invalidRecords = 0;
    const warnings: any[] = [];
    const errors: any[] = [];

    records.forEach((record, index) => {
      let isValid = true;
      
      // Basic validation - check for required fields based on source type
      const requiredFields = getRequiredFieldsForSource(sourceType);
      
      requiredFields.forEach(field => {
        if (!record[field] || record[field].toString().trim() === '') {
          isValid = false;
          errors.push({
            id: `error_${index}_${field}`,
            record_index: index,
            field,
            error_type: 'validation',
            error_code: 'MISSING_REQUIRED_FIELD',
            message: `Campo obrigatório '${field}' está vazio`,
            timestamp: new Date()
          });
        }
      });

      if (isValid) {
        validRecords++;
      } else {
        invalidRecords++;
      }
    });

    return {
      valid_records: validRecords,
      invalid_records: invalidRecords,
      warnings,
      errors
    };
  };

  const getRequiredFieldsForSource = (sourceType: string): string[] => {
    const fieldMap: Record<string, string[]> = {
      nessus_file: ['pluginName', 'severity'],
      qualys_file: ['TITLE', 'SEVERITY'],
      openvas_file: ['name', 'severity'],
      csv_file: ['title', 'severity'],
      json_file: ['title', 'severity']
    };
    
    return fieldMap[sourceType] || ['title', 'severity'];
  };

  const getExpectedFieldsForSource = (sourceType: string): string[] => {
    const fieldMap: Record<string, string[]> = {
      nessus_api: ['pluginID', 'pluginName', 'severity', 'host', 'port', 'description'],
      qualys_api: ['QID', 'TITLE', 'SEVERITY', 'IP', 'PORT', 'DIAGNOSIS'],
      sonarqube_api: ['key', 'rule', 'severity', 'component', 'message', 'type'],
      aws_inspector_api: ['findingArn', 'title', 'severity', 'description', 'type'],
      veracode_api: ['issue_id', 'description', 'severity', 'cwe', 'file_name'],
      orca_security_api: ['alert_id', 'title', 'severity', 'asset_name', 'category', 'description']
    };
    
    return fieldMap[sourceType] || ['id', 'title', 'severity', 'description'];
  };

  const generateMockApiData = (sourceType: string) => {
    // Generate mock data based on source type
    const mockData = [];
    for (let i = 0; i < 5; i++) {
      if (sourceType === 'nessus_api') {
        mockData.push({
          pluginID: `${10000 + i}`,
          pluginName: `Vulnerability ${i + 1}`,
          severity: ['Critical', 'High', 'Medium', 'Low'][i % 4],
          host: `192.168.1.${100 + i}`,
          port: 80 + i,
          description: `Description for vulnerability ${i + 1}`
        });
      } else if (sourceType === 'qualys_api') {
        mockData.push({
          QID: `${90000 + i}`,
          TITLE: `Qualys Finding ${i + 1}`,
          SEVERITY: [5, 4, 3, 2][i % 4],
          IP: `10.0.0.${10 + i}`,
          DIAGNOSIS: `Diagnosis for finding ${i + 1}`
        });
      } else if (sourceType === 'orca_security_api') {
        mockData.push({
          alert_id: `orca-${Date.now()}-${i}`,
          title: `Orca Security Alert ${i + 1}`,
          severity: ['critical', 'high', 'medium', 'low'][i % 4],
          asset_name: `cloud-asset-${i + 1}`,
          category: ['security', 'vulnerability', 'compliance'][i % 3],
          description: `Cloud security finding ${i + 1} detected by Orca`,
          asset_type: 'EC2 Instance',
          cloud_provider: 'AWS',
          score: [90, 75, 50, 25][i % 4]
        });
      } else if (sourceType === 'sonarqube_api') {
        mockData.push({
          key: `sonar-issue-${i + 1}`,
          rule: `java:S${2000 + i}`,
          severity: ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR'][i % 4],
          component: `src/main/java/Component${i + 1}.java`,
          message: `Security vulnerability ${i + 1} detected`,
          type: 'VULNERABILITY',
          line: 10 + i,
          status: 'OPEN'
        });
      } else if (sourceType === 'aws_inspector_api') {
        mockData.push({
          findingArn: `arn:aws:inspector2:us-east-1:123456789012:finding/${Date.now()}-${i}`,
          title: `AWS Inspector Finding ${i + 1}`,
          severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'][i % 4],
          description: `Security finding ${i + 1} detected by AWS Inspector v2`,
          type: 'PACKAGE_VULNERABILITY',
          awsAccountId: '123456789012',
          status: 'ACTIVE'
        });
      } else if (sourceType === 'veracode_api') {
        mockData.push({
          issue_id: 1000 + i,
          description: `Veracode Security Issue ${i + 1}`,
          severity: [5, 4, 3, 2][i % 4],
          cwe: {
            id: `${79 + i}`,
            name: `CWE-${79 + i}: Security Weakness`
          },
          file_name: `Component${i + 1}.java`,
          file_line_number: 25 + i,
          scan_type: 'STATIC'
        });
      }
    }
    return mockData;
  };

  const generateFieldMappingSuggestions = (detectedFields: string[], sourceType: string) => {
    // Return suggested field mappings based on detected fields and source type
    return {};
  };

  const getSeverityBadgeColor = (severity: string | number) => {
    const severityStr = String(severity).toLowerCase();
    if (severityStr.includes('critical') || severityStr === '5') return 'bg-red-600 text-white';
    if (severityStr.includes('high') || severityStr === '4') return 'bg-orange-600 text-white';
    if (severityStr.includes('medium') || severityStr === '3') return 'bg-yellow-600 text-white';
    if (severityStr.includes('low') || severityStr === '2') return 'bg-green-600 text-white';
    return 'bg-blue-600 text-white';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Gerando preview dos dados...</p>
            <Progress value={33} className="w-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Erro ao gerar preview:</p>
                <p className="text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={generatePreview}>
                  Tentar Novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Aguardando dados para preview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumo da Importação
          </CardTitle>
          <CardDescription>
            Estatísticas dos dados que serão importados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{preview.total_records}</p>
              <p className="text-sm text-muted-foreground">Total de Registros</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{preview.validation_results.valid_records}</p>
              <p className="text-sm text-muted-foreground">Registros Válidos</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{preview.validation_results.invalid_records}</p>
              <p className="text-sm text-muted-foreground">Registros Inválidos</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{preview.detected_fields.length}</p>
              <p className="text-sm text-muted-foreground">Campos Detectados</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo estimado: {preview.estimated_import_time}s
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fonte: {source.name}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erros e Avisos */}
      {(preview.validation_results.errors.length > 0 || preview.validation_results.warnings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Problemas Detectados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview.validation_results.errors.length > 0 && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{preview.validation_results.errors.length} erro(s) encontrado(s):</p>
                    {preview.validation_results.errors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-sm">
                        • Linha {error.record_index + 1}: {error.message}
                      </p>
                    ))}
                    {preview.validation_results.errors.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ... e mais {preview.validation_results.errors.length - 5} erro(s)
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {preview.validation_results.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{preview.validation_results.warnings.length} aviso(s):</p>
                    {preview.validation_results.warnings.slice(0, 3).map((warning, index) => (
                      <p key={index} className="text-sm">
                        • Linha {warning.record_index + 1}: {warning.message}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview dos Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview dos Dados
          </CardTitle>
          <CardDescription>
            Primeiros {preview.sample_records.length} registros detectados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {preview.detected_fields.slice(0, 6).map(field => (
                    <TableHead key={field}>{field}</TableHead>
                  ))}
                  {preview.detected_fields.length > 6 && (
                    <TableHead>...</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.sample_records.map((record, index) => (
                  <TableRow key={index}>
                    {preview.detected_fields.slice(0, 6).map(field => {
                      const value = record[field];
                      return (
                        <TableCell key={field} className="max-w-xs">
                          {field.toLowerCase().includes('severity') ? (
                            <Badge className={getSeverityBadgeColor(value)}>
                              {String(value)}
                            </Badge>
                          ) : (
                            <span className="truncate block" title={String(value)}>
                              {String(value || 'N/A')}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                    {preview.detected_fields.length > 6 && (
                      <TableCell>
                        <span className="text-muted-foreground">
                          +{preview.detected_fields.length - 6} campos
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Campos Detectados */}
      <Card>
        <CardHeader>
          <CardTitle>Campos Detectados</CardTitle>
          <CardDescription>
            Todos os campos encontrados nos dados de origem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {preview.detected_fields.map(field => (
              <Badge key={field} variant="outline">
                {field}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
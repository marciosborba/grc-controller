import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Globe, 
  TestTube, 
  Play, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Settings,
  Download,
  X
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { ImportSource, ConnectionConfig, ImportPreview } from './types/import';
import FieldMappingInterface from './FieldMappingInterface';
import ImportPreviewComponent from './ImportPreview';
import ConnectionTester from './ConnectionTester';

interface ImportSourceSelectorProps {
  source: ImportSource;
  onClose: () => void;
}

export default function ImportSourceSelector({ source, onClose }: ImportSourceSelectorProps) {
  const [activeTab, setActiveTab] = useState('connection');
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const isFileSource = source.category === 'file' || source.type.includes('_file');
  const isApiSource = source.category === 'api' || source.type.includes('_api');

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!source.supportedFormats.includes(fileExtension)) {
      toast.error(`Tipo de arquivo não suportado. Use: ${source.supportedFormats.join(', ')}`);
      return;
    }

    setUploadedFile(file);
    toast.success(`Arquivo ${file.name} carregado com sucesso`);
    
    // Auto-advance to preview tab
    setActiveTab('preview');
  }, [source.supportedFormats]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: source.supportedFormats.reduce((acc, format) => {
      if (format === '.csv') acc['text/csv'] = ['.csv'];
      if (format === '.xml') acc['application/xml'] = ['.xml'];
      if (format === '.json') acc['application/json'] = ['.json'];
      if (format === '.nessus') acc['application/xml'] = ['.nessus'];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  // Connection configuration handlers
  const handleConnectionConfigChange = (field: string, value: string) => {
    setConnectionConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    if (!isApiSource) return;
    
    setConnectionStatus('testing');
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('success');
      toast.success('Conexão testada com sucesso!');
      setActiveTab('preview');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Erro ao testar conexão');
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Importação concluída com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro durante a importação');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderConnectionTab = () => {
    if (isFileSource) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Arquivo
            </CardTitle>
            <CardDescription>
              Faça upload do arquivo {source.supportedFormats.join(' ou ')} do {source.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Solte o arquivo aqui...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Arraste um arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Formatos suportados: {source.supportedFormats.join(', ')} (máx. 100MB)
                  </p>
                  {uploadedFile && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {source.documentationUrl && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Consulte a documentação oficial para formatos de arquivo</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={source.documentationUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Docs
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    }

    if (isApiSource) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuração da API
              </CardTitle>
              <CardDescription>
                Configure a conexão com a API do {source.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL da API *</Label>
                  <Input
                    placeholder="https://api.exemplo.com"
                    value={connectionConfig.api_url || ''}
                    onChange={(e) => handleConnectionConfigChange('api_url', e.target.value)}
                  />
                </div>

                {source.authType === 'api_key' && (
                  <div className="space-y-2">
                    <Label>API Key *</Label>
                    <Input
                      type="password"
                      placeholder="Sua chave de API"
                      value={connectionConfig.api_key || ''}
                      onChange={(e) => handleConnectionConfigChange('api_key', e.target.value)}
                    />
                  </div>
                )}

                {source.authType === 'basic_auth' && (
                  <>
                    <div className="space-y-2">
                      <Label>Usuário *</Label>
                      <Input
                        placeholder="Nome de usuário"
                        value={connectionConfig.username || ''}
                        onChange={(e) => handleConnectionConfigChange('username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha *</Label>
                      <Input
                        type="password"
                        placeholder="Senha"
                        value={connectionConfig.password || ''}
                        onChange={(e) => handleConnectionConfigChange('password', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {source.authType === 'token' && (
                  <div className="space-y-2">
                    <Label>Token *</Label>
                    <Input
                      type="password"
                      placeholder="Token de acesso"
                      value={connectionConfig.token || ''}
                      onChange={(e) => handleConnectionConfigChange('token', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Parâmetros Adicionais</Label>
                <Textarea
                  placeholder="Parâmetros adicionais em formato JSON (opcional)"
                  value={connectionConfig.tool_specific?.additionalParams || ''}
                  onChange={(e) => handleConnectionConfigChange('tool_specific', {
                    ...connectionConfig.tool_specific,
                    additionalParams: e.target.value
                  })}
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-2">
                  {connectionStatus === 'success' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  )}
                  {connectionStatus === 'error' && (
                    <Badge variant="destructive">
                      <X className="h-3 w-3 mr-1" />
                      Erro de Conexão
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={handleTestConnection}
                  disabled={!connectionConfig.api_url || connectionStatus === 'testing'}
                  variant="outline"
                >
                  {connectionStatus === 'testing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {source.documentationUrl && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Consulte a documentação da API para configuração detalhada</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={source.documentationUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Documentação
                    </a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    return null;
  };

  const canProceedToPreview = () => {
    if (isFileSource) return uploadedFile !== null;
    if (isApiSource) return connectionStatus === 'success';
    return false;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">
            {isFileSource ? 'Upload' : 'Conexão'}
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!canProceedToPreview()}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="mapping" disabled={!preview}>
            Mapeamento
          </TabsTrigger>
          <TabsTrigger value="import" disabled={!preview}>
            Importar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          {renderConnectionTab()}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <ImportPreviewComponent
            source={source}
            file={uploadedFile}
            connectionConfig={connectionConfig}
            onPreviewGenerated={setPreview}
          />
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          {preview && (
            <FieldMappingInterface
              source={source}
              preview={preview}
              onMappingChange={() => {}}
            />
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Confirmar Importação
              </CardTitle>
              <CardDescription>
                Revise as configurações e inicie a importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preview && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{preview.total_records}</p>
                    <p className="text-sm text-muted-foreground">Total de Registros</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {preview.validation_results.valid_records}
                    </p>
                    <p className="text-sm text-muted-foreground">Registros Válidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {preview.validation_results.invalid_records}
                    </p>
                    <p className="text-sm text-muted-foreground">Registros Inválidos</p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Importando vulnerabilidades...</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={isProcessing || !preview}>
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Importação
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
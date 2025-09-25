import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Lock,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  EthicsReportFormData,
  EthicsReportSeverity,
  ETHICS_SEVERITY_LABELS
} from '@/types/ethics';

interface EthicsCategory {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  default_severity: EthicsReportSeverity;
  sla_days: number;
}

interface EthicsSettings {
  public_submissions_enabled: boolean;
  anonymous_submissions_enabled: boolean;
  require_evidence: boolean;
  welcome_message: string;
  disclaimer_text: string;
  ethics_committee_emails: string[];
}

const PublicEthicsReportPage: React.FC = () => {
  const [formData, setFormData] = useState<EthicsReportFormData>({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    is_anonymous: true,
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    evidence_files: [],
    source: 'public_web',
    reporter_type: 'external',
    tags: []
  });

  const [categories, setCategories] = useState<EthicsCategory[]>([]);
  const [settings, setSettings] = useState<EthicsSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    protocol?: string;
    message: string;
  } | null>(null);
  const [step, setStep] = useState<'form' | 'success' | 'status-check'>('form');
  const [lookupProtocol, setLookupProtocol] = useState('');

  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      // Buscar configurações (sem tenant específico para página pública)
      const { data: settingsData } = await supabase
        .from('ethics_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsData) {
        setSettings(settingsData);
      }

      // Buscar categorias ativas
      const { data: categoriesData } = await supabase
        .from('ethics_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados públicos:', error);
      toast.error('Erro ao carregar informações do canal de ética');
    }
  };

  const handleInputChange = (field: keyof EthicsReportFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-ajustar severidade baseada na categoria
    if (field === 'category') {
      const selectedCategory = categories.find(cat => cat.code === value);
      if (selectedCategory) {
        setFormData(prev => ({
          ...prev,
          severity: selectedCategory.default_severity
        }));
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      evidence_files: [...(prev.evidence_files || []), ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence_files: prev.evidence_files?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings?.public_submissions_enabled) {
      toast.error('O canal de denúncias está temporariamente indisponível');
      return;
    }

    if (!formData.is_anonymous && (!formData.reporter_email || !formData.reporter_name)) {
      toast.error('Para denúncias identificadas, nome e email são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Usar tenant padrão para denúncias públicas (primeiro tenant encontrado)
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id')
        .limit(1)
        .single();

      if (!tenantData) {
        throw new Error('Sistema temporariamente indisponível');
      }

      const reportData = {
        tenant_id: tenantData.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        priority: formData.severity === 'critical' ? 'critical' : 'medium',
        status: 'open',
        is_anonymous: formData.is_anonymous,
        reporter_name: formData.is_anonymous ? null : formData.reporter_name,
        reporter_email: formData.is_anonymous ? null : formData.reporter_email,
        reporter_phone: formData.is_anonymous ? null : formData.reporter_phone,
        source: 'public_web',
        reporter_type: 'external',
        tags: formData.tags || []
      };

      const { data, error } = await supabase
        .from('ethics_reports')
        .insert([reportData])
        .select('protocol_number')
        .single();

      if (error) throw error;

      // Registrar atividade de criação
      await supabase
        .from('ethics_activities')
        .insert([{
          tenant_id: tenantData.id,
          report_id: data.id,
          activity_type: 'created',
          description: 'Denúncia criada via canal público',
          performed_by_name: formData.is_anonymous ? 'Anônimo' : formData.reporter_name
        }]);

      // TODO: Upload de arquivos se houver
      // TODO: Enviar notificação automática

      setSubmissionResult({
        success: true,
        protocol: data.protocol_number,
        message: settings?.welcome_message || 'Sua denúncia foi recebida com sucesso'
      });
      setStep('success');

      toast.success('Denúncia enviada com sucesso!');

    } catch (error: any) {
      console.error('Erro ao enviar denúncia:', error);
      setSubmissionResult({
        success: false,
        message: error.message || 'Erro ao enviar denúncia. Tente novamente.'
      });
      toast.error('Erro ao enviar denúncia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusLookup = async () => {
    if (!lookupProtocol.trim()) {
      toast.error('Digite um protocolo para consulta');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ethics_reports')
        .select(`
          protocol_number,
          status,
          created_at,
          last_activity_at,
          category,
          severity
        `)
        .eq('protocol_number', lookupProtocol.trim())
        .single();

      if (error || !data) {
        toast.error('Protocolo não encontrado');
        return;
      }

      // Mostrar informações básicas do status
      const statusLabels = {
        open: 'Aberto',
        triaging: 'Em Triagem',
        investigating: 'Investigando',
        in_review: 'Em Análise',
        resolved: 'Resolvido',
        closed: 'Fechado',
        escalated: 'Escalado'
      };

      const categoryName = categories.find(cat => cat.code === data.category)?.name || data.category;

      toast.success(
        `Protocolo: ${data.protocol_number}\nStatus: ${statusLabels[data.status as keyof typeof statusLabels]}\nCategoria: ${categoryName}\nÚltima atualização: ${new Date(data.last_activity_at).toLocaleDateString('pt-BR')}`,
        { duration: 8000 }
      );

    } catch (error) {
      console.error('Erro ao consultar protocolo:', error);
      toast.error('Erro ao consultar protocolo');
    }
  };

  if (!settings || !settings.public_submissions_enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Canal Temporariamente Indisponível</h3>
            <p className="text-muted-foreground">
              O canal de denúncias está em manutenção. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success' && submissionResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Denúncia Enviada com Sucesso!</h2>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-6">
              <div className="text-sm text-muted-foreground mb-2">Seu Protocolo de Acompanhamento:</div>
              <div className="text-3xl font-mono font-bold text-green-700 dark:text-green-400 mb-4">
                {submissionResult.protocol}
              </div>
              <div className="text-sm text-muted-foreground">
                Guarde este protocolo para acompanhar o andamento de sua denúncia
              </div>
            </div>

            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {submissionResult.message}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="text-left">
                <h4 className="font-semibold mb-2">📧 Próximos Passos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Análise inicial em até 48h</li>
                  <li>• Você receberá atualizações {formData.is_anonymous ? 'nesta página' : 'por email'}</li>
                  <li>• Investigação conforme a severidade</li>
                  <li>• Resolução dentro do prazo estabelecido</li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="font-semibold mb-2">🔐 Garantias:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Confidencialidade absoluta</li>
                  <li>• Proteção contra retaliações</li>
                  <li>• Investigação imparcial</li>
                  <li>• Acompanhamento transparente</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => {
                setStep('form');
                setFormData({
                  title: '',
                  description: '',
                  category: '',
                  severity: 'medium',
                  is_anonymous: true,
                  reporter_name: '',
                  reporter_email: '',
                  reporter_phone: '',
                  evidence_files: [],
                  source: 'public_web',
                  reporter_type: 'external',
                  tags: []
                });
                setSubmissionResult(null);
              }}>
                Nova Denúncia
              </Button>
              <Button variant="outline" onClick={() => setStep('status-check')}>
                Consultar Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'status-check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <CardTitle>Consultar Status da Denúncia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="protocol">Protocolo de Acompanhamento</Label>
              <Input
                id="protocol"
                value={lookupProtocol}
                onChange={(e) => setLookupProtocol(e.target.value)}
                placeholder="Ex: ETH-2024-0001"
                className="font-mono"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleStatusLookup} className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Consultar
              </Button>
              <Button variant="outline" onClick={() => setStep('form')}>
                Voltar
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Digite o protocolo que você recebeu após enviar sua denúncia para consultar o status atual.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Canal de Ética</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nosso canal confidencial para denúncias de questões éticas. 
            Sua contribuição é fundamental para manter um ambiente íntegro e respeitoso.
          </p>
        </div>

        {/* Informações e Garantias */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Lock className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Confidencial</h3>
              <p className="text-sm text-muted-foreground">
                Garantimos absoluto sigilo sobre sua identidade e informações
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Disponível 24h</h3>
              <p className="text-sm text-muted-foreground">
                Canal aberto 24 horas, 7 dias por semana para receber denúncias
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Acompanhamento</h3>
              <p className="text-sm text-muted-foreground">
                Receba um protocolo para acompanhar o andamento de sua denúncia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário Principal */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Formulário de Denúncia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Denúncia */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Switch
                      id="anonymous"
                      checked={formData.is_anonymous}
                      onCheckedChange={(checked) => handleInputChange('is_anonymous', checked)}
                    />
                    <Label htmlFor="anonymous" className="flex items-center space-x-2">
                      {formData.is_anonymous ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Denúncia Anônima</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Denúncia Identificada</span>
                        </>
                      )}
                    </Label>
                    <Badge variant={formData.is_anonymous ? "secondary" : "default"}>
                      {formData.is_anonymous ? "Anônima" : "Identificada"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_anonymous 
                      ? 'Sua identidade será mantida em sigilo absoluto. Você receberá um protocolo para acompanhamento.' 
                      : 'Suas informações serão utilizadas apenas para comunicação sobre o caso e mantidas confidenciais.'}
                  </p>
                </div>

                {/* Informações da Denúncia */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título da Denúncia *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                        placeholder="Descreva brevemente a situação"
                        maxLength={200}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formData.title.length}/200 caracteres
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de denúncia" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.code} value={category.code}>
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.category && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          {categories.find(cat => cat.code === formData.category)?.description}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="severity">Gravidade *</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value) => handleInputChange('severity', value as EthicsReportSeverity)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ETHICS_SEVERITY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição Detalhada *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      rows={8}
                      placeholder="Descreva detalhadamente o ocorrido, incluindo datas, locais, pessoas envolvidas e qualquer informação relevante..."
                      maxLength={5000}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/5000 caracteres
                    </div>
                  </div>
                </div>

                {/* Informações do Denunciante (se não anônimo) */}
                {!formData.is_anonymous && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Informações para Contato</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="reporter_name">Nome Completo *</Label>
                          <Input
                            id="reporter_name"
                            value={formData.reporter_name}
                            onChange={(e) => handleInputChange('reporter_name', e.target.value)}
                            required={!formData.is_anonymous}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reporter_email">Email *</Label>
                          <Input
                            id="reporter_email"
                            type="email"
                            value={formData.reporter_email}
                            onChange={(e) => handleInputChange('reporter_email', e.target.value)}
                            required={!formData.is_anonymous}
                            placeholder="seu.email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reporter_phone">Telefone</Label>
                          <Input
                            id="reporter_phone"
                            value={formData.reporter_phone}
                            onChange={(e) => handleInputChange('reporter_phone', e.target.value)}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Upload de Evidências */}
                <Separator />
                <div>
                  <Label>Evidências (Opcional)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.xlsx"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Clique para enviar documentos, fotos ou outros arquivos
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, JPG, PNG, TXT, CSV, XLSX (máx. 10MB cada)
                        </p>
                      </div>
                    </Label>
                    
                    {formData.evidence_files && formData.evidence_files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.evidence_files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Disclaimer */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    {settings.disclaimer_text}
                  </AlertDescription>
                </Alert>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.description || !formData.category}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Enviar Denúncia
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('status-check')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Consultar Status
                  </Button>
                </div>

                {/* Informações de Contato Alternativo */}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Canais Alternativos de Contato:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      <span>
                        Email: {settings.ethics_committee_emails?.[0] || 'etica@empresa.com'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-green-500" />
                      <span>Telefone: 0800-123-4567</span>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicEthicsReportPage;
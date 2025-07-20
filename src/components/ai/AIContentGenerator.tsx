import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Wand2,
  Loader2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIContentGeneratorProps {
  type: 'questionnaire' | 'risk_assessment' | 'audit_plan' | 'policy';
  onGenerated?: (content: any) => void;
  trigger?: React.ReactNode;
}

interface GenerationParams {
  framework?: string;
  questionCount?: number;
  topic?: string;
  focus?: string;
  area?: string;
  context?: string;
  scope?: string;
  department?: string;
  objectives?: string;
  type?: string;
  organization?: string;
  requirements?: string;
}

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  type,
  onGenerated,
  trigger
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [params, setParams] = useState<GenerationParams>({});

  const getTypeConfig = () => {
    const configs = {
      questionnaire: {
        title: 'Gerador de Questionário',
        icon: FileText,
        color: 'text-purple-500',
        description: 'Crie questionários de assessment automaticamente'
      },
      risk_assessment: {
        title: 'Avaliador de Riscos',
        icon: AlertTriangle,
        color: 'text-red-500',
        description: 'Gere avaliações de risco estruturadas'
      },
      audit_plan: {
        title: 'Plano de Auditoria',
        icon: CheckCircle,
        color: 'text-green-500',
        description: 'Crie planos de auditoria detalhados'
      },
      policy: {
        title: 'Gerador de Políticas',
        icon: FileText,
        color: 'text-indigo-500',
        description: 'Desenvolva políticas corporativas estruturadas'
      }
    };
    return configs[type];
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generator', {
        body: {
          type,
          parameters: params
        }
      });

      if (error) throw error;

      setGeneratedContent(data.data);
      if (onGenerated) {
        onGenerated(data.data);
      }

      toast({
        title: 'Sucesso',
        description: 'Conteúdo gerado com sucesso!',
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar conteúdo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
    toast({
      title: 'Copiado',
      description: 'Conteúdo copiado para a área de transferência',
    });
  };

  const downloadContent = () => {
    const blob = new Blob([JSON.stringify(generatedContent, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  const renderForm = () => {
    switch (type) {
      case 'questionnaire':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="framework">Framework</Label>
              <Select 
                value={params.framework} 
                onValueChange={(value) => setParams({...params, framework: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                  <SelectItem value="NIST">NIST</SelectItem>
                  <SelectItem value="LGPD">LGPD</SelectItem>
                  <SelectItem value="SOX">SOX</SelectItem>
                  <SelectItem value="COSO">COSO</SelectItem>
                  <SelectItem value="Custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="topic">Tópico Principal</Label>
              <Input
                id="topic"
                value={params.topic || ''}
                onChange={(e) => setParams({...params, topic: e.target.value})}
                placeholder="Ex: Controles de segurança da informação"
              />
            </div>
            
            <div>
              <Label htmlFor="questionCount">Número de Perguntas</Label>
              <Select 
                value={params.questionCount?.toString()} 
                onValueChange={(value) => setParams({...params, questionCount: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quantidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 perguntas</SelectItem>
                  <SelectItem value="10">10 perguntas</SelectItem>
                  <SelectItem value="15">15 perguntas</SelectItem>
                  <SelectItem value="20">20 perguntas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="focus">Foco da Avaliação</Label>
              <Textarea
                id="focus"
                value={params.focus || ''}
                onChange={(e) => setParams({...params, focus: e.target.value})}
                placeholder="Descreva o foco específico do questionário..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'risk_assessment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="area">Área de Risco</Label>
              <Select 
                value={params.area} 
                onValueChange={(value) => setParams({...params, area: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cybersecurity">Segurança Cibernética</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="strategic">Estratégico</SelectItem>
                  <SelectItem value="technology">Tecnologia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="context">Contexto Organizacional</Label>
              <Input
                id="context"
                value={params.context || ''}
                onChange={(e) => setParams({...params, context: e.target.value})}
                placeholder="Ex: Empresa de tecnologia com 500 funcionários"
              />
            </div>
            
            <div>
              <Label htmlFor="scope">Escopo da Avaliação</Label>
              <Textarea
                id="scope"
                value={params.scope || ''}
                onChange={(e) => setParams({...params, scope: e.target.value})}
                placeholder="Descreva o escopo específico da avaliação de risco..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'audit_plan':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="area">Área de Auditoria</Label>
              <Select 
                value={params.area} 
                onValueChange={(value) => setParams({...params, area: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial_controls">Controles Financeiros</SelectItem>
                  <SelectItem value="it_controls">Controles de TI</SelectItem>
                  <SelectItem value="operational">Processos Operacionais</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="cybersecurity">Segurança Cibernética</SelectItem>
                  <SelectItem value="data_privacy">Privacidade de Dados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={params.department || ''}
                onChange={(e) => setParams({...params, department: e.target.value})}
                placeholder="Ex: Departamento de TI"
              />
            </div>
            
            <div>
              <Label htmlFor="objectives">Objetivos da Auditoria</Label>
              <Textarea
                id="objectives"
                value={params.objectives || ''}
                onChange={(e) => setParams({...params, objectives: e.target.value})}
                placeholder="Descreva os objetivos específicos da auditoria..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'policy':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="policyType">Tipo de Política</Label>
              <Select 
                value={params.type} 
                onValueChange={(value) => setParams({...params, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">Segurança da Informação</SelectItem>
                  <SelectItem value="privacy">Privacidade de Dados</SelectItem>
                  <SelectItem value="access_control">Controle de Acesso</SelectItem>
                  <SelectItem value="incident_response">Resposta a Incidentes</SelectItem>
                  <SelectItem value="business_continuity">Continuidade de Negócios</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="organization">Organização</Label>
              <Input
                id="organization"
                value={params.organization || ''}
                onChange={(e) => setParams({...params, organization: e.target.value})}
                placeholder="Ex: Empresa de tecnologia"
              />
            </div>
            
            <div>
              <Label htmlFor="requirements">Requisitos Específicos</Label>
              <Textarea
                id="requirements"
                value={params.requirements || ''}
                onChange={(e) => setParams({...params, requirements: e.target.value})}
                placeholder="Descreva requisitos regulatórios ou específicos..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2">
            <Wand2 className="h-4 w-4" />
            <span>Gerar com IA</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <IconComponent className={`h-5 w-5 ${config.color}`} />
            <span>{config.title}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parâmetros de Geração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderForm()}
                
                <Button 
                  onClick={generateContent} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar Conteúdo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conteúdo Gerado</CardTitle>
                  {generatedContent && (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadContent}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Badge variant="secondary">
                        Gerado com IA
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!generatedContent ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconComponent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure os parâmetros e clique em "Gerar Conteúdo" para ver o resultado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      {JSON.stringify(generatedContent, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
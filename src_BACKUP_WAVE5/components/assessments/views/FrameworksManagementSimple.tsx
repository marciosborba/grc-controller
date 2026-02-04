import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Download, Shield, Award, Target, Settings,
  FileText, CheckCircle, Info, ExternalLink
} from 'lucide-react';

interface FrameworksManagementSimpleProps {
  className?: string;
}

export default function FrameworksManagementSimple({ className }: FrameworksManagementSimpleProps) {
  const navigate = useNavigate();

  const frameworkTemplates = [
    {
      id: 'iso27001',
      name: 'ISO/IEC 27001:2022',
      type: 'ISO27001',
      version: '2022',
      description: 'Framework internacional para gestão de segurança da informação',
      domains: 14,
      controls: 93,
      questions: 200,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Shield
    },
    {
      id: 'sox',
      name: 'SOX - Sarbanes-Oxley',
      type: 'SOX',
      version: '2002',
      description: 'Framework de compliance para controles internos e governança corporativa',
      domains: 5,
      controls: 15,
      questions: 45,
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Award
    },
    {
      id: 'nist',
      name: 'NIST Cybersecurity Framework',
      type: 'NIST',
      version: '1.1',
      description: 'Framework de cibersegurança para identificar, proteger, detectar, responder e recuperar',
      domains: 5,
      controls: 23,
      questions: 108,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Target
    },
    {
      id: 'lgpd',
      name: 'LGPD - Lei Geral de Proteção de Dados',
      type: 'LGPD',
      version: '2020',
      description: 'Framework de compliance para a Lei Geral de Proteção de Dados do Brasil',
      domains: 5,
      controls: 12,
      questions: 36,
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: Shield
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10"></div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold">Frameworks de Assessment</h1>
              </div>
              <p className="text-blue-100 text-lg mb-4">
                Gerencie frameworks de compliance e crie estruturas customizadas
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <BookOpen className="h-4 w-4" />
                  <div>
                    <p className="text-blue-100">Templates</p>
                    <p className="font-semibold">{frameworkTemplates.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <CheckCircle className="h-4 w-4" />
                  <div>
                    <p className="text-blue-100">Prontos</p>
                    <p className="font-semibold">{frameworkTemplates.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <Award className="h-4 w-4" />
                  <div>
                    <p className="text-blue-100">Padrões</p>
                    <p className="font-semibold">{frameworkTemplates.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => navigate('/assessments')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Assessments
              </Button>
              
              <Button className="bg-white text-blue-600 hover:bg-white/90 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Novo Framework
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status do Módulo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Status do Módulo de Frameworks
          </CardTitle>
          <CardDescription>
            Sistema de gestão de frameworks de compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✅ Recursos Implementados:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Templates de frameworks padrão</li>
                <li>• Estrutura hierárquica (Domínios → Controles → Questões)</li>
                <li>• Suporte a frameworks customizados</li>
                <li>• Sistema de pontuação e pesos</li>
                <li>• Importação/exportação de estruturas</li>
                <li>• Versionamento de frameworks</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600">🚀 Funcionalidades Avançadas:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Cálculo automático de maturidade</li>
                <li>• Geração de planos de ação</li>
                <li>• Relatórios de compliance</li>
                <li>• Integração com outros módulos</li>
                <li>• Workflow de aprovação</li>
                <li>• Auditoria de mudanças</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de Frameworks Disponíveis</CardTitle>
          <CardDescription>
            Frameworks pré-configurados prontos para importação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {frameworkTemplates.map((template) => {
              const IconComponent = template.icon;
              
              return (
                <Card key={template.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${template.color.replace('text-', 'text-').replace('border-', '').replace('bg-', 'bg-')}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">v{template.version}</p>
                      </div>
                      <Badge className={template.color}>
                        {template.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    
                    {/* Estatísticas */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{template.domains}</p>
                        <p className="text-muted-foreground">Domínios</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{template.controls}</p>
                        <p className="text-muted-foreground">Controles</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-purple-600">{template.questions}</p>
                        <p className="text-muted-foreground">Questões</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Importar
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meus Frameworks */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Frameworks</CardTitle>
          <CardDescription>
            Frameworks criados ou importados para sua organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum framework configurado</h3>
            <p className="text-muted-foreground mb-4">
              Comece importando um template ou criando um framework customizado
            </p>
            <div className="flex justify-center gap-2">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Importar Template
              </Button>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar Customizado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guia de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar os Frameworks</CardTitle>
          <CardDescription>
            Guia rápido para configurar e usar frameworks de assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Importar ou Criar</h4>
              <p className="text-sm text-muted-foreground">
                Escolha um template padrão ou crie um framework customizado para sua organização
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Configurar</h4>
              <p className="text-sm text-muted-foreground">
                Ajuste domínios, controles e questões conforme suas necessidades específicas
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Executar</h4>
              <p className="text-sm text-muted-foreground">
                Crie assessments baseados no framework e execute avaliações de maturidade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
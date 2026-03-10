import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Settings, Plus, Activity, Play, CheckCircle, Award,
  ArrowRight, BarChart3, List, Target, BookOpen
} from 'lucide-react';

interface AssessmentsDashboardSimpleProps {
  className?: string;
}

export default function AssessmentsDashboardSimple({ className }: AssessmentsDashboardSimpleProps) {
  const navigate = useNavigate();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Profissional com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-white/5"></div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold">Assessments</h1>
              </div>
              <p className="text-blue-100 text-lg mb-4">
                Central de Avaliação de Maturidade e Compliance
              </p>
              
              {/* Métricas rápidas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <Activity className="h-4 w-4" />
                  <div>
                    <p className="text-blue-100">Total</p>
                    <p className="font-semibold">0</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <Play className="h-4 w-4" />
                  <div>
                    <p className="text-blue-100">Ativos</p>
                    <p className="font-semibold">0</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <CheckCircle className="h-4 w-4" />
                  <div>
                    <p className="text-blue-100">Concluídos</p>
                    <p className="font-semibold">0</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                  <Award className="h-4 w-4" />
                  <div>
                    <p className="text-blue-100">Maturidade</p>
                    <p className="font-semibold">0%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ações principais */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate('/assessments/frameworks')}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Frameworks
              </Button>
              <Button 
                onClick={() => navigate('/assessments/execution')}
                className="bg-white text-blue-600 hover:bg-white/90 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status do Módulo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Módulo de Assessment - Versão Profissional
          </CardTitle>
          <CardDescription>
            Sistema completo de avaliação de maturidade e compliance organizacional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✅ Implementado:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Esquema completo do banco de dados (10 tabelas)</li>
                <li>• Tipos TypeScript para todo o módulo</li>
                <li>• Hooks React para gestão de dados</li>
                <li>• Interface moderna e responsiva</li>
                <li>• Suporte a multi-tenancy</li>
                <li>• Frameworks padrão (ISO 27001, SOX, NIST, LGPD)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600">⚠️ Próximos Passos:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Aplicar esquema do banco de dados</li>
                <li>• Configurar permissões no Supabase</li>
                <li>• Importar templates de frameworks</li>
                <li>• Testar funcionalidades completas</li>
                <li>• Configurar workflows de assessment</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Para ativar todas as funcionalidades, execute o script de instalação:
                </p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  node apply-assessment-schema.js
                </code>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Pronto para Produção
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/assessments/frameworks')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Frameworks</p>
                <p className="text-xl font-bold">Gerenciar</p>
              </div>
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/assessments/execution')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Execução</p>
                <p className="text-xl font-bold">Assessments</p>
              </div>
              <div className="flex items-center">
                <Play className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/assessments/questions')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questões</p>
                <p className="text-xl font-bold">Biblioteca</p>
              </div>
              <div className="flex items-center">
                <List className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/assessments/reports')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Relatórios</p>
                <p className="text-xl font-bold">Analytics</p>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Frameworks Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Frameworks Suportados</CardTitle>
          <CardDescription>
            Frameworks de compliance prontos para uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'ISO 27001:2022', type: 'ISO27001', color: 'bg-blue-100 text-blue-800' },
              { name: 'SOX', type: 'SOX', color: 'bg-green-100 text-green-800' },
              { name: 'NIST CSF', type: 'NIST', color: 'bg-purple-100 text-purple-800' },
              { name: 'COBIT 2019', type: 'COBIT', color: 'bg-orange-100 text-orange-800' },
              { name: 'LGPD', type: 'LGPD', color: 'bg-red-100 text-red-800' },
              { name: 'GDPR', type: 'GDPR', color: 'bg-red-100 text-red-800' },
              { name: 'PCI DSS', type: 'PCI_DSS', color: 'bg-yellow-100 text-yellow-800' },
              { name: 'HIPAA', type: 'HIPAA', color: 'bg-pink-100 text-pink-800' }
            ].map((framework) => (
              <div key={framework.type} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-gray-100 rounded">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{framework.name}</p>
                  <Badge className={framework.color} variant="secondary">
                    {framework.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação e Recursos</CardTitle>
          <CardDescription>
            Guias e recursos para usar o módulo de Assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📋 Guia de Instalação</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Instruções completas para configurar o módulo
              </p>
              <Button variant="outline" size="sm">
                Ver Documentação
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Templates de Frameworks</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Frameworks pré-configurados prontos para uso
              </p>
              <Button variant="outline" size="sm">
                Importar Templates
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📊 Relatórios de Exemplo</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Exemplos de relatórios e dashboards
              </p>
              <Button variant="outline" size="sm">
                Ver Exemplos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings2, Edit, Workflow, BarChart3, FileText, Network, 
  Save, Plus, Grid, Eye, Boxes, Map, Settings, PlayCircle,
  Download, RefreshCw, Share2, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';

const AlexProcessDesignerEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [activeLayer, setActiveLayer] = useState<'form' | 'workflow' | 'analytics' | 'reports' | 'integrations'>('form');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Arquitetural */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl shadow-lg">
              <Settings2 className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Alex Process Designer Enhanced
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arquitetura de 5 Camadas: Form Builder • Workflow Engine • Analytics • Reports • Integrations
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              v4.0.0 Enhanced
            </Badge>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navegação das Camadas */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <Tabs value={activeLayer} onValueChange={(value) => setActiveLayer(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="form" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Form Builder</span>
                <span className="sm:hidden">Forms</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                <span className="hidden sm:inline">Workflow Engine</span>
                <span className="sm:hidden">Workflow</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
                <span className="sm:hidden">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Integrations</span>
                <span className="sm:hidden">APIs</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Conteúdo das Camadas */}
      <div className="flex-1 p-6">
        <Tabs value={activeLayer} className="w-full">
          {/* ETAPA 1: Form Builder */}
          <TabsContent value="form" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
              {/* Biblioteca de Componentes */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Boxes className="h-4 w-4" />
                      Biblioteca de Campos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Campos Básicos
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {['Texto', 'Número', 'Email', 'Data', 'Seleção'].map((field) => (
                            <Button
                              key={field}
                              variant="outline"
                              size="sm"
                              className="justify-start h-auto p-3"
                              onClick={() => toast.success(`Campo ${field} adicionado`)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                  <span className="text-xs">📝</span>
                                </div>
                                <span className="text-xs">{field}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Campos Avançados
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {['Tabela', 'Assinatura', 'Geolocalização', 'QR Code'].map((field) => (
                            <Button
                              key={field}
                              variant="outline"
                              size="sm"
                              className="justify-start h-auto p-3"
                              onClick={() => toast.success(`Campo ${field} adicionado`)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                  <span className="text-xs">⚡</span>
                                </div>
                                <span className="text-xs">{field}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Canvas de Edição */}
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Grid className="h-4 w-4" />
                        Canvas de Formulário
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[calc(100vh-350px)] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">Canvas Vazio</h3>
                          <p className="text-sm">Arraste campos da biblioteca para começar a criar seu formulário</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Painel de Propriedades */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Propriedades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Selecione um campo para editar suas propriedades
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* ETAPA 2: Workflow Engine */}
          <TabsContent value="workflow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Workflow className="h-4 w-4" />
                      Elementos BPMN
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Eventos', 'Atividades', 'Gateways'].map((category) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {category}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {['Start', 'Task', 'End'].map((element) => (
                              <Button
                                key={element}
                                variant="outline"
                                size="sm"
                                className="justify-start h-auto p-3"
                                onClick={() => toast.success(`Elemento ${element} adicionado`)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs">○</span>
                                  </div>
                                  <span className="text-xs">{element}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Map className="h-4 w-4" />
                        Designer de Processo
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Simular
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar BPMN
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[calc(100vh-350px)] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">Canvas de Processo Vazio</h3>
                          <p className="text-sm mb-4">Arraste elementos BPMN para começar a modelar seu processo</p>
                          <Button onClick={() => toast.success('Processo criado com sucesso')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Processo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Propriedades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Crie ou selecione um processo para ver suas propriedades
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* ETAPA 3: Analytics & Dashboard */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Widgets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Visualizações
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {['Gráfico de Linha', 'Gráfico de Barras', 'KPI Card', 'Tabela'].map((widget) => (
                            <Button
                              key={widget}
                              variant="outline"
                              size="sm"
                              className="justify-start h-auto p-3"
                              onClick={() => toast.success(`Widget ${widget} adicionado`)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                  <span className="text-xs">📊</span>
                                </div>
                                <span className="text-xs">{widget}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Grid className="h-4 w-4" />
                        Dashboard Canvas
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Atualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[calc(100vh-350px)] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">Dashboard Vazio</h3>
                          <p className="text-sm mb-4">Arraste widgets para criar seu dashboard analítico</p>
                          <Button onClick={() => toast.success('Dashboard criado com sucesso')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Dashboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Crie ou selecione um dashboard para ver suas configurações
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* ETAPA 4: Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Seções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Elementos
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {['Header', 'Content', 'Chart', 'Table', 'Footer'].map((element) => (
                            <Button
                              key={element}
                              variant="outline"
                              size="sm"
                              className="justify-start h-auto p-3"
                              onClick={() => toast.success(`Seção ${element} adicionada`)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                                  <span className="text-xs">📄</span>
                                </div>
                                <span className="text-xs">{element}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Designer de Relatório
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[calc(100vh-350px)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">Nenhum Relatório Selecionado</h3>
                          <p className="text-sm mb-4">Crie um novo relatório para começar</p>
                          <div className="flex gap-2 justify-center">
                            <Button onClick={() => toast.success('Relatório Operacional criado')}>
                              <Plus className="h-4 w-4 mr-2" />
                              Operacional
                            </Button>
                            <Button onClick={() => toast.success('Relatório Analítico criado')}>
                              <Plus className="h-4 w-4 mr-2" />
                              Analítico
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Crie ou selecione um relatório para ver suas configurações
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* ETAPA 5: Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Conectores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: 'Notificações', items: ['SMTP/Email', 'Slack', 'Teams'] },
                        { category: 'Bancos de Dados', items: ['PostgreSQL', 'MongoDB'] },
                        { category: 'Sistemas', items: ['SAP', 'Salesforce'] }
                      ].map((group) => (
                        <div key={group.category}>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {group.category}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {group.items.map((item) => (
                              <Button
                                key={item}
                                variant="outline"
                                size="sm"
                                className="justify-start h-auto p-3"
                                onClick={() => toast.success(`Conector ${item} configurado`)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                    <span className="text-xs">🔗</span>
                                  </div>
                                  <span className="text-xs">{item}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        API Gateway
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Endpoint
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Documentação
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[calc(100vh-350px)] space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Endpoints Disponíveis</h4>
                        <div className="space-y-2">
                          {[
                            { method: 'GET', path: '/api/processes', description: 'Listar processos' },
                            { method: 'POST', path: '/api/forms', description: 'Criar formulário' },
                            { method: 'GET', path: '/api/analytics', description: 'Dados analíticos' }
                          ].map((endpoint, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'} className="text-xs">
                                  {endpoint.method}
                                </Badge>
                                <code className="text-xs font-mono">{endpoint.path}</code>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{endpoint.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          API Gateway
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Endpoints:</span>
                            <span>6</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conectores:</span>
                            <span>0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Requests/min:</span>
                            <span className="text-green-600">142</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uptime:</span>
                            <span className="text-green-600">99.9%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AlexProcessDesignerEnhanced;
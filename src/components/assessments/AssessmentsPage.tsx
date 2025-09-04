import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Zap,
  Target,
  Activity,
  BarChart3,
  Settings,
  Library,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';

const AssessmentsPage: React.FC = () => {
  console.log('🎯 [ALEX ASSESSMENT ENGINE] Carregando sistema completo!');
  
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data para demonstração
  const quickStats = {
    activeAssessments: 12,
    completedAssessments: 48,
    pendingReviews: 5,
    complianceScore: 87
  };

  const recentAssessments = [
    { id: 1, name: 'ISO 27001 Assessment', status: 'Em Andamento', progress: 65, framework: 'ISO 27001' },
    { id: 2, name: 'LGPD Compliance Check', status: 'Concluído', progress: 100, framework: 'LGPD' },
    { id: 3, name: 'SOC 2 Type II', status: 'Pendente', progress: 25, framework: 'SOC 2' }
  ];

  const frameworks = [
    { id: 1, name: 'ISO 27001', category: 'Security', description: 'Information Security Management', assessments: 15 },
    { id: 2, name: 'LGPD', category: 'Privacy', description: 'Brazilian Data Protection Law', assessments: 8 },
    { id: 3, name: 'SOC 2', category: 'Compliance', description: 'Service Organization Control', assessments: 12 },
    { id: 4, name: 'NIST CSF', category: 'Security', description: 'Cybersecurity Framework', assessments: 6 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header com Banner de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Alex Assessment Engine</h1>
          <Badge className="bg-green-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Integrada
          </Badge>
        </div>
        <p className="text-blue-100">
          Sistema inteligente de assessments adaptativo que se molda ao seu processo de trabalho
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{quickStats.activeAssessments}</p>
                <p className="text-sm text-gray-600">Assessments Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{quickStats.completedAssessments}</p>
                <p className="text-sm text-gray-600">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{quickStats.pendingReviews}</p>
                <p className="text-sm text-gray-600">Revisões Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{quickStats.complianceScore}%</p>
                <p className="text-sm text-gray-600">Score Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Assessment
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Library className="h-4 w-4" />
          Biblioteca de Frameworks
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Recomendações IA
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="frameworks" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Frameworks
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Assessments Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{assessment.name}</h3>
                      <p className="text-sm text-gray-600">{assessment.framework}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{assessment.progress}%</p>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${assessment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge variant={assessment.status === 'Concluído' ? 'default' : 'secondary'}>
                        {assessment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Assessments</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar assessments..." 
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>Lista de assessments será implementada</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Biblioteca de Frameworks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{framework.name}</h3>
                      <Badge variant="outline">{framework.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{framework.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{framework.assessments} assessments</span>
                      <Button size="sm" variant="outline">Usar Framework</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de analytics será implementado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentsPage;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  FileText, 
  Video, 
  HelpCircle, 
  Download,
  ExternalLink,
  Search,
  Star,
  Clock,
  Users,
  Shield,
  Zap,
  Brain,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Archive,
  Filter,
  Eye,
  Edit,
  Share2,
  Printer,
  Copy,
  ChevronRight,
  ChevronDown,
  Home,
  Layers,
  Workflow,
  Database,
  Code,
  Terminal,
  Cpu,
  Network,
  Lock,
  Unlock,
  Key,
  Award,
  Bookmark,
  Flag,
  Tag,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Certificate,
  Library,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Bell,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  category: 'overview' | 'guide' | 'reference' | 'tutorial' | 'support' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  lastUpdated: string;
  popularity: number;
}

export const RiskDocumentation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [readingSessions, setReadingSessions] = useState<Record<string, number>>({});

  // Carregar documentação completa
  useEffect(() => {
    // Simular carregamento de sessões de leitura
    const savedSessions = localStorage.getItem('riskDocReadingSessions');
    if (savedSessions) {
      setReadingSessions(JSON.parse(savedSessions));
    }
    
    const savedBookmarks = localStorage.getItem('riskDocBookmarks');
    if (savedBookmarks) {
      setBookmarks(new Set(JSON.parse(savedBookmarks)));
    }
  }, []);

  const documentationSections: DocumentationSection[] = [
    {
      id: 'overview',
      title: 'Visão Geral do Sistema',
      icon: Globe,
      category: 'overview',
      difficulty: 'beginner',
      estimatedTime: '5 min',
      tags: ['introdução', 'visão geral', 'benefícios'],
      lastUpdated: '2024-12-15',
      popularity: 95,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              Módulo de Risco Corporativo - Visão Geral
            </h3>
            <p className="text-gray-700 mb-4">
              Este módulo representa uma solução completa e integrada para gestão de riscos corporativos, 
              desenvolvida com base nas melhores práticas de mercado e frameworks internacionais como 
              COSO ERM, ISO 31000 e NIST.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <Brain className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="font-medium">Alex Risk IA</p>
                <p className="text-sm text-gray-600">Assistente Inteligente</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <BarChart3 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium">Análises Avançadas</p>
                <p className="text-sm text-gray-600">Monte Carlo, FMEA</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <Shield className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <p className="font-medium">Compliance</p>
                <p className="text-sm text-gray-600">COSO, ISO 31000</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="font-medium">Dashboard</p>
                <p className="text-sm text-gray-600">Visão Unificada</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Principais Benefícios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    60% redução no tempo de criação de riscos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Alex Risk integrado ao processo completo
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Compliance total com frameworks internacionais
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    70% melhoria de performance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    80% aumento na satisfação do usuário
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  Funcionalidades Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    Alex Risk - Assistente IA
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                    Biblioteca de Riscos Inteligente
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
                    Análises Avançadas (Monte Carlo, FMEA)
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 text-red-600 mr-2" />
                    Compliance (COSO, ISO 31000, SOX)
                  </li>
                  <li className="flex items-center">
                    <Settings className="h-4 w-4 text-gray-600 mr-2" />
                    Workflow Digital Completo
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      title: 'Arquitetura e Integração',
      icon: Layers,
      category: 'reference',
      difficulty: 'intermediate',
      estimatedTime: '8 min',
      tags: ['arquitetura', 'integração', 'componentes'],
      lastUpdated: '2024-12-15',
      popularity: 78,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Layers className="h-6 w-6 mr-2 text-indigo-600" />
              Arquitetura do Sistema
            </h3>
            <p className="text-gray-700 mb-4">
              O módulo de Risco Corporativo é construído com arquitetura modular e integrada, 
              permitindo máxima flexibilidade e escalabilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-blue-600" />
                  Componentes Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    Alex Risk - Assistente IA
                  </li>
                  <li className="flex items-center">
                    <Library className="h-4 w-4 text-green-600 mr-2" />
                    Biblioteca de Riscos
                  </li>
                  <li className="flex items-center">
                    <Workflow className="h-4 w-4 text-orange-600 mr-2" />
                    Workflow de Aprovações
                  </li>
                  <li className="flex items-center">
                    <MessageCircle className="h-4 w-4 text-blue-600 mr-2" />
                    Central de Comunicações
                  </li>
                  <li className="flex items-center">
                    <Target className="h-4 w-4 text-red-600 mr-2" />
                    Planos de Ação
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="h-5 w-5 mr-2 text-green-600" />
                  Integrações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Eye className="h-4 w-4 text-blue-600 mr-2" />
                    Auditoria IA
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 text-green-600 mr-2" />
                    Compliance
                  </li>
                  <li className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    Incidentes
                  </li>
                  <li className="flex items-center">
                    <Users className="h-4 w-4 text-purple-600 mr-2" />
                    Vendor Risk
                  </li>
                  <li className="flex items-center">
                    <Lock className="h-4 w-4 text-orange-600 mr-2" />
                    Privacidade/LGPD
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      icon: Lightbulb,
      category: 'tutorial',
      difficulty: 'beginner',
      estimatedTime: '10 min',
      tags: ['tutorial', 'início', 'configuração'],
      lastUpdated: '2024-12-15',
      popularity: 92,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Lightbulb className="h-6 w-6 mr-2 text-blue-600" />
              Como Começar
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">Acesso ao Módulo</h4>
                  <p className="text-gray-700">Navegue para "Gestão de Riscos" no menu principal após fazer login</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">Dashboard Principal</h4>
                  <p className="text-gray-700">Visualize o painel com métricas, riscos principais e Alex Risk</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">Primeiro Risco</h4>
                  <p className="text-gray-700">Clique em "Novo Risco" e siga o wizard guiado com Alex Risk</p>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tutorial Interativo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Recomendamos começar com nosso tutorial interativo que te guiará pelas principais funcionalidades:</p>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Tutorial: Criando seu Primeiro Risco (5 min)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Tutorial: Usando Alex Risk (3 min)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Tutorial: Análises Avançadas (8 min)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'alex-risk',
      title: 'Alex Risk - Assistente IA',
      icon: Brain,
      category: 'guide',
      difficulty: 'intermediate',
      estimatedTime: '15 min',
      tags: ['alex risk', 'ia', 'assistente', 'automação'],
      lastUpdated: '2024-12-15',
      popularity: 89,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Brain className="h-6 w-6 mr-2 text-purple-600" />
              Alex Risk - Seu Assistente Inteligente
            </h3>
            <p className="text-gray-700 mb-4">
              Alex Risk é uma IA avançada que está integrada a todo o processo de gestão de riscos, 
              desde a identificação até o monitoramento contínuo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Como Alex Risk Funciona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <strong>Análise Contínua:</strong> Monitora dados 24/7
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <strong>Aprendizado:</strong> Melhora com suas decisões
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <strong>Predição:</strong> Identifica riscos emergentes
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <strong>Benchmarking:</strong> Compara com mercado
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Exemplos de Interação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm"><strong>👤 Você:</strong> "Quais riscos cibernéticos são relevantes para fintech?"</p>
                    <p className="text-sm mt-2"><strong>🤖 Alex:</strong> "Identifiquei 5 riscos críticos: 1) Ransomware (87% das fintechs afetadas)..."</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm"><strong>👤 Você:</strong> "Como está meu portfólio vs mercado?"</p>
                    <p className="text-sm mt-2"><strong>🤖 Alex:</strong> "23% acima da média em riscos operacionais, 15% abaixo em regulatórios..."</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integração no Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h4 className="font-medium">Identificação</h4>
                  <p className="text-sm text-gray-600">Sugere riscos relevantes</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-medium">Avaliação</h4>
                  <p className="text-sm text-gray-600">Calcula automaticamente</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-medium">Tratamento</h4>
                  <p className="text-sm text-gray-600">Recomenda estratégias</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <h4 className="font-medium">Monitoramento</h4>
                  <p className="text-sm text-gray-600">Define KRIs automáticos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'risk-creation',
      title: 'Criação de Riscos',
      icon: FileText,
      category: 'tutorial',
      difficulty: 'beginner',
      estimatedTime: '12 min',
      tags: ['criação', 'riscos', 'wizard', 'templates'],
      lastUpdated: '2024-12-15',
      popularity: 87,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-green-600" />
              Wizard de Criação de Riscos
            </h3>
            <p className="text-gray-700">
              O processo de criação de riscos é guiado por um wizard inteligente em 4 etapas, 
              com Alex Risk integrado em cada uma delas.
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</div>
                  Etapa 1: Identificação Inteligente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Alex Risk analisa automaticamente seu contexto e sugere riscos relevantes:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Contexto organizacional e setor
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Riscos existentes e padrões
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Tendências de mercado
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Regulamentações aplicáveis
                    </li>
                  </ul>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">💡 Dica Alex Risk:</p>
                    <p className="text-sm text-blue-700">
                      "Baseado no seu perfil de fintech, identifiquei 3 riscos cibernéticos emergentes 
                      que 67% das empresas similares estão enfrentando. Deseja revisar?"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</div>
                  Etapa 2: Avaliação Automática
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Alex Risk calcula automaticamente probabilidade e impactos:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="font-medium text-red-800">Impacto Financeiro</h4>
                      <p className="text-sm text-red-700">Estimativas baseadas no setor</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h4 className="font-medium text-orange-800">Impacto Operacional</h4>
                      <p className="text-sm text-orange-700">Análise de processos afetados</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="font-medium text-purple-800">Impacto Reputacional</h4>
                      <p className="text-sm text-purple-700">Avaliação de exposição midiática</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</div>
                  Etapa 3: Estratégia de Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Alex Risk recomenda estratégias baseadas em análise custo-benefício:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Shield className="h-6 w-6 mx-auto text-green-600 mb-1" />
                      <p className="text-sm font-medium">Mitigar</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <ExternalLink className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                      <p className="text-sm font-medium">Transferir</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-1" />
                      <p className="text-sm font-medium">Evitar</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                      <p className="text-sm font-medium">Aceitar</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">4</div>
                  Etapa 4: Aprovação e Monitoramento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Fluxo de aprovação digital e configuração de KRIs automáticos:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Roteamento automático por alçadas
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Assinatura digital PKI
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      KRIs definidos automaticamente
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Dashboards personalizados
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'methodologies',
      title: 'Metodologias e Frameworks',
      icon: BarChart3,
      category: 'reference',
      difficulty: 'advanced',
      estimatedTime: '20 min',
      tags: ['metodologias', 'frameworks', 'coso', 'iso', 'nist'],
      lastUpdated: '2024-12-15',
      popularity: 76,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-purple-600" />
              Metodologias e Frameworks Implementados
            </h3>
            <p className="text-gray-700">
              O sistema implementa as principais metodologias e frameworks de gestão de risco 
              reconhecidos internacionalmente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  COSO ERM Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Framework empresarial para gestão de riscos</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">5 Componentes implementados</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">20 Princípios avaliados</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Avaliação de maturidade automática</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  ISO 31000
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Padrão internacional de gestão de risco</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Princípios integrados</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Processo estruturado</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Framework organizacional</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  NIST Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Framework de cibersegurança</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">5 Funções principais</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Categorias e subcategorias</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Perfis de maturidade</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Análises Quantitativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Métodos estatísticos avançados</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Monte Carlo Simulation</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Value at Risk (VaR)</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Conditional VaR (CVaR)</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Stress Testing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análises Qualitativas Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-medium">FMEA</h4>
                  <p className="text-sm text-gray-600">Failure Mode and Effects Analysis</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-medium">Bow-Tie</h4>
                  <p className="text-sm text-gray-600">Análise de barreiras preventivas</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h4 className="font-medium">Fault Tree</h4>
                  <p className="text-sm text-gray-600">Análise de árvore de falhas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'workflow',
      title: 'Workflow Integrado',
      icon: Workflow,
      category: 'guide',
      difficulty: 'intermediate',
      estimatedTime: '18 min',
      tags: ['workflow', 'processo', 'integração', 'automação'],
      lastUpdated: '2024-12-15',
      popularity: 82,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Workflow className="h-6 w-6 mr-2 text-purple-600" />
              Workflow Integrado de Gestão de Riscos
            </h3>
            <p className="text-gray-700 mb-4">
              O sistema implementa um workflow completamente integrado que conecta todas as funcionalidades 
              em um processo fluido e automatizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-blue-600" />
                  Fluxo Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</div>
                    <span className="text-sm">Identificação com Alex Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</div>
                    <span className="text-sm">Avaliação Automática</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</div>
                    <span className="text-sm">Workflow de Aprovação</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</div>
                    <span className="text-sm">Planos de Ação</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">5</div>
                    <span className="text-sm">Monitoramento Contínuo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Automações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    Classificação automática
                  </li>
                  <li className="flex items-center">
                    <Target className="h-4 w-4 text-red-600 mr-2" />
                    Sugestão de controles
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
                    Definição de KRIs
                  </li>
                  <li className="flex items-center">
                    <Bell className="h-4 w-4 text-orange-600 mr-2" />
                    Alertas preditivos
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-600 mr-2" />
                    Relatórios dinâmicos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'best-practices',
      title: 'Melhores Práticas',
      icon: Award,
      category: 'guide',
      difficulty: 'intermediate',
      estimatedTime: '25 min',
      tags: ['melhores práticas', 'dicas', 'otimização'],
      lastUpdated: '2024-12-15',
      popularity: 84,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2 text-green-600" />
              Melhores Práticas de Gestão de Riscos
            </h3>
            <p className="text-gray-700 mb-4">
              Diretrizes e recomendações baseadas em anos de experiência e melhores práticas de mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2 text-blue-600" />
                  Estruturação de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Nomenclatura Padronizada</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use verbos no infinitivo</li>
                      <li>• Seja específico e contextual</li>
                      <li>• Máximo de 80 caracteres</li>
                      <li>• Evite termos genéricos</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Exemplo Bom</h4>
                    <p className="text-sm text-green-700">"Falhar em detectar fraudes em transações PIX"</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Exemplo Ruim</h4>
                    <p className="text-sm text-red-700">"Risco de TI"</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  Avaliação Eficaz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Probabilidade</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use dados históricos</li>
                      <li>• Considere controles existentes</li>
                      <li>• Analise tendências</li>
                      <li>• Valide com especialistas</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Impacto</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Quantifique sempre que possível</li>
                      <li>• Múltiplas dimensões</li>
                      <li>• Inclua custos indiretos</li>
                      <li>• Avalie longo prazo</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: Settings,
      category: 'support',
      difficulty: 'intermediate',
      estimatedTime: '15 min',
      tags: ['troubleshooting', 'problemas', 'soluções'],
      lastUpdated: '2024-12-15',
      popularity: 71,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-red-600" />
              Solução de Problemas Comuns
            </h3>
            <p className="text-gray-700 mb-4">
              Guia para resolver os problemas mais frequentes no uso do sistema.
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Alex Risk não responde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Sintomas</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Botão não abre o chat</li>
                      <li>• Respostas demoram muito</li>
                      <li>• Sugestões irrelevantes</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Soluções</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Verifique conexão com internet</li>
                      <li>• Limpe cache (Ctrl+F5)</li>
                      <li>• Confirme permissões de IA</li>
                      <li>• Use perguntas específicas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Dashboard vazio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Sintomas</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Poucos ou nenhum risco</li>
                      <li>• Filtros sem resultado</li>
                      <li>• Métricas zeradas</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Soluções</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Limpe todos os filtros</li>
                      <li>• Verifique permissões</li>
                      <li>• Clique em "Sync" no header</li>
                      <li>• Ajuste filtros de data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'support',
      title: 'Suporte e Contato',
      icon: HelpCircle,
      category: 'support',
      difficulty: 'beginner',
      estimatedTime: '5 min',
      tags: ['suporte', 'contato', 'ajuda'],
      lastUpdated: '2024-12-15',
      popularity: 68,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <HelpCircle className="h-6 w-6 mr-2 text-green-600" />
              Suporte e Assistência
            </h3>
            <p className="text-gray-700">
              Nossa equipe está disponível para ajudá-lo a aproveitar ao máximo o sistema de gestão de riscos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Canais de Suporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">suporte@empresa.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-sm text-gray-600">+55 11 1234-5678</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Chat Online</p>
                      <p className="text-sm text-gray-600">Disponível 24/7 no sistema</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Emergência</p>
                      <p className="text-sm text-gray-600">+55 11 9999-0000</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Equipe de Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Product Manager</p>
                    <p className="text-sm text-gray-600">João Silva</p>
                    <p className="text-sm text-gray-600">joao.silva@empresa.com</p>
                  </div>
                  <div>
                    <p className="font-medium">Tech Lead</p>
                    <p className="text-sm text-gray-600">Maria Santos</p>
                    <p className="text-sm text-gray-600">maria.santos@empresa.com</p>
                  </div>
                  <div>
                    <p className="font-medium">UX Designer</p>
                    <p className="text-sm text-gray-600">Pedro Costa</p>
                    <p className="text-sm text-gray-600">pedro.costa@empresa.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recursos de Treinamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="flex items-center space-x-3">
                    <Video className="h-6 w-6 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">Vídeos Tutoriais</p>
                      <p className="text-sm text-gray-600">Demonstrações práticas</p>
                    </div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-6 w-6 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Guias de Usuário</p>
                      <p className="text-sm text-gray-600">Passo a passo detalhado</p>
                    </div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-6 w-6 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium">FAQ</p>
                      <p className="text-sm text-gray-600">Perguntas frequentes</p>
                    </div>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="flex items-center space-x-3">
                    <Star className="h-6 w-6 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">Best Practices</p>
                      <p className="text-sm text-gray-600">Melhores práticas</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const filteredSections = documentationSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleExpand = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleToggleBookmark = (sectionId: string) => {
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(sectionId)) {
      newBookmarks.delete(sectionId);
    } else {
      newBookmarks.add(sectionId);
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('riskDocBookmarks', JSON.stringify(Array.from(newBookmarks)));
  };

  const handleSectionView = (sectionId: string) => {
    const newSessions = { ...readingSessions };
    newSessions[sectionId] = (newSessions[sectionId] || 0) + 1;
    setReadingSessions(newSessions);
    localStorage.setItem('riskDocReadingSessions', JSON.stringify(newSessions));
    setSelectedSection(sectionId);
  };

  const categories = [
    { id: 'all', label: 'Todos', icon: BookOpen },
    { id: 'overview', label: 'Visão Geral', icon: Globe },
    { id: 'guide', label: 'Guias', icon: FileText },
    { id: 'tutorial', label: 'Tutoriais', icon: Video },
    { id: 'reference', label: 'Referência', icon: BarChart3 },
    { id: 'advanced', label: 'Avançado', icon: Code },
    { id: 'support', label: 'Suporte', icon: HelpCircle }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedSectionData = documentationSections.find(s => s.id === selectedSection);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span>Documentação - Módulo de Risco Corporativo</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Guia completo para utilização do sistema de gestão de riscos corporativos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Versão Online
          </Button>
        </div>
      </div>

      {/* Search and Filters - Compact */}
      <Card>
        <CardContent className="p-4">
          {/* Linha principal sempre visível */}
          <div className="flex items-center space-x-3">
            {/* Campo de busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar na documentação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            
            {/* Filtro rápido - categoria selecionada */}
            {selectedCategory !== 'all' && (() => {
              const selectedCat = categories.find(c => c.id === selectedCategory);
              const IconComponent = selectedCat?.icon;
              return (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  <span>{selectedCat?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSelectedCategory('all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })()}
            
            {/* Botão para expandir filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {filtersExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Filtros expandidos */}
          {filtersExpanded && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Categorias
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="h-8"
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {category.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Filtros adicionais */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Dificuldade
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="cursor-pointer hover:bg-green-50">
                        Iniciante
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-yellow-50">
                        Intermediário
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-red-50">
                        Avançado
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Tempo de Leitura
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                        &lt; 10 min
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                        10-20 min
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                        &gt; 20 min
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Popularidade
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">
                        Mais populares
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">
                        Recentes
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Ações dos filtros */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-gray-500">
                    {filteredSections.length} seção(ões) encontrada(s)
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltersExpanded(false)}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seções</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredSections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSections.has(section.id);
                    const isBookmarked = bookmarks.has(section.id);
                    const viewCount = readingSessions[section.id] || 0;
                    
                    return (
                      <div key={section.id} className="border rounded-lg mb-2">
                        <Button
                          variant={selectedSection === section.id ? "default" : "ghost"}
                          className="w-full justify-start h-auto p-3"
                          onClick={() => handleSectionView(section.id)}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <Icon className="h-5 w-5 mt-0.5" />
                            <div className="text-left flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{section.title}</p>
                                <div className="flex items-center space-x-1">
                                  {isBookmarked && (
                                    <Bookmark className="h-3 w-3 text-yellow-500 fill-current" />
                                  )}
                                  {viewCount > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {viewCount}x
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getDifficultyColor(section.difficulty)}`}
                                >
                                  {section.difficulty}
                                </Badge>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {section.estimatedTime}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {section.popularity}%
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {section.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {section.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{section.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                        
                        {/* Ações da seção */}
                        <div className="px-3 pb-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleBookmark(section.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Bookmark className={`h-3 w-3 ${
                                isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'
                              }`} />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Share2 className="h-3 w-3 text-gray-400" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Printer className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Atualizado: {section.lastUpdated}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedSectionData && (
                    <>
                      <selectedSectionData.icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{selectedSectionData.title}</span>
                          {bookmarks.has(selectedSectionData.id) && (
                            <Bookmark className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={getDifficultyColor(selectedSectionData.difficulty)}
                          >
                            {selectedSectionData.difficulty}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {selectedSectionData.estimatedTime}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {selectedSectionData.popularity}% popularidade
                          </div>
                          {readingSessions[selectedSectionData.id] && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Eye className="h-4 w-4 mr-1" />
                              {readingSessions[selectedSectionData.id]}x visualizado
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedSectionData.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => selectedSectionData && handleToggleBookmark(selectedSectionData.id)}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${
                      selectedSectionData && bookmarks.has(selectedSectionData.id) 
                        ? 'text-yellow-500 fill-current' 
                        : ''
                    }`} />
                    {selectedSectionData && bookmarks.has(selectedSectionData.id) ? 'Remover' : 'Favoritar'}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {selectedSectionData?.content}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estatísticas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas de Uso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Estatísticas de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Seções mais populares:</span>
                <Badge variant="secondary">
                  {filteredSections.sort((a, b) => b.popularity - a.popularity)[0]?.title}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de favoritos:</span>
                <Badge variant="secondary">{bookmarks.size}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Sessões de leitura:</span>
                <Badge variant="secondary">
                  {Object.values(readingSessions).reduce((a, b) => a + b, 0)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Última atualização:</span>
                <Badge variant="outline">15/12/2024</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Criar Primeiro Risco</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Brain className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Testar Alex Risk</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Ver Dashboard</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <HelpCircle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">Contatar Suporte</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Video className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-sm font-medium">Vídeos Tutoriais</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Download className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                  <p className="text-sm font-medium">Download PDF</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Seções Relacionadas */}
      {selectedSectionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2 text-gray-600" />
              Seções Relacionadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {documentationSections
                .filter(section => 
                  section.id !== selectedSectionData.id && 
                  (section.category === selectedSectionData.category ||
                   section.tags.some(tag => selectedSectionData.tags.includes(tag)))
                )
                .slice(0, 3)
                .map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant="outline"
                      className="h-auto p-4 text-left"
                      onClick={() => handleSectionView(section.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{section.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {section.estimatedTime} • {section.difficulty}
                          </p>
                        </div>
                      </div>
                    </Button>
                  );
                })
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Brain,
  Sparkles,
  Shield,
  Star,
  MessageSquare,
  Send,
  Save,
  ArrowRight,
  Calendar,
  User,
  BarChart3,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

import type { 
  PolicyV2, 
  PolicyReview, 
  ReviewType,
  AlexAnalysis,
  ComplianceCheck
} from '@/types/policy-management-v2';

interface PolicyReviewViewProps {
  onReviewCompleted: (review: PolicyReview) => void;
}

const PolicyReviewView: React.FC<PolicyReviewViewProps> = ({
  onReviewCompleted
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principais
  const [policiesForReview, setPoliciesForReview] = useState<PolicyV2[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyV2 | null>(null);
  const [currentReview, setCurrentReview] = useState<Partial<PolicyReview>>({
    review_type: 'technical',
    status: 'pending',
    requires_changes: false,
    overall_rating: 3
  });

  // Estados para IA
  const [alexAnalysis, setAlexAnalysis] = useState<AlexAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck | null>(null);

  // Estados de UI
  const [activeTab, setActiveTab] = useState('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPoliciesForReview();
  }, []);

  const loadPoliciesForReview = async () => {
    // Mock data - em produção viria do backend
    const mockPolicies: PolicyV2[] = [
      {
        id: '1',
        tenant_id: user?.tenant?.id || '',
        title: 'Política de Segurança da Informação',
        description: 'Diretrizes para proteção de dados e sistemas',
        content: `# POLÍTICA DE SEGURANÇA DA INFORMAÇÃO

## 1. OBJETIVO
Esta política estabelece as diretrizes para proteção das informações da organização.

## 2. ESCOPO
Aplica-se a todos os colaboradores, terceiros e sistemas da organização.

## 3. RESPONSABILIDADES
- CISO: Responsável pela implementação
- Colaboradores: Cumprimento das diretrizes
- TI: Implementação técnica`,
        category: 'security',
        policy_type: 'policy',
        priority: 'high',
        status: 'under_review',
        workflow_stage: 'review',
        version: '2.0',
        is_current_version: true,
        created_by: 'user-1',
        requires_acknowledgment: true,
        is_mandatory: true,
        applies_to_all_users: true,
        ai_generated: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        compliance_frameworks: ['ISO 27001', 'LGPD']
      },
      {
        id: '2',
        tenant_id: user?.tenant?.id || '',
        title: 'Código de Ética e Conduta',
        description: 'Princípios éticos e comportamentais da organização',
        content: `# CÓDIGO DE ÉTICA E CONDUTA

## 1. MENSAGEM DA LIDERANÇA
Nossa organização está comprometida com os mais altos padrões éticos.

## 2. NOSSOS VALORES
- Integridade
- Transparência
- Responsabilidade
- Respeito`,
        category: 'governance',
        policy_type: 'code_of_conduct',
        priority: 'medium',
        status: 'under_review',
        workflow_stage: 'review',
        version: '1.5',
        is_current_version: true,
        created_by: 'user-2',
        requires_acknowledgment: true,
        is_mandatory: true,
        applies_to_all_users: true,
        ai_generated: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        review_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        compliance_frameworks: ['SOX', 'Compliance Corporativo']
      }
    ];

    setPoliciesForReview(mockPolicies);
    if (mockPolicies.length > 0) {
      setSelectedPolicy(mockPolicies[0]);
    }
  };

  const generateAlexAnalysis = async (policy: PolicyV2) => {
    setIsAnalyzing(true);
    
    try {
      // Simular análise do Alex Policy
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysis: AlexAnalysis = {
        quality_score: 85,
        readability_score: 78,
        compliance_score: 92,
        completeness_score: 88,
        recommendations: [
          'Adicionar seção sobre proteção de dados pessoais',
          'Incluir definições de termos técnicos',
          'Especificar penalidades por descumprimento',
          'Adicionar fluxograma de processo de incidentes'
        ],
        identified_gaps: [
          'Ausência de procedimentos para backup',
          'Falta de definição de papéis e responsabilidades',
          'Critérios de classificação de informação não claros'
        ],
        improvement_suggestions: [
          'Reorganizar seções por ordem de importância',
          'Adicionar exemplos práticos',
          'Incluir checklist de verificação',
          'Criar versão resumida para treinamento'
        ],
        generated_at: new Date().toISOString()
      };

      const compliance: ComplianceCheck = {
        framework: 'ISO 27001',
        requirements_met: 23,
        total_requirements: 25,
        compliance_percentage: 92,
        gaps: [
          'Controle A.12.6.1 - Gestão de vulnerabilidades técnicas',
          'Controle A.16.1.2 - Relato de eventos de segurança da informação'
        ],
        recommendations: [
          'Implementar processo formal de gestão de vulnerabilidades',
          'Definir procedimentos claros para relato de incidentes'
        ],
        checked_at: new Date().toISOString()
      };

      setAlexAnalysis(analysis);
      setComplianceCheck(compliance);
      
      toast({
        title: '🤖 Análise Concluída',
        description: 'Alex Policy analisou a política e gerou recomendações',
      });

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar análise',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitReview = async () => {
    if (!selectedPolicy) return;

    setIsSubmitting(true);
    
    try {
      // Validações
      if (!currentReview.findings?.trim()) {
        throw new Error('Observações da revisão são obrigatórias');
      }

      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));

      const review: PolicyReview = {
        id: Date.now().toString(),
        policy_id: selectedPolicy.id,
        tenant_id: selectedPolicy.tenant_id,
        reviewer_id: user?.id || '',
        review_type: currentReview.review_type || 'technical',
        status: 'completed',
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
        completed_at: new Date().toISOString(),
        findings: currentReview.findings || '',
        recommendations: currentReview.recommendations || [],
        issues_found: currentReview.issues_found || [],
        compliance_check: complianceCheck || undefined,
        overall_rating: currentReview.overall_rating || 3,
        requires_changes: currentReview.requires_changes || false,
        alex_analysis: alexAnalysis || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onReviewCompleted(review);

      // Reset form
      setCurrentReview({
        review_type: 'technical',
        status: 'pending',
        requires_changes: false,
        overall_rating: 3
      });
      setAlexAnalysis(null);
      setComplianceCheck(null);

      // Remove da lista
      setPoliciesForReview(prev => prev.filter(p => p.id !== selectedPolicy.id));
      
      // Seleciona próxima política
      const remaining = policiesForReview.filter(p => p.id !== selectedPolicy.id);
      if (remaining.length > 0) {
        setSelectedPolicy(remaining[0]);
      } else {
        setSelectedPolicy(null);
      }

    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao enviar revisão',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const reviewTypes: { value: ReviewType; label: string }[] = [
    { value: 'technical', label: 'Técnica' },
    { value: 'legal', label: 'Jurídica' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'business', label: 'Negócio' },
    { value: 'security', label: 'Segurança' }
  ];

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h2 className=\"text-xl font-semibold flex items-center space-x-2\">
            <Eye className=\"h-5 w-5\" />
            <span>Revisão de Políticas</span>
          </h2>
          <p className=\"text-sm text-muted-foreground\">
            Processo de revisão técnica e de compliance com assistência Alex Policy
          </p>
        </div>
        
        <div className=\"flex items-center space-x-2\">
          <ImprovedAIChatDialog
            type=\"policy\"
            title=\"Alex Policy - Assistente de Revisão\"
            trigger={
              <Button variant=\"outline\" className=\"flex items-center space-x-2\">
                <Brain className=\"h-4 w-4\" />
                <span>Alex Policy</span>
                <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                  <Sparkles className=\"h-3 w-3 mr-1\" />
                  IA
                </Badge>
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className=\"grid gap-4 md:grid-cols-4\">
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center space-x-2\">
              <Clock className=\"h-4 w-4 text-yellow-600\" />
              <div>
                <div className=\"text-2xl font-bold\">{policiesForReview.length}</div>
                <p className=\"text-xs text-muted-foreground\">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center space-x-2\">
              <CheckCircle className=\"h-4 w-4 text-green-600\" />
              <div>
                <div className=\"text-2xl font-bold\">12</div>
                <p className=\"text-xs text-muted-foreground\">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center space-x-2\">
              <BarChart3 className=\"h-4 w-4 text-blue-600\" />
              <div>
                <div className=\"text-2xl font-bold\">4.2</div>
                <p className=\"text-xs text-muted-foreground\">Nota Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className=\"p-4\">
            <div className=\"flex items-center space-x-2\">
              <Brain className=\"h-4 w-4 text-indigo-600\" />
              <div>
                <div className=\"text-2xl font-bold\">89%</div>
                <p className=\"text-xs text-muted-foreground\">Precisão IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className=\"grid gap-6 lg:grid-cols-3\">
        {/* Policy List */}
        <div className=\"space-y-4\">
          <Card>
            <CardHeader>
              <CardTitle className=\"text-sm\">Políticas para Revisão</CardTitle>
            </CardHeader>
            <CardContent className=\"p-0\">
              {policiesForReview.length > 0 ? (
                <div className=\"space-y-1\">
                  {policiesForReview.map((policy) => (
                    <div
                      key={policy.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                        selectedPolicy?.id === policy.id 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <div className=\"space-y-2\">
                        <div className=\"flex items-start justify-between\">
                          <h3 className=\"font-medium text-sm\">{policy.title}</h3>
                          <Badge className={`text-xs ${getPriorityColor(policy.priority)}`}>
                            {policy.priority}
                          </Badge>
                        </div>
                        
                        <p className=\"text-xs text-muted-foreground line-clamp-2\">
                          {policy.description}
                        </p>
                        
                        <div className=\"flex items-center justify-between\">
                          <div className=\"flex items-center space-x-2\">
                            <Badge variant=\"outline\" className=\"text-xs\">
                              v{policy.version}
                            </Badge>
                            {policy.ai_generated && (
                              <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                                <Sparkles className=\"h-3 w-3 mr-1\" />
                                IA
                              </Badge>
                            )}
                          </div>
                          
                          <div className=\"flex items-center space-x-1 text-xs text-muted-foreground\">
                            <Calendar className=\"h-3 w-3\" />
                            <span>
                              {new Date(policy.review_date || '').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className=\"p-6 text-center\">
                  <Eye className=\"h-8 w-8 text-muted-foreground mx-auto mb-2\" />
                  <p className=\"text-sm text-muted-foreground\">
                    Nenhuma política pendente de revisão
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Content */}
        <div className=\"lg:col-span-2 space-y-6\">
          {selectedPolicy ? (
            <>
              {/* Policy Header */}
              <Card>
                <CardHeader>
                  <div className=\"flex items-start justify-between\">
                    <div className=\"space-y-2\">
                      <CardTitle className=\"flex items-center space-x-2\">
                        <FileText className=\"h-5 w-5\" />
                        <span>{selectedPolicy.title}</span>
                      </CardTitle>
                      <p className=\"text-sm text-muted-foreground\">
                        {selectedPolicy.description}
                      </p>
                    </div>
                    
                    <Button
                      variant=\"outline\"
                      onClick={() => generateAlexAnalysis(selectedPolicy)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2\"></div>
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className=\"h-4 w-4 mr-2\" />
                          Análise Alex Policy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className=\"flex items-center space-x-4 text-sm text-muted-foreground\">
                    <span>Versão {selectedPolicy.version}</span>
                    <span>•</span>
                    <span>Categoria: {selectedPolicy.category}</span>
                    <span>•</span>
                    <span>Tipo: {selectedPolicy.policy_type}</span>
                  </div>
                </CardHeader>
              </Card>

              {/* Alex Analysis */}
              {alexAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className=\"flex items-center space-x-2\">
                      <Brain className=\"h-5 w-5 text-indigo-600\" />
                      <span>Análise Alex Policy</span>
                      <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                        <Sparkles className=\"h-3 w-3 mr-1\" />
                        IA
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=\"space-y-6\">
                    {/* Scores */}
                    <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
                      <div className=\"text-center\">
                        <div className=\"text-2xl font-bold text-green-600\">{alexAnalysis.quality_score}</div>
                        <p className=\"text-xs text-muted-foreground\">Qualidade</p>
                        <Progress value={alexAnalysis.quality_score} className=\"h-1 mt-1\" />
                      </div>
                      <div className=\"text-center\">
                        <div className=\"text-2xl font-bold text-blue-600\">{alexAnalysis.readability_score}</div>
                        <p className=\"text-xs text-muted-foreground\">Legibilidade</p>
                        <Progress value={alexAnalysis.readability_score} className=\"h-1 mt-1\" />
                      </div>
                      <div className=\"text-center\">
                        <div className=\"text-2xl font-bold text-purple-600\">{alexAnalysis.compliance_score}</div>
                        <p className=\"text-xs text-muted-foreground\">Compliance</p>
                        <Progress value={alexAnalysis.compliance_score} className=\"h-1 mt-1\" />
                      </div>
                      <div className=\"text-center\">
                        <div className=\"text-2xl font-bold text-orange-600\">{alexAnalysis.completeness_score}</div>
                        <p className=\"text-xs text-muted-foreground\">Completude</p>
                        <Progress value={alexAnalysis.completeness_score} className=\"h-1 mt-1\" />
                      </div>
                    </div>

                    {/* Recommendations */}
                    <Tabs defaultValue=\"recommendations\">
                      <TabsList className=\"grid w-full grid-cols-3\">
                        <TabsTrigger value=\"recommendations\">Recomendações</TabsTrigger>
                        <TabsTrigger value=\"gaps\">Gaps</TabsTrigger>
                        <TabsTrigger value=\"improvements\">Melhorias</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value=\"recommendations\" className=\"space-y-2\">
                        {alexAnalysis.recommendations?.map((rec, index) => (
                          <div key={index} className=\"p-3 bg-green-50 rounded-lg\">
                            <div className=\"flex items-start space-x-2\">
                              <CheckCircle className=\"h-4 w-4 text-green-600 mt-0.5 flex-shrink-0\" />
                              <p className=\"text-sm text-green-900\">{rec}</p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value=\"gaps\" className=\"space-y-2\">
                        {alexAnalysis.identified_gaps?.map((gap, index) => (
                          <div key={index} className=\"p-3 bg-red-50 rounded-lg\">
                            <div className=\"flex items-start space-x-2\">
                              <AlertTriangle className=\"h-4 w-4 text-red-600 mt-0.5 flex-shrink-0\" />
                              <p className=\"text-sm text-red-900\">{gap}</p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value=\"improvements\" className=\"space-y-2\">
                        {alexAnalysis.improvement_suggestions?.map((suggestion, index) => (
                          <div key={index} className=\"p-3 bg-blue-50 rounded-lg\">
                            <div className=\"flex items-start space-x-2\">
                              <Lightbulb className=\"h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0\" />
                              <p className=\"text-sm text-blue-900\">{suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Check */}
              {complianceCheck && (
                <Card>
                  <CardHeader>
                    <CardTitle className=\"flex items-center space-x-2\">
                      <Shield className=\"h-5 w-5 text-green-600\" />
                      <span>Verificação de Compliance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=\"space-y-4\">
                    <div className=\"flex items-center justify-between\">
                      <span className=\"font-medium\">{complianceCheck.framework}</span>
                      <Badge className=\"bg-green-100 text-green-800\">
                        {complianceCheck.compliance_percentage}% Conforme
                      </Badge>
                    </div>
                    
                    <Progress value={complianceCheck.compliance_percentage} className=\"h-3\" />
                    
                    <div className=\"text-sm text-muted-foreground\">
                      {complianceCheck.requirements_met} de {complianceCheck.total_requirements} requisitos atendidos
                    </div>

                    {complianceCheck.gaps.length > 0 && (
                      <div className=\"space-y-2\">
                        <h4 className=\"font-medium text-sm\">Gaps Identificados:</h4>
                        {complianceCheck.gaps.map((gap, index) => (
                          <div key={index} className=\"p-2 bg-yellow-50 rounded text-xs text-yellow-900\">
                            <AlertTriangle className=\"h-3 w-3 inline mr-1\" />
                            {gap}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Review Form */}
              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center space-x-2\">
                    <MessageSquare className=\"h-5 w-5\" />
                    <span>Formulário de Revisão</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className=\"space-y-6\">
                  {/* Review Type */}
                  <div className=\"space-y-2\">
                    <label className=\"text-sm font-medium\">Tipo de Revisão</label>
                    <div className=\"flex flex-wrap gap-2\">
                      {reviewTypes.map((type) => (
                        <Button
                          key={type.value}
                          variant={currentReview.review_type === type.value ? 'default' : 'outline'}
                          size=\"sm\"
                          onClick={() => setCurrentReview(prev => ({ ...prev, review_type: type.value }))}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className=\"space-y-2\">
                    <label className=\"text-sm font-medium\">Avaliação Geral</label>
                    <div className=\"flex items-center space-x-2\">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant=\"ghost\"
                          size=\"sm\"
                          onClick={() => setCurrentReview(prev => ({ ...prev, overall_rating: rating }))}
                          className=\"p-1\"
                        >
                          <Star 
                            className={`h-5 w-5 ${
                              rating <= (currentReview.overall_rating || 0) 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </Button>
                      ))}
                      <span className=\"text-sm text-muted-foreground ml-2\">
                        {currentReview.overall_rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Findings */}
                  <div className=\"space-y-2\">
                    <label className=\"text-sm font-medium\">Observações da Revisão *</label>
                    <Textarea
                      value={currentReview.findings || ''}
                      onChange={(e) => setCurrentReview(prev => ({ ...prev, findings: e.target.value }))}
                      placeholder=\"Descreva suas observações sobre a política...\"
                      rows={6}
                    />
                  </div>

                  {/* Requires Changes */}
                  <div className=\"flex items-center space-x-2\">
                    <input
                      type=\"checkbox\"
                      id=\"requires_changes\"
                      checked={currentReview.requires_changes}
                      onChange={(e) => setCurrentReview(prev => ({ ...prev, requires_changes: e.target.checked }))}
                    />
                    <label htmlFor=\"requires_changes\" className=\"text-sm font-medium\">
                      Esta política requer alterações antes da aprovação
                    </label>
                  </div>

                  {/* Actions */}
                  <div className=\"flex justify-between\">
                    <Button variant=\"outline\">
                      <Save className=\"h-4 w-4 mr-2\" />
                      Salvar Rascunho
                    </Button>
                    
                    <Button onClick={submitReview} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2\"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className=\"h-4 w-4 mr-2\" />
                          Concluir Revisão
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className=\"flex flex-col items-center justify-center py-16\">
                <Eye className=\"h-16 w-16 text-muted-foreground mb-4\" />
                <h3 className=\"text-lg font-semibold mb-2\">Selecione uma Política</h3>
                <p className=\"text-muted-foreground text-center\">
                  Escolha uma política da lista ao lado para iniciar a revisão
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyReviewView;
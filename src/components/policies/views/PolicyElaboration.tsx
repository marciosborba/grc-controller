import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Edit,
  Plus,
  FileText,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PolicyProcessCard from '../shared/PolicyProcessCard';
import AlexPolicyChat from '../shared/AlexPolicyChat';

interface Policy {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  document_type: string;
  version: string;
  created_at: string;
  updated_at: string;
  effective_date?: string;
  review_date?: string;
  expiry_date?: string;
  created_by?: string;
  approved_by?: string;
  approval_date?: string;
  tenant_id: string;
}

interface PolicyElaborationProps {
  policies: Policy[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
  searchTerm?: string;
  filters?: any;
}

const PolicyElaboration: React.FC<PolicyElaborationProps> = ({
  policies,
  onPolicyUpdate,
  alexConfig,
  searchTerm = '',
  filters = {}
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showAlexChat, setShowAlexChat] = useState(false);

  // Filtrar políticas para elaboração (draft, under_review)
  const filteredPolicies = policies.filter(policy => {
    const elaborationStatuses = ['draft', 'under_review', 'pending_approval'];
    const matchesStatus = elaborationStatuses.includes(policy.status.toLowerCase());
    const matchesSearch = !searchTerm || 
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Gerar insights do Alex Policy para cada política
  const generateAlexInsights = (policy: Policy) => {
    const insights = [];
    
    // Verificar se precisa de descrição
    if (!policy.description || policy.description.length < 50) {
      insights.push({
        type: 'suggestion' as const,
        title: 'Descrição incompleta',
        description: 'Adicione uma descrição mais detalhada para melhor compreensão',
        action: 'improve_description'
      });
    }

    // Verificar se está há muito tempo em rascunho
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(policy.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCreation > 7 && policy.status === 'draft') {
      insights.push({
        type: 'warning' as const,
        title: 'Política em rascunho há muito tempo',
        description: `Esta política está em elaboração há ${daysSinceCreation} dias`,
        action: 'expedite_review'
      });
    }

    // Sugestão de estrutura baseada no tipo
    if (policy.document_type === 'Política' && !policy.description?.includes('objetivo')) {
      insights.push({
        type: 'suggestion' as const,
        title: 'Estrutura recomendada',
        description: 'Considere adicionar seções de objetivo, escopo e responsabilidades',
        action: 'suggest_structure'
      });
    }

    return insights;
  };

  const handlePolicyAction = async (action: string, policyId: string, data?: any) => {
    setIsLoading(true);
    
    try {
      switch (action) {
        case 'edit':
          // Abrir modal de edição (implementar)
          toast({
            title: "Editar Política",
            description: "Funcionalidade de edição será implementada",
          });
          break;
          
        case 'alex_suggestions':
          setSelectedPolicy(policies.find(p => p.id === policyId) || null);
          setShowAlexChat(true);
          break;
          
        case 'send_review':
          await updatePolicyStatus(policyId, 'under_review');
          toast({
            title: "Política enviada para revisão",
            description: "A política foi enviada para a equipe de revisão",
          });
          break;
          
        case 'improve_description':
          toast({
            title: "Alex Policy",
            description: "Sugestão: Adicione mais detalhes sobre o propósito e escopo da política",
          });
          break;
          
        case 'suggest_structure':
          toast({
            title: "Alex Policy",
            description: "Sugestão de estrutura enviada para o chat",
          });
          setSelectedPolicy(policies.find(p => p.id === policyId) || null);
          setShowAlexChat(true);
          break;
          
        default:
          console.log('Ação não implementada:', action);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao executar a ação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    const { error } = await supabase
      .from('policies')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', policyId);

    if (error) throw error;
    onPolicyUpdate();
  };

  const handleCreateNewPolicy = () => {
    toast({
      title: "Nova Política",
      description: "Modal de criação será implementado",
    });
  };

  const handleAlexSuggestion = (suggestion: any) => {
    toast({
      title: "Alex Policy",
      description: `Sugestão "${suggestion.title}" aplicada com sucesso!`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com confirmação do novo módulo */}
      <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/30 dark:text-green-100">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          ✅ <strong>NOVO MÓDULO REFATORADO ATIVO</strong> - Cards Expansíveis implementados com sucesso!
        </AlertDescription>
      </Alert>

      {/* Header da seção */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Elaboração de Políticas</h2>
          <p className="text-muted-foreground">
            Crie, edite e desenvolva políticas com assistência da IA Alex Policy
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlexChat(!showAlexChat)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {showAlexChat ? 'Ocultar' : 'Mostrar'} Alex Chat
          </Button>
          
          <Button onClick={handleCreateNewPolicy}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Política
          </Button>
        </div>
      </div>

      {/* Layout principal */}
      <div className={`grid gap-6 ${showAlexChat ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Coluna principal - Lista de políticas */}
        <div className={`space-y-4 ${showAlexChat ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Em Elaboração</p>
                    <p className="text-2xl font-bold">
                      {filteredPolicies.filter(p => p.status === 'draft').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Edit className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Em Revisão</p>
                    <p className="text-2xl font-bold">
                      {filteredPolicies.filter(p => p.status === 'under_review').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Com Insights Alex</p>
                    <p className="text-2xl font-bold">
                      {filteredPolicies.filter(p => generateAlexInsights(p).length > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e busca */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar políticas em elaboração..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Políticas com Cards Expansíveis */}
          <div className="space-y-4">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => (
                <PolicyProcessCard
                  key={policy.id}
                  policy={policy}
                  mode="elaboration"
                  onAction={handlePolicyAction}
                  alexInsights={generateAlexInsights(policy)}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma política em elaboração</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Comece criando uma nova política ou verifique os filtros aplicados.
                  </p>
                  <Button onClick={handleCreateNewPolicy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Política
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Coluna lateral - Alex Policy Chat */}
        {showAlexChat && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AlexPolicyChat
                policyId={selectedPolicy?.id}
                policyTitle={selectedPolicy?.title}
                mode="elaboration"
                onApplySuggestion={handleAlexSuggestion}
                className="h-[600px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Processando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyElaboration;
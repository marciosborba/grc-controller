import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  X, 
  Clock, 
  FileText,
  User,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Send,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Users,
  Shield
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';

import type { PolicyV2, PolicyApproval } from '@/types/policy-management-v2';

interface PolicyApprovalViewProps {
  onApprovalDecision: (approval: PolicyApproval) => void;
}

const PolicyApprovalView: React.FC<PolicyApprovalViewProps> = ({
  onApprovalDecision
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [pendingApprovals, setPendingApprovals] = useState<(PolicyV2 & { approval_level: number })[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyV2 | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    // Mock data
    const mockPolicies = [
      {
        id: '1',
        tenant_id: user?.tenant?.id || '',
        title: 'Política de Trabalho Remoto',
        description: 'Diretrizes para trabalho remoto e híbrido',
        category: 'hr' as const,
        policy_type: 'policy' as const,
        priority: 'high' as const,
        status: 'pending_approval' as const,
        workflow_stage: 'approval' as const,
        version: '1.0',
        is_current_version: true,
        created_by: 'user-1',
        requires_acknowledgment: true,
        is_mandatory: true,
        applies_to_all_users: true,
        ai_generated: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        approval_level: 1
      }
    ];

    setPendingApprovals(mockPolicies);
    if (mockPolicies.length > 0) {
      setSelectedPolicy(mockPolicies[0]);
    }
  };

  const submitDecision = async () => {
    if (!selectedPolicy || !decision) return;

    setIsSubmitting(true);
    
    try {
      const approval: PolicyApproval = {
        id: Date.now().toString(),
        policy_id: selectedPolicy.id,
        tenant_id: selectedPolicy.tenant_id,
        approver_id: user?.id || '',
        approval_level: 1,
        status: decision,
        decision_date: new Date().toISOString(),
        comments,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onApprovalDecision(approval);

      // Reset
      setDecision(null);
      setComments('');
      setPendingApprovals(prev => prev.filter(p => p.id !== selectedPolicy.id));
      
      const remaining = pendingApprovals.filter(p => p.id !== selectedPolicy.id);
      setSelectedPolicy(remaining.length > 0 ? remaining[0] : null);

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar decisão',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <div>
          <h2 className=\"text-xl font-semibold flex items-center space-x-2\">
            <CheckCircle className=\"h-5 w-5\" />
            <span>Aprovação de Políticas</span>
          </h2>
          <p className=\"text-sm text-muted-foreground\">
            Fluxo de aprovação estruturado e controlado
          </p>
        </div>
      </div>

      <div className=\"grid gap-6 lg:grid-cols-3\">
        {/* Pending List */}
        <div className=\"space-y-4\">
          <Card>
            <CardHeader>
              <CardTitle className=\"text-sm\">Aguardando Aprovação</CardTitle>
            </CardHeader>
            <CardContent className=\"p-0\">
              {pendingApprovals.map((policy) => (
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
                    <h3 className=\"font-medium text-sm\">{policy.title}</h3>
                    <p className=\"text-xs text-muted-foreground\">{policy.description}</p>
                    <div className=\"flex items-center justify-between\">
                      <Badge variant=\"outline\" className=\"text-xs\">
                        Nível {policy.approval_level}
                      </Badge>
                      <div className=\"flex items-center space-x-1 text-xs text-muted-foreground\">
                        <Clock className=\"h-3 w-3\" />
                        <span>3 dias</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Approval Content */}
        <div className=\"lg:col-span-2 space-y-6\">
          {selectedPolicy ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center space-x-2\">
                    <FileText className=\"h-5 w-5\" />
                    <span>{selectedPolicy.title}</span>
                  </CardTitle>
                  <p className=\"text-sm text-muted-foreground\">
                    {selectedPolicy.description}
                  </p>
                </CardHeader>
                <CardContent className=\"space-y-4\">
                  <div className=\"grid grid-cols-2 gap-4 text-sm\">
                    <div>
                      <span className=\"font-medium\">Categoria:</span> {selectedPolicy.category}
                    </div>
                    <div>
                      <span className=\"font-medium\">Tipo:</span> {selectedPolicy.policy_type}
                    </div>
                    <div>
                      <span className=\"font-medium\">Prioridade:</span> {selectedPolicy.priority}
                    </div>
                    <div>
                      <span className=\"font-medium\">Versão:</span> {selectedPolicy.version}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center space-x-2\">
                    <MessageSquare className=\"h-5 w-5\" />
                    <span>Decisão de Aprovação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className=\"space-y-6\">
                  <div className=\"flex space-x-4\">
                    <Button
                      variant={decision === 'approved' ? 'default' : 'outline'}
                      onClick={() => setDecision('approved')}
                      className=\"flex-1\"
                    >
                      <ThumbsUp className=\"h-4 w-4 mr-2\" />
                      Aprovar
                    </Button>
                    <Button
                      variant={decision === 'rejected' ? 'destructive' : 'outline'}
                      onClick={() => setDecision('rejected')}
                      className=\"flex-1\"
                    >
                      <ThumbsDown className=\"h-4 w-4 mr-2\" />
                      Rejeitar
                    </Button>
                  </div>

                  <div className=\"space-y-2\">
                    <label className=\"text-sm font-medium\">Comentários</label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder=\"Adicione comentários sobre sua decisão..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={submitDecision} 
                    disabled={!decision || isSubmitting}
                    className=\"w-full\"
                  >
                    {isSubmitting ? (
                      <>
                        <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2\"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Send className=\"h-4 w-4 mr-2\" />
                        Confirmar Decisão
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className=\"flex flex-col items-center justify-center py-16\">
                <CheckCircle className=\"h-16 w-16 text-muted-foreground mb-4\" />
                <h3 className=\"text-lg font-semibold mb-2\">Nenhuma Aprovação Pendente</h3>
                <p className=\"text-muted-foreground text-center\">
                  Todas as políticas foram processadas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyApprovalView;
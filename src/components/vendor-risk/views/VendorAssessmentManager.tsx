import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileCheck,
  Plus,
  Send,
  Link,
  Copy,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Brain,
  BarChart3,
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  MessageSquare,
  Zap,
  Target,
  Star,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';

interface VendorAssessment {
  id: string;
  vendor_id: string;
  framework_id: string;
  assessment_name: string;
  assessment_type: 'initial' | 'annual' | 'reassessment' | 'incident_triggered' | 'ad_hoc';
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  progress_percentage: number;
  public_link?: string;
  public_link_expires_at?: string;
  vendor_submitted_at?: string;
  internal_review_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_clarification';
  overall_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  vendor_registry?: {
    name: string;
    primary_contact_email?: string;
    primary_contact_name?: string;
  };
  vendor_assessment_frameworks?: {
    name: string;
    framework_type: string;
    questions: any[];
  };
}

interface VendorAssessmentManagerProps {
  searchTerm: string;
  selectedFilter: string;
}

export const VendorAssessmentManager: React.FC<VendorAssessmentManagerProps> = ({
  searchTerm,
  selectedFilter
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<VendorAssessment | null>(null);
  const [showNewAssessmentDialog, setShowNewAssessmentDialog] = useState(false);
  const [showPublicLinkDialog, setShowPublicLinkDialog] = useState(false);
  const [publicLinkData, setPublicLinkData] = useState<{link: string; expiresAt: string} | null>(null);

  // Load assessments
  const loadAssessments = async () => {
    if (!user?.tenantId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor_registry:vendor_id (
            name,
            primary_contact_email,
            primary_contact_name
          ),
          vendor_assessment_frameworks:framework_id (
            name,
            framework_type,
            questions
          )
        `)
        .eq('tenant_id', user.tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar assessments:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os assessments",
          variant: "destructive"
        });
        return;
      }

      setAssessments(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [user?.tenantId]);

  // Filter assessments based on search and filters
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = !searchTerm || 
      assessment.assessment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.vendor_registry?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'pending' && ['draft', 'sent'].includes(assessment.status)) ||
      (selectedFilter === 'in_progress' && assessment.status === 'in_progress') ||
      (selectedFilter === 'completed' && assessment.status === 'completed') ||
      (selectedFilter === 'overdue' && new Date(assessment.due_date) < new Date() && !['completed', 'approved'].includes(assessment.status));

    return matchesSearch && matchesFilter;
  });

  // Generate public link for assessment
  const generatePublicLink = async (assessmentId: string) => {
    try {
      const publicLinkId = `${assessmentId}-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

      const { error } = await supabase
        .from('vendor_assessments')
        .update({
          public_link: publicLinkId,
          public_link_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) throw error;

      const publicLink = `${window.location.origin}/vendor-assessment/${publicLinkId}`;
      
      setPublicLinkData({
        link: publicLink,
        expiresAt: expiresAt.toISOString()
      });

      setShowPublicLinkDialog(true);
      
      toast({
        title: "Link Público Gerado",
        description: "O link foi criado com sucesso. Você pode copiá-lo e enviá-lo ao fornecedor."
      });

      await loadAssessments(); // Refresh data

    } catch (error) {
      console.error('Erro ao gerar link público:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link público",
        variant: "destructive"
      });
    }
  };

  // Copy link to clipboard
  const copyLinkToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link Copiado",
        description: "O link foi copiado para a área de transferência"
      });
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
  };

  // Send assessment via email (placeholder for integration with notification system)
  const sendAssessmentEmail = async (assessment: VendorAssessment) => {
    if (!assessment.public_link) {
      await generatePublicLink(assessment.id);
      return;
    }

    // This would integrate with the notification system
    toast({
      title: "Assessment Enviado",
      description: `Assessment enviado para ${assessment.vendor_registry?.primary_contact_email || 'fornecedor'}`,
    });
  };

  // Get status badge
  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && !['completed', 'approved'].includes(status);
    
    if (isOverdue) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }

    switch (status) {
      case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
      case 'sent': return <Badge variant="outline">Enviado</Badge>;
      case 'in_progress': return <Badge variant="default">Em Andamento</Badge>;
      case 'completed': return <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">Concluído</Badge>;
      case 'approved': return <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-300">Aprovado</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejeitado</Badge>;
      case 'expired': return <Badge variant="secondary">Expirado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get risk level badge
  const getRiskLevelBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;

    switch (riskLevel) {
      case 'low': return <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-300">Baixo</Badge>;
      case 'medium': return <Badge variant="default" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">Médio</Badge>;
      case 'high': return <Badge variant="default" className="bg-orange-500/10 text-orange-700 dark:text-orange-300">Alto</Badge>;
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Assessments
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {assessments.length}
                </p>
              </div>
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Em Andamento
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {assessments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Concluídos
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {assessments.filter(a => ['completed', 'approved'].includes(a.status)).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Atrasados
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {assessments.filter(a => new Date(a.due_date) < new Date() && !['completed', 'approved'].includes(a.status)).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Assessments de Fornecedores</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowNewAssessmentDialog(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Carregando assessments...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileCheck className="h-8 w-8 text-gray-400" />
                        <span className="text-gray-500">Nenhum assessment encontrado</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{assessment.assessment_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {assessment.vendor_assessment_frameworks?.name}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">{assessment.vendor_registry?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {assessment.vendor_registry?.primary_contact_email}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {assessment.assessment_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(assessment.status, assessment.due_date)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={assessment.progress_percentage} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {assessment.progress_percentage}%
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getRiskLevelBadge(assessment.risk_level)}
                      </TableCell>
                      
                      <TableCell>
                        {assessment.overall_score ? (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{assessment.overall_score.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAssessment(assessment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generatePublicLink(assessment.id)}
                          >
                            <Link className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendAssessmentEmail(assessment)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Public Link Dialog */}
      <Dialog open={showPublicLinkDialog} onOpenChange={setShowPublicLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Link Público do Assessment
            </DialogTitle>
            <DialogDescription>
              Compartilhe este link com o fornecedor para que ele possa responder ao assessment.
            </DialogDescription>
          </DialogHeader>
          
          {publicLinkData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="public-link">Link Público</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="public-link"
                    value={publicLinkData.link}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyLinkToClipboard(publicLinkData.link)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expira em: {new Date(publicLinkData.expiresAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="bg-primary/10 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-primary mb-1">
                  🎯 ALEX VENDOR - Dica Inteligente
                </h4>
                <p className="text-sm text-primary/80">
                  O link expira automaticamente em 30 dias por segurança. O fornecedor receberá 
                  lembretes automáticos conforme o prazo se aproxima.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
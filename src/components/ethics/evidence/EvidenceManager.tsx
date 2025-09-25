import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  Download,
  Trash2,
  Eye,
  Lock,
  Shield,
  Calendar,
  Hash,
  HardDrive,
  Plus,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Archive,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface Evidence {
  id: string;
  ethics_report_id: string;
  investigation_plan_id?: string;
  evidence_type: string;
  evidence_source: string;
  evidence_description: string;
  evidence_location?: string;
  file_path?: string;
  file_hash?: string;
  file_size?: number;
  collected_date: string;
  collected_by: string;
  chain_of_custody: any[];
  preservation_status: string;
  retention_period_months: number;
  destruction_date?: string;
  legal_hold: boolean;
  legal_hold_reason?: string;
  privileged: boolean;
  privilege_type?: string;
  access_restricted: boolean;
  access_reason?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface EvidenceManagerProps {
  reportId?: string;
  investigationPlanId?: string;
  onUpdate?: () => void;
}

const EvidenceManager: React.FC<EvidenceManagerProps> = ({ 
  reportId, 
  investigationPlanId,
  onUpdate 
}) => {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [formData, setFormData] = useState<Partial<Evidence>>({
    evidence_type: 'document',
    evidence_source: 'investigation',
    preservation_status: 'active',
    retention_period_months: 84,
    legal_hold: false,
    privileged: false,
    access_restricted: false
  });

  useEffect(() => {
    if (user && (user.tenantId || user.isPlatformAdmin)) {
      fetchEvidence();
    }
  }, [reportId, investigationPlanId, user]);

  const fetchEvidence = async () => {
    if (!user?.tenantId && !user?.isPlatformAdmin) {
      setIsLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from('ethics_evidence')
        .select('*');
      
      if (reportId) {
        query = query.eq('ethics_report_id', reportId);
      } else if (!user.isPlatformAdmin && user.tenantId) {
        query = query.eq('tenant_id', user.tenantId);
      }
      
      if (investigationPlanId) {
        query = query.eq('investigation_plan_id', investigationPlanId);
      }

      const { data, error } = await query.order('collected_date', { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error('Erro ao carregar evidências');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.evidence_description || !formData.collected_date) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const evidenceData = {
        ...formData,
        ethics_report_id: reportId,
        investigation_plan_id: investigationPlanId,
        tenant_id: user?.tenant_id,
        collected_by: user?.id,
        updated_at: new Date().toISOString(),
        chain_of_custody: formData.chain_of_custody || []
      };

      if (editingEvidence) {
        const { error } = await supabase
          .from('ethics_evidence')
          .update(evidenceData)
          .eq('id', editingEvidence.id);
        
        if (error) throw error;
        toast.success('Evidência atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('ethics_evidence')
          .insert(evidenceData);
        
        if (error) throw error;
        toast.success('Evidência registrada com sucesso');
      }

      setIsCreateDialogOpen(false);
      setEditingEvidence(null);
      setFormData({
        evidence_type: 'document',
        evidence_source: 'investigation',
        preservation_status: 'active',
        retention_period_months: 84,
        legal_hold: false,
        privileged: false,
        access_restricted: false
      });
      fetchEvidence();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving evidence:', error);
      toast.error('Erro ao salvar evidência');
    }
  };

  const handleEdit = (evidenceItem: Evidence) => {
    setEditingEvidence(evidenceItem);
    setFormData(evidenceItem);
    setIsCreateDialogOpen(true);
  };

  const updateChainOfCustody = async (evidenceId: string, action: string, notes?: string) => {
    try {
      const evidenceItem = evidence.find(e => e.id === evidenceId);
      if (!evidenceItem) return;

      const newEntry = {
        action,
        user_id: user?.id,
        user_name: user?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        notes: notes || ''
      };

      const updatedChain = [...(evidenceItem.chain_of_custody || []), newEntry];

      const { error } = await supabase
        .from('ethics_evidence')
        .update({ 
          chain_of_custody: updatedChain,
          updated_at: new Date().toISOString()
        })
        .eq('id', evidenceId);

      if (error) throw error;
      
      toast.success('Cadeia de custódia atualizada');
      fetchEvidence();
    } catch (error) {
      console.error('Error updating chain of custody:', error);
      toast.error('Erro ao atualizar cadeia de custódia');
    }
  };

  const getEvidenceTypeIcon = (type: string) => {
    const icons = {
      'document': <FileText className="h-4 w-4" />,
      'digital': <HardDrive className="h-4 w-4" />,
      'physical': <Archive className="h-4 w-4" />,
      'testimony': <Eye className="h-4 w-4" />,
      'electronic': <LinkIcon className="h-4 w-4" />,
      'financial': <FileText className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'archived': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'destroyed': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      'transferred': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando evidências...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Gestão de Evidências</h3>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Evidência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvidence ? 'Editar Evidência' : 'Registrar Nova Evidência'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="preservation">Preservação</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="custody">Custódia</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="evidence_type">Tipo de Evidência</Label>
                    <Select 
                      value={formData.evidence_type} 
                      onValueChange={(value) => setFormData({...formData, evidence_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Documento</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="physical">Físico</SelectItem>
                        <SelectItem value="testimony">Testemunho</SelectItem>
                        <SelectItem value="electronic">Eletrônico</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="evidence_source">Fonte da Evidência</Label>
                    <Select 
                      value={formData.evidence_source} 
                      onValueChange={(value) => setFormData({...formData, evidence_source: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complainant">Denunciante</SelectItem>
                        <SelectItem value="witness">Testemunha</SelectItem>
                        <SelectItem value="subject">Denunciado</SelectItem>
                        <SelectItem value="third_party">Terceiro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                        <SelectItem value="investigation">Investigação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="collected_date">Data de Coleta *</Label>
                    <Input
                      id="collected_date"
                      type="datetime-local"
                      value={formData.collected_date?.substring(0, 16)}
                      onChange={(e) => setFormData({...formData, collected_date: e.target.value + ':00.000Z'})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="evidence_location">Localização</Label>
                    <Input
                      id="evidence_location"
                      value={formData.evidence_location}
                      onChange={(e) => setFormData({...formData, evidence_location: e.target.value})}
                      placeholder="Onde a evidência está armazenada"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="evidence_description">Descrição da Evidência *</Label>
                  <Textarea
                    id="evidence_description"
                    value={formData.evidence_description}
                    onChange={(e) => setFormData({...formData, evidence_description: e.target.value})}
                    rows={4}
                    placeholder="Descrição detalhada da evidência..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="file_hash">Hash do Arquivo</Label>
                    <Input
                      id="file_hash"
                      value={formData.file_hash}
                      onChange={(e) => setFormData({...formData, file_hash: e.target.value})}
                      placeholder="SHA-256 hash para verificação de integridade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="file_size">Tamanho do Arquivo (bytes)</Label>
                    <Input
                      id="file_size"
                      type="number"
                      value={formData.file_size}
                      onChange={(e) => setFormData({...formData, file_size: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preservation" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preservation_status">Status de Preservação</Label>
                    <Select 
                      value={formData.preservation_status} 
                      onValueChange={(value) => setFormData({...formData, preservation_status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="archived">Arquivado</SelectItem>
                        <SelectItem value="destroyed">Destruído</SelectItem>
                        <SelectItem value="transferred">Transferido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="retention_period_months">Período de Retenção (meses)</Label>
                    <Input
                      id="retention_period_months"
                      type="number"
                      value={formData.retention_period_months}
                      onChange={(e) => setFormData({...formData, retention_period_months: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="destruction_date">Data de Destruição</Label>
                    <Input
                      id="destruction_date"
                      type="date"
                      value={formData.destruction_date}
                      onChange={(e) => setFormData({...formData, destruction_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="legal_hold"
                      checked={formData.legal_hold}
                      onCheckedChange={(checked) => setFormData({...formData, legal_hold: checked as boolean})}
                    />
                    <Label htmlFor="legal_hold">Legal Hold (Retenção Legal)</Label>
                  </div>

                  {formData.legal_hold && (
                    <div>
                      <Label htmlFor="legal_hold_reason">Motivo do Legal Hold</Label>
                      <Textarea
                        id="legal_hold_reason"
                        value={formData.legal_hold_reason}
                        onChange={(e) => setFormData({...formData, legal_hold_reason: e.target.value})}
                        rows={2}
                        placeholder="Explicar por que a evidência está em legal hold..."
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="legal" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privileged"
                      checked={formData.privileged}
                      onCheckedChange={(checked) => setFormData({...formData, privileged: checked as boolean})}
                    />
                    <Label htmlFor="privileged">Informação Privilegiada</Label>
                  </div>

                  {formData.privileged && (
                    <div>
                      <Label htmlFor="privilege_type">Tipo de Privilégio</Label>
                      <Select 
                        value={formData.privilege_type} 
                        onValueChange={(value) => setFormData({...formData, privilege_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attorney_client">Advogado-Cliente</SelectItem>
                          <SelectItem value="work_product">Produto do Trabalho</SelectItem>
                          <SelectItem value="trade_secret">Segredo Comercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="access_restricted"
                      checked={formData.access_restricted}
                      onCheckedChange={(checked) => setFormData({...formData, access_restricted: checked as boolean})}
                    />
                    <Label htmlFor="access_restricted">Acesso Restrito</Label>
                  </div>

                  {formData.access_restricted && (
                    <div>
                      <Label htmlFor="access_reason">Motivo da Restrição</Label>
                      <Textarea
                        id="access_reason"
                        value={formData.access_reason}
                        onChange={(e) => setFormData({...formData, access_reason: e.target.value})}
                        rows={2}
                        placeholder="Por que o acesso é restrito..."
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custody" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Cadeia de Custódia</h4>
                  {editingEvidence?.chain_of_custody && editingEvidence.chain_of_custody.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editingEvidence.chain_of_custody.map((entry: any, index: number) => (
                        <div key={index} className="border rounded p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{entry.action}</span>
                            <span className="text-gray-500 text-xs">
                              {format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            Por: {entry.user_name}
                          </div>
                          {entry.notes && (
                            <div className="text-gray-600 dark:text-gray-400 mt-1">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma entrada na cadeia de custódia ainda.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Evidência
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {evidence.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma evidência registrada ainda.</p>
            <p>Clique em "Nova Evidência" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {evidence.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getEvidenceTypeIcon(item.evidence_type)}
                    <div>
                      <CardTitle className="text-lg">
                        {item.evidence_type === 'document' ? 'Documento' :
                         item.evidence_type === 'digital' ? 'Evidência Digital' :
                         item.evidence_type === 'physical' ? 'Evidência Física' :
                         item.evidence_type === 'testimony' ? 'Testemunho' :
                         item.evidence_type === 'electronic' ? 'Eletrônico' :
                         item.evidence_type === 'financial' ? 'Financeiro' :
                         item.evidence_type}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Coletado em {format(new Date(item.collected_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.legal_hold && (
                      <Badge className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                        <Lock className="h-3 w-3 mr-1" />
                        Legal Hold
                      </Badge>
                    )}
                    {item.privileged && (
                      <Badge className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Privilegiado
                      </Badge>
                    )}
                    <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(item.preservation_status)}`}>
                      {item.preservation_status === 'active' ? 'Ativo' :
                       item.preservation_status === 'archived' ? 'Arquivado' :
                       item.preservation_status === 'destroyed' ? 'Destruído' :
                       item.preservation_status === 'transferred' ? 'Transferido' :
                       item.preservation_status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Descrição:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.evidence_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Fonte:</span>
                      <p className="text-gray-600 dark:text-gray-400 capitalize">
                        {item.evidence_source.replace('_', ' ')}
                      </p>
                    </div>
                    {item.evidence_location && (
                      <div>
                        <span className="font-medium">Localização:</span>
                        <p className="text-gray-600 dark:text-gray-400">{item.evidence_location}</p>
                      </div>
                    )}
                    {item.file_size && (
                      <div>
                        <span className="font-medium">Tamanho:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {(item.file_size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Retenção:</span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.retention_period_months} meses
                      </p>
                    </div>
                  </div>

                  {item.file_hash && (
                    <div className="border-t pt-2">
                      <span className="font-medium text-sm">Hash: </span>
                      <span className="text-xs font-mono text-gray-500 break-all">
                        {item.file_hash}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateChainOfCustody(item.id, 'Acessado', 'Visualização de evidência')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Registrar Acesso
                    </Button>
                    {item.chain_of_custody && item.chain_of_custody.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const lastEntry = item.chain_of_custody[item.chain_of_custody.length - 1];
                          toast.info(`Última ação: ${lastEntry.action} por ${lastEntry.user_name}`);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Ver Custódia ({item.chain_of_custody.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceManager;
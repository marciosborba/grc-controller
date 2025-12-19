import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  FileCheck,
  Brain
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';

// Componente de botão de compliance com estilos forçados
interface ComplianceButtonProps {
  status: ComplianceStatus;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const ComplianceButton: React.FC<ComplianceButtonProps> = ({
  status,
  isSelected,
  onClick,
  disabled = false,
  children
}) => {
  console.log('ComplianceButton render:', { status, isSelected });

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: '500',
        borderRadius: '6px',
        border: '2px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        minHeight: '36px',
        // Cores forçadas baseadas no status e seleção
        backgroundColor: isSelected
          ? (status === 'compliant' ? '#16a34a'
            : status === 'compliant_with_reservation' ? '#ca8a04'
              : '#dc2626')
          : 'transparent',
        color: isSelected
          ? '#ffffff'
          : (status === 'compliant' ? '#15803d'
            : status === 'compliant_with_reservation' ? '#a16207'
              : '#dc2626'),
        borderColor: isSelected
          ? (status === 'compliant' ? '#16a34a'
            : status === 'compliant_with_reservation' ? '#ca8a04'
              : '#dc2626')
          : (status === 'compliant' ? '#86efac'
            : status === 'compliant_with_reservation' ? '#fde047'
              : '#fca5a5')
      }}
      className="compliance-button"
    >
      {children}
    </button>
  );
};

// Tipos para o checklist editável
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'compliant_with_reservation' | null;

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  category: string;
  order: number;
  isDefault: boolean; // Para identificar questões padrão vs customizadas
  createdBy?: string;
  updatedAt?: string;
}

export interface ChecklistResponse {
  itemId: string;
  status: ComplianceStatus;
  justification: string;
  attachments?: string[];
  respondedBy?: string;
  respondedAt?: string;
}

interface EditableChecklistManagerProps {
  vendorId?: string;
  onChecklistComplete: (completed: boolean) => void;
  onResponsesChange?: (responses: Record<string, ChecklistResponse>) => void;
}

// Questões padrão conforme especificado
const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, 'id' | 'createdBy' | 'updatedAt'>[] = [
  {
    title: 'Registro Empresarial Válido (CNPJ)',
    description: 'CNPJ ativo na Receita Federal com situação cadastral regular',
    required: true,
    category: 'legal',
    order: 1,
    isDefault: true
  },
  {
    title: 'Cláusula Contratual de Privacidade',
    description: 'Cláusulas específicas sobre proteção de dados e privacidade conforme LGPD',
    required: true,
    category: 'legal',
    order: 2,
    isDefault: true
  },
  {
    title: 'Cláusulas Contratuais de Segurança da Informação',
    description: 'Disposições contratuais sobre segurança da informação e proteção de dados',
    required: true,
    category: 'security',
    order: 3,
    isDefault: true
  },
  {
    title: 'Cláusula Contratual de NDA',
    description: 'Acordo de confidencialidade (Non-Disclosure Agreement) assinado',
    required: true,
    category: 'legal',
    order: 4,
    isDefault: true
  },
  {
    title: 'Cláusula Contratual de SLA',
    description: 'Service Level Agreement com métricas e penalidades definidas',
    required: true,
    category: 'operational',
    order: 5,
    isDefault: true
  }
];

export const EditableChecklistManager: React.FC<EditableChecklistManagerProps> = ({
  vendorId,
  onChecklistComplete,
  onResponsesChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [responses, setResponses] = useState<Record<string, ChecklistResponse>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    title: '',
    description: '',
    required: false,
    category: 'operational',
    isDefault: false
  });

  // Carregar checklist ao montar o componente
  useEffect(() => {
    console.log('EditableChecklistManager montado:', { vendorId, tenantId: user?.tenantId, userId: user?.id });
    loadChecklist();
  }, [vendorId, user?.tenantId]);

  // Verificar se checklist está completo
  useEffect(() => {
    const requiredItems = checklistItems.filter(item => item.required);
    const completedRequired = requiredItems.filter(item => {
      const response = responses[item.id];
      const isCompleted = response?.status === 'compliant' || response?.status === 'compliant_with_reservation';

      // Verificar se justificativa é obrigatória para "non_compliant"
      if (response?.status === 'non_compliant' && item.required) {
        const hasJustification = response.justification && response.justification.trim().length > 0;
        console.log(`Item ${item.id} (${item.title}) - Non-compliant com justificativa:`, hasJustification);
        return hasJustification; // Considera completo se tem justificativa
      }

      return isCompleted;
    });

    const isComplete = requiredItems.length > 0 && completedRequired.length === requiredItems.length;

    console.log('Validação do checklist:', {
      totalRequired: requiredItems.length,
      completedRequired: completedRequired.length,
      isComplete,
      requiredItems: requiredItems.map(item => ({
        id: item.id,
        title: item.title,
        response: responses[item.id],
        isCompleted: responses[item.id]?.status === 'compliant' ||
          responses[item.id]?.status === 'compliant_with_reservation' ||
          (responses[item.id]?.status === 'non_compliant' && responses[item.id]?.justification?.trim())
      }))
    });

    onChecklistComplete(isComplete);

    if (onResponsesChange) {
      onResponsesChange(responses);
    }
  }, [checklistItems, responses, onChecklistComplete, onResponsesChange]);

  // Carregar checklist do banco ou criar padrão
  const loadChecklist = async () => {
    console.log('Carregando checklist...', { tenantId: user?.tenantId, vendorId });

    if (!user?.tenantId) {
      console.log('Sem tenant ID, usando checklist padrão local');
      // Fallback para checklist padrão local se não houver tenant
      const defaultItems = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
        ...item,
        id: `default-${index}`,
        createdBy: user?.id || '',
        updatedAt: new Date().toISOString()
      }));
      setChecklistItems(defaultItems);
      return;
    }

    try {
      // Tentar carregar checklist customizado do tenant
      const { data: customItems, error } = await supabase
        .from('vendor_checklist_templates')
        .select('*')
        .eq('tenant_id', user.tenantId)
        .order('order_index');

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        console.error('Erro ao carregar checklist:', error);
      }

      if (customItems && customItems.length > 0) {
        console.log('Checklist customizado carregado:', customItems.length, 'itens');
        // Usar checklist customizado
        setChecklistItems(customItems.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          required: item.required,
          category: item.category,
          order: item.order_index,
          isDefault: item.is_default,
          createdBy: item.created_by,
          updatedAt: item.updated_at
        })));
      } else {
        console.log('Nenhum checklist encontrado, criando padrão');
        // Criar checklist padrão
        await createDefaultChecklist();
      }

      // Carregar respostas se houver vendorId
      if (vendorId) {
        console.log('Carregando respostas para vendor:', vendorId);
        await loadResponses();
      } else {
        console.log('Sem vendorId, não carregando respostas');
      }
    } catch (error) {
      console.error('Erro ao carregar checklist:', error);
      // Fallback para checklist padrão local
      const defaultItems = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
        ...item,
        id: `default-${index}`,
        createdBy: user?.id || '',
        updatedAt: new Date().toISOString()
      }));
      setChecklistItems(defaultItems);
    }
  };

  // Criar checklist padrão no banco
  const createDefaultChecklist = async () => {
    if (!user?.tenantId) return;

    try {
      const itemsToInsert = DEFAULT_CHECKLIST_ITEMS.map(item => ({
        ...item,
        tenant_id: user.tenantId,
        created_by: user.id,
        is_default: item.isDefault
      }));

      const { data, error } = await supabase
        .from('vendor_checklist_templates')
        .insert(itemsToInsert)
        .select();

      if (error) {
        console.error('Erro ao criar checklist padrão:', error);
        // Fallback para checklist local
        const defaultItems = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
          ...item,
          id: `default-${index}`,
          createdBy: user?.id || '',
          updatedAt: new Date().toISOString()
        }));
        setChecklistItems(defaultItems);
        return;
      }

      if (data) {
        setChecklistItems(data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          required: item.required,
          category: item.category,
          order: item.order_index,
          isDefault: item.is_default,
          createdBy: item.created_by,
          updatedAt: item.updated_at
        })));
      }
    } catch (error) {
      console.error('Erro ao criar checklist padrão:', error);
    }
  };

  // Carregar respostas do vendor
  const loadResponses = async () => {
    if (!vendorId) {
      console.log('Sem vendorId para carregar respostas');
      return;
    }

    try {
      console.log('Buscando respostas para vendor:', vendorId);
      const { data, error } = await supabase
        .from('vendor_checklist_responses')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) {
        console.error('Erro ao carregar respostas:', error);
        return;
      }

      console.log('Respostas carregadas:', data?.length || 0, 'respostas');

      if (data) {
        const responsesMap: Record<string, ChecklistResponse> = {};
        data.forEach(response => {
          responsesMap[response.item_id] = {
            itemId: response.item_id,
            status: response.status as ComplianceStatus,
            justification: response.justification || '',
            attachments: response.attachments || [],
            respondedBy: response.responded_by,
            respondedAt: response.responded_at
          };
        });
        setResponses(responsesMap);
        console.log('Respostas mapeadas:', Object.keys(responsesMap).length, 'itens');
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    }
  };

  // Salvar resposta
  const saveResponse = async (itemId: string, response: Partial<ChecklistResponse>) => {
    console.log('Salvando resposta:', { itemId, response, vendorId, userId: user?.id });

    if (!vendorId || !user?.id) {
      console.error('Vendor ID ou User ID não encontrado:', { vendorId, userId: user?.id });
      toast({
        title: "Erro",
        description: "Informações do fornecedor ou usuário não encontradas",
        variant: "destructive"
      });
      return;
    }

    try {
      const responseData = {
        vendor_id: vendorId,
        item_id: itemId,
        status: response.status,
        justification: response.justification || '',
        attachments: response.attachments || [],
        responded_by: user.id,
        responded_at: new Date().toISOString()
      };

      console.log('Dados sendo enviados para o banco:', responseData);

      const { data, error } = await supabase
        .from('vendor_checklist_responses')
        .upsert(responseData, { onConflict: 'vendor_id,item_id' })
        .select();

      if (error) {
        console.error('Erro SQL ao salvar resposta:', error);
        throw error;
      }

      console.log('Resposta salva no banco:', data);

    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      throw error;
    }
  };

  // Adicionar novo item
  const addNewItem = async () => {
    if (!newItem.title) return;

    const maxOrder = Math.max(...checklistItems.map(item => item.order), 0);
    const newChecklistItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      title: newItem.title,
      description: newItem.description || '',
      required: newItem.required || false,
      category: newItem.category || 'operational',
      order: maxOrder + 1,
      isDefault: false,
      createdBy: user?.id || '',
      updatedAt: new Date().toISOString()
    };

    if (user?.tenantId) {
      try {
        const itemToInsert = {
          title: newItem.title,
          description: newItem.description || '',
          required: newItem.required || false,
          category: newItem.category || 'operational',
          order: maxOrder + 1,
          is_default: false,
          tenant_id: user.tenantId,
          created_by: user.id
        };

        const { data, error } = await supabase
          .from('vendor_checklist_templates')
          .insert(itemToInsert)
          .select()
          .single();

        if (error) {
          console.error('Erro ao adicionar item:', error);
          toast({
            title: "Erro",
            description: "Não foi possível adicionar o item",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          newChecklistItem.id = data.id;
        }
      } catch (error) {
        console.error('Erro ao adicionar item:', error);
      }
    }

    setChecklistItems(prev => [...prev, newChecklistItem].sort((a, b) => a.order - b.order));
    setNewItem({
      title: '',
      description: '',
      required: false,
      category: 'operational',
      isDefault: false
    });
    setIsAddingNew(false);

    toast({
      title: "Item Adicionado",
      description: "Nova questão foi adicionada ao checklist"
    });
  };

  // Editar item existente
  const updateItem = async (item: ChecklistItem) => {
    if (user?.tenantId && !item.id.startsWith('default-') && !item.id.startsWith('custom-')) {
      try {
        const { error } = await supabase
          .from('vendor_checklist_templates')
          .update({
            title: item.title,
            description: item.description,
            required: item.required,
            category: item.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) {
          console.error('Erro ao atualizar item:', error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o item",
            variant: "destructive"
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao atualizar item:', error);
      }
    }

    setChecklistItems(prev =>
      prev.map(i => i.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : i)
    );
    setEditingItem(null);

    toast({
      title: "Item Atualizado",
      description: "Questão foi atualizada com sucesso"
    });
  };

  // Remover item (apenas customizados)
  const removeItem = async (itemId: string) => {
    const item = checklistItems.find(i => i.id === itemId);
    if (!item || item.isDefault) {
      toast({
        title: "Não Permitido",
        description: "Questões padrão não podem ser removidas",
        variant: "destructive"
      });
      return;
    }

    if (user?.tenantId && !itemId.startsWith('default-') && !itemId.startsWith('custom-')) {
      try {
        const { error } = await supabase
          .from('vendor_checklist_templates')
          .delete()
          .eq('id', itemId);

        if (error) {
          console.error('Erro ao remover item:', error);
          toast({
            title: "Erro",
            description: "Não foi possível remover o item",
            variant: "destructive"
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao remover item:', error);
      }
    }

    setChecklistItems(prev => prev.filter(i => i.id !== itemId));

    // Remover respostas relacionadas
    setResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[itemId];
      return newResponses;
    });

    toast({
      title: "Item Removido",
      description: "Questão foi removida do checklist"
    });
  };

  // Atualizar resposta local
  const updateResponse = async (itemId: string, field: keyof ChecklistResponse, value: any) => {
    console.log('Atualizando resposta:', { itemId, field, value, vendorId });

    const updatedResponse = {
      ...responses[itemId],
      itemId,
      [field]: value
    };

    // Atualizar estado local imediatamente para feedback visual
    setResponses(prev => ({
      ...prev,
      [itemId]: updatedResponse
    }));

    // Salvar no banco se for uma mudança de status ou justificativa
    if (field === 'status' || field === 'justification') {
      try {
        await saveResponse(itemId, updatedResponse);
        console.log('Resposta salva com sucesso');

        toast({
          title: "Resposta Salva",
          description: `Status atualizado para: ${value === 'compliant' ? 'Compliance' : value === 'compliant_with_reservation' ? 'Compliance com Ressalva' : 'Não Compliance'}`,
        });
      } catch (error) {
        console.error('Erro ao salvar resposta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a resposta",
          variant: "destructive"
        });
      }
    }
  };

  // Obter cor do botão de status
  const getStatusButtonClass = (status: ComplianceStatus, currentStatus: ComplianceStatus) => {
    const isActive = status === currentStatus;

    switch (status) {
      case 'compliant':
        return isActive
          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
          : 'border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20';
      case 'compliant_with_reservation':
        return isActive
          ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600'
          : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950/20';
      case 'non_compliant':
        return isActive
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
          : 'border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20';
      default:
        return 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950/20';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'compliant_with_reservation':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'non_compliant':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Calcular estatísticas
  const requiredItems = checklistItems.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => {
    const response = responses[item.id];
    return response?.status === 'compliant' ||
      response?.status === 'compliant_with_reservation' ||
      (response?.status === 'non_compliant' && response?.justification?.trim());
  }).length;
  const isComplete = requiredItems.length > 0 && completedRequired === requiredItems.length;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Brain className="h-5 w-5" />
                Checklist de Due Diligence
              </CardTitle>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Checklist editável para avaliação de fornecedores
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
              >
                <Settings className="h-4 w-4 mr-1" />
                {isEditing ? 'Finalizar Edição' : 'Editar Checklist'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${isComplete ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {completedRequired}/{requiredItems.length} itens obrigatórios
              </span>
            </div>

            <div className="flex-1">
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  style={{ width: `${requiredItems.length > 0 ? (completedRequired / requiredItems.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <Badge variant={isComplete ? "default" : "secondary"} className={
              isComplete ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
            }>
              {isComplete ? "Completo" : "Pendente"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Botão para adicionar nova questão */}
      {isEditing && (
        <Card className="border-dashed border-gray-300 dark:border-gray-700">
          <CardContent className="p-4">
            {!isAddingNew ? (
              <Button
                variant="outline"
                onClick={() => setIsAddingNew(true)}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Nova Questão
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-title">Título da Questão *</Label>
                    <Input
                      id="new-title"
                      value={newItem.title || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Certificação ISO 27001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-category">Categoria</Label>
                    <select
                      id="new-category"
                      value={newItem.category || 'operational'}
                      onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="legal">Legal</option>
                      <option value="security">Segurança</option>
                      <option value="operational">Operacional</option>
                      <option value="financial">Financeiro</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-description">Descrição</Label>
                  <Textarea
                    id="new-description"
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada da questão..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-required"
                    checked={newItem.required || false}
                    onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, required: !!checked }))}
                  />
                  <Label htmlFor="new-required">Item obrigatório</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addNewItem} disabled={!newItem.title}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewItem({
                        title: '',
                        description: '',
                        required: false,
                        category: 'operational',
                        isDefault: false
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de questões */}
      <div className="space-y-4">
        {checklistItems
          .sort((a, b) => a.order - b.order)
          .map((item) => {
            const response = responses[item.id];
            const isEditingThis = editingItem?.id === item.id;

            // Debug: log do estado da resposta
            if (process.env.NODE_ENV === 'development') {
              console.log(`Item ${item.id} (${item.title}):`, {
                response,
                status: response?.status,
                hasResponse: !!response
              });
            }

            return (
              <Card key={item.id} className={`transition-all duration-200 ${response?.status === 'compliant'
                ? 'border-green-300 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20'
                : response?.status === 'compliant_with_reservation'
                  ? 'border-yellow-300 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/20'
                  : response?.status === 'non_compliant'
                    ? 'border-red-300 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20'
                    : item.required
                      ? 'border-orange-300 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/20'
                      : 'border-gray-300 dark:border-gray-700'
                }`}>
                <CardContent className="p-4">
                  {!isEditingThis ? (
                    <div className="space-y-4">
                      {/* Header da questão */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{item.title}</h4>
                            {item.required && (
                              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                            )}
                            {item.isDefault && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Padrão
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {!item.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botões de status */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <ComplianceButton
                            status="compliant"
                            isSelected={response?.status === 'compliant'}
                            onClick={() => {
                              console.log('Clicou em Compliance para item:', item.id, 'Current response:', response);
                              updateResponse(item.id, 'status', 'compliant');
                            }}
                            disabled={!vendorId}
                          >
                            {getStatusIcon('compliant')}
                            Compliance
                          </ComplianceButton>

                          <ComplianceButton
                            status="compliant_with_reservation"
                            isSelected={response?.status === 'compliant_with_reservation'}
                            onClick={() => {
                              console.log('Clicou em Compliance com Ressalva para item:', item.id, 'Current response:', response);
                              updateResponse(item.id, 'status', 'compliant_with_reservation');
                            }}
                            disabled={!vendorId}
                          >
                            {getStatusIcon('compliant_with_reservation')}
                            Compliance com Ressalva
                          </ComplianceButton>

                          <ComplianceButton
                            status="non_compliant"
                            isSelected={response?.status === 'non_compliant'}
                            onClick={() => {
                              console.log('Clicou em Não Compliance para item:', item.id, 'Current response:', response);
                              updateResponse(item.id, 'status', 'non_compliant');
                            }}
                            disabled={!vendorId}
                          >
                            {getStatusIcon('non_compliant')}
                            Não Compliance
                          </ComplianceButton>
                        </div>

                        {!vendorId && (
                          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            ⚠️ Para responder o checklist, é necessário ter um fornecedor selecionado no workflow de onboarding.
                          </div>
                        )}

                        {/* Campo de justificativa */}
                        {response?.status && (
                          <div className="space-y-2">
                            <Label htmlFor={`justification-${item.id}`} className="text-xs font-medium">
                              Justificativa {response.status === 'non_compliant' && item.required ? '(obrigatória)' : ''}
                              {response.status === 'non_compliant' && item.required && (
                                <span className="text-red-600 ml-1">*</span>
                              )}
                            </Label>
                            <Textarea
                              id={`justification-${item.id}`}
                              placeholder={response.status === 'non_compliant' && item.required
                                ? "Justificativa obrigatória para itens não compliance..."
                                : "Descreva a justificativa para esta avaliação..."}
                              value={response.justification || ''}
                              onChange={(e) => updateResponse(item.id, 'justification', e.target.value)}
                              className={`text-xs min-h-[60px] ${response.status === 'non_compliant' && item.required && !response.justification?.trim()
                                ? 'border-red-300 focus:border-red-500'
                                : ''
                                }`}
                              required={response.status === 'non_compliant' && item.required}
                            />
                            {response.status === 'non_compliant' && item.required && !response.justification?.trim() && (
                              <p className="text-xs text-red-600">
                                Justificativa é obrigatória para itens marcados como "Não Compliance"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Modo de edição */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-title-${item.id}`}>Título da Questão *</Label>
                          <Input
                            id={`edit-title-${item.id}`}
                            value={editingItem?.title || ''}
                            onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-category-${item.id}`}>Categoria</Label>
                          <select
                            id={`edit-category-${item.id}`}
                            value={editingItem?.category || 'operational'}
                            onChange={(e) => setEditingItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="legal">Legal</option>
                            <option value="security">Segurança</option>
                            <option value="operational">Operacional</option>
                            <option value="financial">Financeiro</option>
                            <option value="compliance">Compliance</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`edit-description-${item.id}`}>Descrição</Label>
                        <Textarea
                          id={`edit-description-${item.id}`}
                          value={editingItem?.description || ''}
                          onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-required-${item.id}`}
                          checked={editingItem?.required || false}
                          onCheckedChange={(checked) => setEditingItem(prev => prev ? { ...prev, required: !!checked } : null)}
                        />
                        <Label htmlFor={`edit-required-${item.id}`}>Item obrigatório</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => editingItem && updateItem(editingItem)}
                          disabled={!editingItem?.title}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingItem(null)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Resumo de insights */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Insights do Checklist
          </h4>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            {!isComplete && (
              <p>⚠️ Ainda faltam {requiredItems.length - completedRequired} itens obrigatórios com status Compliance</p>
            )}
            {isComplete && (
              <p>✅ Todos os requisitos obrigatórios estão em Compliance!</p>
            )}

            {/* Resumo de status */}
            {(() => {
              const totalResponses = Object.values(responses);
              const compliantCount = totalResponses.filter(r => r?.status === 'compliant').length;
              const withReservationCount = totalResponses.filter(r => r?.status === 'compliant_with_reservation').length;
              const nonCompliantCount = totalResponses.filter(r => r?.status === 'non_compliant').length;

              return (
                <div className="flex gap-4 text-xs">
                  {compliantCount > 0 && <span>✅ {compliantCount} em compliance</span>}
                  {withReservationCount > 0 && <span>⚠️ {withReservationCount} com ressalva</span>}
                  {nonCompliantCount > 0 && <span>❌ {nonCompliantCount} não compliance</span>}
                </div>
              );
            })()}

            <p>💡 Checklist personalizado com {checklistItems.length} questões ({checklistItems.filter(i => i.isDefault).length} padrão, {checklistItems.filter(i => !i.isDefault).length} customizadas)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
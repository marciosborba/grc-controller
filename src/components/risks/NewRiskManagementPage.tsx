import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRiskManagement } from '@/hooks/useRiskManagement';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Shield, 
  Search,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
  Filter,
  Brain,
  BarChart3,
  Settings
} from 'lucide-react';
import SortableRiskCard from './SortableRiskCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import type { 
  Risk, 
  CreateRiskRequest, 
  RiskCategory, 
  TreatmentType, 
  RiskLevel,
  RiskStatus,
  RiskFilters
} from '@/types/risk-management';
import { RISK_CATEGORIES, TREATMENT_TYPES } from '@/types/risk-management';

const NewRiskManagementPage: React.FC = () => {
  const { user } = useAuth();
  const {
    risks,
    metrics,
    isLoadingRisks,
    isLoadingMetrics,
    risksError,
    createRisk,
    updateRisk,
    deleteRisk,
    isCreatingRisk,
    filterRisks
  } = useRiskManagement();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<RiskCategory[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<RiskLevel[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<RiskStatus[]>([]);
  const [showOverdue, setShowOverdue] = useState(false);
  const [orderedRisks, setOrderedRisks] = useState<Risk[]>([]);

  // Form data for creating new risk
  const [formData, setFormData] = useState<CreateRiskRequest>({
    name: '',
    description: '',
    executiveSummary: '',
    technicalDetails: '',
    category: 'Operacional',
    probability: 3,
    impact: 3,
    treatmentType: 'Mitigar',
    owner: user?.id || '',
    assignedTo: '',
    dueDate: undefined
  });

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Apply filters to risks
  const filteredRisks = filterRisks({
    searchTerm,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    levels: selectedLevels.length > 0 ? selectedLevels : undefined,
    statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    showOverdue
  });

  // Update ordered risks when filtered risks change
  useEffect(() => {
    if (filteredRisks.length > 0) {
      setOrderedRisks(filteredRisks);
    }
  }, [filteredRisks]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedRisks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save order to localStorage
        localStorage.setItem('riskCardsOrder', JSON.stringify(newOrder.map(r => r.id)));
        
        return newOrder;
      });
    }
  };

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('riskCardsOrder');
    if (savedOrder && filteredRisks.length > 0) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const reorderedRisks = orderIds
          .map((id: string) => filteredRisks.find(risk => risk.id === id))
          .filter(Boolean)
          .concat(filteredRisks.filter(risk => !orderIds.includes(risk.id)));
        setOrderedRisks(reorderedRisks);
      } catch (error) {
        console.warn('Failed to load saved risk order:', error);
        setOrderedRisks(filteredRisks);
      }
    }
  }, [filteredRisks]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      executiveSummary: '',
      technicalDetails: '',
      category: 'Operacional',
      probability: 3,
      impact: 3,
      treatmentType: 'Mitigar',
      owner: user?.id || '',
      assignedTo: '',
      dueDate: undefined
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRisk(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateRisk = async (riskId: string, updates: any) => {
    updateRisk({ riskId, data: updates });
  };

  const handleDeleteRisk = async (riskId: string) => {
    if (confirm('Tem certeza que deseja excluir este risco?')) {
      deleteRisk(riskId);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoadingRisks) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando riscos...</div>
        </CardContent>
      </Card>
    );
  }

  if (risksError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Erro ao carregar riscos: {risksError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Gestão de Riscos Corporativos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie e monitore riscos com cards interativos e drag & drop
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            IA Assistente
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Risco
              </Button>
            </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Novo Risco
                    </DialogTitle>
                    <DialogDescription>
                      Cadastre um novo risco para monitoramento e gestão
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="name">Nome do Risco *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Ex: Vulnerabilidade crítica no sistema de pagamentos"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="category">Categoria *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value as RiskCategory })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(RISK_CATEGORIES).map(([key, description]) => (
                                <SelectItem key={key} value={key} title={description}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="treatmentType">Tratamento *</Label>
                          <Select
                            value={formData.treatmentType}
                            onValueChange={(value) => setFormData({ ...formData, treatmentType: value as TreatmentType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TREATMENT_TYPES).map(([key, description]) => (
                                <SelectItem key={key} value={key} title={description}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="probability">Probabilidade (1-5) *</Label>
                          <Input
                            id="probability"
                            type="number"
                            min="1"
                            max="5"
                            value={formData.probability}
                            onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">1 = Muito Baixa, 5 = Muito Alta</p>
                        </div>
                        
                        <div>
                          <Label htmlFor="impact">Impacto (1-5) *</Label>
                          <Input
                            id="impact"
                            type="number"
                            min="1"
                            max="5"
                            value={formData.impact}
                            onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">1 = Muito Baixo, 5 = Muito Alto</p>
                        </div>
                        
                        <div className="col-span-2">
                          <Label htmlFor="description">Descrição Técnica</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Descreva tecnicamente o risco identificado..."
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Label htmlFor="executiveSummary">Sumário Executivo</Label>
                          <Textarea
                            id="executiveSummary"
                            value={formData.executiveSummary}
                            onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
                            rows={2}
                            placeholder="Resumo executivo para alta gestão..."
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="assignedTo">Responsável</Label>
                          <Input
                            id="assignedTo"
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            placeholder="Nome do responsável pelo tratamento"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="dueDate">Data de Vencimento</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate?.toISOString().split('T')[0] || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              dueDate: e.target.value ? new Date(e.target.value) : undefined 
                            })}
                          />
                        </div>
                        
                        <div className="col-span-2 bg-muted/50 p-4 rounded-lg">
                          <Label className="text-sm font-medium">Nível de Risco Calculado</Label>
                          <div className="mt-2">
                            <Badge className={getRiskLevelColor(
                              formData.probability * formData.impact >= 20 ? 'Muito Alto' :
                              formData.probability * formData.impact >= 15 ? 'Alto' :
                              formData.probability * formData.impact >= 8 ? 'Médio' :
                              formData.probability * formData.impact >= 4 ? 'Baixo' : 'Muito Baixo'
                            )}>
                              {formData.probability * formData.impact >= 20 ? 'Muito Alto' :
                               formData.probability * formData.impact >= 15 ? 'Alto' :
                               formData.probability * formData.impact >= 8 ? 'Médio' :
                               formData.probability * formData.impact >= 4 ? 'Baixo' : 'Muito Baixo'}
                            </Badge>
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Score: {formData.probability * formData.impact})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isCreatingRisk}>
                        {isCreatingRisk ? 'Criando...' : 'Criar Risco'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Muito Alto</p>
                  <p className="text-2xl font-bold">
                    {metrics.risksByLevel['Muito Alto'] || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Alto</p>
                  <p className="text-2xl font-bold">
                    {metrics.risksByLevel['Alto'] || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Em Tratamento</p>
                  <p className="text-2xl font-bold">
                    {metrics.risksByStatus['Em Tratamento'] || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{metrics.totalRisks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar riscos por nome, descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showOverdue ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOverdue(!showOverdue)}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Vencidos ({metrics?.overdueActivities || 0})
              </Button>
              
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categorias" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(RISK_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Baixo">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Cards with Drag & Drop */}
      <div className="space-y-4">
          {orderedRisks.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Shield className="mx-auto h-12 w-12 mb-4" />
                  <p>{searchTerm ? 'Nenhum risco encontrado.' : 'Nenhum risco cadastrado.'}</p>
                  {!searchTerm && (
                    <p className="text-sm mt-2">Clique em "Novo Risco" para começar.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={orderedRisks.map(risk => risk.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {orderedRisks.map((risk) => (
                    <SortableRiskCard
                      key={risk.id}
                      risk={risk}
                      onUpdate={handleUpdateRisk}
                      onDelete={handleDeleteRisk}
                      canEdit={true}
                      canDelete={true}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
      </div>
    </div>
  );
};

export default NewRiskManagementPage;
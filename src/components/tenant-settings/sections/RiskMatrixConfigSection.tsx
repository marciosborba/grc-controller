import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

interface RiskLevel {
  id: string;
  name: string;
  value: number;
  color: string;
  description: string;
}

interface ImpactLevel {
  id: string;
  name: string;
  value: number;
  description: string;
  examples: string[];
}

interface ProbabilityLevel {
  id: string;
  name: string;
  value: number;
  description: string;
  percentage: string;
}

interface RiskMatrixConfig {
  dimensions: {
    probability: ProbabilityLevel[];
    impact: ImpactLevel[];
  };
  riskLevels: RiskLevel[];
  matrix: number[][];
  settings: {
    matrixSize: '3x3' | '4x4' | '5x5';
    calculationMethod: 'multiplication' | 'addition' | 'custom';
    autoCalculation: boolean;
  };
}

interface RiskMatrixConfigSectionProps {
  tenantId: string;
  onSettingsChange: () => void;
}

export const RiskMatrixConfigSection: React.FC<RiskMatrixConfigSectionProps> = ({
  tenantId,
  onSettingsChange
}) => {
  const [config, setConfig] = useState<RiskMatrixConfig>({
    dimensions: {
      probability: [
        { id: '1', name: 'Muito Baixa', value: 1, description: 'Evento muito improvável', percentage: '< 5%' },
        { id: '2', name: 'Baixa', value: 2, description: 'Evento improvável', percentage: '5-25%' },
        { id: '3', name: 'Média', value: 3, description: 'Evento possível', percentage: '25-50%' },
        { id: '4', name: 'Alta', value: 4, description: 'Evento provável', percentage: '50-75%' },
        { id: '5', name: 'Muito Alta', value: 5, description: 'Evento muito provável', percentage: '> 75%' }
      ],
      impact: [
        { 
          id: '1', 
          name: 'Insignificante', 
          value: 1, 
          description: 'Impacto mínimo nas operações',
          examples: ['Atraso menor que 1 dia', 'Custo < R$ 1.000']
        },
        { 
          id: '2', 
          name: 'Baixo', 
          value: 2, 
          description: 'Impacto limitado nas operações',
          examples: ['Atraso de 1-3 dias', 'Custo R$ 1.000-10.000']
        },
        { 
          id: '3', 
          name: 'Moderado', 
          value: 3, 
          description: 'Impacto significativo nas operações',
          examples: ['Atraso de 1-2 semanas', 'Custo R$ 10.000-100.000']
        },
        { 
          id: '4', 
          name: 'Alto', 
          value: 4, 
          description: 'Impacto severo nas operações',
          examples: ['Atraso de 1 mês', 'Custo R$ 100.000-1M']
        },
        { 
          id: '5', 
          name: 'Catastrófico', 
          value: 5, 
          description: 'Impacto crítico nas operações',
          examples: ['Atraso > 1 mês', 'Custo > R$ 1M']
        }
      ]
    },
    riskLevels: [
      { id: '1', name: 'Muito Baixo', value: 1, color: '#22c55e', description: 'Risco aceitável' },
      { id: '2', name: 'Baixo', value: 2, color: '#84cc16', description: 'Risco tolerável' },
      { id: '3', name: 'Médio', value: 3, color: '#eab308', description: 'Risco que requer atenção' },
      { id: '4', name: 'Alto', value: 4, color: '#f97316', description: 'Risco que requer ação imediata' },
      { id: '5', name: 'Muito Alto', value: 5, color: '#ef4444', description: 'Risco inaceitável' }
    ],
    matrix: [
      [1, 2, 3, 4, 5],
      [2, 2, 3, 4, 5],
      [3, 3, 3, 4, 5],
      [4, 4, 4, 4, 5],
      [5, 5, 5, 5, 5]
    ],
    settings: {
      matrixSize: '5x5',
      calculationMethod: 'multiplication',
      autoCalculation: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'probability' | 'impact' | 'riskLevel' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadMatrixConfig();
  }, [tenantId]);

  const loadMatrixConfig = async () => {
    try {
      setIsLoading(true);
      // Carregar configuração da matriz de risco da tenant
      // Em produção, isso viria de uma API
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Configuração já está no estado inicial
    } catch (error) {
      console.error('Erro ao carregar configuração da matriz:', error);
      toast.error('Erro ao carregar configuração da matriz de risco');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsLoading(true);
      // Salvar configuração da matriz de risco
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSettingsChange();
      toast.success('Configuração da matriz de risco salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração da matriz de risco');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRiskLevel = (probability: number, impact: number): number => {
    switch (config.settings.calculationMethod) {
      case 'multiplication':
        return Math.min(probability * impact, 25);
      case 'addition':
        return Math.min(probability + impact, 10);
      case 'custom':
        return config.matrix[probability - 1]?.[impact - 1] || 1;
      default:
        return probability * impact;
    }
  };

  const getRiskLevelForValue = (value: number): RiskLevel => {
    // Mapear valor calculado para nível de risco
    if (value <= 2) return config.riskLevels[0];
    if (value <= 6) return config.riskLevels[1];
    if (value <= 12) return config.riskLevels[2];
    if (value <= 20) return config.riskLevels[3];
    return config.riskLevels[4];
  };

  const openEditDialog = (item: any, type: 'probability' | 'impact' | 'riskLevel') => {
    setEditingItem({ ...item });
    setEditType(type);
    setIsDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editType) return;

    setConfig(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [editType]: editType === 'riskLevel' 
          ? prev.riskLevels 
          : prev.dimensions[editType].map(item => 
              item.id === editingItem.id ? editingItem : item
            )
      },
      riskLevels: editType === 'riskLevel'
        ? prev.riskLevels.map(item => 
            item.id === editingItem.id ? editingItem : item
          )
        : prev.riskLevels
    }));

    setIsDialogOpen(false);
    setEditingItem(null);
    setEditType(null);
    toast.success('Item atualizado com sucesso');
  };

  const renderMatrix = () => {
    const size = parseInt(config.settings.matrixSize.charAt(0));
    const probabilityLevels = config.dimensions.probability.slice(0, size);
    const impactLevels = config.dimensions.impact.slice(0, size);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-50 text-xs font-medium">
                Probabilidade / Impacto
              </th>
              {impactLevels.map(impact => (
                <th key={impact.id} className="border border-gray-300 p-2 bg-gray-50 text-xs font-medium">
                  {impact.name}
                  <br />
                  <span className="text-xs text-muted-foreground">({String(impact.value)})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {probabilityLevels.map(probability => (
              <tr key={probability.id}>
                <td className="border border-gray-300 p-2 bg-gray-50 text-xs font-medium">
                  {probability.name}
                  <br />
                  <span className="text-xs text-muted-foreground">({String(probability.value)})</span>
                </td>
                {impactLevels.map(impact => {
                  const riskValue = calculateRiskLevel(probability.value, impact.value);
                  const riskLevel = getRiskLevelForValue(riskValue);
                  
                  return (
                    <td 
                      key={`${probability.id}-${impact.id}`}
                      className="border border-gray-300 p-2 text-center text-xs"
                      style={{ backgroundColor: riskLevel.color + '20' }}
                    >
                      <div className="font-medium">{String(riskValue)}</div>
                      <div 
                        className="text-xs px-1 py-0.5 rounded text-white"
                        style={{ backgroundColor: riskLevel.color }}
                      >
                        {riskLevel.name}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configuração da Matriz de Risco
              </CardTitle>
              <CardDescription>
                Configure os níveis de probabilidade, impacto e a matriz de risco da organização
              </CardDescription>
            </div>
            <Button onClick={handleSaveConfig} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Configurações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Tamanho da Matriz</Label>
              <Select
                value={config.settings.matrixSize}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  settings: { ...prev.settings, matrixSize: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3x3">3x3 (Simples)</SelectItem>
                  <SelectItem value="4x4">4x4 (Padrão)</SelectItem>
                  <SelectItem value="5x5">5x5 (Detalhada)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Método de Cálculo</Label>
              <Select
                value={config.settings.calculationMethod}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  settings: { ...prev.settings, calculationMethod: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiplication">Multiplicação (P × I)</SelectItem>
                  <SelectItem value="addition">Adição (P + I)</SelectItem>
                  <SelectItem value="custom">Matriz Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                {String(config.dimensions.probability.length)}×{String(config.dimensions.impact.length)} configurada
              </Badge>
            </div>
          </div>

          {/* Matriz de Risco */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Matriz de Risco
            </h3>
            {renderMatrix()}
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Níveis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Níveis de Probabilidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Níveis de Probabilidade</CardTitle>
            <CardDescription>Configure os níveis de probabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.dimensions.probability.map(prob => (
                <div key={prob.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{prob.name}</div>
                    <div className="text-xs text-muted-foreground">{prob.description}</div>
                    <Badge variant="outline" className="text-xs mt-1">{prob.percentage}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(prob, 'probability')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Níveis de Impacto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Níveis de Impacto</CardTitle>
            <CardDescription>Configure os níveis de impacto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.dimensions.impact.map(impact => (
                <div key={impact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{impact.name}</div>
                    <div className="text-xs text-muted-foreground">{impact.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Ex: {impact.examples.slice(0, 1).join(', ')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(impact, 'impact')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Níveis de Risco */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Níveis de Risco</CardTitle>
            <CardDescription>Configure os níveis de risco resultantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.riskLevels.map(risk => (
                <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: risk.color }}
                      ></div>
                      <div className="font-medium text-sm">{risk.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{risk.description}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(risk, 'riskLevel')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Editar {editType === 'probability' ? 'Probabilidade' : 
                     editType === 'impact' ? 'Impacto' : 'Nível de Risco'}
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do item selecionado.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>

              {editType === 'probability' && (
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Percentual</Label>
                  <Input
                    id="percentage"
                    value={editingItem.percentage || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, percentage: e.target.value })}
                    placeholder="Ex: 5-25%"
                  />
                </div>
              )}

              {editType === 'riskLevel' && (
                <div className="grid gap-2">
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={editingItem.color || '#000000'}
                      onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={editingItem.color || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};